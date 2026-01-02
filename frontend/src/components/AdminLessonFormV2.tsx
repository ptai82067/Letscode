/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { subcoursesAPI, mediaAPI, lessonsAPI } from '../services/api';
import { resolveMediaUrl } from '../utils/media';
import { useToast } from './Toast';
import type {
  Lesson,
  Subcourse,
  LessonObjective,
  LessonModel,
  LessonPreparation,
  LessonBuild,
  LessonContentBlock,
  LessonAttachment,
  LessonChallenge,
  LessonQuiz,
} from '../types';

type Props = {
  initial?: Lesson | undefined;
  onCancel?: () => void;
  onSuccess?: (l: Lesson) => void;
  submit: (id: string | undefined, data: Lesson) => Promise<Lesson> | Promise<void>;
};

const DEFAULT_OBJECTIVE: LessonObjective = { knowledge: '', thinking: '', skills: '', attitude: '' };
const DEFAULT_MODEL: LessonModel = { title: '', description: '', media: [] };
const DEFAULT_BUILD: LessonBuild = { build_type: 'pdf', title: '', description: '', media: [] };
const DEFAULT_CONTENT_BLOCK: LessonContentBlock = { title: '', subtitle: '', description: '', usage_text: '', example_text: '', sort_order: 0, media: [] };
const DEFAULT_ATTACHMENT: LessonAttachment = { title: '', description: '', file_type: '', sort_order: 0, media: [] };
const DEFAULT_CHALLENGE: LessonChallenge = { title: '', subtitle: '', description: '', instructions: '', sort_order: 0, media: [] };
const DEFAULT_QUIZ: LessonQuiz = { title: '', description: '', quiz_type: 'single', options: [], media: [] };

