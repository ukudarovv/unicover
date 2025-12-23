import { Header } from '../components/Header';
import { FooterUnicover } from '../components/FooterUnicover';
import { useMyEnrollments } from '../hooks/useMyEnrollments';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Award } from 'lucide-react';

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

export function StudentHistoryPage() {
  const { courses, loading, error } = useMyEnrollments();

  const completedCourses = Array.isArray(courses) ? courses.filter(c => c.status === 'completed' || c.status === 'exam_passed') : [];

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка истории...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">История обучения</h1>
            <p className="text-gray-600">Завершенные курсы и достижения</p>
          </div>

          {/* Completed Courses */}
          {completedCourses.length > 0 ? (
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
                        <p className="text-sm text-gray-600 mb-4">{course.duration} часов</p>
                        <div className="flex items-center text-sm text-green-600 mb-4">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          <span>Курс завершен</span>
                        </div>
                        {course.progress === 100 && (
                          <div className="flex items-center text-sm text-purple-600 mb-4">
                            <Award className="w-4 h-4 mr-1" />
                            <span>Прогресс: 100%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/student/course/${course.id}`}
                        className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Просмотреть курс
                      </Link>
                      <Link
                        to="/student/documents"
                        className="flex-1 text-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors"
                      >
                        Сертификаты
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">История пуста</h3>
              <p className="text-gray-600 mb-4">У вас пока нет завершенных курсов</p>
              <Link
                to="/student/courses"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Перейти к курсам
              </Link>
            </div>
          )}
        </div>
      </div>
      <FooterUnicover />
    </>
  );
}

