package config

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Database DatabaseConfig
	JWT      JWTConfig
	Server   ServerConfig
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

type JWTConfig struct {
	Secret      string
	ExpireHours int
}

type ServerConfig struct {
	Port        string
	FrontendURL string
}

func Load() (*Config, error) {
	// CRITICAL: Check DATABASE_URL first
	databaseURL := os.Getenv("DATABASE_URL")
	
	// Log env var state for debugging
	log.Printf("Environment check: DATABASE_URL=%v\n", databaseURL != "")

	// If DATABASE_URL is set, use it and skip .env
	if databaseURL != "" {
		log.Println("✓ DATABASE_URL found - skipping .env")
	} else {
		// No DATABASE_URL - try to load .env (local dev mode)
		err := godotenv.Load()
		if err != nil {
			// .env not found - we're likely in production without DATABASE_URL
			log.Println("⚠️  .env file not found - checking if DATABASE_URL is set...")
			
			// If .env fails to load AND DATABASE_URL not set, we MUST fail
			// This prevents silent fallback to localhost
			log.Fatal("❌ FATAL ERROR: DATABASE_URL is not set!\n" +
				"This app requires DATABASE_URL environment variable.\n" +
				"Set it in your Render environment variables:\n" +
				"DATABASE_URL=postgresql://user:password@host:port/db?sslmode=require")
		}
		log.Println("✓ .env file loaded (development mode)")
	}

	expireHours, _ := strconv.Atoi(getEnv("JWT_EXPIRE_HOURS", "24"))

	// Try to use DATABASE_URL if available (Neon, Render, etc.)
	// Otherwise fall back to individual DB_* environment variables
	dbConfig := parseDatabase()

	return &Config{
		Database: dbConfig,
		JWT: JWTConfig{
			Secret:      getEnv("JWT_SECRET", "default-secret-change-me"),
			ExpireHours: expireHours,
		},
		Server: ServerConfig{
			Port:        getEnv("PORT", "8080"),
			FrontendURL: getEnv("FRONTEND_URL", "http://localhost:5173"),
		},
	}, nil
}

func parseDatabase() DatabaseConfig {
	databaseURL := os.Getenv("DATABASE_URL")
	
	// DEBUG: Log EVERYTHING to understand what's happening
	log.Printf("🔍 DEBUG parseDatabase():\n")
	log.Printf("  DATABASE_URL = %q\n", databaseURL)
	log.Printf("  DB_HOST = %q\n", os.Getenv("DB_HOST"))
	log.Printf("  DB_PORT = %q\n", os.Getenv("DB_PORT"))
	log.Printf("  DB_NAME = %q\n", os.Getenv("DB_NAME"))

	log.Printf("Using DATABASE_URL: %v\n", databaseURL != "")

	// If DATABASE_URL is set, use it directly
	if databaseURL != "" {
		log.Println("✓ DATABASE_URL found - connecting to managed database")
		return DatabaseConfig{
			Host:    databaseURL,
			SSLMode: "url", // Marker to use full URL in DSN()
		}
	}

	// Fall back to individual DB vars (local/dev only)
	log.Println("⚠️  Using individual DB_* variables (development mode)")
	return DatabaseConfig{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "postgres"),
		Password: getEnv("DB_PASSWORD", "postgres"),
		Name:     getEnv("DB_NAME", "courseai_db"),
		SSLMode:  getEnv("DB_SSLMODE", "disable"),
	}
}

func (c *DatabaseConfig) DSN() string {
	// If we're using DATABASE_URL, return it directly
	if c.SSLMode == "url" {
		return c.Host
	}

	// Otherwise, construct DSN from individual components
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.Name, c.SSLMode,
	)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
