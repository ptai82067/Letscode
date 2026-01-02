package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type ContentStatus string

const (
	StatusDraft     ContentStatus = "draft"
	StatusPublished ContentStatus = "published"
	StatusArchived  ContentStatus = "archived"
)

type Program struct {
	ID               uuid.UUID      `gorm:"type:uuid;primary_key" json:"id"`
	Name             string         `gorm:"not null" json:"name"`
	Slug             string         `gorm:"uniqueIndex;not null" json:"slug"`
	ShortDescription string         `gorm:"type:text" json:"short_description"`
	Description      string         `gorm:"type:text" json:"description"`
	BlockTypes       datatypes.JSON `gorm:"type:jsonb" json:"block_types"`
	Status           ContentStatus  `gorm:"type:varchar(20);not null;default:'draft'" json:"status"`
	SortOrder        int            `gorm:"default:0" json:"sort_order"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`

	// Relations
	Subcourses []Subcourse `gorm:"foreignKey:ProgramID;references:ID" json:"subcourses,omitempty"`
	Media      []Media     `gorm:"polymorphic:Owner;polymorphicValue:program" json:"media,omitempty"`
	// Transient field populated by handlers
	SubcourseCount int `gorm:"-" json:"subcourse_count,omitempty"`
}

func (p *Program) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
