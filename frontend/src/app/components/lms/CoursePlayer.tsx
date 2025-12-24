import { useState, useEffect } from 'react';
import React from 'react';
import { CheckCircle, Circle, PlayCircle, FileText, Video, Download, ChevronRight, ChevronDown, Lock, ArrowLeft, X, RotateCcw, AlertCircle } from 'lucide-react';
import { Course, Module, Lesson, Test, Answer, TestAttempt } from '../../types/lms';
import { Link } from 'react-router-dom';
import { testsService } from '../../services/tests';
import { examsService } from '../../services/exams';
import { TestInterface } from './TestInterface';
import { TestResultModal } from './TestResultModal';
import { toast } from 'sonner';

interface CoursePlayerProps {
  course: Course;
  onLessonComplete: (lessonId: string) => void;
  onCourseComplete: () => void;
}

export function CoursePlayer({ course, onLessonComplete, onCourseComplete }: CoursePlayerProps) {
  // Убеждаемся, что modules - это массив
  const courseModules = course.modules && Array.isArray(course.modules) 
    ? course.modules 
    : [];
  
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(
    courseModules[0]?.lessons?.[0] || null
  );
  const [expandedModules, setExpandedModules] = useState<string[]>(
    courseModules.map(m => m.id)
  );
  const [showTestModal, setShowTestModal] = useState(false);
  const [test, setTest] = useState<Test | null>(null);
  const [testAttemptId, setTestAttemptId] = useState<number | null>(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [testResult, setTestResult] = useState<TestAttempt | null>(null);
  const [testTimeSpent, setTestTimeSpent] = useState(0);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleLessonComplete = () => {
    if (selectedLesson) {
      onLessonComplete(selectedLesson.id);
      
      // Auto-navigate to next lesson
      const nextLesson = getNextLesson();
      if (nextLesson) {
        setSelectedLesson(nextLesson);
      } else {
        // Course completed
        onCourseComplete();
      }
    }
  };

  // Загружаем попытки при выборе урока с тестом
  useEffect(() => {
    const loadAttempts = async () => {
      if (!selectedLesson) return;
      
      const testId = selectedLesson.testId || selectedLesson.test_id;
      if (!testId) {
        setTestAttempts([]);
        return;
      }

      try {
        setLoadingAttempts(true);
        const attempts = await examsService.getTestAttempts(String(testId));
        setTestAttempts(attempts);
      } catch (error: any) {
        console.error('Failed to load attempts:', error);
        setTestAttempts([]);
      } finally {
        setLoadingAttempts(false);
      }
    };

    loadAttempts();
  }, [selectedLesson]);

  const handleStartQuiz = async () => {
    if (!selectedLesson) return;
    
    const testId = selectedLesson.testId || selectedLesson.test_id;
    if (!testId) {
      toast.error('Тест не привязан к этому уроку');
      return;
    }

    try {
      setLoadingTest(true);
      // Загружаем тест
      const loadedTest = await testsService.getTest(String(testId));
      
      if (!loadedTest.questions || loadedTest.questions.length === 0) {
        toast.error('В тесте нет вопросов');
        setLoadingTest(false);
        return;
      }

      // Проверяем количество попыток
      const maxAttempts = loadedTest.maxAttempts || loadedTest.max_attempts || 3;
      const attemptsCount = testAttempts.length;
      
      if (attemptsCount >= maxAttempts) {
        toast.error(`Достигнуто максимальное количество попыток (${maxAttempts})`);
        setLoadingTest(false);
        return;
      }

      // Начинаем попытку
      const attempt = await examsService.startTestAttempt(String(testId));
      const attemptIdNum = Number(attempt.id);
      
      setTest(loadedTest);
      setTestAttemptId(attemptIdNum);
      setShowTestModal(true);
      
      // Сохраняем attemptId в localStorage для автосохранения
      localStorage.setItem(`test_${testId}_progress`, JSON.stringify({
        attemptId: attemptIdNum,
      }));
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при загрузке теста');
      console.error('Failed to start quiz:', error);
    } finally {
      setLoadingTest(false);
    }
  };

  const handleTestComplete = async (answers: Answer[], timeSpent: number) => {
    if (!test || !testAttemptId) return;

    try {
      // Отправляем ответы на сервер
      const answersData: Record<string, any> = {};
      answers.forEach(answer => {
        answersData[answer.questionId] = answer.answer;
      });

      await examsService.saveTestAttempt(String(testAttemptId), answersData);
      const result = await examsService.submitTestAttempt(String(testAttemptId));

      // Удаляем сохраненный прогресс
      localStorage.removeItem(`test_${test.id}_progress`);

      // Сохраняем результат и время
      setTestResult(result);
      setTestTimeSpent(timeSpent);

      // Обновляем список попыток
      const updatedAttempts = await examsService.getTestAttempts(test.id);
      setTestAttempts(updatedAttempts);

      // Закрываем модальное окно теста
      setShowTestModal(false);
      setTest(null);
      setTestAttemptId(null);

      // Показываем модальное окно результатов
      setShowResultModal(true);

      // Автоматически отмечаем урок как завершенный, если тест пройден
      if (result.passed) {
        handleLessonComplete();
      }
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при завершении теста');
      console.error('Failed to complete test:', error);
    }
  };

  const handleTestCancel = () => {
    setShowTestModal(false);
    setTest(null);
    setTestAttemptId(null);
  };

  const getNextLesson = (): Lesson | null => {
    for (let i = 0; i < courseModules.length; i++) {
      const module = courseModules[i];
      const moduleLessons = module.lessons && Array.isArray(module.lessons) ? module.lessons : [];
      for (let j = 0; j < moduleLessons.length; j++) {
        const lesson = moduleLessons[j];
        if (lesson.id === selectedLesson?.id) {
          // Return next lesson in same module
          if (j < moduleLessons.length - 1) {
            return moduleLessons[j + 1];
          }
          // Return first lesson of next module
          if (i < courseModules.length - 1) {
            const nextModuleLessons = courseModules[i + 1].lessons && Array.isArray(courseModules[i + 1].lessons)
              ? courseModules[i + 1].lessons
              : [];
            return nextModuleLessons[0] || null;
          }
          return null;
        }
      }
    }
    return null;
  };

  const completedLessonsCount = courseModules.reduce(
    (count, module) => {
      const moduleLessons = module.lessons && Array.isArray(module.lessons) ? module.lessons : [];
      return count + moduleLessons.filter(l => l.completed === true).length;
    },
    0
  );
  const totalLessonsCount = courseModules.reduce(
    (count, module) => {
      const moduleLessons = module.lessons && Array.isArray(module.lessons) ? module.lessons : [];
      return count + moduleLessons.length;
    },
    0
  );
  
  // Используем прогресс из enrollment, если он есть, иначе вычисляем
  const courseProgress = course.progress !== undefined ? course.progress : 
    (totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <Link
            to="/student/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться к курсам
          </Link>
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <p className="text-gray-600">{course.description}</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
              {getCategoryName(course.category)}
            </span>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Прогресс курса</span>
              <span>{completedLessonsCount} из {totalLessonsCount} уроков</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${courseProgress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              {courseProgress}% завершено
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Course Structure */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h2 className="font-bold text-gray-900 mb-4">Программа курса</h2>
              
              <div className="space-y-2">
                {courseModules.map(module => {
                  const moduleLessons = module.lessons && Array.isArray(module.lessons) ? module.lessons : [];
                  // Модуль считается завершенным, если все его уроки завершены
                  const isModuleCompleted = moduleLessons.length > 0 && 
                    moduleLessons.every(lesson => lesson.completed === true);
                  return (
                    <div key={module.id}>
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {isModuleCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium text-gray-900 text-left">
                            {module.title}
                          </span>
                        </div>
                        {expandedModules.includes(module.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>

                      {expandedModules.includes(module.id) && (
                        <div className="ml-4 mt-1 space-y-1">
                          {moduleLessons.map(lesson => {
                            const isLocked = false; // TODO: Add logic for locked lessons
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => !isLocked && setSelectedLesson(lesson)}
                                disabled={isLocked}
                                className={`w-full flex items-start gap-2 p-2 rounded-lg transition-colors text-left ${
                                  selectedLesson?.id === lesson.id
                                    ? 'bg-blue-50 text-blue-700'
                                    : isLocked
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                {isLocked ? (
                                  <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                ) : lesson.completed === true ? (
                                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{lesson.title}</p>
                                  {lesson.duration && (
                                    <p className="text-xs text-gray-500">{lesson.duration} мин</p>
                                  )}
                                </div>
                                {getLessonIcon(lesson.type)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedLesson ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Lesson Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                  <div className="flex items-center gap-3 mb-2">
                    {getLessonIcon(selectedLesson.type, 'text-white')}
                    <span className="text-sm font-medium opacity-90">
                      {getLessonTypeName(selectedLesson.type)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{selectedLesson.title}</h2>
                  {selectedLesson.duration && (
                    <p className="text-blue-100 text-sm">
                      Длительность: {selectedLesson.duration} минут
                    </p>
                  )}
                </div>

                {/* Lesson Content */}
                <div className="p-8">
                  {selectedLesson.type === 'video' && (
                    <div className="mb-6">
                      {getVideoPlayer(selectedLesson)}
                    </div>
                  )}

                  {selectedLesson.type === 'text' && (
                    <div className="prose max-w-none">
                      <div className="text-gray-800 leading-relaxed space-y-4">
                        <p>
                          {selectedLesson.content || 
                            'Законодательство Республики Казахстан в области промышленной безопасности основывается на Конституции РК и состоит из Закона РК «О гражданской защите» и иных нормативных правовых актов РК.'}
                        </p>
                        <h3 className="text-xl font-bold text-gray-900 mt-6">Основные принципы</h3>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Приоритет жизни и здоровья работников</li>
                          <li>Предупреждение и профилактика опасных ситуаций</li>
                          <li>Постоянный контроль и мониторинг</li>
                          <li>Ответственность работодателя</li>
                        </ul>
                        <p className="mt-6">
                          Изучение данного материала является обязательным для всех специалистов, работающих на опасных производственных объектах.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedLesson.type === 'pdf' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-bold text-gray-900 mb-2">PDF Документ</h3>
                      <p className="text-gray-600 mb-4">{selectedLesson.pdfUrl}</p>
                      <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="w-4 h-4" />
                        Скачать материал
                      </button>
                    </div>
                  )}

                  {selectedLesson.type === 'quiz' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="font-bold text-gray-900 mb-2">Проверочный тест</h3>
                      <p className="text-gray-600 mb-4">
                        Ответьте на вопросы для проверки усвоения материала модуля.
                      </p>
                      
                      {/* Информация о попытках */}
                      {selectedLesson.testId || selectedLesson.test_id ? (
                        <>
                          {loadingAttempts ? (
                            <div className="text-sm text-gray-500 mb-4">Загрузка информации о попытках...</div>
                          ) : (
                            <div className="mb-4 p-3 bg-white rounded-lg border border-blue-100">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <RotateCcw className="w-4 h-4 text-gray-400" />
                                <span>
                                  Попыток использовано: <strong>{testAttempts.length}</strong> из{' '}
                                  <strong>
                                    {(() => {
                                      // Пытаемся получить max_attempts из теста, если он уже загружен
                                      if (test && (test.maxAttempts || test.max_attempts)) {
                                        return test.maxAttempts || test.max_attempts;
                                      }
                                      // Иначе используем значение по умолчанию
                                      return 3;
                                    })()}
                                  </strong>
                                </span>
                              </div>
                              {testAttempts.length > 0 && (
                                <div className="mt-2 text-xs text-gray-500">
                                  Последняя попытка:{' '}
                                  {(() => {
                                    const lastAttempt = testAttempts[0];
                                    const completedDate = lastAttempt.completed_at || lastAttempt.completedAt;
                                    const startedDate = lastAttempt.started_at || lastAttempt.startedAt;
                                    
                                    if (completedDate) {
                                      try {
                                        const date = typeof completedDate === 'string' ? new Date(completedDate) : completedDate;
                                        return date.toLocaleDateString('ru-RU');
                                      } catch {
                                        return '—';
                                      }
                                    } else if (startedDate) {
                                      try {
                                        const date = typeof startedDate === 'string' ? new Date(startedDate) : startedDate;
                                        return date.toLocaleDateString('ru-RU');
                                      } catch {
                                        return '—';
                                      }
                                    }
                                    return '—';
                                  })()}
                                  {testAttempts[0].score !== undefined && testAttempts[0].score !== null && (
                                    <span className="ml-2">
                                      (Результат: {Number(testAttempts[0].score).toFixed(1)}%)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {testAttempts.length >= (test?.maxAttempts || test?.max_attempts || 3) && (
                            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-orange-800">
                                  <p className="font-medium mb-1">Все попытки использованы</p>
                                  <p className="text-xs">
                                    Обратитесь к администратору для получения дополнительных попыток.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : null}
                      
                      <button 
                        onClick={handleStartQuiz}
                        disabled={
                          loadingTest || 
                          loadingAttempts ||
                          (!selectedLesson.testId && !selectedLesson.test_id) ||
                          (testAttempts.length >= (test?.maxAttempts || test?.max_attempts || 3))
                        }
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingTest ? 'Загрузка теста...' : 'Начать тест'}
                      </button>
                      {!selectedLesson.testId && !selectedLesson.test_id && (
                        <p className="text-sm text-red-600 mt-2">
                          Тест не привязан к этому уроку
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                    <div>
                      {selectedLesson.completed === true && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Урок завершен</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      {selectedLesson.completed !== true && (
                        <button
                          onClick={handleLessonComplete}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                        >
                          Завершить урок
                        </button>
                      )}
                      
                      {getNextLesson() && (
                        <button
                          onClick={() => setSelectedLesson(getNextLesson())}
                          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Следующий урок
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <PlayCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Выберите урок</h3>
                <p className="text-gray-600">Выберите урок из программы курса для начала обучения</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Modal */}
      {showTestModal && test && testAttemptId && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg shadow-2xl ring-4 ring-white ring-opacity-50 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Проверочный тест</h2>
              <button
                onClick={handleTestCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <TestInterface
                testId={test.id}
                attemptId={testAttemptId}
                title={test.title}
                timeLimit={test.timeLimit || test.time_limit || 30}
                questions={test.questions || []}
                onComplete={handleTestComplete}
                onCancel={handleTestCancel}
                inModal={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Test Result Modal */}
      {showResultModal && test && testResult && (
        <TestResultModal
          test={test}
          result={testResult}
          attemptsUsed={testAttempts.length}
          attemptsTotal={test.maxAttempts || test.max_attempts || 3}
          timeSpent={testTimeSpent}
          onClose={() => {
            setShowResultModal(false);
            setTestResult(null);
            setTestTimeSpent(0);
          }}
          onRetry={() => {
            setShowResultModal(false);
            setTestResult(null);
            setTestTimeSpent(0);
            handleStartQuiz();
          }}
          onBackToCourse={() => {
            setShowResultModal(false);
            setTestResult(null);
            setTestTimeSpent(0);
          }}
        />
      )}
    </div>
  );
}

function getLessonIcon(type: string, className: string = 'w-4 h-4 text-gray-400') {
  switch (type) {
    case 'video':
      return <Video className={className} />;
    case 'pdf':
      return <FileText className={className} />;
    case 'quiz':
      return <CheckCircle className={className} />;
    default:
      return <FileText className={className} />;
  }
}

function getLessonTypeName(type: string): string {
  const names: Record<string, string> = {
    'text': 'Текстовый материал',
    'video': 'Видео урок',
    'pdf': 'PDF документ',
    'quiz': 'Проверочный тест',
  };
  return names[type] || type;
}

function getCategoryName(category: any): string {
  // Если category - объект, извлекаем название
  if (category && typeof category === 'object') {
    return category.name || category.name_kz || category.name_en || '—';
  }
  
  // Если category - строка, используем маппинг
  if (typeof category === 'string') {
    const names: Record<string, string> = {
      'industrial_safety': 'Промышленная безопасность',
      'fire_safety': 'Пожарная безопасность',
      'electrical_safety': 'Электробезопасность',
      'labor_protection': 'Охрана труда',
      'professions': 'Рабочие профессии',
    };
    return names[category] || category;
  }
  
  return '—';
}

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // Различные форматы YouTube URL
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

function getVideoPlayer(lesson: Lesson): React.ReactElement {
  const videoUrl = lesson.videoUrl || lesson.video_url || '';
  const youtubeVideoId = getYouTubeVideoId(videoUrl);
  
  if (youtubeVideoId) {
    // YouTube embed URL
    const embedUrl = `https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`;
    
    return (
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <iframe
          src={embedUrl}
          title={lesson.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />
      </div>
    );
  }
  
  // Если это не YouTube URL или URL не распознан, показываем демо
  return (
    <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
      <div className="text-center text-white">
        <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-sm">Видео плеер (демо)</p>
        {videoUrl && (
          <p className="text-xs opacity-70 mt-2 break-all px-4">{videoUrl}</p>
        )}
        {!videoUrl && (
          <p className="text-xs opacity-70 mt-2">URL видео не указан</p>
        )}
      </div>
    </div>
  );
}
