package handlers

import (
	"courseai/backend/internal/database"
	"courseai/backend/internal/middleware"
	"courseai/backend/internal/models"
	"fmt"
	"log"
	"strings"

	"gorm.io/gorm/clause"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// sanitizeMediaForInsert resets IDs and sets owner fields so BeforeCreate generates fresh UUIDs
func sanitizeMediaForInsert(ms []models.Media, ownerID uuid.UUID, ownerType models.MediaOwnerType) []models.Media {
	for i := range ms {
		ms[i].ID = uuid.Nil
		ms[i].OwnerID = ownerID
		ms[i].OwnerType = ownerType
	}
	return ms
}

type LessonHandler struct{}

func NewLessonHandler() *LessonHandler {
	return &LessonHandler{}
}

// validateNoIDsOnCreate ensures client did not send any IDs when creating a new lesson.
func validateNoIDsOnCreate(l *models.Lesson) error {
	if l == nil {
		return nil
	}
	// Only enforce that top-level lesson ID is not provided by client.
	// Allow nested children to have client-generated IDs so frontend can pre-assign stable IDs before upload.
	if l.ID != uuid.Nil {
		return fmt.Errorf("client must not send lesson ID on create")
	}
	return nil
}

// validateRequiredFields ensures required fields for lesson and nested children are present
func validateRequiredFields(l *models.Lesson) error {
	if l == nil {
		return fmt.Errorf("invalid lesson payload")
	}
	if strings.TrimSpace(l.Slug) == "" {
		return fmt.Errorf("lesson.slug is required")
	}
	if strings.TrimSpace(l.Title) == "" {
		return fmt.Errorf("lesson.title is required")
	}
	for i, m := range l.Models {
		if strings.TrimSpace(m.Title) == "" {
			return fmt.Errorf("models[%d].title is required", i)
		}
	}
	if l.Preparation != nil {
		if strings.TrimSpace(l.Preparation.Notes) == "" {
			// preparation.notes is optional; do not enforce here
		}
	}
	for i, b := range l.Builds {
		if strings.TrimSpace(b.Title) == "" {
			return fmt.Errorf("builds[%d].title is required", i)
		}
	}
	for i, cb := range l.ContentBlocks {
		if strings.TrimSpace(cb.Title) == "" {
			return fmt.Errorf("content_blocks[%d].title is required", i)
		}
	}
	for i, a := range l.Attachments {
		if strings.TrimSpace(a.Title) == "" {
			return fmt.Errorf("attachments[%d].title is required", i)
		}
	}
	for i, ch := range l.Challenges {
		if strings.TrimSpace(ch.Title) == "" {
			return fmt.Errorf("challenges[%d].title is required", i)
		}
	}
	return nil
}

// GetAll - List all lessons (with optional filters)
// GetAllPublic - Get all lessons for public pages (no access control, shows all lessons)
func (h *LessonHandler) GetAllPublic(c *fiber.Ctx) error {
	db := database.GetDB()
	var lessons []models.Lesson
	query := db.Preload("Media").Preload("Subcourse").Preload("Subcourse.Program").Order("sort_order ASC, created_at DESC")

	// Optional filters
	if subcourseID := c.Query("subcourse_id"); subcourseID != "" {
		query = query.Where("subcourse_id = ?", subcourseID)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&lessons).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch lessons",
		})
	}

	return c.JSON(lessons)
}

