import type { Program, Subcourse, Lesson } from '../types';
import { publicProgramsAPI, publicSubcoursesAPI, publicLessonsAPI } from './api';

export async function getPrograms(): Promise<Program[]> {
  return publicProgramsAPI.getAll();
}

export async function getSubcourses(programId?: string): Promise<Subcourse[]> {
  if (programId) return publicSubcoursesAPI.getByProgram(programId);
  return publicSubcoursesAPI.getAll();
}

export async function getLessons(subcourseId?: string): Promise<Lesson[]> {
  if (subcourseId) return publicLessonsAPI.getBySubcourse(subcourseId);
  return publicLessonsAPI.getAll();
}

export default { getPrograms, getSubcourses, getLessons };
