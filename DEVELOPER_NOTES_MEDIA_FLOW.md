# Media Upload / Lesson Create — Single Correct Solution

## Sequence (no race conditions)

1. Client POST /api/admin/lessons with lesson payload (no top-level `id`, no client-generated owner_ids in nested media arrays).
2. Server validates required fields, creates lesson and all nested parent records (models, preparation, builds, content_blocks, attachments, challenges) in a transaction; nested child records are created first without their Media relations.
3. Server returns created Lesson object with authoritative child IDs and preloaded relations (empty media arrays initially).
4. Client receives created Lesson object and begins uploads:
   - For each file, client calls POST /api/admin/media/upload with `owner_type` (one of allowed enum values) and `owner_id` equal to the server-provided child ID, and the file as multipart `file`.
   - The upload endpoint validates `owner_type` against a closed enum and confirms `owner_id` exists in the corresponding table before saving any file or DB row.
   - On success upload returns created media rows.
5. After all uploads complete, client calls GET /api/admin/lessons/:id.
6. Server returns the lesson with media arrays preloaded (media now persisted and visible).
7. Client replaces local state entirely with server response — UI renders media only from server response.

## Key Guarantees

- No client-generated UUIDs are ever used as `owner_id`.
- Upload handler validates `owner_type` (closed enum) and that `owner_id` exists in the corresponding table; invalid requests yield 400 errors with clear messages.
- Files are saved only after owner validation; on DB create failure saved files are deleted to avoid orphans.
- Client never mutates local media arrays directly; it always refetches authoritative lesson state after uploads and replaces local state.
- BodyLimit enforced at 64MB and upload handler enforces per-file size; large files return 413.

## Why media now appears reliably

- Previously the client uploaded files referencing client-generated owner IDs or before the server had created child records, producing media rows that didn't match preloads or owner records; the UI read stale local state or server-preload mismatched owner_type strings.
- Now the server is the single source of truth: child IDs come from server-create, upload requires server child IDs, and backend strictly validates owner_type/owner_id, preventing orphan rows.
- After upload the client refetches and replaces state atomically; the UI renders exactly what the server persisted, guaranteeing immediate visibility without manual local pushes.

## Notes for reviewers

- Backend changes:

  - `internal/models/media.go`: OwnerType is now typed to `MediaOwnerType` enum constants.
  - `internal/handlers/media_handler.go`: validates owner_type and owner_id, checks owner existence, enforces 64MB limit, removes files on failures.
  - `internal/handlers/lesson.go`: uses owner_type enum constants consistently when inserting/deleting media and sanitizes incoming media to ensure DB generates IDs.
  - `internal/handlers/program.go` and `internal/handlers/subcourse.go`: replaced raw owner_type strings with the matching enum constants.

- Frontend changes:
  - `frontend/src/components/AdminLessonFormV2.tsx`: removed client UUID usage, upload helper requires server-provided created lesson, uploads use server child IDs only, and after uploads the client refetches the lesson and replaces local state.

This file documents the single, production-ready flow enforced by the code changes in this PR.