// GetAll - Get lessons (with access control for teachers)
func (h *LessonHandler) GetAll(c *fiber.Ctx) error {
	db := database.GetDB()
	var lessons []models.Lesson
	query := db.Preload("Media").Preload("Subcourse").Preload("Subcourse.Program").Order("sort_order ASC, created_at DESC")

	// If the auth middleware attached assignments in locals, use them to filter lessons
	if assignsRaw := c.Locals("assignments"); assignsRaw != nil {
		if assigns, ok := assignsRaw.([]models.TeacherAssignment); ok {
			var progIDs []uuid.UUID
			var subIDs []uuid.UUID
			for _, a := range assigns {
				if a.Status != models.AssignmentStatusActive {
					continue
				}
				if a.ProgramID != nil {
					progIDs = append(progIDs, *a.ProgramID)
				}
				if a.SubcourseID != nil {
					subIDs = append(subIDs, *a.SubcourseID)
				}
			}
			if len(progIDs) == 0 && len(subIDs) == 0 {
				return c.JSON([]models.Lesson{})
			}
			// apply DB-level filters: program precedence doesn't exclude subcourse assignments; return union
			if len(progIDs) > 0 && len(subIDs) > 0 {
				query = query.Joins("JOIN subcourses ON lessons.subcourse_id = subcourses.id").Where("subcourses.program_id IN ? OR lessons.subcourse_id IN ?", progIDs, subIDs)
			} else if len(progIDs) > 0 {
				query = query.Joins("JOIN subcourses ON lessons.subcourse_id = subcourses.id").Where("subcourses.program_id IN ?", progIDs)
			} else {
				query = query.Where("subcourse_id IN ?", subIDs)
			}
		}
	}

	// Optional filters
	if subcourseID := c.Query("subcourse_id"); subcourseID != "" {
		query = query.Where("subcourse_id = ?", subcourseID)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&lessons).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch lessons",
		})
	}

	return c.JSON(lessons)
}

// GetBySubcourse - Get lessons for a specific subcourse
func (h *LessonHandler) GetBySubcourse(c *fiber.Ctx) error {
	subcourseID := c.Params("subcourseId")
	sid, err := uuid.Parse(subcourseID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid subcourse ID",
		})
	}

	db := database.GetDB()

	// enforce access only when caller is an authenticated teacher
	if middleware.GetUserRole(c) == models.RoleTeacher {
		if err := middleware.CanAccessSubcourse(c, sid); err != nil {
			return err
		}
	}

	var lessons []models.Lesson
	if err := db.Preload("Media").Preload("Subcourse").Preload("Subcourse.Program").Where("subcourse_id = ?", sid).Order("sort_order ASC").Find(&lessons).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch lessons"})
	}
	return c.JSON(lessons)
}

// GetOne - Get single lesson by ID with all components
func (h *LessonHandler) GetOne(c *fiber.Ctx) error {
	id := c.Params("id")
	lessonID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid lesson ID",
		})
	}

	db := database.GetDB()
	// enforce access only when caller is an authenticated teacher
	if middleware.GetUserRole(c) == models.RoleTeacher {
		if err := middleware.CanAccessLesson(c, lessonID); err != nil {
			return err
		}
	}
	var lesson models.Lesson
	if err := db.Preload("Media").
		Preload("Subcourse").
		Preload("Subcourse.Program").
		Preload("Objectives").
		Preload("Models").
		Preload("Models.Media").
		Preload("Preparation").
		Preload("Preparation.Media").
		Preload("Builds").
		Preload("Builds.Media").
		Preload("ContentBlocks").
		Preload("ContentBlocks.Media").
		Preload("Attachments").
		Preload("Attachments.Media").
		Preload("Challenges").
		Preload("Challenges.Media").
		Preload("Quizzes").
		Preload("Quizzes.Options").
		First(&lesson, "id = ?", lessonID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Lesson not found"})
	}
	return c.JSON(lesson)
}

