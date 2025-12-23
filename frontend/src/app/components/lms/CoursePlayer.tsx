import { useState } from 'react';
import { CheckCircle, Circle, PlayCircle, FileText, Video, Download, ChevronRight, ChevronDown, Lock, ArrowLeft } from 'lucide-react';
import { Course, Module, Lesson } from '../../types/lms';
import { Link } from 'react-router-dom';

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
      return count + moduleLessons.filter(l => l.completed).length;
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
                style={{ width: `${course.progress}%` }}
              />
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
                  return (
                    <div key={module.id}>
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {module.completed ? (
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
                                ) : lesson.completed ? (
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
                    <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
                      <div className="text-center text-white">
                        <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">Видео плеер (демо)</p>
                        <p className="text-xs opacity-70 mt-2">{selectedLesson.videoUrl}</p>
                      </div>
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
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Начать тест
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                    <div>
                      {selectedLesson.completed && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Урок завершен</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      {!selectedLesson.completed && (
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
