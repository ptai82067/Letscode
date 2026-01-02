/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-no-target-blank */
import { useEffect, useState } from 'react';
import { lessonsAPI } from '../../services/api';
import type { Lesson, Media } from '../../types';
import { useParams, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../utils/error';
import { resolveMediaUrl } from '../../utils/media';

const TABS = [
  { key: 'overview', label: '🔥 Overview' },
  { key: 'media', label: '🎬 Media' },
  { key: 'objectives', label: '🎯 Objectives' },
  { key: 'models', label: '🧩 Models' },
  { key: 'preparation', label: '🛠 Preparation' },
  { key: 'builds', label: '🏗 Builds' },
  { key: 'attachments', label: '📎 Attachments' },
  { key: 'challenges', label: '⚔ Challenges' },
  { key: 'quizzes', label: '🧠 Quizzes' },
];

export default function LessonDetail() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'student' | 'instructor'>('student');
  const [showMetadata, setShowMetadata] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!lessonId) return;

    setLoading(true);
    lessonsAPI.getOne(lessonId)
      .then((d) => mounted && setLesson(d))
      .catch((e) => mounted && setError(getErrorMessage(e)))
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [lessonId]);

  function renderMedia(media?: Media[]) {
    if (!media?.length) return null;
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {media.map(m => {
          const url = resolveMediaUrl(m.url);
          if (m.mime_type?.startsWith('image'))
            return <img key={m.id} src={url} className="rounded-xl shadow-lg object-cover h-44 w-full" />;
          if (m.mime_type?.startsWith('video'))
            return <video key={m.id} src={url} controls className="rounded-xl shadow-lg h-44 w-full object-cover" />;
          return (
            <a
              key={m.id}
              href={url}
              target="_blank"
              className="rounded-xl border border-indigo-400 p-4 bg-white text-gray-800 hover:bg-indigo-50"
            >
              📄 Open file
            </a>
          );
        })}
      </div>
    );
  }

  const Card = ({ title, children }: any) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition mb-8">
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">{title}</h2>
        <div className="text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* HERO */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition mb-4"
          >
            ← Back
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
            <div className="lg:col-span-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {lesson?.title || 'Lesson'}
              </h1>
              {lesson?.subtitle && <p className="text-lg text-gray-600 mb-4">{lesson.subtitle}</p>}
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {lesson?.subcourse?.name || 'Subcourse'}
                </span>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium capitalize">
                  {lesson?.status || 'Draft'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {lesson?.slug && <span className="font-mono text-gray-600">{lesson.slug}</span>}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('student')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${viewMode === 'student' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Student View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('instructor')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${viewMode === 'instructor' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Instructor View
                </button>
              </div>
            </div>
          </div>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {lesson?.duration_minutes && (
              <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Duration</div>
                <div className="text-lg font-semibold text-gray-900 mt-1">{lesson.duration_minutes} min</div>
              </div>
            )}
            {lesson?.difficulty && (
              <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Difficulty</div>
                <div className="text-lg font-semibold text-gray-900 mt-1 capitalize">{lesson.difficulty}</div>
              </div>
            )}
            {lesson?.estimated_time && (
              <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Est. Time</div>
                <div className="text-lg font-semibold text-gray-900 mt-1">{lesson.estimated_time}</div>
              </div>
            )}
            {/* {lesson?.sort_order !== undefined && (
              <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Sequence</div>
                <div className="text-lg font-semibold text-gray-900 mt-1"># {lesson.sort_order}</div>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR - Navigation */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wide mb-4">📚 Lesson Sections</h3>
              <nav className="space-y-2">
                {TABS.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition ${
                      activeTab === t.key
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

        {/* CONTENT */}
        <main className="lg:col-span-3 text-gray-800">
          {loading && <div className="text-center py-12"><div className="inline-block px-6 py-3 bg-indigo-100 text-indigo-700 rounded-lg">Loading…</div></div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

          {lesson && (
            <>
              {/* Cover image if present */}
              {lesson.media && lesson.media[0] && (
                <div className="mb-8 rounded-xl overflow-hidden shadow-md">
                  <img src={resolveMediaUrl(lesson.media[0].url)} alt="cover" className="w-full h-64 sm:h-80 object-cover" />
                </div>
              )}
              {activeTab === 'overview' && (
                <Card title="🔥 Lesson Overview">
                  <div className="prose prose-sm max-w-none mb-8">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {lesson.overview || 'No overview provided.'}
                    </p>
                  </div>
                  {/* Metadata Section */}
                  <div className="mb-8">
                    <button
                      type="button"
                      onClick={() => setShowMetadata(!showMetadata)}
                      className="w-full flex items-center justify-between px-4 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition font-semibold text-indigo-900"
                    >
                      <span>📊 Lesson Details</span>
                      <span className="text-lg">{showMetadata ? '▼' : '▶'}</span>
                    </button>
                    {showMetadata && (
                      <div className="mt-4 grid sm:grid-cols-2 gap-4">
                        {lesson.duration_minutes && (
                          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-xl">⏱</span>
                            <div>
                              <div className="text-xs text-gray-500 uppercase">Duration</div>
                              <div className="font-semibold text-gray-900">{lesson.duration_minutes} minutes</div>
                            </div>
                          </div>
                        )}
                        {lesson.difficulty && (
                          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-xl">⚙️</span>
                            <div>
                              <div className="text-xs text-gray-500 uppercase">Difficulty</div>
                              <div className="font-semibold text-gray-900 capitalize">{lesson.difficulty}</div>
                            </div>
                          </div>
                        )}
                        {lesson.estimated_time && (
                          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-xl">🕒</span>
                            <div>
                              <div className="text-xs text-gray-500 uppercase">Est. Time</div>
                              <div className="font-semibold text-gray-900">{lesson.estimated_time}</div>
                            </div>
                          </div>
                        )}
                        {lesson.sort_order !== undefined && (
                          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-xl">#️⃣</span>
                            <div>
                              <div className="text-xs text-gray-500 uppercase">Sequence</div>
                              <div className="font-semibold text-gray-900">Lesson {lesson.sort_order + 1}</div>
                            </div>
                          </div>
                        )}
                        {lesson.block_types && lesson.block_types.length > 0 && (
                          <div className="sm:col-span-2 flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-xl">🎯</span>
                            <div className="flex-1">
                              <div className="text-xs text-gray-500 uppercase">Content Types</div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {lesson.block_types.map((type, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium">
                                    {type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {lesson.content_blocks && lesson.content_blocks.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-bold mb-6 text-gray-900">📑 Lesson Content</h3>

                      {/* TOC */}
                      <div className="mb-8 p-4 sm:p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">Table of Contents</h4>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 px-3 py-2 rounded hover:bg-white transition"
                              onClick={() => {
                                const next: Record<string, boolean> = {};
                                lesson.content_blocks!.forEach(cb => { next[cb.id as string] = true; });
                                setExpandedBlocks(next);
                              }}
                            >
                              Expand All
                            </button>
                            <button
                              type="button"
                              className="text-xs font-medium text-gray-600 hover:text-gray-700 px-3 py-2 rounded hover:bg-white transition"
                              onClick={() => setExpandedBlocks({})}
                            >
                              Collapse All
                            </button>
                          </div>
                        </div>
                        <ol className="space-y-2">
                          {lesson.content_blocks.map((cb, idx) => (
                            <li key={cb.id} className="flex gap-3">
                              <span className="font-semibold text-indigo-600 min-w-fit">{idx + 1}.</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedBlocks((prev) => ({ ...prev, [cb.id as string]: true }));
                                  const el = document.getElementById(`cb-${cb.id}`);
                                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className="text-indigo-600 hover:text-indigo-700 hover:underline text-left font-medium"
                              >
                                {cb.title}
                              </button>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="space-y-4">
                        {lesson.content_blocks.map((cb, idx) => {
                          const id = `cb-${cb.id}`;
                          const isOpen = !!expandedBlocks[cb.id as string];
                          return (
                            <div key={cb.id} id={id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setExpandedBlocks((prev) => ({ ...prev, [cb.id as string]: !prev[cb.id as string] }))}
                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
                              >
                                <div className="text-left">
                                  <div className="font-semibold text-gray-900">{idx + 1}. {cb.title}</div>
                                  {cb.subtitle && <div className="text-sm text-gray-600 mt-1">{cb.subtitle}</div>}
                                </div>
                                <span className={`text-indigo-600 transition transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                              </button>
                              {isOpen && (
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                  <div className="text-gray-700 whitespace-pre-line mb-4 leading-relaxed">{cb.description}</div>
                                  {cb.usage_text && <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200 text-sm"><strong className="text-blue-900">💡 Usage:</strong> <span className="text-blue-800">{cb.usage_text}</span></div>}
                                  {cb.example_text && <div className="mb-3 p-3 bg-green-50 rounded border border-green-200 text-sm"><strong className="text-green-900">✓ Example:</strong> <span className="text-green-800">{cb.example_text}</span></div>}
                                  {renderMedia(cb.media)}
                                  {cb.sort_order !== undefined && <div className="text-xs text-gray-500 mt-4">Sequence: #{cb.sort_order}</div>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* show block types if present */}
                  {lesson.block_types && lesson.block_types.length > 0 && (
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm"><strong className="text-blue-900">Content Types Used:</strong> <span className="text-blue-800">{lesson.block_types.join(', ')}</span></div>
                    </div>
                  )}
                </Card>
              )}

              {activeTab === 'media' && (
                <Card title="🎬 Lesson Media">
                  {lesson.media && lesson.media.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-6">
                      {lesson.media.map(m => {
                        const url = resolveMediaUrl(m.url);
                        if (m.mime_type?.startsWith('image'))
                          return <div key={m.id} className="rounded-lg overflow-hidden shadow-md"><img src={url} alt="media" className="w-full h-48 object-cover" /></div>;
                        if (m.mime_type?.startsWith('video'))
                          return <div key={m.id} className="rounded-lg overflow-hidden shadow-md"><video src={url} controls className="w-full h-48 object-cover" /></div>;
                        return (
                          <a
                            key={m.id}
                            href={url}
                            target="_blank"
                            className="flex items-center justify-center p-6 rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50 hover:bg-indigo-100 transition text-indigo-600 font-medium"
                          >
                            📄 {m.purpose || 'Download file'}
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No media files for this lesson.</p>
                  )}
                </Card>
              )}

              {activeTab === 'objectives' && (
                <Card title="🎯 Learning Objectives">
                  {lesson.objectives && Object.keys(lesson.objectives).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(lesson.objectives)
                        .filter(([k]) => ['knowledge', 'thinking', 'skills', 'attitude'].includes(k))
                        .map(([k, v]) => {
                        const icons: Record<string, string> = {
                          knowledge: '🧠',
                          thinking: '💭',
                          skills: '🎯',
                          attitude: '💡'
                        };
                        const colors: Record<string, string> = {
                          knowledge: 'from-blue-50 to-cyan-50 border-blue-200',
                          thinking: 'from-purple-50 to-pink-50 border-purple-200',
                          skills: 'from-green-50 to-emerald-50 border-green-200',
                          attitude: 'from-yellow-50 to-orange-50 border-yellow-200'
                        };
                        const textColors: Record<string, string> = {
                          knowledge: 'text-blue-900',
                          thinking: 'text-purple-900',
                          skills: 'text-green-900',
                          attitude: 'text-yellow-900'
                        };
                        return (
                          <div key={k} className={`p-6 rounded-lg bg-gradient-to-br ${colors[k] || 'from-indigo-50 to-blue-50 border-indigo-200'} border-2 hover:shadow-md transition`}>
                            <div className="flex gap-4">
                              <span className="text-3xl">{icons[k] || '📌'}</span>
                              <div className="flex-1">
                                <h4 className={`font-bold text-lg capitalize ${textColors[k] || 'text-indigo-900'} mb-2`}>{k}</h4>
                                <p className="text-gray-700 leading-relaxed">{v || '(No content)'}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No objectives defined.</p>
                  )}
                </Card>
              )}

              {activeTab === 'models' && (
                <>
                  {lesson.models && lesson.models.length > 0 ? (
                    lesson.models.map(m => (
                      <Card key={m.id} title={`🧩 ${m.title}`}>
                        <p className="text-gray-700 whitespace-pre-line mb-4 leading-relaxed">{m.description}</p>
                        {renderMedia(m.media)}
                        {m.sort_order !== undefined && <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">Sequence: #{m.sort_order}</div>}
                      </Card>
                    ))
                  ) : (
                    <Card title="🧩 Models">
                      <p className="text-gray-500 text-center py-8">No models for this lesson.</p>
                    </Card>
                  )}
                </>
              )}

              {activeTab === 'preparation' && (
                <>
                  {lesson.preparation ? (
                    <Card title="🛠 Preparation">
                      <p className="text-gray-700 whitespace-pre-line mb-6 leading-relaxed">{lesson.preparation.notes || 'No preparation notes.'}</p>
                      {renderMedia(lesson.preparation.media)}
                    </Card>
                  ) : (
                    <Card title="🛠 Preparation">
                      <p className="text-gray-500 text-center py-8">No preparation materials available.</p>
                    </Card>
                  )}
                </>
              )}

              {activeTab === 'builds' && (
                <>
                  {lesson.builds && lesson.builds.length > 0 ? (
                    lesson.builds.map(b => (
                      <Card key={b.id} title={`🏗 ${b.title}`}>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {b.build_type && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Type: {b.build_type}</span>}
                          {b.sort_order !== undefined && <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"># {b.sort_order}</span>}
                        </div>
                        <p className="text-gray-700 whitespace-pre-line mb-4 leading-relaxed">{b.description}</p>
                        {renderMedia(b.media)}
                      </Card>
                    ))
                  ) : (
                    <Card title="🏗 Builds">
                      <p className="text-gray-500 text-center py-8">No build materials for this lesson.</p>
                    </Card>
                  )}
                </>
              )}

              {activeTab === 'content' && (
                <>
                  {lesson.content_blocks && lesson.content_blocks.length > 0 ? (
                    lesson.content_blocks.map(cb => (
                      <Card key={cb.id} title={`📄 ${cb.title}`}>
                        {cb.subtitle && <p className="text-sm text-gray-600 mb-3 italic">{cb.subtitle}</p>}
                        <p className="text-gray-700 whitespace-pre-line mb-4 leading-relaxed">{cb.description}</p>
                        {cb.usage_text && <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200 text-sm"><strong className="text-blue-900">💡 Usage:</strong> <span className="text-blue-800">{cb.usage_text}</span></div>}
                        {cb.example_text && <div className="mb-4 p-3 bg-green-50 rounded border border-green-200 text-sm"><strong className="text-green-900">✓ Example:</strong> <span className="text-green-800">{cb.example_text}</span></div>}
                        {renderMedia(cb.media)}
                        {cb.sort_order !== undefined && <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">Sequence: #{cb.sort_order}</div>}
                      </Card>
                    ))
                  ) : (
                    <Card title="📄 Content Blocks">
                      <p className="text-gray-500 text-center py-8">No content blocks for this lesson.</p>
                    </Card>
                  )}
                </>
              )}

              {activeTab === 'attachments' && (
                <>
                  {lesson.attachments && lesson.attachments.length > 0 ? (
                    lesson.attachments.map(a => (
                      <Card key={a.id} title={`📎 ${a.title}`}>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-1">
                            {a.file_type && <div className="text-sm text-gray-600 mb-2"><strong>Type:</strong> {a.file_type.toUpperCase()}</div>}
                            {a.description && <p className="text-gray-700 mb-3">{a.description}</p>}
                            {a.sort_order !== undefined && <div className="text-xs text-gray-500">Sequence: #{a.sort_order}</div>}
                          </div>
                          {a.media?.[0] && (
                            <a
                              href={resolveMediaUrl(a.media[0].url)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm whitespace-nowrap"
                            >
                              ⬇ Download
                            </a>
                          )}
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card title="📎 Attachments">
                      <p className="text-gray-500 text-center py-8">No attachments for this lesson.</p>
                    </Card>
                  )}
                </>
              )}

              {activeTab === 'challenges' && (
                <>
                  {lesson.challenges && lesson.challenges.length > 0 ? (
                    lesson.challenges.map(c => (
                      <Card key={c.id} title={`⚔ ${c.title}`}>
                        {c.subtitle && <p className="text-sm text-gray-600 mb-3 italic">{c.subtitle}</p>}
                        <p className="text-gray-700 whitespace-pre-line mb-4 leading-relaxed">{c.description}</p>
                        {c.instructions && <div className="mb-4 p-4 bg-orange-50 rounded border border-orange-200"><strong className="text-orange-900">📋 Instructions:</strong> <p className="text-orange-800 mt-2 whitespace-pre-line">{c.instructions}</p></div>}
                        {renderMedia(c.media)}
                        {c.sort_order !== undefined && <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">Sequence: #{c.sort_order}</div>}
                      </Card>
                    ))
                  ) : (
                    <Card title="⚔ Challenges">
                      <p className="text-gray-500 text-center py-8">No challenges for this lesson.</p>
                    </Card>
                  )}
                </>
              )}

              {activeTab === 'quizzes' && (
                <>
                  {lesson.quizzes && lesson.quizzes.length > 0 ? (
                    lesson.quizzes.map(q => (
                      <Card key={q.id} title={`🧠 ${q.title}`}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <p className="text-gray-700 whitespace-pre-line flex-1">{q.description}</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${q.quiz_type === 'single' ? 'bg-blue-100 text-blue-700' : q.quiz_type === 'multiple' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                            {q.quiz_type === 'single' ? 'Single Choice' : q.quiz_type === 'multiple' ? 'Multiple Choice' : 'Open Question'}
                          </span>
                        </div>
                        {q.media && q.media.length > 0 && <div className="mb-6">{renderMedia(q.media)}</div>}

                        {/* Options */}
                        {q.quiz_type !== 'open' && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 mb-4">Choose the correct answer{q.quiz_type === 'multiple' ? '(s)' : ''}:</h4>
                            {(q.options || []).map((o, idx) => (
                              <div
                                key={o.id || idx}
                                className={`p-4 rounded-lg border-2 transition ${
                                  viewMode === 'instructor' && o.is_correct
                                    ? 'border-green-300 bg-green-50'
                                    : 'border-gray-200 bg-white hover:border-indigo-300'
                                }`}
                              >
                                <div className="flex gap-4">
                                  <div className="flex-shrink-0">
                                    {q.quiz_type === 'single' ? (
                                      <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center font-semibold text-sm text-gray-600">
                                        {String.fromCharCode(65 + idx)}
                                      </div>
                                    ) : (
                                      <div className="w-6 h-6 rounded border-2 border-gray-400 flex items-center justify-center font-semibold text-sm text-gray-600">
                                        {idx + 1}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className={viewMode === 'instructor' && o.is_correct ? 'font-semibold text-gray-900' : 'text-gray-800'}>
                                        {o.content}
                                      </p>
                                      {viewMode === 'instructor' && o.is_correct && (
                                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                                          ✓ Correct
                                        </span>
                                      )}
                                    </div>
                                    {o.explanation && (
                                      <details className="mt-3 cursor-pointer">
                                        <summary className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                                          Show explanation
                                        </summary>
                                        <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                          {o.explanation}
                                        </p>
                                      </details>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.quiz_type === 'open' && (
                          <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200 text-center">
                            <p className="text-blue-900 font-medium">📝 Open-ended question</p>
                            <p className="text-blue-800 text-sm mt-1">Students will provide a free-text answer</p>
                          </div>
                        )}
                      </Card>
                    ))
                  ) : (
                    <Card title="🧠 Quizzes">
                      <p className="text-gray-500 text-center py-8">No quizzes for this lesson.</p>
                    </Card>
                  )}
                </>
              )}

            </>
          )}
        </main>
        </div>
      </div>
    </div>
  );
}