// Create - Create new lesson with all components
func (h *LessonHandler) Create(c *fiber.Ctx) error {
	var lesson models.Lesson
	if err := c.BodyParser(&lesson); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Log incoming payload for debugging
	log.Printf("Incoming lesson payload: %+v", lesson)

	// Validate client did not send any IDs on create
	if err := validateNoIDsOnCreate(&lesson); err != nil {
		log.Printf("Create validation failed: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Client must not send ID on create"})
	}

	// Validate required fields
	if err := validateRequiredFields(&lesson); err != nil {
		log.Printf("Required fields validation failed: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	// Validate subcourse exists
	db := database.GetDB()
	var subcourse models.Subcourse
	if err := db.First(&subcourse, "id = ?", lesson.SubcourseID).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Subcourse not found",
		})
	}

	// If teacher, enforce assignment-based rules and potentially override subcourse
	if middleware.GetUserRole(c) == models.RoleTeacher {
		userID := middleware.GetUserID(c)
		progIDs, err := middleware.TeacherAssignedProgramIDs(userID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to resolve assignments"})
		}
		subIDs, err := middleware.TeacherAssignedSubcourseIDs(userID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to resolve assignments"})
		}

		if len(progIDs) > 0 {
			// program-level assignment exists -> ensure the chosen subcourse belongs to an assigned program
			allowed := false
			for _, pid := range progIDs {
				if pid == subcourse.ProgramID {
					allowed = true
					break
				}
			}
			if !allowed {
				return fiber.NewError(fiber.StatusForbidden, "Access to subcourse denied")
			}
		} else if len(subIDs) > 0 {
			// Only subcourse-level assignments exist
			if len(subIDs) == 1 {
				// fixed assignment: override whatever client sent and use the assigned subcourse
				lesson.SubcourseID = subIDs[0]
				// refresh subcourse variable to the assigned one
				if err := db.First(&subcourse, "id = ?", lesson.SubcourseID).Error; err != nil {
					return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Assigned subcourse not found"})
				}
			} else {
				// multiple assigned subcourses: ensure provided subcourse is within assigned list
				allowed := false
				for _, sid := range subIDs {
					if sid == lesson.SubcourseID {
						allowed = true
						break
					}
				}
				if !allowed {
					return fiber.NewError(fiber.StatusForbidden, "Access to subcourse denied")
				}
			}
		} else {
			return fiber.NewError(fiber.StatusForbidden, "No active assignments")
		}
	}

	// Start transaction
	tx := db.Begin()

	// Start transaction
	tx = db.Begin()

	// Detach nested relations that we'll create explicitly to prevent GORM from auto-inserting them
	var detachedObjectives *models.LessonObjective
	if lesson.Objectives != nil {
		detachedObjectives = lesson.Objectives
		lesson.Objectives = nil
	}

	var detachedMedia []models.Media
	if len(lesson.Media) > 0 {
		detachedMedia = lesson.Media
		lesson.Media = nil
	}

	var detachedModels []models.LessonModel
	if len(lesson.Models) > 0 {
		detachedModels = lesson.Models
		lesson.Models = nil
	}

	var detachedPreparation *models.LessonPreparation
	if lesson.Preparation != nil {
		detachedPreparation = lesson.Preparation
		lesson.Preparation = nil
	}

	var detachedBuilds []models.LessonBuild
	if len(lesson.Builds) > 0 {
		detachedBuilds = lesson.Builds
		lesson.Builds = nil
	}

	var detachedContentBlocks []models.LessonContentBlock
	if len(lesson.ContentBlocks) > 0 {
		detachedContentBlocks = lesson.ContentBlocks
		lesson.ContentBlocks = nil
	}

	var detachedAttachments []models.LessonAttachment
	if len(lesson.Attachments) > 0 {
		detachedAttachments = lesson.Attachments
		lesson.Attachments = nil
	}

	var detachedChallenges []models.LessonChallenge
	if len(lesson.Challenges) > 0 {
		detachedChallenges = lesson.Challenges
		lesson.Challenges = nil
	}

	var detachedQuizzes []models.LessonQuiz
	if len(lesson.Quizzes) > 0 {
		detachedQuizzes = lesson.Quizzes
		lesson.Quizzes = nil
	}

	// Ensure slug uniqueness to avoid DB unique constraint errors
	origSlug := lesson.Slug
	if origSlug == "" {
		origSlug = "lesson"
	}

	// Set the author to the current user
	userID := middleware.GetUserID(c)
	lesson.AuthorID = &userID

	var existing models.Lesson
	suffix := 1
	for {
		err := tx.Unscoped().Where("slug = ?", lesson.Slug).First(&existing).Error
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				break
			}
			// Unexpected DB error
			tx.Rollback()
			log.Printf("Slug check error: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to check slug uniqueness",
			})
		}
		// slug exists, append suffix and retry
		lesson.Slug = fmt.Sprintf("%s-%d", origSlug, suffix)
		suffix++
		if suffix > 100 {
			break
		}
	}

	// Create lesson (omit associations to prevent GORM auto-insert of nested relations)
	if err := tx.Omit("Models", "Preparation", "Builds", "ContentBlocks", "Attachments", "Challenges", "Quizzes", "Media", "Objectives").Create(&lesson).Error; err != nil {
		tx.Rollback()
		log.Printf("Create lesson error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Handle all detached nested entities and their media in a controlled order
	// 1) Lesson-level media
	if len(detachedMedia) > 0 {
		detachedMedia = sanitizeMediaForInsert(detachedMedia, lesson.ID, models.OwnerLesson)
		if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&detachedMedia).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create lesson media"})
		}
	}

	// 2) Objectives
	if detachedObjectives != nil {
		detachedObjectives.LessonID = lesson.ID
		// preserve client-provided ID if present; if nil, BeforeCreate will generate one
		if err := tx.Create(detachedObjectives).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create objectives"})
		}
	}

	// Two-phase creation: create parents (omit Media) first, collect media, then bulk-insert all media once.
	var mediaToInsert []models.Media

	// 3) Models - create parents first, collect media
	for i := range detachedModels {
		detachedModels[i].LessonID = lesson.ID
		// preserve client-provided ID if present; if nil, BeforeCreate will set it
		mSlice := detachedModels[i].Media
		detachedModels[i].Media = nil
		if err := tx.Omit("Media").Create(&detachedModels[i]).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create model"})
		}
		// assign owner info for media and append to bulk list
		for j := range mSlice {
			mSlice[j].ID = uuid.Nil
			mSlice[j].OwnerID = detachedModels[i].ID
			mSlice[j].OwnerType = models.OwnerLessonModel
			mediaToInsert = append(mediaToInsert, mSlice[j])
		}
	}

	// 4) Preparation
	if detachedPreparation != nil {
		mSlice := detachedPreparation.Media
		detachedPreparation.Media = nil
		detachedPreparation.LessonID = lesson.ID
		// preserve client-provided ID if present
		if err := tx.Omit("Media").Create(detachedPreparation).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create preparation"})
		}
		for j := range mSlice {
			mSlice[j].ID = uuid.Nil
			mSlice[j].OwnerID = detachedPreparation.ID
			mSlice[j].OwnerType = models.OwnerLessonPreparation
			mediaToInsert = append(mediaToInsert, mSlice[j])
		}
	}

	// 5) Builds
	for i := range detachedBuilds {
		mSlice := detachedBuilds[i].Media
		detachedBuilds[i].Media = nil
		detachedBuilds[i].LessonID = lesson.ID
		// preserve client-provided ID if present
		if err := tx.Omit("Media").Create(&detachedBuilds[i]).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create build"})
		}
		for j := range mSlice {
			mSlice[j].ID = uuid.Nil
			mSlice[j].OwnerID = detachedBuilds[i].ID
			mSlice[j].OwnerType = models.OwnerLessonBuild
			mediaToInsert = append(mediaToInsert, mSlice[j])
		}
	}

	// 6) ContentBlocks
	for i := range detachedContentBlocks {
		mSlice := detachedContentBlocks[i].Media
		detachedContentBlocks[i].Media = nil
		detachedContentBlocks[i].LessonID = lesson.ID
		// preserve client-provided ID if present
		if err := tx.Omit("Media").Create(&detachedContentBlocks[i]).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create content block"})
		}
		for j := range mSlice {
			mSlice[j].ID = uuid.Nil
			mSlice[j].OwnerID = detachedContentBlocks[i].ID
			mSlice[j].OwnerType = models.OwnerLessonContentBlock
			mediaToInsert = append(mediaToInsert, mSlice[j])
		}
	}

	// 7) Attachments
	for i := range detachedAttachments {
		mSlice := detachedAttachments[i].Media
		detachedAttachments[i].Media = nil
		detachedAttachments[i].LessonID = lesson.ID
		// preserve client-provided ID if present
		if err := tx.Omit("Media").Create(&detachedAttachments[i]).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create attachment"})
		}
		for j := range mSlice {
			mSlice[j].ID = uuid.Nil
			mSlice[j].OwnerID = detachedAttachments[i].ID
			mSlice[j].OwnerType = models.OwnerLessonAttachment
			mediaToInsert = append(mediaToInsert, mSlice[j])
		}
	}

	// 8) Challenges
	for i := range detachedChallenges {
		mSlice := detachedChallenges[i].Media
		detachedChallenges[i].Media = nil
		detachedChallenges[i].LessonID = lesson.ID
		// preserve client-provided ID if present
		if err := tx.Omit("Media").Create(&detachedChallenges[i]).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create challenge"})
		}
		for j := range mSlice {
			mSlice[j].ID = uuid.Nil
			mSlice[j].OwnerID = detachedChallenges[i].ID
			mSlice[j].OwnerType = models.OwnerLessonChallenge
			mediaToInsert = append(mediaToInsert, mSlice[j])
		}
	}

	// Bulk-insert all collected media once
	if len(mediaToInsert) > 0 {
		// ensure IDs are nil so BeforeCreate sets new UUIDs
		for i := range mediaToInsert {
			if mediaToInsert[i].ID != uuid.Nil {
				mediaToInsert[i].ID = uuid.Nil
			}
		}
		if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&mediaToInsert).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create model media"})
		}
	}

	// 9) Quizzes and options
	for i := range detachedQuizzes {
		detachedQuizzes[i].LessonID = lesson.ID
		detachedQuizzes[i].ID = uuid.Nil
		opts := detachedQuizzes[i].Options
		detachedQuizzes[i].Options = nil
		if err := tx.Create(&detachedQuizzes[i]).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create quiz"})
		}
		if len(opts) > 0 {
			for j := range opts {
				opts[j].ID = uuid.Nil
				opts[j].QuizID = detachedQuizzes[i].ID
			}
			if err := tx.Create(&opts).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create quiz options"})
			}
		}
	}

	tx.Commit()

	// Reload with all relations and return created lesson
	var created models.Lesson
	if err := db.Preload("Media").
		Preload("Subcourse").
		Preload("Subcourse.Program").
		Preload("Objectives").
		Preload("Models").
		Preload("Models.Media").
		Preload("Preparation").
		Preload("Preparation.Media").
		Preload("Builds").
		Preload("Builds.Media").
		Preload("ContentBlocks").
		Preload("ContentBlocks.Media").
		Preload("Attachments").
		Preload("Attachments.Media").
		Preload("Challenges").
		Preload("Challenges.Media").
		Preload("Quizzes").
		Preload("Quizzes.Options").
		First(&created, "id = ?", lesson.ID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to load created lesson",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(created)
}

