import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, GripVertical, Edit2, Video, FileText, CheckCircle, Upload } from 'lucide-react';
import { Course, Module, Lesson } from '../../types/lms';
import { testsService } from '../../services/tests';
import { categoriesService, Category } from '../../services/categories';

interface CourseEditorProps {
  course?: Course;
  onSave: (course: Partial<Course>) => void;
  onCancel: () => void;
}

export function CourseEditor({ course, onSave, onCancel }: CourseEditorProps) {
  const [formData, setFormData] = useState<Partial<Course>>(course || {
    title: '',
    description: '',
    category: 'industrial_safety',
    duration: 0,
    modules: [],
    status: 'in_development',
  });

  // Обновляем formData при изменении course (для редактирования)
  useEffect(() => {
    if (course) {
      // Обрабатываем category: может быть объектом (из API) или строкой (старый формат)
      const categoryId = typeof course.category === 'object' 
        ? course.category?.id 
        : course.categoryId || course.category;
      
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category,
        categoryId: categoryId,
        duration: course.duration || 0,
        status: course.status || 'draft',
        passingScore: course.passingScore || course.passing_score,
        maxAttempts: course.maxAttempts || course.max_attempts,
        hasTimer: course.hasTimer || course.has_timer,
        timerMinutes: course.timerMinutes || course.timer_minutes,
        pdekCommission: course.pdekCommission || course.pdek_commission,
      });
    }
  }, [course?.id]);

  // Инициализируем модули из курса, убеждаясь что это массив
  const initialModules = course?.modules && Array.isArray(course.modules) 
    ? course.modules 
    : [];
  
  const [modules, setModules] = useState<Module[]>(initialModules);
  
  // Обновляем модули при изменении курса (например, при редактировании)
  useEffect(() => {
    if (course?.modules && Array.isArray(course.modules)) {
      console.log('CourseEditor - updating modules from course:', course.modules);
      setModules(course.modules);
    } else if (course && !course.modules) {
      // Если курс есть, но модулей нет - устанавливаем пустой массив
      console.log('CourseEditor - course has no modules, setting empty array');
      setModules([]);
    }
  }, [course?.id, course?.modules]);
  
  // Логируем для отладки
  useEffect(() => {
    console.log('CourseEditor - course:', course);
    console.log('CourseEditor - modules state:', modules);
  }, [course, modules]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson: Lesson | null } | null>(null);
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoadingTests(true);
        const tests = await testsService.getTests();
        setAvailableTests(tests);
      } catch (error) {
        console.error('Failed to fetch tests:', error);
      } finally {
        setLoadingTests(false);
      }
    };
    fetchTests();
  }, []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Загружаем категории из API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const loadedCategories = await categoriesService.getCategories({ is_active: true });
        setCategories(loadedCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAddModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: 'Новый модуль',
      description: '',
      order: modules.length + 1,
      lessons: [],
      completed: false,
    };
    setModules([...modules, newModule]);
    setExpandedModule(newModule.id);
  };

  const handleUpdateModule = (moduleId: string, updates: Partial<Module>) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, ...updates } : m));
  };

  const handleDeleteModule = (moduleId: string) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const handleAddLesson = (moduleId: string) => {
    setEditingLesson({
      moduleId,
      lesson: {
        id: `lesson-${Date.now()}`,
        moduleId,
        title: '',
        type: 'text',
        order: 1,
        completed: false,
        duration: 0,
        description: '',
        content: '',
        required: true,
      }
    });
  };

  const handleEditLesson = (moduleId: string, lesson: Lesson) => {
    setEditingLesson({ moduleId, lesson: { ...lesson } });
  };

  const handleSaveLesson = (moduleId: string, lesson: Lesson) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        const existingIndex = m.lessons.findIndex(l => l.id === lesson.id);
        if (existingIndex >= 0) {
          // Update existing
          const newLessons = [...m.lessons];
          newLessons[existingIndex] = lesson;
          return { ...m, lessons: newLessons };
        } else {
          // Add new
          return { ...m, lessons: [...m.lessons, lesson] };
        }
      }
      return m;
    }));
    setEditingLesson(null);
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
      }
      return m;
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      modules,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl ring-4 ring-white ring-opacity-50 max-w-5xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {course ? 'Редактировать курс' : 'Создать курс'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {/* Basic Info */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Основная информация</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название курса *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Введите название курса"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Краткое описание курса"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория *
                  </label>
                  <select
                    value={typeof formData.category === 'object' ? formData.category?.id : formData.category || ''}
                    onChange={(e) => {
                      const categoryId = e.target.value;
                      const selectedCategory = categories.find(c => String(c.id) === categoryId);
                      setFormData({ 
                        ...formData, 
                        category: selectedCategory ? selectedCategory.id : categoryId,
                        categoryId: categoryId || undefined
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loadingCategories}
                  >
                    <option value="">-- Выберите категорию --</option>
                    {loadingCategories ? (
                      <option disabled>Загрузка категорий...</option>
                    ) : (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Длительность (часы)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус курса
                  </label>
                  <select
                    value={formData.status || 'in_development'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="in_development">В разработке</option>
                    <option value="draft">Черновик</option>
                    <option value="published">Опубликован</option>
                  </select>
                </div>

                <div>
                  {/* Пустое место для выравнивания */}
                </div>
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Модули и уроки</h3>
              <button
                onClick={handleAddModule}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Добавить модуль
              </button>
            </div>

            <div className="space-y-4">
              {modules.map((module, moduleIndex) => (
                <div key={module.id} className="border border-gray-300 rounded-lg">
                  {/* Module Header */}
                  <div className="bg-gray-50 p-4">
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400 mt-2 cursor-move" />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) => handleUpdateModule(module.id, { title: e.target.value })}
                          placeholder="Название модуля"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 font-medium"
                        />
                        <textarea
                          value={module.description}
                          onChange={(e) => handleUpdateModule(module.id, { description: e.target.value })}
                          placeholder="Описание модуля"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                          className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                        >
                          {expandedModule === module.id ? 'Свернуть' : 'Развернуть'}
                        </button>
                        <button
                          onClick={() => handleDeleteModule(module.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lessons */}
                  {expandedModule === module.id && (
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Уроки ({module.lessons && Array.isArray(module.lessons) ? module.lessons.length : 0})
                        </span>
                        <button
                          onClick={() => handleAddLesson(module.id)}
                          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="w-3 h-3" />
                          Добавить урок
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(module.lessons && Array.isArray(module.lessons) ? module.lessons : []).map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-move flex-shrink-0" />
                            {getLessonIcon(lesson.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{lesson.title || 'Без названия'}</p>
                              <p className="text-xs text-gray-500">
                                {getLessonTypeName(lesson.type)} • {lesson.duration || 0} мин
                              </p>
                            </div>
                            {lesson.required && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                                Обязательный
                              </span>
                            )}
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditLesson(module.id, lesson)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {module.lessons.length === 0 && (
                          <div className="text-center py-6 text-gray-500 text-sm">
                            Нет уроков. Нажмите "Добавить урок" для начала.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {modules.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Нет модулей. Нажмите "Добавить модуль" для начала.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Сохранить курс
          </button>
        </div>
      </div>

      {/* Lesson Editor Modal */}
      {editingLesson && (
        <LessonEditorModal
          lesson={editingLesson.lesson}
          onSave={(lesson) => handleSaveLesson(editingLesson.moduleId, lesson)}
          onCancel={() => setEditingLesson(null)}
        />
      )}
    </div>
  );
}

// Lesson Editor Modal Component
interface LessonEditorModalProps {
  lesson: Lesson | null;
  onSave: (lesson: Lesson) => void;
  onCancel: () => void;
}

function LessonEditorModal({ lesson, onSave, onCancel }: LessonEditorModalProps) {
  const [formData, setFormData] = useState<Lesson>(lesson || {
    id: `lesson-${Date.now()}`,
    moduleId: '',
    title: '',
    type: 'text',
    order: 1,
    completed: false,
    duration: 0,
    description: '',
    content: '',
    required: true,
  });

  const lessonTypes = [
    { value: 'text', label: 'Текстовый материал', icon: FileText },
    { value: 'video', label: 'Видео урок', icon: Video },
    { value: 'pdf', label: 'PDF документ', icon: FileText },
    { value: 'quiz', label: 'Проверочный тест', icon: CheckCircle },
  ];

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('Введите название урока');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg shadow-2xl ring-4 ring-white ring-opacity-50 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {lesson && String(lesson.id).startsWith('lesson-') && lesson.title === '' ? 'Создать урок' : 'Редактировать урок'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Основная информация</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название урока *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Введите название урока"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание урока
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Краткое описание того, что изучается в уроке"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тип урока *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {lessonTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Длительность (минуты)
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.required}
                      onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Обязательный урок для прохождения курса</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Content based on type */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Контент урока</h4>
              
              {formData.type === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Текстовое содержание
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Введите текст урока. Можно использовать форматирование..."
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Совет: Для больших текстов можно использовать редактор Markdown
                  </p>
                </div>
              )}

              {formData.type === 'video' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL видео *
                    </label>
                    <input
                      type="url"
                      value={formData.videoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=... или https://vimeo.com/..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Поддерживаются: YouTube, Vimeo, собственный сервер
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Миниатюра видео (URL)
                    </label>
                    <input
                      type="url"
                      value={formData.thumbnailUrl || ''}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.allowDownload || false}
                        onChange={(e) => setFormData({ ...formData, allowDownload: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Разрешить скачивание</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.trackProgress || false}
                        onChange={(e) => setFormData({ ...formData, trackProgress: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Отслеживать просмотр</span>
                    </label>
                  </div>
                </div>
              )}

              {formData.type === 'pdf' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL PDF документа *
                    </label>
                    <input
                      type="url"
                      value={formData.pdfUrl || ''}
                      onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Загрузить PDF файл
                    </label>
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Upload className="w-4 h-4" />
                        Выбрать файл
                      </button>
                      <span className="text-sm text-gray-500">или введите URL выше</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.allowDownload || false}
                        onChange={(e) => setFormData({ ...formData, allowDownload: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Разрешить скачивание PDF</span>
                    </label>
                  </div>
                </div>
              )}

              {formData.type === 'quiz' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Выберите тест
                    </label>
                    <select
                      value={formData.testId || ''}
                      onChange={(e) => setFormData({ ...formData, testId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loadingTests}
                    >
                      <option value="">-- Выберите тест --</option>
                      {availableTests.map((test) => (
                        <option key={test.id} value={test.id}>
                          {test.title}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Тесты создаются в разделе "Тесты" админ-панели
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Проходной балл (%)
                      </label>
                      <input
                        type="number"
                        value={formData.passingScore || 80}
                        onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                        min="0"
                        max="100"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Максимум попыток
                      </label>
                      <input
                        type="number"
                        value={formData.maxAttempts || 3}
                        onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Сохранить урок
          </button>
        </div>
      </div>
    </div>
  );
}

function getLessonIcon(type: string) {
  const iconClass = "w-5 h-5 flex-shrink-0";
  switch (type) {
    case 'video':
      return <Video className={`${iconClass} text-purple-600`} />;
    case 'pdf':
      return <FileText className={`${iconClass} text-red-600`} />;
    case 'quiz':
      return <CheckCircle className={`${iconClass} text-green-600`} />;
    default:
      return <FileText className={`${iconClass} text-blue-600`} />;
  }
}

function getLessonTypeName(type: string): string {
  const names: Record<string, string> = {
    'text': 'Текст',
    'video': 'Видео',
    'pdf': 'PDF',
    'quiz': 'Тест',
  };
  return names[type] || type;
}