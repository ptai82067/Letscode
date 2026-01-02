package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Lesson struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
	SubcourseID uuid.UUID      `gorm:"type:uuid;not null;index" json:"subcourse_id"`
	Title       string         `gorm:"not null" json:"title"`
	Subtitle    string         `gorm:"type:text" json:"subtitle"`
	Overview    string         `gorm:"type:text" json:"overview"`
	BlockTypes  datatypes.JSON `gorm:"type:jsonb" json:"block_types"`
	Status      ContentStatus  `gorm:"type:varchar(20);not null;default:'draft'" json:"status"`
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	// Additional metadata
	DurationMinutes int        `gorm:"default:0" json:"duration_minutes"`
	Difficulty      string     `gorm:"type:varchar(50)" json:"difficulty"`
	EstimatedTime   string     `gorm:"type:varchar(50)" json:"estimated_time"`
	CoverMediaID    *uuid.UUID `gorm:"type:uuid;index" json:"cover_media_id,omitempty"`
	AuthorID        *uuid.UUID `gorm:"type:uuid;index" json:"author_id,omitempty"`
	IsFeatured      bool       `gorm:"default:false" json:"is_featured"`
	PublishedAt     *time.Time `json:"published_at,omitempty"`
	Slug            string     `gorm:"uniqueIndex;not null" json:"slug"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`

	// Relations
	Subcourse     *Subcourse           `gorm:"foreignKey:SubcourseID" json:"subcourse,omitempty"`
	Objectives    *LessonObjective     `gorm:"foreignKey:LessonID" json:"objectives,omitempty"`
	Models        []LessonModel        `gorm:"foreignKey:LessonID" json:"models,omitempty"`
	Preparation   *LessonPreparation   `gorm:"foreignKey:LessonID" json:"preparation,omitempty"`
	Builds        []LessonBuild        `gorm:"foreignKey:LessonID" json:"builds,omitempty"`
	ContentBlocks []LessonContentBlock `gorm:"foreignKey:LessonID" json:"content_blocks,omitempty"`
	Attachments   []LessonAttachment   `gorm:"foreignKey:LessonID" json:"attachments,omitempty"`
	Challenges    []LessonChallenge    `gorm:"foreignKey:LessonID" json:"challenges,omitempty"`
	Quizzes       []LessonQuiz         `gorm:"foreignKey:LessonID" json:"quizzes,omitempty"`
	Media         []Media              `gorm:"polymorphic:Owner;polymorphicValue:lesson" json:"media,omitempty"`
}

func (l *Lesson) BeforeCreate(tx *gorm.DB) error {
	if l.ID == uuid.Nil {
		l.ID = uuid.New()
	}
	return nil
}
