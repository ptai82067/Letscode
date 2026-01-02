package handlers

import (
	"courseai/backend/internal/database"
	"courseai/backend/internal/middleware"
	"courseai/backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type SubcourseHandler struct{}

func NewSubcourseHandler() *SubcourseHandler {
	return &SubcourseHandler{}
}

// GetAll - List all subcourses (with optional program filter)
func (h *SubcourseHandler) GetAll(c *fiber.Ctx) error {
	db := database.GetDB()
	var subcourses []models.Subcourse
	query := db.Preload("Media").Preload("Program").Order("sort_order ASC, created_at DESC")
	// If the caller is a teacher, restrict results to explicitly assigned subcourses.
	if middleware.GetUserRole(c) == models.RoleTeacher {
		assignsRaw := c.Locals("assignments")
		var assigns []models.TeacherAssignment
		if assignsRaw != nil {
			if a, ok := assignsRaw.([]models.TeacherAssignment); ok {
				assigns = a
			}
		}

		// If teacher has no assignments, return empty list
		if len(assigns) == 0 {
			return c.JSON([]models.Subcourse{})
		}

		// Collect assigned subcourse IDs (ignore program-level assignments)
		var assignedIDs []uuid.UUID
		for _, a := range assigns {
			if a.Status != models.AssignmentStatusActive {
				continue
			}
			if a.SubcourseID != nil {
				assignedIDs = append(assignedIDs, *a.SubcourseID)
			}
		}

		// If there are no explicit subcourse assignments, teacher should see empty list
		if len(assignedIDs) == 0 {
			return c.JSON([]models.Subcourse{})
		}

		query = query.Where("subcourses.id IN ?", assignedIDs)
	}

	// Optional filters
	if programID := c.Query("program_id"); programID != "" {
		query = query.Where("program_id = ?", programID)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&subcourses).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch subcourses",
		})
	}

	return c.JSON(subcourses)
}

// GetByProgram - Get subcourses for a specific program
func (h *SubcourseHandler) GetByProgram(c *fiber.Ctx) error {
	programID := c.Params("programId")
	pid, err := uuid.Parse(programID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid program ID",
		})
	}

	db := database.GetDB()

	// enforce access to program only when caller is an authenticated teacher
	if middleware.GetUserRole(c) == models.RoleTeacher {
		if err := middleware.CanAccessProgram(c, pid); err != nil {
			return err
		}
	}

	var subcourses []models.Subcourse
	if err := db.Preload("Media").Preload("Program").Where("program_id = ?", pid).Order("sort_order ASC").Find(&subcourses).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch subcourses"})
	}
	return c.JSON(subcourses)
}

// GetOne - Get single subcourse by ID
func (h *SubcourseHandler) GetOne(c *fiber.Ctx) error {
	id := c.Params("id")
	subcourseID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid subcourse ID",
		})
	}

	db := database.GetDB()
	// enforce access
	if err := middleware.CanAccessSubcourse(c, subcourseID); err != nil {
		return err
	}
	var subcourse models.Subcourse
	if err := db.Preload("Media").Preload("Program").Preload("Lessons").First(&subcourse, "id = ?", subcourseID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Subcourse not found"})
	}
	return c.JSON(subcourse)
}

// Create - Create new subcourse
func (h *SubcourseHandler) Create(c *fiber.Ctx) error {
	var subcourse models.Subcourse
	if err := c.BodyParser(&subcourse); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate program exists
	db := database.GetDB()
	var program models.Program
	if err := db.First(&program, "id = ?", subcourse.ProgramID).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Program not found",
		})
	}

	// If teacher, ensure they have program assignment for this program
	if middleware.GetUserRole(c) == models.RoleTeacher {
		if err := middleware.CanAccessProgram(c, subcourse.ProgramID); err != nil {
			return err
		}
	}

	// Start transaction
	tx := db.Begin()

	if err := tx.Create(&subcourse).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create subcourse",
		})
	}

	// Handle media if provided
	if len(subcourse.Media) > 0 {
		for i := range subcourse.Media {
			subcourse.Media[i].OwnerID = subcourse.ID
			subcourse.Media[i].OwnerType = models.OwnerSubcourse
		}
		if err := tx.Create(&subcourse.Media).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create media",
			})
		}
	}

	tx.Commit()

	// Reload with relations
	db.Preload("Media").Preload("Program").First(&subcourse, "id = ?", subcourse.ID)

	return c.Status(fiber.StatusCreated).JSON(subcourse)
}

// Update - Update existing subcourse
func (h *SubcourseHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	subcourseID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid subcourse ID",
		})
	}

	db := database.GetDB()
	var existing models.Subcourse

	if err := db.First(&existing, "id = ?", subcourseID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Subcourse not found",
		})
	}

	var updates models.Subcourse
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Start transaction
	tx := db.Begin()

	// Update subcourse fields
	updates.ID = subcourseID
	if err := tx.Model(&existing).Updates(updates).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update subcourse",
		})
	}

	// Handle media updates if provided
	if len(updates.Media) > 0 {
		// Delete existing media
		tx.Where("owner_type = ? AND owner_id = ?", models.OwnerSubcourse, subcourseID).Delete(&models.Media{})

		// Create new media
		for i := range updates.Media {
			updates.Media[i].OwnerID = subcourseID
			updates.Media[i].OwnerType = models.OwnerSubcourse
		}
		if err := tx.Create(&updates.Media).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update media",
			})
		}
	}

	tx.Commit()

	// Reload with relations
	db.Preload("Media").Preload("Program").First(&existing, "id = ?", subcourseID)

	return c.JSON(existing)
}

// Delete - Delete subcourse
func (h *SubcourseHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	subcourseID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid subcourse ID"})
	}

	db := database.GetDB()

	// enforce access
	if err := middleware.CanAccessSubcourse(c, subcourseID); err != nil {
		return err
	}

	tx := db.Begin()
	// delete media
	tx.Where("owner_type = ? AND owner_id = ?", models.OwnerSubcourse, subcourseID).Delete(&models.Media{})
	// delete subcourse
	if err := tx.Delete(&models.Subcourse{}, "id = ?", subcourseID).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete subcourse"})
	}
	tx.Commit()

	return c.SendStatus(fiber.StatusNoContent)
}
