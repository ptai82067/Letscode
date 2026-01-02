/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/jsx-no-target-blank */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import { publicLessonsAPI } from '../../services/api';
import type { Lesson, Media } from '../../types';
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

export default function LessonDetailPublic() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    let mounted = true;
    if (!lessonId) return;

    setLoading(true);
    publicLessonsAPI.getOne(lessonId)
      .then(d => mounted && setLesson(d))
      .catch(() => mounted && setError('Không thể tải bài học'))
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
            return (
              <img
                key={m.id}
                src={url}
                className="rounded-xl shadow object-cover h-44 w-full"
              />
            );

          if (m.mime_type?.startsWith('video'))
            return (
              <video
                key={m.id}
                src={url}
                controls
                className="rounded-xl shadow h-44 w-full object-cover bg-black"
              />
            );

          return (
            <a
              key={m.id}
              href={url}
              target="_blank"
              className="rounded-xl border border-indigo-300 p-4 bg-white text-gray-800 hover:bg-indigo-50"
            >
              📄 Open file
            </a>
          );
        })}
      </div>
    );
  }

  const Card = ({ title, children }: any) => (
    <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-8">
      <div className="rounded-2xl bg-white p-6 shadow-xl text-gray-800">
        <h2 className="text-2xl font-extrabold mb-4 text-indigo-700">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 text-gray-800">

        {/* HERO */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-white">
          <div className="container mx-auto px-6 py-12">
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-indigo-100 hover:text-white"
            >
              ← Quay lại
            </button>

            <h1 className="text-4xl font-black mt-4">
              {lesson?.title || 'Lesson'}
            </h1>

            <p className="text-indigo-200">
              {lesson?.subcourse?.name} • {lesson?.status}
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="container mx-auto px-6 py-10 grid grid-cols-12 gap-8">

          {/* SIDEBAR */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl p-4">
              <h3 className="font-bold mb-4 text-gray-800">
                📚 Nội dung
              </h3>

              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`w-full mb-1 px-4 py-2 rounded-lg text-left font-medium transition
                    ${activeTab === t.key
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
                      : 'hover:bg-slate-100 text-gray-800'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </aside>

          {/* CONTENT */}
          <main className="col-span-12 lg:col-span-9">

            {loading && <div className="text-gray-600">Đang tải…</div>}
            {error && <div className="text-red-600">{error}</div>}

            {lesson && (
              <>
                {activeTab === 'overview' && (
                  <Card title="🔥 Lesson Overview">
                    <p className="text-gray-700 leading-relaxed">
                      {lesson.overview || 'Không có mô tả.'}
                    </p>
                  </Card>
                )}

                {activeTab === 'media' && (
                  <Card title="🎬 Lesson Media">
                    {renderMedia(lesson.media)}
                  </Card>
                )}

                {activeTab === 'objectives' && (
                  <Card title="🎯 Learning Objectives">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {lesson.objectives &&
                        Object.entries(lesson.objectives).map(([k, v]) => (
                          <div key={k} className="p-4 rounded-xl bg-indigo-50">
                            <div className="font-semibold capitalize text-indigo-700">
                              {k}
                            </div>
                            <p className="text-sm text-gray-700">{v}</p>
                          </div>
                        ))}
                    </div>
                  </Card>
                )}

                {activeTab === 'models' && lesson.models?.map(m => (
                  <Card key={m.id} title={`🧩 ${m.title}`}>
                    <p className="mb-3 text-gray-700">{m.description}</p>
                    {renderMedia(m.media)}
                  </Card>
                ))}

                {activeTab === 'preparation' && lesson.preparation && (
                  <Card title="🛠 Preparation">
                    <p className="mb-4 text-gray-700">
                      {lesson.preparation.notes}
                    </p>
                    {renderMedia(lesson.preparation.media)}
                  </Card>
                )}

                {activeTab === 'builds' && lesson.builds?.map(b => (
                  <Card key={b.id} title={`🏗 ${b.title}`}>
                    <p className="mb-3 text-gray-700">{b.description}</p>
                    {renderMedia(b.media)}
                  </Card>
                ))}

                {activeTab === 'attachments' && lesson.attachments?.map(a => (
                  <Card key={a.id} title={`📎 ${a.title}`}>
                    {a.media?.[0] && (
                      <a
                        href={resolveMediaUrl(a.media[0].url)}
                        target="_blank"
                        className="text-indigo-600 font-medium"
                      >
                        ⬇ Download file
                      </a>
                    )}
                  </Card>
                ))}

                {activeTab === 'challenges' && lesson.challenges?.map(c => (
                  <Card key={c.id} title={`⚔ ${c.title}`}>
                    <p className="mb-3 text-gray-700">{c.description}</p>
                    {renderMedia(c.media)}
                  </Card>
                ))}

                {activeTab === 'quizzes' && lesson.quizzes?.map(q => (
                  <Card key={q.id} title={`🧠 ${q.title}`}>
                    <ul className="list-disc pl-5 text-gray-700">
                      {q.options?.map(o => (
                        <li
                          key={o.id}
                          className={o.is_correct ? 'text-green-600 font-semibold' : ''}
                        >
                          {o.content}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </>
            )}
          </main>
        </div>
      </div>
    </PublicLayout>
  );
}
