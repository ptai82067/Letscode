package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type MediaOwnerType string
type MediaPurpose string

const (
	OwnerProgram            MediaOwnerType = "program"
	OwnerSubcourse          MediaOwnerType = "subcourse"
	OwnerLesson             MediaOwnerType = "lesson"
	OwnerLessonModel        MediaOwnerType = "lesson_model"
	OwnerLessonPreparation  MediaOwnerType = "lesson_preparation"
	OwnerLessonBuild        MediaOwnerType = "lesson_build"
	OwnerLessonContentBlock MediaOwnerType = "lesson_content_block"
	OwnerLessonAttachment   MediaOwnerType = "lesson_attachment"
	OwnerLessonChallenge    MediaOwnerType = "lesson_challenge"

	PurposeCover   MediaPurpose = "cover"
	PurposeIntro   MediaPurpose = "intro"
	PurposeMain    MediaPurpose = "main"
	PurposeGallery MediaPurpose = "gallery"
	PurposeSlide   MediaPurpose = "slide"
	PurposeOther   MediaPurpose = "other"
)

type Media struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
	OwnerType MediaOwnerType `gorm:"type:varchar(50);not null;index:idx_owner" json:"owner_type"`
	OwnerID   uuid.UUID      `gorm:"type:uuid;not null;index:idx_owner" json:"owner_id"`
	URL       string         `gorm:"type:text;not null" json:"url"`
	MimeType  string         `gorm:"type:varchar(100)" json:"mime_type"`
	Purpose   MediaPurpose   `gorm:"type:varchar(50)" json:"purpose"`
	SortOrder int            `gorm:"default:0" json:"sort_order"`
	Meta      datatypes.JSON `gorm:"type:jsonb" json:"meta"` // {width, height, duration, size, etc}
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

func (m *Media) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}
