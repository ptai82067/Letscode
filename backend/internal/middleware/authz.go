package middleware

import (
	"time"

	"courseai/backend/internal/database"
	"courseai/backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// TeacherAssignedProgramIDs returns program IDs the teacher is assigned to (active)
func TeacherAssignedProgramIDs(userID uuid.UUID) ([]uuid.UUID, error) {
	db := database.GetDB()
	var assigns []models.TeacherAssignment
	now := time.Now().UTC()
	if err := db.Where("teacher_id = ? AND status = ? AND scope_level = ? AND (start_at IS NULL OR start_at <= ?) AND (end_at IS NULL OR end_at >= ?)", userID, models.AssignmentStatusActive, models.ScopeProgram, now, now).Find(&assigns).Error; err != nil {
		return nil, err
	}
	var ids []uuid.UUID
	for _, a := range assigns {
		if a.ProgramID != nil {
			ids = append(ids, *a.ProgramID)
		}
	}
	return ids, nil
}

// TeacherAssignedSubcourseIDs returns subcourse IDs assigned to teacher (active)
func TeacherAssignedSubcourseIDs(userID uuid.UUID) ([]uuid.UUID, error) {
	db := database.GetDB()
	// If the teacher has active program-level assignments, program scope takes precedence
	progIDs, err := TeacherAssignedProgramIDs(userID)
	if err != nil {
		return nil, err
	}
	if len(progIDs) > 0 {
		return []uuid.UUID{}, nil
	}

	var assigns []models.TeacherAssignment
	now := time.Now().UTC()
	if err := db.Where("teacher_id = ? AND status = ? AND scope_level = ? AND (start_at IS NULL OR start_at <= ?) AND (end_at IS NULL OR end_at >= ?)", userID, models.AssignmentStatusActive, models.ScopeSubcourse, now, now).Find(&assigns).Error; err != nil {
		return nil, err
	}
	var ids []uuid.UUID
	for _, a := range assigns {
		if a.SubcourseID != nil {
			ids = append(ids, *a.SubcourseID)
		}
	}
	return ids, nil
}

// CanAccessProgram enforces that the current user can access the program
func CanAccessProgram(c *fiber.Ctx, programID uuid.UUID) error {
	role := GetUserRole(c)
	if role == models.RoleAdmin {
		return nil
	}
	// only teachers left
	userID := GetUserID(c)
	ids, err := TeacherAssignedProgramIDs(userID)
	if err != nil {
		return fiber.ErrInternalServerError
	}
	for _, id := range ids {
		if id == programID {
			return nil
		}
	}
	return fiber.NewError(fiber.StatusForbidden, "Access to program denied")
}

// CanAccessSubcourse enforces access to a subcourse: either assigned subcourse or assigned program
func CanAccessSubcourse(c *fiber.Ctx, subcourseID uuid.UUID) error {
	role := GetUserRole(c)
	if role == models.RoleAdmin {
		return nil
	}
	userID := GetUserID(c)

	// check direct subcourse assignment
	subIds, err := TeacherAssignedSubcourseIDs(userID)
	if err != nil {
		return fiber.ErrInternalServerError
	}
	for _, id := range subIds {
		if id == subcourseID {
			return nil
		}
	}

	// check program assignment matching subcourse's program
	db := database.GetDB()
	var sc models.Subcourse
	if err := db.First(&sc, "id = ?", subcourseID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Subcourse not found")
	}
	progIds, err := TeacherAssignedProgramIDs(userID)
	if err != nil {
		return fiber.ErrInternalServerError
	}
	for _, pid := range progIds {
		if pid == sc.ProgramID {
			return nil
		}
	}
	return fiber.NewError(fiber.StatusForbidden, "Access to subcourse denied")
}

// CanAccessLesson enforces access to a lesson based on its subcourse/program
func CanAccessLesson(c *fiber.Ctx, lessonID uuid.UUID) error {
	role := GetUserRole(c)
	if role == models.RoleAdmin {
		return nil
	}
	userID := GetUserID(c)

	db := database.GetDB()
	var lesson models.Lesson
	if err := db.Preload("Subcourse").First(&lesson, "id = ?", lessonID).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Lesson not found")
	}
	// check subcourse assignment
	subIds, err := TeacherAssignedSubcourseIDs(userID)
	if err != nil {
		return fiber.ErrInternalServerError
	}
	for _, id := range subIds {
		if lesson.SubcourseID == id {
			return nil
		}
	}
	// check program assignment matching lesson's subcourse.program_id
	progIds, err := TeacherAssignedProgramIDs(userID)
	if err != nil {
		return fiber.ErrInternalServerError
	}
	if lesson.Subcourse != nil {
		for _, pid := range progIds {
			if pid == lesson.Subcourse.ProgramID {
				return nil
			}
		}
	}
	return fiber.NewError(fiber.StatusForbidden, "Access to lesson denied")
}