export default function AdminLessonFormV2({ initial, onCancel, onSuccess, submit }: Props) {
  const { warning } = useToast();
  const [subcourses, setSubcourses] = useState<Subcourse[]>([]);
  const [subcourseId, setSubcourseId] = useState(initial?.subcourse_id || '');
  const [title, setTitle] = useState(initial?.title || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [overview, setOverview] = useState(initial?.overview || '');
  const [status, setStatus] = useState<Lesson['status']>(initial?.status || 'draft');
  const [removeExistingCover, setRemoveExistingCover] = useState(false);
  
  // Nested fields
  const [objectives, setObjectives] = useState<LessonObjective>(initial?.objectives || { ...DEFAULT_OBJECTIVE });
  const [models, setModels] = useState<LessonModel[]>(initial?.models || [{ ...DEFAULT_MODEL }]);
  const [preparation, setPreparation] = useState<LessonPreparation>(initial?.preparation || { notes: '', media: [] });
  const [builds, setBuilds] = useState<LessonBuild[]>(initial?.builds || [{ ...DEFAULT_BUILD }]);
  const [contentBlocks, setContentBlocks] = useState<LessonContentBlock[]>(initial?.content_blocks || [{ ...DEFAULT_CONTENT_BLOCK }]);
  const [attachments, setAttachments] = useState<LessonAttachment[]>(initial?.attachments || [{ ...DEFAULT_ATTACHMENT }]);
  const [challenges, setChallenges] = useState<LessonChallenge[]>(initial?.challenges || [{ ...DEFAULT_CHALLENGE }]);
  const [quizzes, setQuizzes] = useState<LessonQuiz[]>(initial?.quizzes || [{ ...DEFAULT_QUIZ }]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'objectives' | 'models' | 'preparation' | 'builds' | 'content' | 'attachments' | 'challenges' | 'quizzes'>('basic');
  const objectUrlRefs = useRef<Record<string, string | null>>({});
  const filesRef = useRef<Record<string, File | null>>({});
  const [_fileTick, setFileTick] = useState(0); // bump to force re-render when refs change

  useEffect(() => {
    let mounted = true;
    subcoursesAPI.getAll().then((data) => { if (mounted) setSubcourses(data); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!subcourseId) e.subcourse_id = 'Tiểu khóa là bắt buộc';
    if (!title.trim()) e.title = 'Tiêu đề là bắt buộc';
    if (!slug.trim()) e.slug = 'Slug là bắt buộc';
    else if (!/^[a-z0-9-]+$/.test(slug)) e.slug = 'Slug chỉ chứa chữ cái thường, số và dấu gạch ngang';
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError(null);
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSubmitting(true);
    try {
      // Auto-fill required titles for children if empty; DO NOT generate client-side IDs.
      // IDs must come from server after create; do not use client UUIDs as owner_id.
      const preparedModels = models.map((m, i) => ({ title: (m.title && m.title.trim()) ? m.title : `Auto model ${i + 1}`, description: m.description || '', media: m.media || [] }));
      const preparedPreparation = { notes: preparation?.notes || '', media: preparation?.media || [] } as any;
      const preparedBuilds = builds.map((b, i) => ({ build_type: b.build_type || 'pdf', title: (b.title && b.title.trim()) ? b.title : `Auto build ${i + 1}`, description: b.description || '', media: b.media || [] }));
      const preparedContent = contentBlocks.map((c, i) => ({ title: (c.title && c.title.trim()) ? c.title : `Auto content ${i + 1}`, subtitle: c.subtitle || '', description: c.description || '', usage_text: c.usage_text || '', example_text: c.example_text || '', sort_order: c.sort_order || 0, media: c.media || [] }));
      const preparedAttachments = attachments.map((a, i) => ({ title: (a.title && a.title.trim()) ? a.title : `Auto attachment ${i + 1}`, description: a.description || '', file_type: a.file_type || '', sort_order: a.sort_order || 0, media: a.media || [] }));
      const preparedChallenges = challenges.map((c, i) => ({ title: (c.title && c.title.trim()) ? c.title : `Auto challenge ${i + 1}`, subtitle: c.subtitle || '', description: c.description || '', instructions: c.instructions || '', sort_order: c.sort_order || 0, media: c.media || [] }));
      const preparedQuizzes = quizzes.map((q, i) => ({ title: (q.title && q.title.trim()) ? q.title : `Auto quiz ${i + 1}`, description: q.description || '', quiz_type: q.quiz_type || 'open', options: q.options || [], media: (q as any).media || [] }));

      // Build payload but strip any blob/object URLs from media arrays; use prepared objects (no client IDs)
      const cleanModels = preparedModels.map((m) => ({ ...m, media: (m.media || []).filter((mm: any) => !(mm && typeof mm.url === 'string' && mm.url.startsWith('blob:'))) }));
      const cleanPreparation = { ...preparedPreparation, media: (preparedPreparation.media || []).filter((mm: any) => !(mm && typeof mm.url === 'string' && mm.url.startsWith('blob:'))) };
      const cleanBuilds = preparedBuilds.map((b) => ({ ...b, media: (b.media || []).filter((mm: any) => !(mm && typeof mm.url === 'string' && mm.url.startsWith('blob:'))) }));
      const cleanContent = preparedContent.map((c) => ({ ...c, media: (c.media || []).filter((mm: any) => !(mm && typeof mm.url === 'string' && mm.url.startsWith('blob:'))) }));
      const cleanAttachments = preparedAttachments.map((a) => ({ ...a, media: (a.media || []).filter((mm: any) => !(mm && typeof mm.url === 'string' && mm.url.startsWith('blob:'))) }));
      const cleanChallenges = preparedChallenges.map((c) => ({ ...c, media: (c.media || []).filter((mm: any) => !(mm && typeof mm.url === 'string' && mm.url.startsWith('blob:'))) }));
      const cleanQuizzes = preparedQuizzes.map((q) => ({ ...q, media: (q.media || []).filter((mm: any) => !(mm && typeof mm.url === 'string' && mm.url.startsWith('blob:'))) }));

      // Filter out empty child records that lack required fields (title)
      const filteredModels = cleanModels.filter((m: any, i: number) => {
        return (m && typeof m.title === 'string' && m.title.trim() !== '') || !!filesRef.current[`model-${i}`];
      });
      const filteredBuilds = cleanBuilds.filter((b: any, i: number) => {
        return (b && typeof b.title === 'string' && b.title.trim() !== '') || !!filesRef.current[`build-${i}`];
      });
      const filteredContent = cleanContent.filter((c: any, i: number) => {
        return (c && typeof c.title === 'string' && c.title.trim() !== '') || !!filesRef.current[`content-block-${i}`];
      });
      const filteredAttachments = cleanAttachments.filter((a: any, i: number) => {
        return (a && typeof a.title === 'string' && a.title.trim() !== '') || !!filesRef.current[`attachment-${i}`];
      });
      const filteredChallenges = cleanChallenges.filter((c: any, i: number) => {
        return (c && typeof c.title === 'string' && c.title.trim() !== '') || !!filesRef.current[`challenge-${i}`];
      });
      const filteredQuizzes = cleanQuizzes.filter((q: any, i: number) => {
        return (q && typeof q.title === 'string' && q.title.trim() !== '') || !!filesRef.current[`quiz-${i}`];
      });

      const payload: Lesson = {
        subcourse_id: subcourseId,
        title,
        slug,
        overview,
        status,
        objectives,
        models: filteredModels,
        preparation: cleanPreparation,
        builds: filteredBuilds,
        content_blocks: filteredContent,
        attachments: filteredAttachments,
        challenges: filteredChallenges,
        quizzes: filteredQuizzes,
      } as any;

      // Helper to upload files to server-owned child records only. Requires the authoritative createdLesson
      async function uploadFilesAndAttach(createdLesson: Lesson) {
        if (!createdLesson || !createdLesson.id) throw new Error('createdLesson required for uploads');

        const entries = Object.entries(filesRef.current) as [string, File | null][];
        for (const [fileKey, file] of entries) {
          if (!file) continue;
          // determine owner_type and owner_id based on fileKey mapping
          let ownerType = 'lesson';
          let ownerId = createdLesson.id as string;
          if (fileKey.startsWith('model-')) {
            const idx = Number(fileKey.split('-')[1]);
            if (!Number.isFinite(idx) || !createdLesson.models?.[idx]?.id) {
              throw new Error(`missing server id for model index ${idx}`);
            }
            ownerType = 'lesson_model';
            ownerId = createdLesson.models[idx].id as string;
          } else if (fileKey === 'preparation') {
            if (!createdLesson.preparation?.id) throw new Error('missing server id for preparation');
            ownerType = 'lesson_preparation';
            ownerId = createdLesson.preparation.id as string;
          } else if (fileKey.startsWith('build-')) {
            const idx = Number(fileKey.split('-')[1]);
            if (!Number.isFinite(idx) || !createdLesson.builds?.[idx]?.id) {
              throw new Error(`missing server id for build index ${idx}`);
            }
            ownerType = 'lesson_build';
            ownerId = createdLesson.builds[idx].id as string;
          } else if (fileKey.startsWith('content-block-')) {
            const idx = Number(fileKey.split('-')[2]);
            if (!Number.isFinite(idx) || !createdLesson.content_blocks?.[idx]?.id) {
              throw new Error(`missing server id for content block index ${idx}`);
            }
            ownerType = 'lesson_content_block';
            ownerId = createdLesson.content_blocks[idx].id as string;
          } else if (fileKey.startsWith('attachment-')) {
            const idx = Number(fileKey.split('-')[1]);
            if (!Number.isFinite(idx) || !createdLesson.attachments?.[idx]?.id) {
              throw new Error(`missing server id for attachment index ${idx}`);
            }
            ownerType = 'lesson_attachment';
            ownerId = createdLesson.attachments[idx].id as string;
          } else if (fileKey.startsWith('challenge-')) {
            const idx = Number(fileKey.split('-')[1]);
            if (!Number.isFinite(idx) || !createdLesson.challenges?.[idx]?.id) {
              throw new Error(`missing server id for challenge index ${idx}`);
            }
            ownerType = 'lesson_challenge';
            ownerId = createdLesson.challenges[idx].id as string;
          }

          else if (fileKey.startsWith('quiz-')) {
            const idx = Number(fileKey.split('-')[1]);
            if (!Number.isFinite(idx) || !createdLesson.quizzes?.[idx]?.id) {
              throw new Error(`missing server id for quiz index ${idx}`);
            }
            ownerType = 'lesson_quiz';
            ownerId = createdLesson.quizzes[idx].id as string;
          }

          // perform upload; backend will validate owner_type and owner_id
          await mediaAPI.upload(ownerType, ownerId, file as File);

          // cleanup local blob refs
          if (objectUrlRefs.current[fileKey]) {
            try { URL.revokeObjectURL(objectUrlRefs.current[fileKey]!); } catch {}
          }
          delete objectUrlRefs.current[fileKey];
          delete filesRef.current[fileKey];
        }
      }

      // If creating new lesson, create first to obtain id, then upload files and attach, then update lesson
      if (!initial?.id) {
        // Defensive: ensure top-level lesson id is not sent on create
        if ((payload as any).id) delete (payload as any).id;
        const created = (await submit(undefined, payload as Lesson)) as Lesson;
        const lessonId = (created && (created as any).id) || '';
        if (lessonId && Object.keys(filesRef.current).length > 0) {
          // Upload only after lesson creation; use server-returned child IDs when possible
          await uploadFilesAndAttach(created);
          // After uploads complete, refetch the lesson from server so UI shows persisted media
          try {
            const fresh = await lessonsAPI.getOne(lessonId);
            setModels(fresh.models || []);
            setPreparation(fresh.preparation || { notes: '', media: [] });
            setBuilds(fresh.builds || []);
            setContentBlocks(fresh.content_blocks || []);
            setAttachments(fresh.attachments || []);
              setChallenges(fresh.challenges || []);
              setQuizzes(fresh.quizzes || []);
            onSuccess?.(fresh as Lesson);
          } catch (e) {
            // fallback: return created lesson if refetch fails
            onSuccess?.(created as Lesson);
          }
        } else {
          onSuccess?.(created as Lesson);
        }
      } else {
        // existing lesson: fetch authoritative server child IDs before uploading, then upload and refetch
        if (Object.keys(filesRef.current).length > 0) {
          const authoritative = await lessonsAPI.getOne(initial.id as string);
          await uploadFilesAndAttach(authoritative as Lesson);
          const fresh = await lessonsAPI.getOne(initial.id as string);
          setModels(fresh.models || []);
          setPreparation(fresh.preparation || { notes: '', media: [] });
          setBuilds(fresh.builds || []);
          setContentBlocks(fresh.content_blocks || []);
          setAttachments(fresh.attachments || []);
          setChallenges(fresh.challenges || []);
          setQuizzes(fresh.quizzes || []);
          onSuccess?.(fresh as Lesson);
          return;
        }
        const finalModels = models;
        const finalPreparation = preparation;
        const finalBuilds = builds;
        const finalContent = contentBlocks;
        const finalAttachments = attachments;
        const finalChallenges = challenges;
        const finalQuizzes = quizzes;

        // Filter final arrays to remove empty children
        const filteredFinalModels = (finalModels || []).filter((m: any, i: number) => {
          return (m && typeof m.title === 'string' && m.title.trim() !== '') || !!filesRef.current[`model-${i}`];
        });
        const filteredFinalBuilds = (finalBuilds || []).filter((b: any, i: number) => {
          return (b && typeof b.title === 'string' && b.title.trim() !== '') || !!filesRef.current[`build-${i}`];
        });
        const filteredFinalContent = (finalContent || []).filter((c: any, i: number) => {
          return (c && typeof c.title === 'string' && c.title.trim() !== '') || !!filesRef.current[`content-block-${i}`];
        });
        const filteredFinalAttachments = (finalAttachments || []).filter((a: any, i: number) => {
          return (a && typeof a.title === 'string' && a.title.trim() !== '') || !!filesRef.current[`attachment-${i}`];
        });
        const filteredFinalChallenges = (finalChallenges || []).filter((c: any, i: number) => {
          return (c && typeof c.title === 'string' && c.title.trim() !== '') || !!filesRef.current[`challenge-${i}`];
        });
        const filteredFinalQuizzes = (finalQuizzes || []).filter((q: any, i: number) => {
          return (q && typeof q.title === 'string' && q.title.trim() !== '') || !!filesRef.current[`quiz-${i}`];
        });

        const updatedPayload: Lesson = {
          subcourse_id: subcourseId,
          title,
          slug,
          overview,
          status,
          objectives,
          models: filteredFinalModels,
          preparation: finalPreparation,
          builds: filteredFinalBuilds,
          content_blocks: filteredFinalContent,
          attachments: filteredFinalAttachments,
          challenges: filteredFinalChallenges,
          quizzes: filteredFinalQuizzes,
        } as any;
        const res = await submit(initial.id, updatedPayload as Lesson);
        const lesson = (res as Lesson) || (initial ? { ...initial, ...updatedPayload } : ({} as Lesson));
        onSuccess?.(lesson as Lesson);
      }
    } catch (err: any) {
      setServerError(err?.response?.data?.error || err?.message || 'Không thể lưu bài học');
    } finally {
      setSubmitting(false);
    }
  }

  function onFileChange(fileKey: string, e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    const allowed = ['image/', 'video/', 'application/pdf'];
    if (!allowed.some((p) => f.type.startsWith(p))) {
      warning('Chỉ cho phép tệp hình ảnh, video hoặc PDF');
      return;
    }
    const maxSize = 50 * 1024 * 1024;
    if (f.size > maxSize) {
      warning('Tệp quá lớn (tối đa 50MB)');
      return;
    }
    if (objectUrlRefs.current[fileKey]) {
      try { URL.revokeObjectURL(objectUrlRefs.current[fileKey]!); } catch {}
    }
    const url = URL.createObjectURL(f);
    objectUrlRefs.current[fileKey] = url;
    filesRef.current[fileKey] = f;
    setFileTick((t) => t + 1);
  }

  useEffect(() => {
    return () => {
      Object.values(objectUrlRefs.current).forEach((url) => {
        if (url) {
          try { URL.revokeObjectURL(url); } catch {}
        }
      });
    };
  }, []);

  function removeFile(fileKey: string) {
    const url = objectUrlRefs.current[fileKey];
    if (url) {
      try { URL.revokeObjectURL(url); } catch {}
    }
    delete objectUrlRefs.current[fileKey];
    delete filesRef.current[fileKey];
    setFileTick((t) => t + 1);
  }

  const tabs = [
    { id: 'basic' as const, label: 'Cơ bản', icon: '📝' },
    { id: 'objectives' as const, label: 'Mục tiêu', icon: '🎯' },
    { id: 'models' as const, label: 'Mô hình', icon: '🏗️' },
    { id: 'preparation' as const, label: 'Chuẩn bị', icon: '📋' },
    { id: 'builds' as const, label: 'Xây dựng', icon: '🔨' },
    { id: 'content' as const, label: 'Nội dung', icon: '📄' },
    { id: 'attachments' as const, label: 'Tệp đính kèm', icon: '📎' },
    { id: 'challenges' as const, label: 'Thách thức', icon: '💪' },
    { id: 'quizzes' as const, label: 'Câu hỏi', icon: '❓' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {serverError && (
        <div className="p-4 bg-red-50 border-2 border-red-300 text-red-700 rounded-xl font-semibold">
          ❌ {serverError}
        </div>
      )}

      {/* TABS */}
      <div className="border-b-2 border-gray-200 bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="flex gap-1 overflow-x-auto p-2 bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-lg font-bold whitespace-nowrap transition duration-300 text-sm ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* BASIC TAB */}
      {activeTab === 'basic' && (
        <div className="space-y-6 bg-gradient-to-br from-white to-indigo-50 p-8 rounded-2xl border border-indigo-100">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">📚 Tiểu khóa *</label>
            <select
              className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-gray-900 font-semibold hover:border-indigo-400 transition placeholder:text-gray-400"
              value={subcourseId}
              onChange={(e) => setSubcourseId(e.target.value)}
            >
              <option value="">-- Chọn tiểu khóa --</option>
              {subcourses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.subcourse_id && <div className="text-red-600 text-sm font-semibold mt-2 flex items-center gap-1">⚠️ {errors.subcourse_id}</div>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">✏️ Tiêu đề *</label>
            <input
              type="text"
              className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-gray-900 font-semibold hover:border-indigo-400 transition placeholder:text-gray-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ví dụ: Giới thiệu Động cơ"
            />
            {errors.title && <div className="text-red-600 text-sm font-semibold mt-2 flex items-center gap-1">⚠️ {errors.title}</div>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">🔗 Slug *</label>
            <input
              type="text"
              className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-gray-900 font-semibold hover:border-indigo-400 transition font-mono text-sm placeholder:text-gray-400"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ví dụ: gioi-thieu-dong-co"
            />
            {errors.slug && <div className="text-red-600 text-sm font-semibold mt-2 flex items-center gap-1">⚠️ {errors.slug}</div>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">📋 Tổng quan</label>
            <textarea
              className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-gray-900 font-semibold hover:border-indigo-400 transition placeholder:text-gray-400"
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="Mô tả ngắn gọn về nội dung bài học..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">🖼️ Ảnh bìa / Cover (tùy chọn)</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => onFileChange('lesson', e)}
              className="w-full p-3 bg-white border-2 border-dashed border-gray-400 rounded-xl cursor-pointer hover:border-indigo-400 transition text-gray-900 font-semibold"
            />
            {/* server-provided cover preview */}
            {(!removeExistingCover && initial?.media && initial.media.length > 0) ? (
              <div className="mt-2">
                {initial.media[0].mime_type?.startsWith('video') ? (
                  <video src={resolveMediaUrl(initial.media[0].url)} controls className="max-h-40 w-auto" />
                ) : (
                  <img src={resolveMediaUrl(initial.media[0].url)} alt={initial.media[0].purpose || 'cover'} className="max-h-40" />
                )}
                <div className="mt-2"><button type="button" onClick={() => setRemoveExistingCover(true)} className="text-sm text-red-600">✕ Hide existing cover</button></div>
              </div>
            ) : null}

            {/* local selected preview */}
            {objectUrlRefs.current['lesson'] ? (
              <div className="mt-2">
                {((filesRef.current['lesson'] && filesRef.current['lesson']!.type.startsWith('video')) || /\.(mp4|webm|ogg)$/i.test(objectUrlRefs.current['lesson'] || '')) ? (
                  <video src={objectUrlRefs.current['lesson'] || ''} controls className="max-h-40 w-auto" />
                ) : (
                  <img src={objectUrlRefs.current['lesson'] || ''} alt="preview" className="max-h-40" />
                )}
                <div className="mt-2"><button type="button" onClick={() => removeFile('lesson')} className="text-sm text-red-600">✕ Xóa file</button></div>
              </div>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">📌 Trạng thái</label>
            <select
              className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-gray-900 font-semibold hover:border-indigo-400 transition placeholder:text-gray-400"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="draft">📝 Nháp</option>
              <option value="published">✅ Đã xuất bản</option>
              <option value="archived">🗂️ Lưu trữ</option>
            </select>
          </div>
        </div>
      )}

      {/* OBJECTIVES TAB */}
      {activeTab === 'objectives' && (
        <div className="space-y-6 bg-gradient-to-br from-white to-purple-50 p-8 rounded-2xl border border-purple-100">
          <p className="text-gray-900 font-semibold text-base">🎯 Nhập các mục tiêu học tập (kiến thức, tư duy, kỹ năng, thái độ)</p>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="💡 Kiến thức"
              className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-900 font-semibold hover:border-purple-400 transition placeholder:text-gray-400"
              value={objectives.knowledge || ''}
              onChange={(e) => setObjectives({ ...objectives, knowledge: e.target.value })}
            />
            <input
              type="text"
              placeholder="🧠 Tư duy"
              className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-900 font-semibold hover:border-purple-400 transition placeholder:text-gray-400"
              value={objectives.thinking || ''}
              onChange={(e) => setObjectives({ ...objectives, thinking: e.target.value })}
            />
            <input
              type="text"
              placeholder="🎯 Kỹ năng"
              className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-900 font-semibold hover:border-purple-400 transition placeholder:text-gray-400"
              value={objectives.skills || ''}
              onChange={(e) => setObjectives({ ...objectives, skills: e.target.value })}
            />
            <input
              type="text"
              placeholder="😊 Thái độ"
              className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-900 font-semibold hover:border-purple-400 transition placeholder:text-gray-400"
              value={objectives.attitude || ''}
              onChange={(e) => setObjectives({ ...objectives, attitude: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* MODELS TAB */}
      {activeTab === 'models' && (
        <div className="space-y-6 bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl border border-blue-100">
          <div className="flex justify-between items-center">
            <p className="text-gray-900 font-semibold text-base">📦 Thêm các mô hình (tối đa 5)</p>
            {models.length < 5 && (
              <button
                type="button"
                onClick={() => setModels([...models, { ...DEFAULT_MODEL }])}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:shadow-lg font-bold transition"
              >
                + Thêm mô hình
              </button>
            )}
          </div>
          <div className="space-y-4">
            {models.map((model, idx) => (
              <div key={idx} className="p-6 bg-white rounded-xl border-2 border-blue-200 space-y-4 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-900 text-lg">🏗️ Mô hình {idx + 1}</h4>
                  {models.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setModels(models.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700 font-bold"
                    >
                      ✕ Xóa
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Tên mô hình"
                  className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-gray-900 font-semibold hover:border-indigo-400 transition placeholder:text-gray-400"
                  value={model.title}
                  onChange={(e) => {
                    const updated = [...models];
                    updated[idx].title = e.target.value;
                    setModels(updated);
                  }}
                />
                <textarea
                  placeholder="Mô tả mô hình"
                  className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-gray-900 font-semibold hover:border-indigo-400 transition placeholder:text-gray-400"
                  value={model.description || ''}
                  onChange={(e) => {
                    const updated = [...models];
                    updated[idx].description = e.target.value;
                    setModels(updated);
                  }}
                  rows={3}
                />
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Tải lên hình ảnh/video</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => onFileChange(`model-${idx}`, e)}
                    className="w-full p-3 bg-white border-2 border-dashed border-gray-400 rounded-xl cursor-pointer hover:border-indigo-400 transition text-gray-900 font-semibold"
                  />
                  { (model.media && model.media.length > 0) ? (
                    <div className="mt-2">
                      {((model.media[0].mime_type && model.media[0].mime_type.startsWith('video')) || /\.(mp4|webm|ogg)$/i.test(model.media[0].url || '')) ? (
                        <video src={resolveMediaUrl(model.media[0].url)} controls className="max-h-40 w-auto" />
                      ) : (
                        <img src={resolveMediaUrl(model.media[0].url)} alt={model.media[0].purpose || 'media'} className="max-h-40" />
                      )}
                      <div className="mt-2"><button type="button" onClick={() => {
                        // remove server media
                        const updated = [...models];
                        updated[idx] = { ...updated[idx], media: (updated[idx].media || []).slice(1) };
                        setModels(updated);
                      }} className="text-sm text-red-600">✕ Xóa file</button></div>
                    </div>
                  ) : objectUrlRefs.current[`model-${idx}`] ? (
                    <div className="mt-2">
                      {((filesRef.current[`model-${idx}`] && filesRef.current[`model-${idx}`]!.type.startsWith('video')) || /\.(mp4|webm|ogg)$/i.test(objectUrlRefs.current[`model-${idx}`] || '')) ? (
                        <video src={objectUrlRefs.current[`model-${idx}`] || ''} controls className="max-h-40 w-auto" />
                      ) : (
                        <img src={objectUrlRefs.current[`model-${idx}`] || ''} alt="preview" className="max-h-40" />
                      )}
                      <div className="mt-2"><button type="button" onClick={() => removeFile(`model-${idx}`)} className="text-sm text-red-600">✕ Xóa file</button></div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PREPARATION TAB */}
      {activeTab === 'preparation' && (
        <div className="space-y-6 bg-gradient-to-br from-white to-green-50 p-8 rounded-2xl border border-green-100">
          <p className="text-gray-900 font-semibold text-base">📋 Nhập ghi chú chuẩn bị và tải lên tài liệu</p>
          <div className="space-y-4">
            <textarea
              placeholder="Ghi chú chuẩn bị (những chuẩn bị cần thiết trước khi bắt đầu bài học)"
              className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none text-gray-900 font-semibold hover:border-green-400 transition placeholder:text-gray-400"
              value={preparation.notes || ''}
              onChange={(e) => setPreparation({ ...preparation, notes: e.target.value })}
              rows={5}
            />
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">📂 Tải lên tài liệu chuẩn bị</label>
              <input
                type="file"
                accept="image/*,video/*,application/pdf"
                onChange={(e) => onFileChange('preparation', e)}
                className="w-full p-3 bg-white border-2 border-dashed border-gray-400 rounded-xl cursor-pointer hover:border-green-400 transition text-gray-900 font-semibold"
              />
              {(preparation.media && preparation.media.length > 0) ? (
                <div className="mt-2">
                  {((preparation.media[0].mime_type && preparation.media[0].mime_type.startsWith('video')) || /\.(mp4|webm|ogg)$/i.test(preparation.media[0].url || '')) ? (
                    <video src={resolveMediaUrl(preparation.media[0].url)} controls className="max-h-40 w-auto" />
                  ) : (/\.pdf$/i.test(preparation.media[0].url || '') || (preparation.media[0].mime_type === 'application/pdf')) ? (
                    <a href={resolveMediaUrl(preparation.media[0].url)} target="_blank" rel="noreferrer" className="text-indigo-600">Open PDF</a>
                  ) : (
                    <img src={resolveMediaUrl(preparation.media[0].url)} alt={preparation.media[0].purpose || 'media'} className="max-h-40" />
                  )}
                  <div className="mt-2"><button type="button" onClick={() => setPreparation((prev) => ({ ...prev, media: (prev.media || []).slice(1) }))} className="text-sm text-red-600">✕ Xóa file</button></div>
                </div>
              ) : (objectUrlRefs.current['preparation'] && (
                <div className="mt-2">
                  {((filesRef.current['preparation'] && filesRef.current['preparation']!.type.startsWith('video')) || /\.(mp4|webm|ogg)$/i.test(objectUrlRefs.current['preparation'] || '')) ? (
                    <video src={objectUrlRefs.current['preparation'] || ''} controls className="max-h-40 w-auto" />
                  ) : (/\.pdf$/i.test(objectUrlRefs.current['preparation'] || '') || (filesRef.current['preparation'] && filesRef.current['preparation']!.type === 'application/pdf')) ? (
                    <a href={objectUrlRefs.current['preparation'] || ''} target="_blank" rel="noreferrer" className="text-indigo-600">Open PDF</a>
                  ) : (
                    <img src={objectUrlRefs.current['preparation'] || ''} alt="preview" className="max-h-40" />
                  )}
                  <div className="mt-2"><button type="button" onClick={() => removeFile('preparation')} className="text-sm text-red-600">✕ Xóa file</button></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BUILDS TAB */}
      {activeTab === 'builds' && (
        <div className="space-y-6 bg-gradient-to-br from-white to-purple-50 p-8 rounded-2xl border border-purple-100">
          <div className="flex justify-between items-center">
            <p className="text-gray-900 font-semibold text-base">🔨 Thêm các bước xây dựng (tối đa 5)</p>
            {builds.length < 5 && (
              <button
                type="button"
                onClick={() => setBuilds([...builds, { ...DEFAULT_BUILD }])}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg font-bold transition"
              >
                + Thêm bước xây dựng
              </button>
            )}
          </div>
          <div className="space-y-4">
            {builds.map((build, idx) => (
              <div key={idx} className="p-6 bg-white rounded-xl border-2 border-purple-200 space-y-4 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-900 text-lg">🏗️ Bước {idx + 1}</h4>
                  {builds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setBuilds(builds.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700 font-bold"
                    >
                      ✕ Xóa
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">📄 Loại</label>
                  <select
                    className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-900 font-semibold hover:border-purple-400 transition placeholder:text-gray-400"
                    value={build.build_type}
                    onChange={(e) => {
                      const updated = [...builds];
                      updated[idx].build_type = e.target.value as 'pdf' | 'images';
                      setBuilds(updated);
                    }}
                  >
                    <option value="pdf">📄 PDF</option>
                    <option value="images">🖼️ Hình ảnh / Slides</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Tiêu đề"
                  className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-900 font-semibold hover:border-purple-400 transition placeholder:text-gray-400"
                  value={build.title}
                  onChange={(e) => {
                    const updated = [...builds];
                    updated[idx].title = e.target.value;
                    setBuilds(updated);
                  }}
                />
                <textarea
                  placeholder="Mô tả"
                  className="w-full p-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-900 font-semibold hover:border-purple-400 transition placeholder:text-gray-400"
                  value={build.description || ''}
                  onChange={(e) => {
                    const updated = [...builds];
                    updated[idx].description = e.target.value;
                    setBuilds(updated);
                  }}
                  rows={3}
                />
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    📂 Tải lên {build.build_type === 'pdf' ? 'PDF' : 'hình ảnh/slides'}
                  </label>
                  <input
                    type="file"
                    accept={build.build_type === 'pdf' ? 'application/pdf' : 'image/*'}
                    onChange={(e) => onFileChange(`build-${idx}`, e)}
                    className="w-full p-3 bg-white border-2 border-dashed border-gray-400 rounded-xl cursor-pointer hover:border-purple-400 transition text-gray-900 font-semibold"
                  />
                  {(build.media && build.media.length > 0) ? (
                    <div className="mt-2">
                      {((build.media[0].mime_type && build.media[0].mime_type.startsWith('video')) || /\.(mp4|webm|ogg)$/i.test(build.media[0].url || '')) ? (
                        <video src={resolveMediaUrl(build.media[0].url)} controls className="max-h-40 w-auto" />
                      ) : (/\.pdf$/i.test(build.media[0].url || '') || (build.media[0].mime_type === 'application/pdf')) ? (
                        <a href={resolveMediaUrl(build.media[0].url)} target="_blank" rel="noreferrer" className="text-indigo-600">Open PDF</a>
                      ) : (
                        <img src={resolveMediaUrl(build.media[0].url)} alt={build.media[0].purpose || 'media'} className="max-h-40" />
                      )}
                      <div className="mt-2"><button type="button" onClick={() => setBuilds((prev) => {
                        const copy = [...prev]; copy[idx] = { ...copy[idx], media: (copy[idx].media || []).slice(1) }; return copy;
                      })} className="text-sm text-red-600">✕ Xóa file</button></div>
                    </div>
                  ) : (objectUrlRefs.current[`build-${idx}`] && (
                    <div className="mt-2">
                      {((filesRef.current[`build-${idx}`] && filesRef.current[`build-${idx}`]!.type.startsWith('video')) || /\.(mp4|webm|ogg)$/i.test(objectUrlRefs.current[`build-${idx}`] || '')) ? (
                        <video src={objectUrlRefs.current[`build-${idx}`] || ''} controls className="max-h-40 w-auto" />
                      ) : (/\.pdf$/i.test(objectUrlRefs.current[`build-${idx}`] || '') || (filesRef.current[`build-${idx}`] && filesRef.current[`build-${idx}`]!.type === 'application/pdf')) ? (
                        <a href={objectUrlRefs.current[`build-${idx}`] || ''} target="_blank" rel="noreferrer" className="text-indigo-600">Open PDF</a>
                      ) : (
                        <img src={objectUrlRefs.current[`build-${idx}`] || ''} alt="preview" className="max-h-40" />
                      )}
                      <div className="mt-2"><button type="button" onClick={() => removeFile(`build-${idx}`)} className="text-sm text-red-600">✕ Xóa file</button></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTENT BLOCKS TAB */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Thêm các khối nội dung (tối đa 10)</p>
            {contentBlocks.length < 10 && (
              <button
                type="button"
                onClick={() => setContentBlocks([...contentBlocks, { ...DEFAULT_CONTENT_BLOCK, sort_order: contentBlocks.length }])}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                + Thêm khối nội dung
              </button>
            )}
          </div>
          <div className="space-y-4">
            {contentBlocks.map((block, idx) => (
              <div key={idx} className="p-6 bg-yellow-50 rounded-lg border border-yellow-200 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900">Khối nội dung {idx + 1}</h4>
                  {contentBlocks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setContentBlocks(contentBlocks.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700"
                    >
                      ✕ Xóa
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Tiêu đề"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={block.title}
                  onChange={(e) => {
                    const updated = [...contentBlocks];
                    updated[idx].title = e.target.value;
                    setContentBlocks(updated);
                  }}
                />
                <input
                  type="text"
                  placeholder="Tiêu đề phụ"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={block.subtitle || ''}
                  onChange={(e) => {
                    const updated = [...contentBlocks];
                    updated[idx].subtitle = e.target.value;
                    setContentBlocks(updated);
                  }}
                />
                <textarea
                  placeholder="Mô tả"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={block.description || ''}
                  onChange={(e) => {
                    const updated = [...contentBlocks];
                    updated[idx].description = e.target.value;
                    setContentBlocks(updated);
                  }}
                  rows={2}
                />
                <textarea
                  placeholder="Văn bản sử dụng"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={block.usage_text || ''}
                  onChange={(e) => {
                    const updated = [...contentBlocks];
                    updated[idx].usage_text = e.target.value;
                    setContentBlocks(updated);
                  }}
                  rows={2}
                />
                <textarea
                  placeholder="Văn bản ví dụ"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={block.example_text || ''}
                  onChange={(e) => {
                    const updated = [...contentBlocks];
                    updated[idx].example_text = e.target.value;
                    setContentBlocks(updated);
                  }}
                  rows={2}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tải lên hình ảnh/video (tùy chọn)</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => onFileChange(`content-block-${idx}`, e)}
                    className="w-full"
                  />
                  {(block.media && block.media.length > 0) ? (
                    <div className="mt-2">
                      {((block.media[0].mime_type && block.media[0].mime_type.startsWith('video')) || /\.(mp4|webm|ogg)$/i.test(block.media[0].url || '')) ? (
                        <video src={resolveMediaUrl(block.media[0].url)} controls className="max-h-40 w-auto" />
                      ) : (
                        <img src={resolveMediaUrl(block.media[0].url)} alt={block.media[0].purpose || 'media'} className="max-h-40" />
                      )}
                      <div className="mt-2"><button type="button" onClick={() => setContentBlocks((prev) => {
                        const copy = [...prev]; copy[idx] = { ...copy[idx], media: (copy[idx].media || []).slice(1) }; return copy;
                      })} className="text-sm text-red-600">✕ Xóa file</button></div>
                    </div>
                  ) : (objectUrlRefs.current[`content-block-${idx}`] && (
                    <div className="mt-2">
                      {((filesRef.current[`content-block-${idx}`] && filesRef.current[`content-block-${idx}`]!.type.startsWith('video')) || /\.(mp4|webm|ogg)$/i.test(objectUrlRefs.current[`content-block-${idx}`] || '')) ? (
                        <video src={objectUrlRefs.current[`content-block-${idx}`] || ''} controls className="max-h-40 w-auto" />
                      ) : (
                        <img src={objectUrlRefs.current[`content-block-${idx}`] || ''} alt="preview" className="max-h-40" />
                      )}
                      <div className="mt-2"><button type="button" onClick={() => removeFile(`content-block-${idx}`)} className="text-sm text-red-600">✕ Xóa file</button></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ATTACHMENTS TAB */}
      {activeTab === 'attachments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Thêm tệp đính kèm (PDF, SB3, v.v.) (tối đa 10)</p>
            {attachments.length < 10 && (
              <button
                type="button"
                onClick={() => setAttachments([...attachments, { ...DEFAULT_ATTACHMENT, sort_order: attachments.length }])}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                + Thêm tệp đính kèm
              </button>
            )}
          </div>
          <div className="space-y-4">
            {attachments.map((attachment, idx) => (
              <div key={idx} className="p-6 bg-orange-50 rounded-lg border border-orange-200 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900">Tệp {idx + 1}</h4>
                  {attachments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700"
                    >
                      ✕ Xóa
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Tiêu đề tệp (ví dụ: Code Mẫu)"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={attachment.title}
                  onChange={(e) => {
                    const updated = [...attachments];
                    updated[idx].title = e.target.value;
                    setAttachments(updated);
                  }}
                />
                <input
                  type="text"
                  placeholder="Loại tệp (ví dụ: PDF, SB3, ZIP)"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={attachment.file_type || ''}
                  onChange={(e) => {
                    const updated = [...attachments];
                    updated[idx].file_type = e.target.value;
                    setAttachments(updated);
                  }}
                />
                <textarea
                  placeholder="Mô tả tệp"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={attachment.description || ''}
                  onChange={(e) => {
                    const updated = [...attachments];
                    updated[idx].description = e.target.value;
                    setAttachments(updated);
                  }}
                  rows={2}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tải lên tệp</label>
                  <input
                    type="file"
                    onChange={(e) => onFileChange(`attachment-${idx}`, e)}
                    className="w-full"
                  />
                  {(attachment.media && attachment.media.length > 0) ? (
                    <div className="mt-2">
                      {((attachment.media[0].mime_type && attachment.media[0].mime_type.startsWith('video')) || /\.(mp4|webm|ogg)$/i.test(attachment.media[0].url || '')) ? (
                        <video src={resolveMediaUrl(attachment.media[0].url)} controls className="max-h-40 w-auto" />
                      ) : (/\.pdf$/i.test(attachment.media[0].url || '') || (attachment.media[0].mime_type === 'application/pdf')) ? (
                        <a href={resolveMediaUrl(attachment.media[0].url)} target="_blank" rel="noreferrer" className="text-indigo-600">Open file</a>
                      ) : (
                        <img src={resolveMediaUrl(attachment.media[0].url)} alt={attachment.media[0].purpose || 'media'} className="max-h-40" />
                      )}
                      <div className="mt-2"><button type="button" onClick={() => setAttachments((prev) => {
                        const copy = [...prev]; copy[idx] = { ...copy[idx], media: (copy[idx].media || []).slice(1) }; return copy;
                      })} className="text-sm text-red-600">✕ Xóa file</button></div>
                    </div>
                  ) : (objectUrlRefs.current[`attachment-${idx}`] && (
                    <div className="mt-2">
                      {((filesRef.current[`attachment-${idx}`] && filesRef.current[`attachment-${idx}`]!.type.startsWith('video')) || /\.(mp4|webm|ogg)$/i.test(objectUrlRefs.current[`attachment-${idx}`] || '')) ? (
                        <video src={objectUrlRefs.current[`attachment-${idx}`] || ''} controls className="max-h-40 w-auto" />
                      ) : (/\.pdf$/i.test(objectUrlRefs.current[`attachment-${idx}`] || '') || (filesRef.current[`attachment-${idx}`] && filesRef.current[`attachment-${idx}`]!.type === 'application/pdf')) ? (
                        <a href={objectUrlRefs.current[`attachment-${idx}`] || ''} target="_blank" rel="noreferrer" className="text-indigo-600">Open file</a>
                      ) : (
                        <img src={objectUrlRefs.current[`attachment-${idx}`] || ''} alt="preview" className="max-h-40" />
                      )}
                      <div className="mt-2"><button type="button" onClick={() => removeFile(`attachment-${idx}`)} className="text-sm text-red-600">✕ Xóa file</button></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHALLENGES TAB */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Thêm các thách thức (tối đa 5)</p>
            {challenges.length < 5 && (
              <button
                type="button"
                onClick={() => setChallenges([...challenges, { ...DEFAULT_CHALLENGE, sort_order: challenges.length }])}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                + Thêm thách thức
              </button>
            )}
          </div>
          <div className="space-y-4">
            {challenges.map((challenge, idx) => (
              <div key={idx} className="p-6 bg-red-50 rounded-lg border border-red-200 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900">Thách thức {idx + 1}</h4>
                  {challenges.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setChallenges(challenges.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:text-red-700"
                    >
                      ✕ Xóa
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Tiêu đề"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={challenge.title}
                  onChange={(e) => {
                    const updated = [...challenges];
                    updated[idx].title = e.target.value;
                    setChallenges(updated);
                  }}
                />
                <input
                  type="text"
                  placeholder="Tiêu đề phụ"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={challenge.subtitle || ''}
                  onChange={(e) => {
                    const updated = [...challenges];
                    updated[idx].subtitle = e.target.value;
                    setChallenges(updated);
                  }}
                />
                <textarea
                  placeholder="Mô tả"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={challenge.description || ''}
                  onChange={(e) => {
                    const updated = [...challenges];
                    updated[idx].description = e.target.value;
                    setChallenges(updated);
                  }}
                  rows={2}
                />
                <textarea
                  placeholder="Hướng dẫn"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={challenge.instructions || ''}
                  onChange={(e) => {
                    const updated = [...challenges];
                    updated[idx].instructions = e.target.value;
                    setChallenges(updated);
                  }}
                  rows={3}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tải lên hình ảnh/video hướng dẫn (tùy chọn)</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => onFileChange(`challenge-${idx}`, e)}
                    className="w-full"
                  />
                  {(challenge.media && challenge.media.length > 0) ? (
                    <div className="mt-2">
                      {((challenge.media[0].mime_type && challenge.media[0].mime_type.startsWith('video')) || /\.(mp4|webm|ogg)$/i.test(challenge.media[0].url || '')) ? (
                        <video src={resolveMediaUrl(challenge.media[0].url)} controls className="max-h-40 w-auto" />
                      ) : (
                        <img src={resolveMediaUrl(challenge.media[0].url)} alt={challenge.media[0].purpose || 'media'} className="max-h-40" />
                      )}
                      <div className="mt-2"><button type="button" onClick={() => setChallenges((prev) => {
                        const copy = [...prev]; copy[idx] = { ...copy[idx], media: (copy[idx].media || []).slice(1) }; return copy;
                      })} className="text-sm text-red-600">✕ Xóa file</button></div>
                    </div>
                  ) : (objectUrlRefs.current[`challenge-${idx}`] && (
                    <div className="mt-2">
                      {((filesRef.current[`challenge-${idx}`] && filesRef.current[`challenge-${idx}`]!.type.startsWith('video')) || /\.(mp4|webm|ogg)$/i.test(objectUrlRefs.current[`challenge-${idx}`] || '')) ? (
                        <video src={objectUrlRefs.current[`challenge-${idx}`] || ''} controls className="max-h-40 w-auto" />
                      ) : (
                        <img src={objectUrlRefs.current[`challenge-${idx}`] || ''} alt="preview" className="max-h-40" />
                      )}
                      <div className="mt-2"><button type="button" onClick={() => removeFile(`challenge-${idx}`)} className="text-sm text-red-600">✕ Xóa file</button></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUIZZES TAB */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Thêm câu hỏi trắc nghiệm (tối đa 10)</p>
            {quizzes.length < 10 && (
              <button
                type="button"
                onClick={() => setQuizzes([...quizzes, { ...DEFAULT_QUIZ }])}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                + Thêm câu hỏi
              </button>
            )}
          </div>
          <div className="space-y-4">
            {quizzes.map((quiz, qIdx) => (
              <div key={qIdx} className="p-6 bg-cyan-50 rounded-lg border border-cyan-200 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900">Câu hỏi {qIdx + 1}</h4>
                  {quizzes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setQuizzes(quizzes.filter((_, i) => i !== qIdx))}
                      className="text-red-600 hover:text-red-700"
                    >
                      ✕ Xóa
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Tiêu đề câu hỏi"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={quiz.title}
                  onChange={(e) => {
                    const updated = [...quizzes];
                    updated[qIdx].title = e.target.value;
                    setQuizzes(updated);
                  }}
                />
                <textarea
                  placeholder="Mô tả / Nội dung câu hỏi"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={quiz.description || ''}
                  onChange={(e) => {
                    const updated = [...quizzes];
                    updated[qIdx].description = e.target.value;
                    setQuizzes(updated);
                  }}
                  rows={2}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại câu hỏi</label>
                  <select
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={quiz.quiz_type}
                    onChange={(e) => {
                      const updated = [...quizzes];
                      updated[qIdx].quiz_type = e.target.value as 'single' | 'multiple' | 'open';
                      setQuizzes(updated);
                    }}
                  >
                    <option value="single">Một lựa chọn</option>
                    <option value="multiple">Nhiều lựa chọn</option>
                    <option value="open">Câu hỏi mở</option>
                  </select>
                </div>

                {quiz.quiz_type !== 'open' && (
                  <div className="space-y-3 bg-white p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700">Các lựa chọn</label>
                    {(quiz.options || []).map((option, oIdx) => (
                      <div key={oIdx} className="space-y-2 p-3 bg-gray-50 rounded border">
                        <input
                          type="text"
                          placeholder={`Lựa chọn ${oIdx + 1}`}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                          value={option.content}
                          onChange={(e) => {
                            const updated = [...quizzes];
                            if (!updated[qIdx].options) updated[qIdx].options = [];
                            updated[qIdx].options![oIdx].content = e.target.value;
                            setQuizzes(updated);
                          }}
                        />
                        <textarea
                          placeholder="Giải thích (tùy chọn)"
                          className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-indigo-500"
                          value={option.explanation || ''}
                          onChange={(e) => {
                            const updated = [...quizzes];
                            if (!updated[qIdx].options) updated[qIdx].options = [];
                            updated[qIdx].options![oIdx].explanation = e.target.value;
                            setQuizzes(updated);
                          }}
                          rows={2}
                        />
                        <div className="flex gap-2 items-center justify-between">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={option.is_correct}
                              onChange={(e) => {
                                const updated = [...quizzes];
                                if (!updated[qIdx].options) updated[qIdx].options = [];
                                updated[qIdx].options![oIdx].is_correct = e.target.checked;
                                setQuizzes(updated);
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm font-medium">✓ Đáp án đúng</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...quizzes];
                              if (!updated[qIdx].options) updated[qIdx].options = [];
                              updated[qIdx].options!.splice(oIdx, 1);
                              setQuizzes(updated);
                            }}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            ✕ Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                    {(quiz.options || []).length < 5 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...quizzes];
                          if (!updated[qIdx].options) updated[qIdx].options = [];
                          updated[qIdx].options!.push({ content: '', is_correct: false });
                          setQuizzes(updated);
                        }}
                        className="px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                      >
                        + Thêm lựa chọn
                      </button>
                    )}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tải lên file cho câu hỏi (tùy chọn)</label>
                      <input
                        type="file"
                        accept="image/*,video/*,application/pdf"
                        onChange={(e) => onFileChange(`quiz-${qIdx}`, e)}
                        className="w-full"
                      />
                      {(quiz.media && quiz.media.length > 0) ? (
                        <div className="mt-2">
                          {((quiz.media[0].mime_type && quiz.media[0].mime_type.startsWith('video')) || /\.(mp4|webm|ogg)$/i.test(quiz.media[0].url || '')) ? (
                            <video src={resolveMediaUrl(quiz.media[0].url)} controls className="max-h-40 w-auto" />
                          ) : (/\.pdf$/i.test(quiz.media[0].url || '') || (quiz.media[0].mime_type === 'application/pdf')) ? (
                            <a href={resolveMediaUrl(quiz.media[0].url)} target="_blank" rel="noreferrer" className="text-indigo-600">Open file</a>
                          ) : (
                            <img src={resolveMediaUrl(quiz.media[0].url)} alt={quiz.media[0].purpose || 'media'} className="max-h-40" />
                          )}
                          <div className="mt-2"><button type="button" onClick={() => setQuizzes((prev) => {
                            const copy = [...prev]; copy[qIdx] = { ...copy[qIdx], media: (copy[qIdx].media || []).slice(1) }; return copy;
                          })} className="text-sm text-red-600">✕ Xóa file</button></div>
                        </div>
                      ) : (objectUrlRefs.current[`quiz-${qIdx}`] && (
                        <div className="mt-2">
                          {((filesRef.current[`quiz-${qIdx}`] && filesRef.current[`quiz-${qIdx}`]!.type.startsWith('video')) || /\.(mp4|webm|ogg)$/i.test(objectUrlRefs.current[`quiz-${qIdx}`] || '')) ? (
                            <video src={objectUrlRefs.current[`quiz-${qIdx}`] || ''} controls className="max-h-40 w-auto" />
                          ) : (/\.pdf$/i.test(objectUrlRefs.current[`quiz-${qIdx}`] || '') || (filesRef.current[`quiz-${qIdx}`] && filesRef.current[`quiz-${qIdx}`]!.type === 'application/pdf')) ? (
                            <a href={objectUrlRefs.current[`quiz-${qIdx}`] || ''} target="_blank" rel="noreferrer" className="text-indigo-600">Open file</a>
                          ) : (
                            <img src={objectUrlRefs.current[`quiz-${qIdx}`] || ''} alt="preview" className="max-h-40" />
                          )}
                          <div className="mt-2"><button type="button" onClick={() => removeFile(`quiz-${qIdx}`)} className="text-sm text-red-600">✕ Xóa file</button></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMIT BUTTONS */}
      <div className="flex gap-4 justify-end border-t-2 border-gray-200 pt-8 bg-gradient-to-r from-gray-50 to-indigo-50 p-6 rounded-xl">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-6 py-3 rounded-xl bg-gray-300 text-gray-900 hover:bg-gray-400 disabled:opacity-50 font-bold transition duration-300 text-base"
        >
          ❌ Hủy
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg disabled:opacity-50 font-bold transition duration-300 text-base hover:scale-105"
        >
          {submitting ? '⏳ Đang lưu...' : '✅ Lưu bài học'}
        </button>
      </div>
    </form>
  );
}
