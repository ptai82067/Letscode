package handlers

import (
	"courseai/backend/internal/database"
	"courseai/backend/internal/models"
	"encoding/json"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type TeacherHandler struct{}

func NewTeacherHandler() *TeacherHandler {
	return &TeacherHandler{}
}

// GET /api/admin/teachers
func (h *TeacherHandler) GetAll(c *fiber.Ctx) error {
	var teachers []models.User

	if err := database.GetDB().
		Where("role = ?", models.RoleTeacher).
		Find(&teachers).Error; err != nil {
		return err
	}

	return c.JSON(teachers)
}

// Post /api/admin/teachers
type CreateTeacherInput struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *TeacherHandler) Create(c *fiber.Ctx) error {
	var input CreateTeacherInput
	if err := c.BodyParser(&input); err != nil {
		return fiber.NewError(400, "Invalid input")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), 10)
	if err != nil {
		return err
	}

	teacher := models.User{
		ID:           uuid.New(),
		Username:     input.Username,
		Email:        input.Email,
		PasswordHash: string(hash),
		Role:         models.RoleTeacher,
		Status:       models.StatusActive,
	}

	if err := database.GetDB().Create(&teacher).Error; err != nil {
		return err
	}

	return c.Status(201).JSON(teacher)
}

// PUT /api/admin/teachers/:id/program-assignments
type ProgramAssignInput struct {
	ProgramIDs []string   `json:"program_ids"`
	StartAt    *time.Time `json:"start_at,omitempty"`
	EndAt      *time.Time `json:"end_at,omitempty"`
}

func (h *TeacherHandler) AssignPrograms(c *fiber.Ctx) error {
	// Log raw body for debugging and parse flexibly to accept common datetime formats
	body := c.Body()
	log.Printf("AssignPrograms raw body: %s", string(body))

	var raw struct {
		ProgramIDs []string `json:"program_ids"`
		StartAt    *string  `json:"start_at,omitempty"`
		EndAt      *string  `json:"end_at,omitempty"`
	}
	if err := json.Unmarshal(body, &raw); err != nil {
		log.Printf("AssignPrograms unmarshal error: %v", err)
		return fiber.NewError(fiber.StatusBadRequest, "Invalid input: "+err.Error())
	}

	teacherIDStr := c.Params("id")
	teacherID, err := uuid.Parse(teacherIDStr)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid teacher id")
	}

	db := database.GetDB()

	// Ensure teacher exists and is a teacher
	var teacher models.User
	if err := db.Where("id = ? AND role = ?", teacherID, models.RoleTeacher).First(&teacher).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Teacher not found")
	}

	// Delete existing program-scope assignments for this teacher
	if err := db.Where("teacher_id = ? AND scope_level = ?", teacherID, models.ScopeProgram).Delete(&models.TeacherAssignment{}).Error; err != nil {
		return err
	}

	// Create new assignments (parse string IDs into UUIDs)
	var created []models.TeacherAssignment
	for _, pidStr := range raw.ProgramIDs {
		pid, err := uuid.Parse(pidStr)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "Invalid program id: "+pidStr)
		}
		// parse start/end times from strings (if provided), otherwise default to now
		var start *time.Time
		if raw.StartAt != nil {
			// try common layouts
			layouts := []string{time.RFC3339, "2006-01-02T15:04", "2006-01-02 15:04:05", "2006-01-02 15:04"}
			var parsed time.Time
			var perr error
			for _, l := range layouts {
				parsed, perr = time.Parse(l, *raw.StartAt)
				if perr == nil {
					break
				}
			}
			if perr != nil {
				log.Printf("AssignPrograms start_at parse error: %v", perr)
				return fiber.NewError(fiber.StatusBadRequest, "Invalid start_at format")
			}
			start = &parsed
		} else {
			now := time.Now()
			start = &now
		}
		var end *time.Time
		if raw.EndAt != nil {
			layouts := []string{time.RFC3339, "2006-01-02T15:04", "2006-01-02 15:04:05", "2006-01-02 15:04"}
			var parsed time.Time
			var perr error
			for _, l := range layouts {
				parsed, perr = time.Parse(l, *raw.EndAt)
				if perr == nil {
					break
				}
			}
			if perr != nil {
				log.Printf("AssignPrograms end_at parse error: %v", perr)
				return fiber.NewError(fiber.StatusBadRequest, "Invalid end_at format")
			}
			end = &parsed
		} else {
			end = nil
		}
		ta := models.TeacherAssignment{
			ID:          uuid.New(),
			TeacherID:   teacherID,
			ProgramID:   &pid,
			SubcourseID: nil,
			ScopeLevel:  models.ScopeProgram,
			Status:      models.AssignmentStatusActive,
			StartAt:     start,
			EndAt:       end,
		}
		if err := db.Create(&ta).Error; err != nil {
			return err
		}
		created = append(created, ta)
	}

	return c.JSON(fiber.Map{"assignments": created})
}

