package database

import (
	"courseai/backend/internal/models"
	"encoding/json"
	"fmt"
	"log"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedData(db *gorm.DB) error {
	log.Println("Starting data seeding...")

	// Check if admin already exists
	var adminCount int64
	// Ensure users table exists before querying. If not, skip seeding.
	if !db.Migrator().HasTable(&models.User{}) {
		log.Println("Users table does not exist yet; skipping data seeding until migrations complete")
		return nil
	}

	db.Model(&models.User{}).Where("username = ?", "admin123").Count(&adminCount)
	if adminCount > 0 {
		log.Println("Admin user already exists, skipping seed")
		return nil
	}

	// Create admin user
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	admin := models.User{
		Username:     "admin123",
		Email:        "admin123@example.com",
		PasswordHash: string(hashedPassword),
		Role:         models.RoleAdmin,
		Status:       models.StatusActive,
	}
	if err := db.Create(&admin).Error; err != nil {
		return err
	}
	log.Println("Admin user created")

	// Check if Program table exists
	if !db.Migrator().HasTable(&models.Program{}) {
		log.Println("Programs table does not exist yet; skipping program seeding until migrations complete")
		return nil
	}

	// If any program exists, assume seed already ran
	var progCount int64
	db.Model(&models.Program{}).Count(&progCount)
	if progCount > 0 {
		log.Println("Programs already exist, skipping seed")
		return nil
	}

	// Seed 3 Programs (tiếng Việt), mỗi chương trình gồm nhiều subcourse và bài học mẫu
	programDefs := []struct {
		ID    string
		Name  string
		Slug  string
		Short string
	}{
		{"11111111-1111-1111-1111-111111111111", "Chương trình Lập trình Cơ bản cho Thiếu nhi", "lap-trinh-co-ban", "Học lập trình cơ bản, logic và tư duy giải quyết vấn đề dành cho trẻ em"},
		{"22222222-2222-2222-2222-222222222222", "Chương trình Sáng tạo STEM", "sang-tao-stem", "Kết hợp Khoa học, Công nghệ, Kỹ thuật và Toán học qua dự án thực hành"},
		{"33333333-3333-3333-3333-333333333333", "Chương trình Khoa học Tự nhiên cho Thiếu nhi", "khoa-hoc-tu-nhien", "Khám phá thế giới tự nhiên qua thí nghiệm và hoạt động thực tế"},
	}

	for pi, pd := range programDefs {
		programBlockTypes, _ := json.Marshal([]string{"cover", "text", "video"})
		pid := uuid.MustParse(pd.ID)
		program := models.Program{
			ID:               pid,
			Name:             pd.Name,
			Slug:             pd.Slug,
			ShortDescription: pd.Short,
			Description:      fmt.Sprintf("%s: Nội dung khóa học, mục tiêu và cấu trúc học tập. Phù hợp cho học sinh tiểu học.", pd.Name),
			BlockTypes:       programBlockTypes,
			Status:           models.StatusPublished,
			SortOrder:        pi + 1,
		}
		if err := db.Create(&program).Error; err != nil {
			return err
		}

		// program media
		progMedia := []models.Media{
			{OwnerType: models.OwnerProgram, OwnerID: program.ID, URL: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80", MimeType: "image/jpeg", Purpose: models.PurposeCover, SortOrder: 1},
			{OwnerType: models.OwnerProgram, OwnerID: program.ID, URL: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", MimeType: "video/mp4", Purpose: models.PurposeIntro, SortOrder: 2},
		}
		if err := db.Create(&progMedia).Error; err != nil {
			return err
		}

		// create 3 subcourses per program
		subDefs := []struct{ ID, Name, Slug string }{
			{fmt.Sprintf("%s-aaaa-0000-0000-000000000001", pd.ID[:8]), fmt.Sprintf("%s - Phần 1: Giới thiệu", pd.Name), pd.Slug + "-phan-1"},
			{fmt.Sprintf("%s-bbbb-0000-0000-000000000002", pd.ID[:8]), fmt.Sprintf("%s - Phần 2: Thực hành", pd.Name), pd.Slug + "-phan-2"},
			{fmt.Sprintf("%s-cccc-0000-0000-000000000003", pd.ID[:8]), fmt.Sprintf("%s - Phần 3: Dự án", pd.Name), pd.Slug + "-phan-3"},
		}
		for si, sd := range subDefs {
			// create subcourse ID from base
			// to keep IDs valid UUIDs, use a new uuid
			subID := uuid.New()
			subBlockTypes, _ := json.Marshal([]string{"text", "video", "quiz"})
			sub := models.Subcourse{
				ID:               subID,
				ProgramID:        program.ID,
				Name:             sd.Name,
				Slug:             sd.Slug,
				AgeRange:         "8-12",
				LessonCount:      4,
				ShortDescription: fmt.Sprintf("%s — mô-đun hướng dẫn với nội dung thực hành và bài tập.", sd.Name),
				BlockTypes:       subBlockTypes,
				Status:           models.StatusPublished,
				SortOrder:        si + 1,
			}
			if err := db.Create(&sub).Error; err != nil {
				return err
			}

			subMedia := []models.Media{
				{OwnerType: models.OwnerSubcourse, OwnerID: sub.ID, URL: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=80", MimeType: "image/jpeg", Purpose: models.PurposeCover, SortOrder: 1},
				{OwnerType: models.OwnerSubcourse, OwnerID: sub.ID, URL: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", MimeType: "video/mp4", Purpose: models.PurposeIntro, SortOrder: 2},
			}
			if err := db.Create(&subMedia).Error; err != nil {
				return err
			}

			// create 4 lessons per subcourse
			for li := 1; li <= 4; li++ {
				lessonBlockTypes, _ := json.Marshal([]string{"text", "video", "file"})
				lesson := models.Lesson{
					SubcourseID: sub.ID,
					Title:       fmt.Sprintf("Bài %d: %s", li, sub.Name),
					Subtitle:    "Bài học mẫu bằng tiếng Việt",
					Overview:    "Nội dung bài học minh họa bao gồm giải thích, ví dụ và bài tập thực hành.",
					BlockTypes:  lessonBlockTypes,
					Status:      models.StatusPublished,
					Slug:        fmt.Sprintf("%s-bai-%d", sub.Slug, li),
					SortOrder:   li,
				}
				if err := db.Create(&lesson).Error; err != nil {
					return err
				}

				// lesson media: cover, intro, content
				lessonMedia := []models.Media{
					{OwnerType: models.OwnerLesson, OwnerID: lesson.ID, URL: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80", MimeType: "image/jpeg", Purpose: models.PurposeCover, SortOrder: 1},
					{OwnerType: models.OwnerLesson, OwnerID: lesson.ID, URL: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4", MimeType: "video/mp4", Purpose: models.PurposeIntro, SortOrder: 2},
					{OwnerType: models.OwnerLesson, OwnerID: lesson.ID, URL: "https://file-examples.com/wp-content/uploads/2017/10/file-sample_150kB.pdf", MimeType: "application/pdf", Purpose: models.PurposeMain, SortOrder: 3},
					{OwnerType: models.OwnerLesson, OwnerID: lesson.ID, URL: "https://images.unsplash.com/photo-1517817748493-527f3f6c2b79?auto=format&fit=crop&w=1200&q=80", MimeType: "image/jpeg", Purpose: models.PurposeGallery, SortOrder: 4},
				}
				if err := db.Create(&lessonMedia).Error; err != nil {
					return err
				}
			}
		}
	}

	log.Println("✅ Data seeding completed successfully!")
	return nil
}
