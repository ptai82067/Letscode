package handlers

import (
	"courseai/backend/internal/config"
	"courseai/backend/internal/database"
	"courseai/backend/internal/middleware"
	"courseai/backend/internal/models"
	"courseai/backend/internal/utils"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	Config *config.Config
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	return &AuthHandler{Config: cfg}
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string       `json:"token"`
	User  *models.User `json:"user"`
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Username == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Username and password are required",
		})
	}

	db := database.GetDB()
	var user models.User

	// Find user by username or email
	if err := db.Where("username = ? OR email = ?", req.Username, req.Username).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	// Check if user is active
	if user.Status != models.StatusActive {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Account is not active",
		})
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(&user, h.Config.JWT.Secret, h.Config.JWT.ExpireHours)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	// If teacher, include assignments in returned user struct
	if user.Role == models.RoleTeacher {
		var assigns []models.TeacherAssignment
		if err := database.GetDB().Where("teacher_id = ? AND status = ?", user.ID, models.AssignmentStatusActive).Find(&assigns).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load assignments"})
		}
		// prepare a user map including assignments
		userMap := fiber.Map{
			"id":          user.ID,
			"username":    user.Username,
			"email":       user.Email,
			"role":        user.Role,
			"status":      user.Status,
			"created_at":  user.CreatedAt,
			"updated_at":  user.UpdatedAt,
			"assignments": assigns,
		}
		return c.JSON(fiber.Map{"token": token, "user": userMap})
	}

	return c.JSON(LoginResponse{
		Token: token,
		User:  &user,
	})
}

func (h *AuthHandler) Me(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID.String() == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	db := database.GetDB()
	var user models.User
	if err := db.First(&user, "id = ?", userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// If the user is a teacher, include active assignments
	if user.Role == models.RoleTeacher {
		var assigns []models.TeacherAssignment
		if err := db.Where("teacher_id = ? AND status = ?", user.ID, models.AssignmentStatusActive).Find(&assigns).Error; err != nil {
			// log but don't fail completely
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to load assignments"})
		}
		// Return combined user with assignments
		return c.JSON(fiber.Map{
			"id":          user.ID,
			"username":    user.Username,
			"email":       user.Email,
			"role":        user.Role,
			"status":      user.Status,
			"created_at":  user.CreatedAt,
			"updated_at":  user.UpdatedAt,
			"assignments": assigns,
		})
	}

	return c.JSON(user)
}
