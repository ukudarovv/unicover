import { Header } from '../components/Header';
import { FooterUnicover } from '../components/FooterUnicover';
import { useMyEnrollments } from '../hooks/useMyEnrollments';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Play, CheckCircle2 } from 'lucide-react';

function getCategoryName(category: any): string {
  if (typeof category === 'object' && category !== null) {
    return category.name || category.name_kz || category.name_en || '—';
  }
  const names: Record<string, string> = {
    'industrial_safety': 'Промышленная безопасность',
    'fire_safety': 'Пожарная безопасность',
    'electrical_safety': 'Электробезопасность',
    'labor_protection': 'Охрана труда',
    'professions': 'Рабочие профессии',
  };
  return names[category] || category || '—';
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'assigned': 'Назначен',
    'in_progress': 'В процессе',
    'exam_available': 'Экзамен доступен',
    'completed': 'Завершен',
    'exam_passed': 'Экзамен сдан',
    'exam_failed': 'Экзамен не сдан',
  };
  return statusMap[status] || status;
}

export function StudentCoursesPage() {
  const { courses, loading, error } = useMyEnrollments();

  const activeCourses = Array.isArray(courses) ? courses.filter(c => c.status === 'in_progress' || c.status === 'exam_available' || c.status === 'assigned') : [];
  const completedCourses = Array.isArray(courses) ? courses.filter(c => c.status === 'completed' || c.status === 'exam_passed') : [];

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка курсов...</p>
          </div>
        </div>
        <FooterUnicover />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Ошибка загрузки</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link
              to="/student/dashboard"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться в личный кабинет
            </Link>
          </div>
        </div>
        <FooterUnicover />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/student/dashboard"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block"
            >
              ← Вернуться в личный кабинет
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои курсы</h1>
            <p className="text-gray-600">Управление вашими курсами и обучением</p>
          </div>

          {/* Active Courses */}
          {activeCourses.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Активные курсы</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeCourses.map(course => (
                  <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-2">
                            {getCategoryName(course.category)}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{course.duration} часов</p>
                          <div className="flex items-center text-sm text-gray-600 mb-4">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{getStatusText(course.status || '')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Прогресс</span>
                          <span className="text-sm font-semibold text-gray-900">{course.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link
                        to={`/student/course/${course.id}`}
                        className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        {course.status === 'exam_available' ? 'Перейти к экзамену' : 'Продолжить обучение'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Courses */}
          {completedCourses.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Завершенные курсы</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completedCourses.map(course => (
                  <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-green-500">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full mb-2">
                            {getCategoryName(course.category)}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{course.duration} часов</p>
                          <div className="flex items-center text-sm text-green-600 mb-4">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            <span>Завершен</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        to={`/student/course/${course.id}`}
                        className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Просмотреть курс
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {activeCourses.length === 0 && completedCourses.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Нет курсов</h3>
              <p className="text-gray-600 mb-4">У вас пока нет назначенных курсов</p>
              <Link
                to="/student/dashboard"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Вернуться в личный кабинет
              </Link>
            </div>
          )}
        </div>
      </div>
      <FooterUnicover />
    </>
  );
}

