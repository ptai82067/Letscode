export interface User {
  assignments: never[];
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'teacher';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Media {
  filename?: string;
  id?: string;
  url: string;
  mime_type?: string;
  purpose: 'cover' | 'intro' | 'main' | 'gallery' | 'slide' | 'other';
  sort_order?: number;
  meta?: Record<string, unknown>;
}

export interface Program {
  id?: string;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  block_types?: string[];
  status: 'draft' | 'published' | 'archived';
  sort_order?: number;
  subcourse_count?: number;
  media?: Media[];
  created_at?: string;
  updated_at?: string;
}

export interface Subcourse {
  id?: string;
  program_id: string;
  name: string;
  slug: string;
  age_range?: string;
  lesson_count?: number;
  short_description?: string;
  general_objectives?: string;
  block_types?: string[];
  status: 'draft' | 'published' | 'archived';
  sort_order?: number;
  media?: Media[];
  program?: Program;
  created_at?: string;
  updated_at?: string;
}

export interface LessonObjective {
  id?: string;
  lesson_id?: string;
  knowledge?: string;
  thinking?: string;
  skills?: string;
  attitude?: string;
}

export interface LessonModel {
  id?: string;
  lesson_id?: string;
  title: string;
  description?: string;
  sort_order?: number;
  media?: Media[];
}

export interface LessonPreparation {
  id?: string;
  lesson_id?: string;
  notes?: string;
  media?: Media[];
}

export interface LessonBuild {
  id?: string;
  lesson_id?: string;
  build_type: 'pdf' | 'images';
  title: string;
  description?: string;
  sort_order?: number;
  media?: Media[];
}

export interface LessonContentBlock {
  id?: string;
  lesson_id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  usage_text?: string;
  example_text?: string;
  sort_order?: number;
  media?: Media[];
}

export interface LessonAttachment {
  id?: string;
  lesson_id?: string;
  title: string;
  description?: string;
  file_type?: string;
  sort_order?: number;
  media?: Media[];
}

export interface LessonChallenge {
  id?: string;
  lesson_id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  instructions?: string;
  sort_order?: number;
  media?: Media[];
}

export interface LessonQuizOption {
  id?: string;
  quiz_id?: string;
  content: string;
  is_correct: boolean;
  explanation?: string;
}

export interface LessonQuiz {
  id?: string;
  lesson_id?: string;
  title: string;
  description?: string;
  quiz_type: 'single' | 'multiple' | 'open';
  options?: LessonQuizOption[];
  media?: Media[];
}

export interface Lesson {
  id?: string;
  subcourse_id: string;
  title: string;
  subtitle?: string;
  overview?: string;
  block_types?: string[];
  status: 'draft' | 'published' | 'archived';
  sort_order?: number;
  slug: string;
  duration_minutes?: number;
  difficulty?: string;
  estimated_time?: string;
  media?: Media[];
  subcourse?: Subcourse;
  objectives?: LessonObjective;
  models?: LessonModel[];
  preparation?: LessonPreparation;
  builds?: LessonBuild[];
  content_blocks?: LessonContentBlock[];
  attachments?: LessonAttachment[];
  challenges?: LessonChallenge[];
  quizzes?: LessonQuiz[];
  created_at?: string;
  updated_at?: string;
}

export type TeacherAssignmentScope = 'program' | 'subcourse';
export type TeacherAssignmentStatus = 'pending' | 'active' | 'revoked';

export interface TeacherAssignment {
  id: string;
  teacher_id: string;
  program_id?: string;
  subcourse_id?: string;
  scope_level: TeacherAssignmentScope;
  status: TeacherAssignmentStatus;
  start_at?: string;
  end_at?: string;
  created_at: string;
}

