/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { subcoursesAPI, programsAPI, mediaAPI } from '../services/api';
import type { Subcourse, Program } from '../types';

type Props = {
  initial?: Subcourse | null;
  onCancel?: () => void;
  onSuccess?: (s: Subcourse) => void;
};

export default function SubcourseForm({ initial, onCancel, onSuccess }: Props) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programId, setProgramId] = useState(initial?.program_id || '');
  const [name, setName] = useState(initial?.name || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [ageRange, setAgeRange] = useState(initial?.age_range || '');
  const [status, setStatus] = useState<Subcourse['status']>(initial?.status || 'draft');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initial?.media?.[0]?.url || null);
  const [fileError, setFileError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    programsAPI.getAll().then((data) => { if (mounted) setPrograms(data); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!programId) e.program_id = 'Program is required';
    if (!name.trim()) e.name = 'Name is required';
    if (!slug.trim()) e.slug = 'Slug is required';
    else if (!/^[a-z0-9-]+$/.test(slug)) e.slug = 'Slug may contain only lowercase letters, numbers and hyphens';
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
      const payload: Subcourse = {
        program_id: programId,
        name,
        slug,
        age_range: ageRange,
        status,
      } as any;

      let res: Subcourse;
      if (initial?.id) res = await subcoursesAPI.update(initial.id, payload);
      else res = await subcoursesAPI.create(payload as Subcourse);

      if (file && res.id) {
        try {
          await mediaAPI.upload('subcourse', res.id, file, 'cover');
          res = await subcoursesAPI.getOne(res.id);
        } catch (err) {
          setServerError((err as any)?.response?.data?.error || 'Failed to upload media');
        }
      }

      onSuccess?.(res);
    } catch (err: any) {
      setServerError(err?.response?.data?.error || err?.message || 'Failed to save subcourse');
    } finally {
      setSubmitting(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const f = e.target.files?.[0] || null;
    if (!f) { setFile(null); setPreview(null); return; }
    const allowed = ['image/', 'video/'];
    if (!allowed.some((p) => f.type.startsWith(p))) {
      setFile(null); setPreview(null); setFileError('Only image or video files are allowed'); return;
    }
    const maxSize = 8 * 1024 * 1024;
    if (f.size > maxSize) { setFile(null); setPreview(null); setFileError('File is too large (max 8MB)'); return; }
    if (objectUrlRef.current) {
      try { URL.revokeObjectURL(objectUrlRef.current); } catch {}
      objectUrlRef.current = null;
    }
    const url = URL.createObjectURL(f);
    objectUrlRef.current = url;
    setFile(f); setPreview(url);
  }

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        try { URL.revokeObjectURL(objectUrlRef.current); } catch {}
        objectUrlRef.current = null;
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">{initial?.id ? 'Sửa tiểu khóa' : 'Tạo tiểu khóa'}</h3>
      </div>
      {serverError && <div className="text-red-600 mb-2">{serverError}</div>}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-sm font-medium">Chương trình</label>
          <select className="mt-1 p-2 border rounded w-full max-w-xs" value={programId} onChange={(e) => setProgramId(e.target.value)}>
            <option value="">-- Chọn chương trình --</option>
            {programs.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
          {errors.program_id && <div className="text-red-600 text-sm">{errors.program_id}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium">Tên</label>
          <input className="mt-1 p-2 border rounded w-full" value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <div className="text-red-600 text-sm">{errors.name}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input className="mt-1 p-2 border rounded w-full" value={slug} onChange={(e) => setSlug(e.target.value)} />
          {errors.slug && <div className="text-red-600 text-sm">{errors.slug}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium">Độ tuổi</label>
          <input className="mt-1 p-2 border rounded w-full max-w-xs" value={ageRange} onChange={(e) => setAgeRange(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Ảnh bìa / Phương tiện</label>
          <input type="file" accept="image/*,video/*" onChange={onFileChange} aria-label="Choose cover image or video" />
          {preview && (
            <div className="mt-2">
              {file && file.type.startsWith('video/') ? (
                <video src={preview} controls className="max-h-40 w-auto" />
              ) : (!file && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(preview) ? (
                <video src={preview} controls className="max-h-40 w-auto" />
              ) : (
                <img src={preview} alt="preview" className="max-h-40" />
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <div>
            <label className="block text-sm font-medium">Trạng thái</label>
            <select className="mt-1 p-2 border rounded" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="draft">Nháp</option>
              <option value="published">Đã xuất bản</option>
              <option value="archived">Lưu trữ</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" className="px-3 py-2 text-sm rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300" onClick={onCancel} disabled={submitting}>Hủy</button>
          <button type="submit" className="px-3 py-2 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed" disabled={submitting || !!fileError}>{submitting ? 'Đang lưu...' : 'Lưu'}</button>
        </div>
        {fileError && <div className="text-red-600 text-sm mt-2">{fileError}</div>}
      </div>
    </form>
  );
}
