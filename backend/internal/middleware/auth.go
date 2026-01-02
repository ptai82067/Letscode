package middleware

import (
	"courseai/backend/internal/database"
	"courseai/backend/internal/models"
	"courseai/backend/internal/utils"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type AuthMiddleware struct {
	JWTSecret string
}

func NewAuthMiddleware(jwtSecret string) *AuthMiddleware {
	return &AuthMiddleware{
		JWTSecret: jwtSecret,
	}
}

func (am *AuthMiddleware) Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Missing authorization header",
			})
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid authorization format",
			})
		}

		token := parts[1]
		claims, err := utils.ValidateJWT(token, am.JWTSecret)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		// Store user info in context
		c.Locals("user_id", claims.UserID)
		c.Locals("username", claims.Username)
		c.Locals("role", claims.Role)

		return c.Next()
	}
}

func (am *AuthMiddleware) AdminOnly() fiber.Handler {
	return func(c *fiber.Ctx) error {
		role := c.Locals("role")
		if role != models.RoleAdmin {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Access denied",
			})
		}
		return c.Next()
	}
}

// TokenOptional attempts to parse Authorization header and set user locals if present.
// It does NOT return 401 when header is missing or invalid — it silently continues as unauthenticated.
func (am *AuthMiddleware) TokenOptional() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Next()
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Next()
		}
		token := parts[1]
		claims, err := utils.ValidateJWT(token, am.JWTSecret)
		if err != nil {
			// ignore invalid token for optional middleware
			return c.Next()
		}

		c.Locals("user_id", claims.UserID)
		c.Locals("username", claims.Username)
		c.Locals("role", claims.Role)

		// If teacher, load active assignments into locals for handlers to use
		if claims.Role == models.RoleTeacher {
			db := database.GetDB()
			var assigns []models.TeacherAssignment
			now := time.Now().UTC()
			if err := db.Where("teacher_id = ? AND status = ? AND (start_at IS NULL OR start_at <= ?) AND (end_at IS NULL OR end_at >= ?)", claims.UserID, models.AssignmentStatusActive, now, now).Find(&assigns).Error; err == nil {
				c.Locals("assignments", assigns)
			}
		}

		return c.Next()
	}
}

// Helper functions to get user info from context
func GetUserID(c *fiber.Ctx) uuid.UUID {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return uuid.Nil
	}
	return userID
}

func GetUsername(c *fiber.Ctx) string {
	username, ok := c.Locals("username").(string)
	if !ok {
		return ""
	}
	return username
}

func GetUserRole(c *fiber.Ctx) models.UserRole {
	role, ok := c.Locals("role").(models.UserRole)
	if !ok {
		return ""
	}
	return role
}
