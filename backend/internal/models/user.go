package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRole string
type UserStatus string

const (
	RoleAdmin   UserRole = "admin"
	RoleTeacher UserRole = "teacher"

	StatusActive   UserStatus = "active"
	StatusInactive UserStatus = "inactive"
)

type User struct {
	ID           uuid.UUID  `gorm:"type:uuid;primary_key" json:"id"`
	Username     string     `gorm:"uniqueIndex;not null" json:"username"`
	Email        string     `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string     `gorm:"not null" json:"-"`
	Role         UserRole   `gorm:"type:varchar(20);not null" json:"role"`
	Status       UserStatus `gorm:"type:varchar(20);not null;default:'active'" json:"status"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}
