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

	// Log env var state for debugging - ABSOLUTE DIAGNOSTIC
	log.Println("")
	log.Println("════════════════════════════════════════════════════════════════")
	log.Println("🚀 CourseAI Backend Configuration Loading")
	log.Println("════════════════════════════════════════════════════════════════")
	log.Printf("🔍 DIAGNOSTIC: DATABASE_URL exists: %v\n", databaseURL != "")
	if databaseURL != "" {
		log.Printf("   DATABASE_URL length: %d chars\n", len(databaseURL))
		log.Printf("   DATABASE_URL starts with: %.30s...\n", databaseURL)
		log.Println("✅ Using managed database connection (Neon/Render/Production)")
	} else {
		log.Println("   ⚠️  DATABASE_URL is EMPTY or NOT SET")
		// No DATABASE_URL - try to load .env (local dev mode)
		log.Println("\n⚠️  DATABASE_URL not found - attempting godotenv.Load()...")
		err := godotenv.Load()
		if err != nil {
			// .env not found - we're in production without DATABASE_URL
			log.Println("════════════════════════════════════════════════════════════════")
			log.Println("❌ FATAL ERROR: PRODUCTION DEPLOYMENT - DATABASE_URL REQUIRED")
			log.Println("════════════════════════════════════════════════════════════════")
			log.Println("")
			log.Println("Application cannot start: Missing database configuration")
			log.Println("")
			log.Println("This is a production environment (no .env file found)")
			log.Println("DATABASE_URL environment variable MUST be set")
			log.Println("")
			log.Println("TO FIX on Render.com:")
			log.Println("  1. Go to: https://dashboard.render.com")
			log.Println("  2. Select your backend service")
			log.Println("  3. Go to: Settings → Environment")
			log.Println("  4. Add Environment Variable:")
			log.Println("     Name:  DATABASE_URL")
			log.Println("     Value: postgresql://user:password@host/db?sslmode=require")
			log.Println("  5. Save and Manual Deploy")
			log.Println("")
			log.Println("Expected PostgreSQL connection string format:")
			log.Println("  postgresql://username:password@hostname:port/dbname?sslmode=require")
			log.Println("  Example: postgresql://neondb_owner:npg_xxx@ep-xxx.aws.neon.tech/neondb?sslmode=require")
			log.Println("")
			log.Println("════════════════════════════════════════════════════════════════")
			log.Fatal("STOPPING: DATABASE_URL environment variable is not set")
		}
		log.Println("✓ .env file loaded successfully (development mode)")
	}
	log.Println("════════════════════════════════════════════════════════════════")
	log.Println("")

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

	log.Println("\n════════════════════════════════════════════════════════════════")
	log.Println("🔍 DATABASE CONFIGURATION ANALYSIS")
	log.Println("════════════════════════════════════════════════════════════════")
	log.Printf("  DATABASE_URL value: %q\n", databaseURL)
	log.Printf("  DATABASE_URL is empty: %v\n", databaseURL == "")
	log.Printf("  DATABASE_URL length: %d\n", len(databaseURL))

	// Also check individual vars
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")
	dbUser := os.Getenv("DB_USER")

	log.Printf("  DB_HOST: %q\n", dbHost)
	log.Printf("  DB_PORT: %q\n", dbPort)
	log.Printf("  DB_NAME: %q\n", dbName)
	log.Printf("  DB_USER: %q\n", dbUser)
	log.Println("════════════════════════════════════════════════════════════════\n")

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