// Update - Update existing lesson
func (h *LessonHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	lessonID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid lesson ID",
		})
	}

	// enforce access
	if err := middleware.CanAccessLesson(c, lessonID); err != nil {
		return err
	}

	db := database.GetDB()
	var existing models.Lesson

	if err := db.First(&existing, "id = ?", lessonID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Lesson not found"})
	}

	var updates models.Lesson
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// If teacher, prevent changing the subcourse of an existing lesson
	if middleware.GetUserRole(c) == models.RoleTeacher {
		if updates.SubcourseID != uuid.Nil && updates.SubcourseID != existing.SubcourseID {
			return fiber.NewError(fiber.StatusForbidden, "Teachers cannot change lesson subcourse")
		}
	}

	// Start transaction
	tx := db.Begin()

	// Update lesson basic fields
	updates.ID = lessonID

	// Preserve the original author, but ensure it's set if it wasn't before
	if existing.AuthorID == nil {
		userID := middleware.GetUserID(c)
		updates.AuthorID = &userID
	}

	if err := tx.Model(&existing).Updates(updates).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update lesson",
		})
	}

	// Delete all existing related data
	tx.Where("owner_type = ? AND owner_id = ?", models.OwnerLesson, lessonID).Delete(&models.Media{})
	tx.Where("lesson_id = ?", lessonID).Delete(&models.LessonObjective{})

	// Delete models and their media
	var existingModels []models.LessonModel
	tx.Where("lesson_id = ?", lessonID).Find(&existingModels)
	for _, m := range existingModels {
		tx.Where("owner_type = ? AND owner_id = ?", models.OwnerLessonModel, m.ID).Delete(&models.Media{})
	}
	tx.Where("lesson_id = ?", lessonID).Delete(&models.LessonModel{})

	// Delete preparation and its media
	var existingPrep models.LessonPreparation
	if tx.Where("lesson_id = ?", lessonID).First(&existingPrep).Error == nil {
		tx.Where("owner_type = ? AND owner_id = ?", models.OwnerLessonPreparation, existingPrep.ID).Delete(&models.Media{})
	}
	tx.Where("lesson_id = ?", lessonID).Delete(&models.LessonPreparation{})

	// Delete builds and their media
	var existingBuilds []models.LessonBuild
	tx.Where("lesson_id = ?", lessonID).Find(&existingBuilds)
	for _, b := range existingBuilds {
		tx.Where("owner_type = ? AND owner_id = ?", models.OwnerLessonBuild, b.ID).Delete(&models.Media{})
	}
	tx.Where("lesson_id = ?", lessonID).Delete(&models.LessonBuild{})

	// Delete content blocks and their media
	var existingBlocks []models.LessonContentBlock
	tx.Where("lesson_id = ?", lessonID).Find(&existingBlocks)
	for _, cb := range existingBlocks {
		tx.Where("owner_type = ? AND owner_id = ?", models.OwnerLessonContentBlock, cb.ID).Delete(&models.Media{})
	}
	tx.Where("lesson_id = ?", lessonID).Delete(&models.LessonContentBlock{})

	// Delete attachments and their media
	var existingAttachments []models.LessonAttachment
	tx.Where("lesson_id = ?", lessonID).Find(&existingAttachments)
	for _, a := range existingAttachments {
		tx.Where("owner_type = ? AND owner_id = ?", models.OwnerLessonAttachment, a.ID).Delete(&models.Media{})
	}
	tx.Where("lesson_id = ?", lessonID).Delete(&models.LessonAttachment{})

	// Delete challenges and their media
	var existingChallenges []models.LessonChallenge
	tx.Where("lesson_id = ?", lessonID).Find(&existingChallenges)
	for _, ch := range existingChallenges {
		tx.Where("owner_type = ? AND owner_id = ?", models.OwnerLessonChallenge, ch.ID).Delete(&models.Media{})
	}
	tx.Where("lesson_id = ?", lessonID).Delete(&models.LessonChallenge{})

	// Delete quizzes and their options
	var existingQuizzes []models.LessonQuiz
	tx.Where("lesson_id = ?", lessonID).Find(&existingQuizzes)
	for _, q := range existingQuizzes {
		tx.Where("quiz_id = ?", q.ID).Delete(&models.LessonQuizOption{})
	}
	tx.Where("lesson_id = ?", lessonID).Delete(&models.LessonQuiz{})

	// Now recreate everything with new data (similar to Create)
	// This section is identical to Create handler above
	if len(updates.Media) > 0 {
		for i := range updates.Media {
			// reset incoming media IDs so DB generates new ones
			updates.Media[i].ID = uuid.Nil
			updates.Media[i].OwnerID = lessonID
			updates.Media[i].OwnerType = models.OwnerLesson
		}
		tx.Create(&updates.Media)
	}

	if updates.Objectives != nil {
		updates.Objectives.LessonID = lessonID
		tx.Create(updates.Objectives)
	}

	if len(updates.Models) > 0 {
		for i := range updates.Models {
			updates.Models[i].LessonID = lessonID
			updates.Models[i].ID = uuid.Nil
			tx.Create(&updates.Models[i])
			if len(updates.Models[i].Media) > 0 {
				for j := range updates.Models[i].Media {
					updates.Models[i].Media[j].ID = uuid.Nil
					updates.Models[i].Media[j].OwnerID = updates.Models[i].ID
					updates.Models[i].Media[j].OwnerType = models.OwnerLessonModel
				}
				tx.Create(&updates.Models[i].Media)
			}
		}
	}

	if updates.Preparation != nil {
		updates.Preparation.LessonID = lessonID
		updates.Preparation.ID = uuid.Nil
		tx.Create(updates.Preparation)
		if len(updates.Preparation.Media) > 0 {
			for i := range updates.Preparation.Media {
				updates.Preparation.Media[i].ID = uuid.Nil
				updates.Preparation.Media[i].OwnerID = updates.Preparation.ID
				updates.Preparation.Media[i].OwnerType = models.OwnerLessonPreparation
			}
			tx.Create(&updates.Preparation.Media)
		}
	}

	if len(updates.Builds) > 0 {
		for i := range updates.Builds {
			updates.Builds[i].LessonID = lessonID
			updates.Builds[i].ID = uuid.Nil
			tx.Create(&updates.Builds[i])
			if len(updates.Builds[i].Media) > 0 {
				for j := range updates.Builds[i].Media {
					updates.Builds[i].Media[j].ID = uuid.Nil
					updates.Builds[i].Media[j].OwnerID = updates.Builds[i].ID
					updates.Builds[i].Media[j].OwnerType = models.OwnerLessonBuild
				}
				tx.Create(&updates.Builds[i].Media)
			}
		}
	}

	if len(updates.ContentBlocks) > 0 {
		for i := range updates.ContentBlocks {
			updates.ContentBlocks[i].LessonID = lessonID
			updates.ContentBlocks[i].ID = uuid.Nil
			tx.Create(&updates.ContentBlocks[i])
			if len(updates.ContentBlocks[i].Media) > 0 {
				for j := range updates.ContentBlocks[i].Media {
					updates.ContentBlocks[i].Media[j].ID = uuid.Nil
					updates.ContentBlocks[i].Media[j].OwnerID = updates.ContentBlocks[i].ID
					updates.ContentBlocks[i].Media[j].OwnerType = models.OwnerLessonContentBlock
				}
				tx.Create(&updates.ContentBlocks[i].Media)
			}
		}
	}

	if len(updates.Attachments) > 0 {
		for i := range updates.Attachments {
			updates.Attachments[i].LessonID = lessonID
			updates.Attachments[i].ID = uuid.Nil
			tx.Create(&updates.Attachments[i])
			if len(updates.Attachments[i].Media) > 0 {
				for j := range updates.Attachments[i].Media {
					updates.Attachments[i].Media[j].ID = uuid.Nil
					updates.Attachments[i].Media[j].OwnerID = updates.Attachments[i].ID
					updates.Attachments[i].Media[j].OwnerType = models.OwnerLessonAttachment
				}
				tx.Create(&updates.Attachments[i].Media)
			}
		}
	}

	if len(updates.Challenges) > 0 {
		for i := range updates.Challenges {
			updates.Challenges[i].LessonID = lessonID
			updates.Challenges[i].ID = uuid.Nil
			tx.Create(&updates.Challenges[i])
			if len(updates.Challenges[i].Media) > 0 {
				for j := range updates.Challenges[i].Media {
					updates.Challenges[i].Media[j].ID = uuid.Nil
					updates.Challenges[i].Media[j].OwnerID = updates.Challenges[i].ID
					updates.Challenges[i].Media[j].OwnerType = models.OwnerLessonChallenge
				}
				tx.Create(&updates.Challenges[i].Media)
			}
		}
	}

	if len(updates.Quizzes) > 0 {
		for i := range updates.Quizzes {
			updates.Quizzes[i].LessonID = lessonID
			updates.Quizzes[i].ID = uuid.Nil
			tx.Create(&updates.Quizzes[i])
			if len(updates.Quizzes[i].Options) > 0 {
				for j := range updates.Quizzes[i].Options {
					updates.Quizzes[i].Options[j].ID = uuid.Nil
					updates.Quizzes[i].Options[j].QuizID = updates.Quizzes[i].ID
				}
				tx.Create(&updates.Quizzes[i].Options)
			}
		}
	}

	tx.Commit()

	// Return updated lesson
	return h.GetOne(c)
}

