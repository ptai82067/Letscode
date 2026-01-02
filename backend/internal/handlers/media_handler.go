package handlers

import (
	"courseai/backend/internal/config"
	"courseai/backend/internal/database"
	"courseai/backend/internal/models"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type MediaHandler struct {
	cfg *config.Config
}

func NewMediaHandler(cfg *config.Config) *MediaHandler {
	return &MediaHandler{cfg: cfg}
}

var allowedMimePrefixes = []string{"image/", "video/", "audio/"}
var allowedMimeExact = []string{"application/pdf", "text/plain"}

const maxUploadSize = 32 << 20 // 32 MB

func (h *MediaHandler) Upload(c *fiber.Ctx) error {
	// Parse multipart form using Fiber helper
	form, err := c.MultipartForm()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid multipart form"})
	}

	// get owner_type
	ownerType := c.FormValue("owner_type")
	if ownerType == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "owner_type is required"})
	}

	ownerIDStr := c.FormValue("owner_id")
	if ownerIDStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "owner_id is required"})
	}
	ownerID, err := uuid.Parse(ownerIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid owner_id"})
	}

	purpose := c.FormValue("purpose")

	files := form.File["file"]
	if len(files) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "file is required"})
	}

	db := database.GetDB()

	// Validate owner_type is one of the allowed enum values and that owner_id exists for that owner_type
	switch models.MediaOwnerType(ownerType) {
	case models.OwnerLesson:
		var l models.Lesson
		if err := db.First(&l, "id = ?", ownerID).Error; err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "owner_id not found for owner_type lesson"})
		}
	case models.OwnerLessonModel:
		var m models.LessonModel
		if err := db.First(&m, "id = ?", ownerID).Error; err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "owner_id not found for owner_type lesson_model"})
		}
	case models.OwnerLessonPreparation:
		var p models.LessonPreparation
		if err := db.First(&p, "id = ?", ownerID).Error; err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "owner_id not found for owner_type lesson_preparation"})
		}
	case models.OwnerLessonBuild:
		var b models.LessonBuild
		if err := db.First(&b, "id = ?", ownerID).Error; err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "owner_id not found for owner_type lesson_build"})
		}
	case models.OwnerLessonContentBlock:
		var cb models.LessonContentBlock
		if err := db.First(&cb, "id = ?", ownerID).Error; err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "owner_id not found for owner_type lesson_content_block"})
		}
	case models.OwnerLessonAttachment:
		var a models.LessonAttachment
		if err := db.First(&a, "id = ?", ownerID).Error; err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "owner_id not found for owner_type lesson_attachment"})
		}
	case models.OwnerLessonChallenge:
		var ch models.LessonChallenge
		if err := db.First(&ch, "id = ?", ownerID).Error; err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "owner_id not found for owner_type lesson_challenge"})
		}
	default:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid owner_type"})
	}

	// create uploads dir if not exists
	baseDir := "uploads"
	if _, err := os.Stat(baseDir); os.IsNotExist(err) {
		_ = os.Mkdir(baseDir, 0755)
	}

	savedMedias := make([]models.Media, 0)

	// handle multiple files
	for _, fh := range files {
		if fh == nil {
			continue
		}

		// open file to read header for content-type detection
		f, err := fh.Open()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to open file"})
		}
		var headerBuf [512]byte
		n, _ := io.ReadFull(f, headerBuf[:])
		contentType := http.DetectContentType(headerBuf[:n])
		// reset reader by closing (we will let SaveFile re-open the file)
		f.Close()

		// validate mime
		if !isAllowedMime(contentType) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": fmt.Sprintf("file type not allowed: %s", contentType)})
		}

		// prepare dest path
		ownerDir := filepath.Join(baseDir, ownerType)
		if _, err := os.Stat(ownerDir); os.IsNotExist(err) {
			_ = os.MkdirAll(ownerDir, 0755)
		}

		ext := filepath.Ext(fh.Filename)
		fname := fmt.Sprintf("%s_%d%s", uuid.New().String(), time.Now().UnixNano(), ext)
		destPath := filepath.Join(ownerDir, fname)

		// save file using Fiber helper (handles underlying copy)
		if err := c.SaveFile(fh, destPath); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save file"})
		}

		// get size and enforce max size
		info, _ := os.Stat(destPath)
		var savedSize int64 = 0
		if info != nil {
			savedSize = info.Size()
		}
		if savedSize > int64(64<<20) { // 64MB limit
			// remove file and return clear error
			_ = os.Remove(destPath)
			return c.Status(fiber.StatusRequestEntityTooLarge).JSON(fiber.Map{"error": "file too large"})
		}

		// build URL relative to server
		urlPath := fmt.Sprintf("/uploads/%s/%s", ownerType, fname)

		// meta: size, original filename
		meta := map[string]interface{}{"original_name": fh.Filename, "size": savedSize}
		metaJson, _ := json.Marshal(meta)

		media := models.Media{
			OwnerType: models.MediaOwnerType(ownerType),
			OwnerID:   ownerID,
			URL:       urlPath,
			MimeType:  contentType,
			Purpose:   models.MediaPurpose(purpose),
			SortOrder: 0,
			Meta:      metaJson,
		}

		if err := db.Create(&media).Error; err != nil {
			// remove saved file on DB failure to avoid orphan files
			_ = os.Remove(destPath)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create media record"})
		}

		savedMedias = append(savedMedias, media)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"media": savedMedias})
}

func isAllowedMime(ct string) bool {
	for _, p := range allowedMimePrefixes {
		if strings.HasPrefix(ct, p) {
			return true
		}
	}
	for _, e := range allowedMimeExact {
		if ct == e {
			return true
		}
	}
	return false
}
