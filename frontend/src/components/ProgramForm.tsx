import { useEffect, useRef, useState } from 'react';
import { programsAPI, mediaAPI } from '../services/api';
import type { Program } from '../types';

type Props = {
  initial?: Program | null;
  onCancel?: () => void;
  onSuccess?: (p: Program) => void;
};

export default function ProgramForm({ initial, onCancel, onSuccess }: Props) {
  const [name, setName] = useState(initial?.name || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [shortDescription, setShortDescription] = useState(initial?.short_description || '');
  const [status, setStatus] = useState<Program['status']>(initial?.status || 'draft');
  const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order || 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initial?.media?.[0]?.url || null);
  const [fileError, setFileError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!slug.trim()) e.slug = 'Slug is required';
    else if (!/^[a-z0-9-]+$/.test(slug)) e.slug = 'Slug may contain only lowercase letters, numbers and hyphens';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSubmitting(true);
    try {
      const payload: Program = {
        name,
        slug,
        short_description: shortDescription,
        status,
        sort_order: sortOrder,
      } as any;

      let res: Program;
      if (initial?.id) res = await programsAPI.update(initial.id, payload);
      else res = await programsAPI.create(payload as Program);

      // if a file is selected, upload it referencing the created/updated program id
      if (file && res.id) {
        try {
          await mediaAPI.upload('program', res.id, file, 'cover');
          // reload program to get media URL
          res = await programsAPI.getOne(res.id);
        } catch (err) {
          // non-fatal: show server error but still return created program
          setServerError((err as any)?.response?.data?.error || 'Failed to upload media');
        }
      }

      onSuccess?.(res);
    } catch (err: any) {
      setServerError(err?.response?.data?.error || err?.message || 'Failed to save program');
    } finally {
      setSubmitting(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const f = e.target.files?.[0] || null;
    if (!f) { setFile(null); setPreview(null); return; }
    // validate type and size (max 8MB)
    const allowed = ['image/', 'video/'];
    if (!allowed.some((p) => f.type.startsWith(p))) {
      setFile(null);
      setPreview(null);
      setFileError('Only image or video files are allowed');
      return;
    }
    const maxSize = 8 * 1024 * 1024;
    if (f.size > maxSize) {
      setFile(null);
      setPreview(null);
      setFileError('File is too large (max 8MB)');
      return;
    }
    // revoke previous object URL if any
    if (objectUrlRef.current) {
      try { URL.revokeObjectURL(objectUrlRef.current); } catch {}
      objectUrlRef.current = null;
    }
    const url = URL.createObjectURL(f);
    objectUrlRef.current = url;
    setFile(f);
    setPreview(url);
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
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg mb-6 overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 border-b border-blue-700">
        <h3 className="text-2xl font-bold text-white">
          {initial?.id ? '✏️ Sửa chương trình' : '➕ Tạo chương trình'}
        </h3>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <p className="font-semibold text-red-800">Lỗi</p>
              <p className="text-red-700 text-sm">{serverError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {/* Tên */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              📛 Tên chương trình <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white text-slate-900 placeholder-slate-500"
              placeholder="Nhập tên chương trình"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <div className="mt-2 text-sm text-red-600 font-medium flex items-center gap-2">
                <span>⚠️</span>{errors.name}
              </div>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              🔗 Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white text-slate-900 placeholder-slate-500"
              placeholder="program-slug (chỉ chứa chữ thường, số và dấu gạch ngang)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            {errors.slug && (
              <div className="mt-2 text-sm text-red-600 font-medium flex items-center gap-2">
                <span>⚠️</span>{errors.slug}
              </div>
            )}
          </div>

          {/* Mô tả ngắn */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              📝 Mô tả ngắn
            </label>
            <textarea
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white text-slate-900 placeholder-slate-500 resize-vertical min-h-24"
              placeholder="Mô tả ngắn về chương trình..."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              🖼️ Ảnh bìa / Phương tiện
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={onFileChange}
                aria-label="Chọn ảnh bìa hoặc video"
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="block w-full px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer text-center bg-white"
              >
                <div className="text-4xl mb-2">📤</div>
                <p className="text-sm font-medium text-slate-700">Nhấp để chọn ảnh hoặc video</p>
                <p className="text-xs text-slate-500 mt-1">Tối đa 8MB (JPG, PNG, MP4, WebM, ...)</p>
              </label>
            </div>

            {/* File Error */}
            {fileError && (
              <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-2">
                <span className="text-lg">❌</span>
                <p className="text-sm text-red-700 font-medium">{fileError}</p>
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-600 mb-2">✅ Xem trước</p>
                <div className="bg-slate-900 rounded-lg p-2 inline-block">
                  {file && file.type.startsWith('video/') ? (
                    <video src={preview} controls className="max-h-48 rounded" />
                  ) : (!file && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(preview) ? (
                    <video src={preview} controls className="max-h-48 rounded" />
                  ) : (
                    <img src={preview} alt="preview" className="max-h-48 rounded" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status and Sort Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                📊 Trạng thái
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white text-slate-900 font-medium"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="draft">📝 Nháp</option>
                <option value="published">✅ Đã xuất bản</option>
                <option value="archived">📦 Lưu trữ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                🔢 Thứ tự sắp xếp
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition bg-white text-slate-900"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Actions */}
      <div className="bg-slate-100 px-8 py-4 border-t border-slate-200 flex gap-3 justify-end">
        <button
          type="button"
          className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-slate-300 text-slate-800 hover:bg-slate-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onCancel}
          disabled={submitting}
        >
          ❌ Hủy
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitting || !!fileError}
        >
          {submitting ? '⏳ Đang lưu...' : '💾 Lưu'}
        </button>
      </div>
    </form>
  );
}
