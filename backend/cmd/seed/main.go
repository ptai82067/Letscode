package main

import (
	"courseai/backend/internal/config"
	"courseai/backend/internal/database"
	"courseai/backend/internal/models"
	"encoding/json"
	"fmt"
	"log"

	"gorm.io/gorm"
)

func upsertProgram(db *gorm.DB) (models.Program, error) {
	slug := "lap-trinh-co-ban-seed"
	var prog models.Program
	if err := db.First(&prog, "slug = ?", slug).Error; err == nil {
		return prog, nil
	}
	blockTypes, _ := json.Marshal([]string{"cover", "text", "video"})
	prog = models.Program{
		Name:             "Chương trình Lập trình Cơ bản (Seed)",
		Slug:             slug,
		ShortDescription: "Khóa học mẫu tiếng Việt tạo bởi seed runner",
		Description:      "Phiên bản seed của Chương trình Lập trình Cơ bản cho mục đích phát triển",
		BlockTypes:       blockTypes,
		Status:           models.StatusPublished,
	}
	if err := db.Create(&prog).Error; err != nil {
		return models.Program{}, err
	}
	return prog, nil
}

func upsertSubcourse(db *gorm.DB, prog models.Program) (models.Subcourse, error) {
	slug := "lap-trinh-subcourse-seed"
	var sc models.Subcourse
	if err := db.First(&sc, "slug = ?", slug).Error; err == nil {
		return sc, nil
	}
	blockTypes, _ := json.Marshal([]string{"text", "video"})
	sc = models.Subcourse{
		ProgramID:        prog.ID,
		Name:             "Lập trình — Mô-đun Seed",
		Slug:             slug,
		AgeRange:         "8-12",
		LessonCount:      4,
		ShortDescription: "Mô-đun mẫu bằng tiếng Việt để phát triển và kiểm thử",
		BlockTypes:       blockTypes,
		Status:           models.StatusPublished,
	}
	if err := db.Create(&sc).Error; err != nil {
		return models.Subcourse{}, err
	}
	return sc, nil
}

func upsertLessons(db *gorm.DB, sc models.Subcourse) error {
	for i := 1; i <= 4; i++ {
		slug := fmt.Sprintf("%s-bai-%d", sc.Slug, i)
		var l models.Lesson
		if err := db.First(&l, "slug = ?", slug).Error; err == nil {
			continue
		}
		blockTypes, _ := json.Marshal([]string{"text", "video", "file"})
		lesson := models.Lesson{
			SubcourseID: sc.ID,
			Title:       fmt.Sprintf("Bài %d: %s", i, sc.Name),
			Subtitle:    "Bài học mẫu tiếng Việt",
			Overview:    "Nội dung minh họa: giải thích, ví dụ và bài tập thực hành.",
			BlockTypes:  blockTypes,
			Status:      models.StatusPublished,
			Slug:        slug,
			SortOrder:   i,
		}
		if err := db.Create(&lesson).Error; err != nil {
			return err
		}
		// add simple media for each lesson
		medias := []models.Media{
			{OwnerType: models.OwnerLesson, OwnerID: lesson.ID, URL: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80", MimeType: "image/jpeg", Purpose: models.PurposeCover, SortOrder: 1},
			{OwnerType: models.OwnerLesson, OwnerID: lesson.ID, URL: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", MimeType: "video/mp4", Purpose: models.PurposeIntro, SortOrder: 2},
			{OwnerType: models.OwnerLesson, OwnerID: lesson.ID, URL: "https://file-examples.com/wp-content/uploads/2017/10/file-sample_150kB.pdf", MimeType: "application/pdf", Purpose: models.PurposeMain, SortOrder: 3},
		}
		if err := db.Create(&medias).Error; err != nil {
			return err
		}
	}
	return nil
}

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("failed to load config:", err)
	}
	if err := database.Connect(cfg.Database.DSN()); err != nil {
		log.Fatal("failed to connect to db:", err)
	}
	db := database.GetDB()

	// ensure migrations ran
	if err := database.AutoMigrate(); err != nil {
		log.Println("warning: migrations error (continuing):", err)
	}

	prog, err := upsertProgram(db)
	if err != nil {
		log.Fatal("failed to create program:", err)
	}
	fmt.Println("Program ensured:", prog.Slug)

	sc, err := upsertSubcourse(db, prog)
	if err != nil {
		log.Fatal("failed to create subcourse:", err)
	}
	fmt.Println("Subcourse ensured:", sc.Slug)

	if err := upsertLessons(db, sc); err != nil {
		log.Fatal("failed to create lessons:", err)
	}
	fmt.Println("Lessons ensured for subcourse:", sc.Slug)
}
