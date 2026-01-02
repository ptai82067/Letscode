package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AssignmentScope string
type AssignmentStatus string
type AssignmentAction string

const (
	ScopeProgram   AssignmentScope = "program"
	ScopeSubcourse AssignmentScope = "subcourse"

	AssignmentStatusPending AssignmentStatus = "pending"
	AssignmentStatusActive  AssignmentStatus = "active"
	AssignmentStatusRevoked AssignmentStatus = "revoked"

	ActionCreate   AssignmentAction = "create"
	ActionUpdate   AssignmentAction = "update"
	ActionRevoke   AssignmentAction = "revoke"
	ActionActivate AssignmentAction = "activate"
	ActionSetCode  AssignmentAction = "set_code"
)

type TeacherAssignment struct {
	ID             uuid.UUID        `gorm:"type:uuid;primary_key" json:"id"`
	TeacherID      uuid.UUID        `gorm:"type:uuid;not null;index" json:"teacher_id"`
	ProgramID      *uuid.UUID       `gorm:"type:uuid;index" json:"program_id,omitempty"`
	SubcourseID    *uuid.UUID       `gorm:"type:uuid;index" json:"subcourse_id,omitempty"`
	ScopeLevel     AssignmentScope  `gorm:"type:varchar(20);not null" json:"scope_level"`
	Status         AssignmentStatus `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`
	AccessCodeHash *string          `gorm:"type:text" json:"-"`
	CodeExpiresAt  *time.Time       `json:"code_expires_at,omitempty"`
	StartAt        *time.Time       `json:"start_at,omitempty"`
	EndAt          *time.Time       `json:"end_at,omitempty"`
	CreatedAt      time.Time        `json:"created_at"`
	UpdatedAt      time.Time        `json:"updated_at"`

	// Relations
	Teacher *User `gorm:"foreignKey:TeacherID" json:"teacher,omitempty"`
}

func (ta *TeacherAssignment) BeforeCreate(tx *gorm.DB) error {
	if ta.ID == uuid.Nil {
		ta.ID = uuid.New()
	}
	return nil
}

type TeacherAssignmentLog struct {
	ID           uuid.UUID        `gorm:"type:uuid;primary_key" json:"id"`
	AssignmentID uuid.UUID        `gorm:"type:uuid;not null;index" json:"assignment_id"`
	ActorID      uuid.UUID        `gorm:"type:uuid;not null" json:"actor_id"`
	Action       AssignmentAction `gorm:"type:varchar(50);not null" json:"action"`
	OldStatus    *string          `gorm:"type:varchar(20)" json:"old_status,omitempty"`
	NewStatus    *string          `gorm:"type:varchar(20)" json:"new_status,omitempty"`
	CreatedAt    time.Time        `json:"created_at"`

	// Relations
	Assignment *TeacherAssignment `gorm:"foreignKey:AssignmentID" json:"assignment,omitempty"`
	Actor      *User              `gorm:"foreignKey:ActorID" json:"actor,omitempty"`
}

func (tal *TeacherAssignmentLog) BeforeCreate(tx *gorm.DB) error {
	if tal.ID == uuid.Nil {
		tal.ID = uuid.New()
	}
	return nil
}
