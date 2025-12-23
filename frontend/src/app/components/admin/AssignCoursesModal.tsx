import { useState, useEffect } from 'react';
import { X, Search, BookOpen, CheckCircle, Calendar, Users } from 'lucide-react';
import { coursesService } from '../../services/courses';
import { ApiError } from '../../services/api';

interface AssignCoursesModalProps {
  user?: any;
  users?: any[];
  onClose: () => void;
  onAssign?: (userIds: string[], courseIds: string[], deadline?: string) => void;
}

export function AssignCoursesModal({ user, users, onClose, onAssign }: AssignCoursesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [deadline, setDeadline] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine which users to work with
  const targetUsers = users || (user ? [user] : []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await coursesService.getCourses();
        setCourses(data);
        setError(null);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Ошибка загрузки курсов';
        setError(message);
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);


  const getCategoryName = (cat: string) => {
    const names: Record<string, string> = {
      'industrial_safety': 'Промбезопасность',
      'fire_safety': 'Пожарная безопасность',
      'electrical_safety': 'Электробезопасность',
      'labor_protection': 'Охрана труда',
      'professions': 'Рабочие профессии',
    };
    return names[cat] || cat;
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryName = getCategoryName(course.category);
    const matchesCategory = filterCategory === 'all' || categoryName === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleCourse = (courseId: string) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCourses.size === filteredCourses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(new Set(filteredCourses.map(c => c.id)));
    }
  };

  const handleAssign = () => {
    if (selectedCourses.size === 0) {
      alert('Выберите хотя бы один курс');
      return;
    }
    onAssign(targetUsers.map(u => u.id), Array.from(selectedCourses), deadline);
    onClose();
  };


  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl ring-4 ring-white ring-opacity-50 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Назначить курсы
              </h2>
              <p className="text-gray-600">
                Выбрано пользователей: {targetUsers.length}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Selected Users */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Студенты:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {targetUsers.slice(0, 5).map(user => (
                <span key={user.id} className="px-2 py-1 bg-white text-blue-700 text-xs font-medium rounded">
                  {user.full_name || user.fullName || 'Неизвестно'}
                </span>
              ))}
              {targetUsers.length > 5 && (
                <span className="px-2 py-1 bg-blue-200 text-blue-700 text-xs font-medium rounded">
                  +{targetUsers.length - 5} еще
                </span>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск курсов..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все категории</option>
              <option value="Промбезопасность">Промбезопасность</option>
              <option value="Пожарная безопасность">Пожарная безопасность</option>
              <option value="Электробезопасность">Электробезопасность</option>
              <option value="Охрана труда">Охрана труда</option>
              <option value="Рабочие профессии">Рабочие профессии</option>
            </select>
          </div>

          {/* Deadline */}
          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              Срок прохождения (опционально)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Courses List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка курсов...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Ошибка: {error}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">
                  Доступные курсы ({filteredCourses.length})
                </h3>
                {filteredCourses.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedCourses.size === filteredCourses.length ? 'Снять все' : 'Выбрать все'}
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {filteredCourses.map((course) => {
                  const categoryName = getCategoryName(course.category);
                  
                  return (
                    <div
                      key={course.id}
                      onClick={() => handleToggleCourse(course.id)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedCourses.has(course.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center h-6">
                          <input
                            type="checkbox"
                            checked={selectedCourses.has(course.id)}
                            onChange={() => handleToggleCourse(course.id)}
                            className="w-5 h-5 rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{course.title}</h4>
                              <p className="text-sm text-gray-600">{categoryName}</p>
                            </div>
                            {selectedCourses.has(course.id) && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {course.duration} часов
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Курсы не найдены</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchQuery ? 'Попробуйте изменить параметры поиска' : 'Нет доступных курсов'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Выбрано курсов: <span className="font-semibold text-gray-900">{selectedCourses.size}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleAssign}
                disabled={selectedCourses.size === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Назначить {selectedCourses.size > 0 && `(${selectedCourses.size})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}