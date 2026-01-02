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
	// Load .env file ONLY in development (not in Render/production)
	// Render uses environment variables directly, not .env files
	if os.Getenv("RENDER") != "true" && os.Getenv("ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("⚠️  .env file not found (expected in development)")
		}
	} else {
		log.Println("✓ Skipping .env file (production environment detected)")
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
	
	// Log current environment for debugging
	isRender := os.Getenv("RENDER") == "true"
	isProduction := os.Getenv("ENV") == "production"
	log.Printf("🔍 Config Debug: RENDER=%v, ENV=%s, DATABASE_URL=%s\n", isRender, os.Getenv("ENV"), 
		func() string {
			if databaseURL != "" {
				return "***SET***"
			}
			return "NOT_SET"
		}())

	// If DATABASE_URL is set, parse it (for Neon, Render, and other managed services)
	if databaseURL != "" {
		log.Println("✓ DATABASE_URL found - using managed database service")
		return DatabaseConfig{
			Host:    databaseURL, // Store the full URL to signal we're using DATABASE_URL
			SSLMode: "url",       // Marker to use full URL mode
		}
	}

	// On Render or production, DATABASE_URL is REQUIRED
	if isRender || isProduction {
		log.Fatal("❌ FATAL: DATABASE_URL environment variable is REQUIRED in production/Render. " +
			"Please configure DATABASE_URL in your Render environment variables. " +
			"Example: postgresql://user:password@host:port/dbname?sslmode=require")
	}

	// Fall back to individual environment variables (development/local setup ONLY)
	log.Println("⚠️  Development mode: using individual DB_* environment variables")
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
