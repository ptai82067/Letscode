package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// LessonObjective - Objectives for a lesson (knowledge, thinking, skills, attitude)
type LessonObjective struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	LessonID  uuid.UUID `gorm:"type:uuid;not null;uniqueIndex" json:"lesson_id"`
	Knowledge string    `gorm:"type:text" json:"knowledge"`
	Thinking  string    `gorm:"type:text" json:"thinking"`
	Skills    string    `gorm:"type:text" json:"skills"`
	Attitude  string    `gorm:"type:text" json:"attitude"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (lo *LessonObjective) BeforeCreate(tx *gorm.DB) error {
	if lo.ID == uuid.Nil {
		lo.ID = uuid.New()
	}
	return nil
}

// LessonModel - Models used in lesson
type LessonModel struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	LessonID    uuid.UUID `gorm:"type:uuid;not null;index" json:"lesson_id"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relations
	Media []Media `gorm:"polymorphic:Owner;polymorphicValue:lesson_model" json:"media,omitempty"`
}

func (lm *LessonModel) BeforeCreate(tx *gorm.DB) error {
	if lm.ID == uuid.Nil {
		lm.ID = uuid.New()
	}
	return nil
}

// LessonPreparation - Preparation notes and materials
type LessonPreparation struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	LessonID  uuid.UUID `gorm:"type:uuid;not null;uniqueIndex" json:"lesson_id"`
	Notes     string    `gorm:"type:text" json:"notes"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relations
	Media []Media `gorm:"polymorphic:Owner;polymorphicValue:lesson_preparation" json:"media,omitempty"`
}

func (lp *LessonPreparation) BeforeCreate(tx *gorm.DB) error {
	if lp.ID == uuid.Nil {
		lp.ID = uuid.New()
	}
	return nil
}

// BuildType enum
type BuildType string

const (
	BuildTypePDF    BuildType = "pdf"
	BuildTypeImages BuildType = "images"
)

// LessonBuild - PDF or image slides for lesson
type LessonBuild struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	LessonID    uuid.UUID `gorm:"type:uuid;not null;index" json:"lesson_id"`
	BuildType   BuildType `gorm:"type:varchar(20);not null" json:"build_type"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relations
	Media []Media `gorm:"polymorphic:Owner;polymorphicValue:lesson_build" json:"media,omitempty"`
}

func (lb *LessonBuild) BeforeCreate(tx *gorm.DB) error {
	if lb.ID == uuid.Nil {
		lb.ID = uuid.New()
	}
	return nil
}

// LessonContentBlock - Content blocks in lesson
type LessonContentBlock struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	LessonID    uuid.UUID `gorm:"type:uuid;not null;index" json:"lesson_id"`
	Title       string    `gorm:"not null" json:"title"`
	Subtitle    string    `gorm:"type:text" json:"subtitle"`
	Description string    `gorm:"type:text" json:"description"`
	UsageText   string    `gorm:"type:text" json:"usage_text"`
	ExampleText string    `gorm:"type:text" json:"example_text"`
	SortOrder   int       `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relations
	Media []Media `gorm:"polymorphic:Owner;polymorphicValue:lesson_content_block" json:"media,omitempty"`
}

func (lcb *LessonContentBlock) BeforeCreate(tx *gorm.DB) error {
	if lcb.ID == uuid.Nil {
		lcb.ID = uuid.New()
	}
	return nil
}

// LessonAttachment - File attachments for lesson
type LessonAttachment struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	LessonID    uuid.UUID `gorm:"type:uuid;not null;index" json:"lesson_id"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	FileType    string    `gorm:"type:varchar(50)" json:"file_type"`
	SortOrder   int       `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relations
	Media []Media `gorm:"polymorphic:Owner;polymorphicValue:lesson_attachment" json:"media,omitempty"`
}

func (la *LessonAttachment) BeforeCreate(tx *gorm.DB) error {
	if la.ID == uuid.Nil {
		la.ID = uuid.New()
	}
	return nil
}

// LessonChallenge - Challenges for lesson
type LessonChallenge struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	LessonID     uuid.UUID `gorm:"type:uuid;not null;index" json:"lesson_id"`
	Title        string    `gorm:"not null" json:"title"`
	Subtitle     string    `gorm:"type:text" json:"subtitle"`
	Description  string    `gorm:"type:text" json:"description"`
	Instructions string    `gorm:"type:text" json:"instructions"`
	SortOrder    int       `gorm:"default:0" json:"sort_order"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	// Relations
	Media []Media `gorm:"polymorphic:Owner;polymorphicValue:lesson_challenge" json:"media,omitempty"`
}

func (lc *LessonChallenge) BeforeCreate(tx *gorm.DB) error {
	if lc.ID == uuid.Nil {
		lc.ID = uuid.New()
	}
	return nil
}

// QuizType enum
type QuizType string

const (
	QuizTypeSingle   QuizType = "single"
	QuizTypeMultiple QuizType = "multiple"
	QuizTypeOpen     QuizType = "open"
)

// LessonQuiz - Quiz questions for lesson
type LessonQuiz struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key" json:"id"`
	LessonID    uuid.UUID `gorm:"type:uuid;not null;index" json:"lesson_id"`
	Title       string    `gorm:"not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	QuizType    QuizType  `gorm:"type:varchar(20);not null" json:"quiz_type"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relations
	Options []LessonQuizOption `gorm:"foreignKey:QuizID;references:ID" json:"options,omitempty"`
}

func (lq *LessonQuiz) BeforeCreate(tx *gorm.DB) error {
	if lq.ID == uuid.Nil {
		lq.ID = uuid.New()
	}
	return nil
}

// LessonQuizOption - Options for quiz questions
type LessonQuizOption struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	QuizID      uuid.UUID `gorm:"type:uuid;not null;index" json:"quiz_id"`
	Content     string    `gorm:"type:text;not null" json:"content"`
	IsCorrect   bool      `gorm:"default:false" json:"is_correct"`
	Explanation string    `gorm:"type:text" json:"explanation"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (lqo *LessonQuizOption) BeforeCreate(tx *gorm.DB) error {
	if lqo.ID == uuid.Nil {
		lqo.ID = uuid.New()
	}
	return nil
}
