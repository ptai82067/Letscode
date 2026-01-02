/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import type { User, Program, Subcourse, Lesson } from '../types';
import { routes } from '../routes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Defensive: strip any blob: object URLs from JSON payloads so blob URLs never cross API boundaries
    function stripBlobUrls(value: any): any {
      if (value == null) return value;
      if (Array.isArray(value)) {
        return value
          .map((v) => stripBlobUrls(v))
          .filter((v) => {
            if (v && typeof v === 'object' && typeof v.url === 'string' && v.url.startsWith('blob:')) return false;
            return true;
          });
      }
      if (typeof value === 'object') {
        // don't attempt to process FormData
        if (typeof FormData !== 'undefined' && value instanceof FormData) return value;
        const out: Record<string, any> = {};
        for (const k of Object.keys(value)) {
          const v = value[k];
          if (v && typeof v === 'object' && typeof v.url === 'string' && v.url.startsWith('blob:')) {
            // skip this media object entirely
            continue;
          }
          out[k] = stripBlobUrls(v);
        }
        return out;
      }
      return value;
    }

    try {
      if (config.data && typeof config.data === 'object' && !(typeof FormData !== 'undefined' && config.data instanceof FormData)) {
        config.data = stripBlobUrls(config.data);
      }
    } catch (e) {
      // if sanitization fails for any reason, don't block the request — log and continue
      // eslint-disable-next-line no-console
      console.warn('Failed to sanitize request body for blob URLs', e);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Sanitize responses: remove any media objects that contain blob: URLs so persisted data never exposes blob URLs
    function sanitizeResponseData(value: any): any {
      if (value == null) return value;
      if (Array.isArray(value)) {
        const mapped = value.map((v) => sanitizeResponseData(v)).filter((v) => v !== null && v !== undefined);
        return mapped;
      }
      if (typeof value === 'object') {
        // if this object looks like a media object with a blob URL, drop it
        if (typeof value.url === 'string' && value.url.startsWith('blob:')) return null;
        // don't attempt to process FormData
        if (typeof FormData !== 'undefined' && value instanceof FormData) return value;
        const out: Record<string, any> = {};
        for (const k of Object.keys(value)) {
          const v = value[k];
          const sv = sanitizeResponseData(v);
          if (sv === null || sv === undefined) continue;
          out[k] = sv;
        }
        return out;
      }
      return value;
    }

    try {
      if (response && response.data) {
        response.data = sanitizeResponseData(response.data);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to sanitize API response for blob URLs', e);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = routes.login();
    }

    if (status === 403) {
      // Graceful handling: redirect to home with query flag so UI can show friendly message
      try {
        const url = new URL(window.location.href);
        url.pathname = routes.home();
        url.searchParams.set('forbidden', '1');
        window.location.href = url.toString();
        return Promise.reject({ isForbidden: true, original: error });
      } catch (e) {
        return Promise.reject({ isForbidden: true, original: error });
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Programs API
export const programsAPI = {
  getAll: async (): Promise<Program[]> => {
    const response = await api.get('/admin/programs');
    return response.data;
  },
  
  getOne: async (id: string): Promise<Program> => {
    const response = await api.get(`/admin/programs/${id}`);
    return response.data;
  },
  
  create: async (data: Program): Promise<Program> => {
    const response = await api.post('/admin/programs', data);
    return response.data;
  },
  
  update: async (id: string, data: Program): Promise<Program> => {
    const response = await api.put(`/admin/programs/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/programs/${id}`);
  },
};

// Public Programs API (read-only, no auth required)
export const publicProgramsAPI = {
  getAll: async (): Promise<Program[]> => {
    const response = await api.get('/programs');
    return response.data;
  },

  getOne: async (id: string): Promise<Program> => {
    const response = await api.get(`/programs/${id}`);
    return response.data;
  },
};

// Subcourses API
export const subcoursesAPI = {
  getAll: async (programId?: string): Promise<Subcourse[]> => {
    const params = programId ? { program_id: programId } : {};
    const response = await api.get('/admin/subcourses', { params });
    return response.data;
  },
  
  getOne: async (id: string): Promise<Subcourse> => {
    const response = await api.get(`/admin/subcourses/${id}`);
    return response.data;
  },
  
  getByProgram: async (programId: string): Promise<Subcourse[]> => {
    const response = await api.get(`/admin/programs/${programId}/subcourses`);
    return response.data;
  },
  
  create: async (data: Subcourse): Promise<Subcourse> => {
    const response = await api.post('/admin/subcourses', data);
    return response.data;
  },
  
  update: async (id: string, data: Subcourse): Promise<Subcourse> => {
    const response = await api.put(`/admin/subcourses/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/subcourses/${id}`);
  },
};

// Public Subcourses API (read-only)
export const publicSubcoursesAPI = {
  getAll: async (programId?: string): Promise<Subcourse[]> => {
    const params = programId ? { program_id: programId } : {};
    const response = await api.get('/subcourses', { params });
    return response.data;
  },

  getByProgram: async (programId: string): Promise<Subcourse[]> => {
    const response = await api.get(`/programs/${programId}/subcourses`);
    return response.data;
  },

  getOne: async (id: string): Promise<Subcourse> => {
    const response = await api.get(`/subcourses/${id}`);
    return response.data;
  },
};

// Lessons API
export const lessonsAPI = {
  getAll: async (subcourseId?: string): Promise<Lesson[]> => {
    const params = subcourseId ? { subcourse_id: subcourseId } : {};
    const response = await api.get('/admin/lessons', { params });
    return response.data;
  },
  
  getOne: async (id: string): Promise<Lesson> => {
    const response = await api.get(`/admin/lessons/${id}`);
    return response.data;
  },
  
  getBySubcourse: async (subcourseId: string): Promise<Lesson[]> => {
    const response = await api.get(`/admin/subcourses/${subcourseId}/lessons`);
    return response.data;
  },
  
  create: async (data: Lesson): Promise<Lesson> => {
    const response = await api.post('/admin/lessons', data);
    return response.data;
  },
  
  update: async (id: string, data: Lesson): Promise<Lesson> => {
    const response = await api.put(`/admin/lessons/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/lessons/${id}`);
  },
};

// Public Lessons API (read-only)
export const publicLessonsAPI = {
  getAll: async (subcourseId?: string): Promise<Lesson[]> => {
    const params = subcourseId ? { subcourse_id: subcourseId } : {};
    const response = await api.get('/lessons', { params });
    return response.data;
  },

  getBySubcourse: async (subcourseId: string): Promise<Lesson[]> => {
    const response = await api.get(`/subcourses/${subcourseId}/lessons`);
    return response.data;
  },

  getOne: async (id: string): Promise<Lesson> => {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
  },
};

// Teachers API
export const teachersAPI = {
  getAll: async () => {
    const res = await api.get('/admin/teachers');
    return res.data;
  },
  create: async (data: {
    username: string;
    email: string;
    password: string;
  }) => {
    const res = await api.post('/admin/teachers', data);
    return res.data;
  },
  getHistory: async () => {
    const res = await api.get('/admin/teachers/history');
    return res.data;
  },
  getTeacherLessonHistory: async (teacherId: string) => {
    const res = await api.get(`/admin/teachers/${teacherId}/lesson-history`);
    return res.data;
  },
};

// Teacher Assignments API
export const teacherAssignmentsAPI = {
  getAll: async () => {
    const res = await api.get('/admin/teacher-assignments');
    return res.data;
  },
 
  create: async (data: {
    teacher_id: string;
    program_id?: string;
    subcourse_id?: string;
    scope_level: 'program' | 'subcourse';
  }) => {
    const res = await api.post('/admin/teacher-assignments', data);
    return res.data;
  },

  revoke: async (id: string) => {
    await api.delete(`/admin/teacher-assignments/${id}`);
  },
  assignPrograms: async (teacherId: string, programIds: string[], startAt?: string | null, endAt?: string | null) => {
    const body: any = { program_ids: programIds };
    if (startAt) body.start_at = startAt;
    if (endAt) body.end_at = endAt;
    const res = await api.put(`/admin/teachers/${teacherId}/program-assignments`, body);
    return res.data;
  },
  assignSubcourses: async (teacherId: string, subcourseIds: string[], startAt?: string | null, endAt?: string | null) => {
    const body: any = { subcourse_ids: subcourseIds };
    if (startAt) body.start_at = startAt;
    if (endAt) body.end_at = endAt;
    const res = await api.put(`/admin/teachers/${teacherId}/subcourse-assignments`, body);
    return res.data;
  },
  getForTeacher: async (teacherId: string) => {
    const res = await api.get(`/admin/teachers/${teacherId}/assignments`);
    // backend returns { assignments: [...] }
    return res.data.assignments || [];
  },
};



// Media API
export const mediaAPI = {
  upload: async (owner_type: string, owner_id: string, file: File, purpose?: string) => {
    const form = new FormData();
    form.append('owner_type', owner_type);
    form.append('owner_id', owner_id);
    if (purpose) form.append('purpose', purpose);
    form.append('file', file);
    const response = await api.post('/admin/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default api;