// PUT /api/admin/teachers/:id/subcourse-assignments
type SubcourseAssignInput struct {
	SubcourseIDs []string   `json:"subcourse_ids"`
	StartAt      *time.Time `json:"start_at,omitempty"`
	EndAt        *time.Time `json:"end_at,omitempty"`
}

func (h *TeacherHandler) AssignSubcourses(c *fiber.Ctx) error {
	// Log raw body for debugging and parse flexibly to accept common datetime formats
	body := c.Body()
	log.Printf("AssignSubcourses raw body: %s", string(body))

	var raw struct {
		SubcourseIDs []string `json:"subcourse_ids"`
		StartAt      *string  `json:"start_at,omitempty"`
		EndAt        *string  `json:"end_at,omitempty"`
	}
	if err := json.Unmarshal(body, &raw); err != nil {
		log.Printf("AssignSubcourses unmarshal error: %v", err)
		return fiber.NewError(fiber.StatusBadRequest, "Invalid input: "+err.Error())
	}

	teacherIDStr := c.Params("id")
	teacherID, err := uuid.Parse(teacherIDStr)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid teacher id")
	}

	db := database.GetDB()

	// Ensure teacher exists and is a teacher
	var teacher models.User
	if err := db.Where("id = ? AND role = ?", teacherID, models.RoleTeacher).First(&teacher).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Teacher not found")
	}

	// Delete existing subcourse-scope assignments for this teacher
	if err := db.Where("teacher_id = ? AND scope_level = ?", teacherID, models.ScopeSubcourse).Delete(&models.TeacherAssignment{}).Error; err != nil {
		return err
	}

	// Create new assignments (parse string IDs into UUIDs)
	var created []models.TeacherAssignment
	for _, sidStr := range raw.SubcourseIDs {
		sid, err := uuid.Parse(sidStr)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "Invalid subcourse id: "+sidStr)
		}
		var start *time.Time
		if raw.StartAt != nil {
			layouts := []string{time.RFC3339, "2006-01-02T15:04", "2006-01-02 15:04:05", "2006-01-02 15:04"}
			var parsed time.Time
			var perr error
			for _, l := range layouts {
				parsed, perr = time.Parse(l, *raw.StartAt)
				if perr == nil {
					break
				}
			}
			if perr != nil {
				log.Printf("AssignSubcourses start_at parse error: %v", perr)
				return fiber.NewError(fiber.StatusBadRequest, "Invalid start_at format")
			}
			start = &parsed
		} else {
			now := time.Now()
			start = &now
		}
		var end *time.Time
		if raw.EndAt != nil {
			layouts := []string{time.RFC3339, "2006-01-02T15:04", "2006-01-02 15:04:05", "2006-01-02 15:04"}
			var parsed time.Time
			var perr error
			for _, l := range layouts {
				parsed, perr = time.Parse(l, *raw.EndAt)
				if perr == nil {
					break
				}
			}
			if perr != nil {
				log.Printf("AssignSubcourses end_at parse error: %v", perr)
				return fiber.NewError(fiber.StatusBadRequest, "Invalid end_at format")
			}
			end = &parsed
		} else {
			end = nil
		}
		ta := models.TeacherAssignment{
			ID:          uuid.New(),
			TeacherID:   teacherID,
			ProgramID:   nil,
			SubcourseID: &sid,
			ScopeLevel:  models.ScopeSubcourse,
			Status:      models.AssignmentStatusActive,
			StartAt:     start,
			EndAt:       end,
		}
		if err := db.Create(&ta).Error; err != nil {
			return err
		}
		created = append(created, ta)
	}

	return c.JSON(fiber.Map{"assignments": created})
}

