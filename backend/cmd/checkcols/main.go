package main

import (
	"courseai/backend/internal/config"
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config load: %v", err)
	}
	db, err := sql.Open("postgres", cfg.Database.DSN())
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer db.Close()

	rows, err := db.Query("SELECT column_name FROM information_schema.columns WHERE table_name='lessons' ORDER BY ordinal_position")
	if err != nil {
		log.Fatalf("query columns: %v", err)
	}
	defer rows.Close()
	fmt.Println("Columns in lessons:")
	for rows.Next() {
		var col string
		if err := rows.Scan(&col); err != nil {
			log.Fatalf("scan: %v", err)
		}
		fmt.Println(" -", col)
	}
}
