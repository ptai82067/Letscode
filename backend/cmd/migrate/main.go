package main

import (
	"courseai/backend/internal/config"
	"courseai/backend/internal/database"
	"log"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	if err := database.Connect(cfg.Database.DSN()); err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	if err := database.AutoMigrate(); err != nil {
		log.Fatalf("AutoMigrate failed: %v", err)
	}

	log.Println("AutoMigrate completed successfully")
}