// GET /api/admin/teachers/history
func (h *TeacherHandler) GetTeacherHistory(c *fiber.Ctx) error {
	db := database.GetDB()

	type TeacherLessonHistory struct {
		TeacherID   uuid.UUID `json:"teacher_id"`
		TeacherName string    `json:"teacher_name"`
		LessonID    uuid.UUID `json:"lesson_id"`
		LessonTitle string    `json:"lesson_title"`
		LessonSlug  string    `json:"lesson_slug"`
		CreatedAt   time.Time `json:"created_at"`
		UpdatedAt   time.Time `json:"updated_at"`
		Status      string    `json:"status"`
	}

	var history []TeacherLessonHistory

	// Use raw SQL for JOIN query
	query := `
		SELECT 
			COALESCE(u.id, '00000000-0000-0000-0000-000000000000'::uuid) as teacher_id,
			COALESCE(u.username, 'Unknown') as teacher_name,
			l.id as lesson_id,
			l.title as lesson_title,
			l.slug as lesson_slug,
			l.created_at,
			l.updated_at,
			l.status
		FROM lessons l
		LEFT JOIN users u ON l.author_id = u.id
		WHERE l.author_id IS NOT NULL
		ORDER BY l.updated_at DESC
	`

	if err := db.Raw(query).Scan(&history).Error; err != nil {
		log.Printf("GetTeacherHistory error: %v", err)
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to fetch teacher history")
	}

	// Return empty array instead of null if no results
	if history == nil {
		history = []TeacherLessonHistory{}
	}

	return c.JSON(history)
}

// GET /api/admin/teachers/:teacherId/lesson-history
func (h *TeacherHandler) GetTeacherLessonHistory(c *fiber.Ctx) error {
	teacherIDStr := c.Params("teacherId")
	teacherID, err := uuid.Parse(teacherIDStr)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid teacher id")
	}

	db := database.GetDB()

	type LessonHistoryItem struct {
		ID          uuid.UUID `json:"id"`
		Title       string    `json:"title"`
		Slug        string    `json:"slug"`
		SubcourseID uuid.UUID `json:"subcourse_id"`
		Status      string    `json:"status"`
		CreatedAt   time.Time `json:"created_at"`
		UpdatedAt   time.Time `json:"updated_at"`
	}

	var lessons []LessonHistoryItem
	if err := db.
		Where("author_id = ?", teacherID).
		Order("updated_at DESC").
		Find(&lessons).Error; err != nil {
		return err
	}

	return c.JSON(lessons)
}

// GET /api/admin/teachers/:teacherId/assignments
func (h *TeacherHandler) GetAssignments(c *fiber.Ctx) error {
	teacherIDStr := c.Params("teacherId")
	teacherID, err := uuid.Parse(teacherIDStr)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid teacher id")
	}

	db := database.GetDB()
	var assignments []models.TeacherAssignment
	if err := db.Where("teacher_id = ? AND status = ?", teacherID, models.AssignmentStatusActive).Find(&assignments).Error; err != nil {
		return err
	}

	return c.JSON(fiber.Map{"assignments": assignments})
}
