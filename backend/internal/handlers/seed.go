package handlers

import (
	"courseai/backend/internal/database"

	"github.com/gofiber/fiber/v2"
)

type SeedHandler struct{}

func NewSeedHandler() *SeedHandler { return &SeedHandler{} }

// Run triggers the database seeding routine. Protected route (admin only).
func (h *SeedHandler) Run(c *fiber.Ctx) error {
	db := database.GetDB()
	if db == nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "database not initialized"})
	}
	if err := database.SeedData(db); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "seeding triggered"})
}
