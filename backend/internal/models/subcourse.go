package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Subcourse struct {
	ID                 uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
	ProgramID          uuid.UUID      `gorm:"type:uuid;not null;index" json:"program_id"`
	Name               string         `gorm:"not null" json:"name"`
	Slug               string         `gorm:"uniqueIndex;not null" json:"slug"`
	AgeRange           string         `gorm:"type:varchar(50)" json:"age_range"`
	LessonCount        int            `gorm:"default:0" json:"lesson_count"`
	ShortDescription   string         `gorm:"type:text" json:"short_description"`
	GeneralObjectives  string         `gorm:"type:text" json:"general_objectives"`
	BlockTypes         datatypes.JSON `gorm:"type:jsonb" json:"block_types"`
	Status             ContentStatus  `gorm:"type:varchar(20);not null;default:'draft'" json:"status"`
	SortOrder          int            `gorm:"default:0" json:"sort_order"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`

	// Relations
	Program *Program `gorm:"foreignKey:ProgramID" json:"program,omitempty"`
	Lessons []Lesson `gorm:"foreignKey:SubcourseID" json:"lessons,omitempty"`
	Media   []Media  `gorm:"polymorphic:Owner;polymorphicValue:subcourse" json:"media,omitempty"`
}

func (s *Subcourse) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
