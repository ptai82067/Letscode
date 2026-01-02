package handlers

import (
	"courseai/backend/internal/database"
	"courseai/backend/internal/middleware"
	"courseai/backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type ProgramHandler struct{}

func NewProgramHandler() *ProgramHandler {
	return &ProgramHandler{}
}

// GetAllPublic - List all programs for public pages (no access control, shows all programs)
func (h *ProgramHandler) GetAllPublic(c *fiber.Ctx) error {
	db := database.GetDB()
	var programs []models.Program

	query := db.Preload("Media").Order("sort_order ASC, created_at DESC")

	// Optional status filter
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&programs).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch programs",
		})
	}

	// Count subcourses for each program
	for i := range programs {
		var count int64
		db.Model(&models.Subcourse{}).Where("program_id = ?", programs[i].ID).Count(&count)
		programs[i].SubcourseCount = int(count)
		// Ensure subcourses is non-nil for JSON consumers expecting an array
		if programs[i].Subcourses == nil {
			programs[i].Subcourses = make([]models.Subcourse, 0)
		}
	}

	return c.JSON(programs)
}

// GetAll - List all programs (with access control)
func (h *ProgramHandler) GetAll(c *fiber.Ctx) error {
	db := database.GetDB()
	var programs []models.Program

	// If teacher, restrict to assigned programs
	role := middleware.GetUserRole(c)
	query := db.Preload("Media").Order("sort_order ASC, created_at DESC")
	if role == models.RoleTeacher {
		userID := middleware.GetUserID(c)
		ids, err := middleware.TeacherAssignedProgramIDs(userID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to resolve assignments"})
		}
		if len(ids) == 0 {
			return c.JSON([]models.Program{})
		}
		query = query.Where("id IN ?", ids)
	}

	// Optional status filter
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&programs).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch programs",
		})
	}

	// Count subcourses for each program
	for i := range programs {
		var count int64
		db.Model(&models.Subcourse{}).Where("program_id = ?", programs[i].ID).Count(&count)
		programs[i].SubcourseCount = int(count)
		// Ensure subcourses is non-nil for JSON consumers expecting an array
		if programs[i].Subcourses == nil {
			programs[i].Subcourses = make([]models.Subcourse, 0)
		}
	}

	return c.JSON(programs)
}

// GetOne - Get single program by ID
func (h *ProgramHandler) GetOne(c *fiber.Ctx) error {
	id := c.Params("id")
	programID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid program ID",
		})
	}

	db := database.GetDB()
	// Enforce access
	if err := middleware.CanAccessProgram(c, programID); err != nil {
		return err
	}
	var program models.Program
	if err := db.Preload("Media").Preload("Subcourses").First(&program, "id = ?", programID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Program not found"})
	}
	return c.JSON(program)
}

// Create - Create new program
func (h *ProgramHandler) Create(c *fiber.Ctx) error {
	var program models.Program
	if err := c.BodyParser(&program); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	db := database.GetDB()

	// Only admin can create programs
	if middleware.GetUserRole(c) == models.RoleTeacher {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Only admin can create programs"})
	}

	// Start transaction
	tx := db.Begin()

	if err := tx.Create(&program).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create program",
		})
	}

	// Handle media if provided
	if len(program.Media) > 0 {
		for i := range program.Media {
			program.Media[i].OwnerID = program.ID
			program.Media[i].OwnerType = models.OwnerProgram
		}
		if err := tx.Create(&program.Media).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create media",
			})
		}
	}

	tx.Commit()

	// Reload with media
	db.Preload("Media").First(&program, "id = ?", program.ID)

	return c.Status(fiber.StatusCreated).JSON(program)
}

// Update - Update existing program
func (h *ProgramHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	programID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid program ID",
		})
	}

	db := database.GetDB()
	var existing models.Program

	if err := db.First(&existing, "id = ?", programID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Program not found"})
	}

	// enforce access
	if err := middleware.CanAccessProgram(c, programID); err != nil {
		return err
	}

	var updates models.Program
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Start transaction
	tx := db.Begin()

	// Update program fields
	updates.ID = programID
	if err := tx.Model(&existing).Updates(updates).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update program",
		})
	}

	// Handle media updates if provided
	if len(updates.Media) > 0 {
		// Delete existing media
		tx.Where("owner_type = ? AND owner_id = ?", models.OwnerProgram, programID).Delete(&models.Media{})

		// Create new media
		for i := range updates.Media {
			updates.Media[i].OwnerID = programID
			updates.Media[i].OwnerType = models.OwnerProgram
		}
		if err := tx.Create(&updates.Media).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update media",
			})
		}
	}

	tx.Commit()

	// Reload with media
	db.Preload("Media").First(&existing, "id = ?", programID)

	return c.JSON(existing)
}

// Delete - Delete program
func (h *ProgramHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	programID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid program ID",
		})
	}

	db := database.GetDB()

	// enforce access
	if err := middleware.CanAccessProgram(c, programID); err != nil {
		return err
	}

	// Check if program has subcourses
	var count int64
	db.Model(&models.Subcourse{}).Where("program_id = ?", programID).Count(&count)
	if count > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot delete program with existing subcourses",
		})
	}

	// Delete media first
	db.Where("owner_type = ? AND owner_id = ?", models.OwnerProgram, programID).Delete(&models.Media{})

	// Delete program
	if err := db.Delete(&models.Program{}, "id = ?", programID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete program",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Program deleted successfully",
	})
}