// Delete - Delete lesson and all related data
func (h *LessonHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	lessonID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid lesson ID",
		})
	}

	// enforce access
	if err := middleware.CanAccessLesson(c, lessonID); err != nil {
		return err
	}

	db := database.GetDB()
	tx := db.Begin()

	// Delete all related data (cascade delete)
	tx.Where("owner_type = ? AND owner_id = ?", models.OwnerLesson, lessonID).Delete(&models.Media{})
	tx.Where("lesson_id = ?", lessonID).Delete(&models.LessonObjective{})

	// Delete models and their media
	var lessonModels []models.LessonModel
	tx.Where("lesson_id = ?", lessonID).Find(&lessonModels)
	for _, m := range lessonModels {
		tx.Where("owner_type = ? AND owner_id = ?", models.OwnerLessonModel, m.ID).Delete(&models.Media{})
	}
	tx.Where("lesson_id = ?", lessonID).Delete(&models.LessonModel{})

	// Delete preparation and its media
	var lessonPrep models.LessonPreparation
	if tx.Where("lesson_id = ?", lessonID).First(&lessonPrep).Error == nil {
		tx.Where("owner_type = ? AND owner_id = ?", models.OwnerLessonPreparation, lessonPrep.ID).Delete(&models.Media{})
	}
	tx.Where("lesson_id = ?", lessonID).Delete(&models.LessonPreparation{})

	// Delete builds and their media
	var lessonBuilds []models.LessonBuild
	tx.Where("lesson_id = ?", lessonID).Find(&lessonBuilds)
	for _, b := range lessonBuilds {
		tx.Where("owner_type = ? AND owner_id = ?", models.OwnerLessonBuild, b.ID).Delete(&models.Media{})
	}
	tx.Where("lesson_id = ?", lessonID).Delete(&models.LessonBuild{})

	// Delete content blocks and their media
	var contentBlocks []models.LessonContentBlock
	tx.Where("lesson_id = ?", lessonID).Find(&contentBlocks)
	for _, cb := range contentBlocks {
		tx.Where("owner_type = ? AND owner_id = ?", models.OwnerLessonContentBlock, cb.ID).Delete(&models.Media{})
	}
	tx.Where("lesson_id = ?", lessonID).Delete(&models.LessonContentBlock{})

	// Delete attachments and their media
	var lessonAttachments []models.LessonAttachment
	tx.Where("lesson_id = ?", lessonID).Find(&lessonAttachments)
	for _, a := range lessonAttachments {
		tx.Where("owner_type = ? AND owner_id = ?", models.OwnerLessonAttachment, a.ID).Delete(&models.Media{})
	}
	tx.Where("lesson_id = ?", lessonID).Delete(&models.LessonAttachment{})

	// Delete challenges and their media
	var lessonChallenges []models.LessonChallenge
	tx.Where("lesson_id = ?", lessonID).Find(&lessonChallenges)
	for _, ch := range lessonChallenges {
		tx.Where("owner_type = ? AND owner_id = ?", models.OwnerLessonChallenge, ch.ID).Delete(&models.Media{})
	}
	tx.Where("lesson_id = ?", lessonID).Delete(&models.LessonChallenge{})

	// Delete quizzes and their options
	var lessonQuizzes []models.LessonQuiz
	tx.Where("lesson_id = ?", lessonID).Find(&lessonQuizzes)
	for _, q := range lessonQuizzes {
		tx.Where("quiz_id = ?", q.ID).Delete(&models.LessonQuizOption{})
	}
	tx.Where("lesson_id = ?", lessonID).Delete(&models.LessonQuiz{})

	// Finally delete the lesson
	if err := tx.Delete(&models.Lesson{}, "id = ?", lessonID).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete lesson",
		})
	}

	tx.Commit()

	return c.JSON(fiber.Map{
		"message": "Lesson deleted successfully",
	})
}
