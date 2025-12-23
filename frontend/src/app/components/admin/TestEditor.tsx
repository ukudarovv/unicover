import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { Test, Question, Course } from '../../types/lms';
import { testsService } from '../../services/tests';
import { coursesService } from '../../services/courses';

interface TestEditorProps {
  test?: Test;
  onSave: (test: Partial<Test>) => void;
  onCancel: () => void;
}

export function TestEditor({ test, onSave, onCancel }: TestEditorProps) {
  // Инициализируем courseId из test
  const getInitialCourseId = (test?: Test): string => {
    if (!test) return '';
    if (test.courseId) return String(test.courseId);
    if (test.course) {
      return typeof test.course === 'string' ? test.course : String(test.course.id || '');
    }
    return '';
  };

  const [formData, setFormData] = useState<Partial<Test>>({
    title: test?.title || '',
    description: test?.description || '',
    courseId: getInitialCourseId(test),
    timeLimit: test?.timeLimit || test?.time_limit || 30,
    passingScore: test?.passingScore || test?.passing_score || 80,
    maxAttempts: test?.maxAttempts || test?.max_attempts || 3,
    shuffleQuestions: true,
    showResults: true,
    questions: [],
  });

  const [questions, setQuestions] = useState<Question[]>(test?.questions || []);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Загружаем курсы при монтировании компонента
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        const response = await coursesService.getCourses({ page_size: 1000 });
        setCourses(response.results);
      } catch (error) {
        console.error('Failed to load courses:', error);
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };
    loadCourses();
  }, []);

  // Загружаем вопросы при редактировании теста
  useEffect(() => {
    const loadQuestions = async () => {
      if (test?.id) {
        try {
          setLoading(true);
          const loadedQuestions = await testsService.getTestQuestions(test.id);
          setQuestions(loadedQuestions);
        } catch (error) {
          console.error('Failed to load questions:', error);
          setQuestions([]);
        } finally {
          setLoading(false);
        }
      }
    };
    loadQuestions();
  }, [test?.id]);

  // Обновляем formData при изменении test (для редактирования)
  useEffect(() => {
    if (test) {
      const courseId = test.courseId 
        || (typeof test.course === 'string' ? test.course : test.course?.id)
        || '';
      
      setFormData(prev => ({
        ...prev,
        title: test.title || prev.title,
        description: test.description || prev.description,
        courseId: courseId ? String(courseId) : '',
        timeLimit: test.timeLimit || test.time_limit || prev.timeLimit,
        passingScore: test.passingScore || test.passing_score || prev.passingScore,
        maxAttempts: test.maxAttempts || test.max_attempts || prev.maxAttempts,
      }));
    }
  }, [test?.id, test?.courseId, test?.course, test?.title, test?.description]);

  const questionTypes = [
    { value: 'single_choice', label: 'Один правильный ответ' },
    { value: 'multiple_choice', label: 'Несколько правильных ответов' },
    { value: 'yes_no', label: 'Да/Нет' },
    { value: 'short_answer', label: 'Краткий ответ' },
  ];

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: 'single_choice',
      text: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      order: questions.length + 1,
      weight: 1,
    };
    setQuestions([...questions, newQuestion]);
    setExpandedQuestion(newQuestion.id);
  };

  const handleUpdateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const updated = { ...q, ...updates };
        
        // При изменении типа вопроса нужно обновить options и correctAnswer
        if (updates.type && updates.type !== q.type) {
          if (updates.type === 'yes_no') {
            updated.options = ['Да', 'Нет'];
            updated.correctAnswer = '';
          } else if (updates.type === 'short_answer') {
            updated.options = undefined;
            updated.correctAnswer = '';
          } else if (updates.type === 'single_choice' || updates.type === 'multiple_choice') {
            if (!updated.options || updated.options.length === 0) {
              updated.options = ['', '', '', ''];
            }
            if (updates.type === 'single_choice') {
              updated.correctAnswer = '';
            } else {
              updated.correctAnswer = [];
            }
          }
        }
        
        return updated;
      }
      return q;
    }));
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleAddOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        // Убеждаемся, что options - это массив строк
        const currentOptions = Array.isArray(q.options) 
          ? q.options.filter((opt): opt is string => typeof opt === 'string')
          : [];
        return { ...q, options: [...currentOptions, ''] };
      }
      return q;
    }));
  };

  const handleUpdateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleDeleteOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        // Убеждаемся, что options - это массив строк
        const currentOptions = Array.isArray(q.options) 
          ? q.options.filter((opt): opt is string => typeof opt === 'string')
          : [];
        const newOptions = currentOptions.filter((_, i) => i !== optionIndex);
        
        // Если удаляем правильный ответ, нужно обновить correctAnswer
        const deletedOption = currentOptions[optionIndex];
        let newCorrectAnswer = q.correctAnswer;
        if (q.type === 'single_choice' && q.correctAnswer === deletedOption) {
          newCorrectAnswer = '';
        } else if (q.type === 'multiple_choice' && Array.isArray(q.correctAnswer)) {
          newCorrectAnswer = q.correctAnswer.filter(a => a !== deletedOption);
        }
        
        return { ...q, options: newOptions, correctAnswer: newCorrectAnswer };
      }
      return q;
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      questions,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl ring-4 ring-white ring-opacity-50 max-w-5xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {test ? 'Редактировать тест' : 'Создать тест'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {/* Basic Info */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Настройки теста</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название теста *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Введите название теста"
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
                  placeholder="Описание теста и инструкции"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Привязать к курсу
                </label>
                <select
                  value={formData.courseId || ''}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Без привязки к курсу --</option>
                  {coursesLoading ? (
                    <option disabled>Загрузка курсов...</option>
                  ) : (
                    courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))
                  )}
                </select>
                {formData.courseId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Выбран курс: {courses.find(c => String(c.id) === String(formData.courseId))?.title || 'Загрузка...'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Время (мин)
                  </label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Проходной балл (%)
                  </label>
                  <input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Попыток
                  </label>
                  <input
                    type="number"
                    value={formData.maxAttempts}
                    onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.shuffleQuestions}
                    onChange={(e) => setFormData({ ...formData, shuffleQuestions: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Перемешивать вопросы</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showResults}
                    onChange={(e) => setFormData({ ...formData, showResults: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Показывать результаты</span>
                </label>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Вопросы ({questions.length})
              </h3>
              <button
                onClick={handleAddQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Добавить вопрос
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border border-gray-300 rounded-lg">
                  {/* Question Header */}
                  <div className="bg-gray-50 p-4">
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400 mt-2 cursor-move" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-semibold text-gray-700">Вопрос {index + 1}</span>
                          <select
                            value={question.type}
                            onChange={(e) => handleUpdateQuestion(question.id, { type: e.target.value as any })}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                          >
                            {questionTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            value={question.weight}
                            onChange={(e) => handleUpdateQuestion(question.id, { weight: parseInt(e.target.value) })}
                            placeholder="Баллы"
                            className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                            min="1"
                          />
                        </div>
                        <textarea
                          value={question.text}
                          onChange={(e) => handleUpdateQuestion(question.id, { text: e.target.value })}
                          placeholder="Текст вопроса"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                          className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium"
                        >
                          {expandedQuestion === question.id ? 'Свернуть' : 'Варианты'}
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Question Options */}
                  {expandedQuestion === question.id && (question.type === 'single_choice' || question.type === 'multiple_choice') && (
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Варианты ответов</span>
                        <button
                          onClick={() => handleAddOption(question.id)}
                          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="w-3 h-3" />
                          Добавить вариант
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(Array.isArray(question.options) ? question.options.filter((opt): opt is string => typeof opt === 'string') : []).map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-3">
                            <input
                              type={question.type === 'single_choice' ? 'radio' : 'checkbox'}
                              name={`correct-${question.id}`}
                              checked={
                                question.type === 'single_choice'
                                  ? question.correctAnswer === option
                                  : Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option)
                              }
                              onChange={(e) => {
                                if (question.type === 'single_choice') {
                                  handleUpdateQuestion(question.id, { correctAnswer: option });
                                } else {
                                  const current = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
                                  const updated = e.target.checked
                                    ? [...current, option]
                                    : current.filter(a => a !== option);
                                  handleUpdateQuestion(question.id, { correctAnswer: updated });
                                }
                              }}
                              className="flex-shrink-0"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleUpdateOption(question.id, optionIndex, e.target.value)}
                              placeholder={`Вариант ${optionIndex + 1}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <button
                              onClick={() => handleDeleteOption(question.id, optionIndex)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        {question.type === 'single_choice' 
                          ? 'Выберите один правильный ответ'
                          : 'Выберите один или несколько правильных ответов'}
                      </p>
                    </div>
                  )}

                  {/* Short Answer Question */}
                  {expandedQuestion === question.id && question.type === 'short_answer' && (
                    <div className="p-4">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Правильный ответ
                        </label>
                        <input
                          type="text"
                          value={question.correctAnswer || ''}
                          onChange={(e) => handleUpdateQuestion(question.id, { correctAnswer: e.target.value })}
                          placeholder="Введите правильный ответ"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Для вопросов с кратким ответом укажите правильный ответ
                      </p>
                    </div>
                  )}

                  {expandedQuestion === question.id && question.type === 'yes_no' && (
                    <div className="p-4">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctAnswer === 'Да'}
                            onChange={() => handleUpdateQuestion(question.id, { correctAnswer: 'Да' })}
                          />
                          <span>Да</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctAnswer === 'Нет'}
                            onChange={() => handleUpdateQuestion(question.id, { correctAnswer: 'Нет' })}
                          />
                          <span>Нет</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Нет вопросов. Нажмите "Добавить вопрос" для начала.
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
            Сохранить тест
          </button>
        </div>
      </div>
    </div>
  );
}
