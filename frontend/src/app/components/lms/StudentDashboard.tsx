import { BookOpen, Clock, Award, FileText, TrendingUp, CheckCircle2, AlertCircle, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMyEnrollments } from '../../hooks/useMyEnrollments';
import { useTests } from '../../hooks/useTests';
import { useNotifications } from '../../hooks/useNotifications';
import { certificatesService } from '../../services/certificates';
import { useState, useEffect } from 'react';
import { Certificate } from '../../types/lms';

export function StudentDashboard() {
  const { courses, loading: coursesLoading } = useMyEnrollments();
  const { tests, loading: testsLoading } = useTests({ is_active: true });
  const { notifications, loading: notificationsLoading } = useNotifications({ read: false });
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificatesLoading, setCertificatesLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const data = await certificatesService.getCertificates();
        setCertificates(data);
      } catch (error) {
        console.error('Failed to fetch certificates:', error);
      } finally {
        setCertificatesLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const activeCourses = Array.isArray(courses) ? courses.filter(c => c.status === 'in_progress' || c.status === 'exam_available' || c.status === 'assigned') : [];
  const completedCourses = Array.isArray(courses) ? courses.filter(c => c.status === 'completed' || c.status === 'exam_passed') : [];
  const availableTests = tests.filter(t => t.status === 'available');
  // Защита от случаев, когда notifications не является массивом
  const unreadNotifications = Array.isArray(notifications) ? notifications.filter(n => !n.read) : [];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Личный кабинет студента</h1>
          <p className="text-gray-600">Добро пожаловать! Здесь вы можете управлять своим обучением</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">{activeCourses.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Активные курсы</h3>
            <Link to="/student/courses" className="text-xs text-blue-600 hover:text-blue-700">
              Перейти к курсам →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">{completedCourses.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Завершено курсов</h3>
            <Link to="/student/history" className="text-xs text-green-600 hover:text-green-700">
              Посмотреть историю →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-orange-600">{availableTests.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Доступно тестов</h3>
            <Link to="/student/tests" className="text-xs text-orange-600 hover:text-orange-700">
              Начать тестирование →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-purple-600">{certificates.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Сертификатов</h3>
            <Link to="/student/documents" className="text-xs text-purple-600 hover:text-purple-700">
              Просмотр документов →
            </Link>
          </div>
        </div>

        {/* Notifications */}
        {unreadNotifications.length > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  У вас {unreadNotifications.length} непрочитанных уведомлений
                </h3>
                <div className="space-y-2">
                  {unreadNotifications.slice(0, 3).map(notif => (
                    <div key={notif.id} className="text-sm text-blue-800">
                      <span className="font-medium">{notif.title}:</span> {notif.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Активные курсы</h2>
            <Link to="/student/courses" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Все курсы →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeCourses.length > 0 ? activeCourses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-2">
                        {getCategoryName(course.category)}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{course.duration} часов</p>
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

                  {/* Status and Action */}
                  <div className="flex items-center justify-between">
                    {course.status === 'exam_available' ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Экзамен доступен</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-blue-600">
                        <Play className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">В процессе обучения</span>
                      </div>
                    )}
                    <Link
                      to={`/student/course/${course.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      {course.status === 'exam_available' ? 'К экзамену' : 'Продолжить'}
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center py-8 bg-white rounded-lg shadow-md">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">У вас пока нет активных курсов</p>
              </div>
            )}
          </div>
        </div>

        {/* Available Tests */}
        {availableTests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Доступные тесты</h2>
              <Link to="/student/tests" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Все тесты →
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {availableTests.map(test => (
                <div key={test.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{test.title}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">Вопросов:</span>
                      <span className="ml-2 font-semibold text-gray-900">{test.questionsCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Время:</span>
                      <span className="ml-2 font-semibold text-gray-900">{test.timeLimit} мин</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Проходной балл:</span>
                      <span className="ml-2 font-semibold text-gray-900">{test.passingScore}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Попыток:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {test.attemptsTotal - test.attemptsUsed} из {test.attemptsTotal}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/student/test/${test.id}`}
                    className="block w-full text-center px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                  >
                    Начать тестирование
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/student/documents"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <FileText className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Документы</h3>
            <p className="text-sm text-gray-600">Сертификаты, протоколы и справки</p>
          </Link>

          <Link
            to="/student/history"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <TrendingUp className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">История обучения</h3>
            <p className="text-sm text-gray-600">Завершенные курсы и результаты</p>
          </Link>

          <Link
            to="/student/support"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <AlertCircle className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">Поддержка</h3>
            <p className="text-sm text-gray-600">Задать вопрос или получить помощь</p>
          </Link>
        </div>
      </div>
    </div>
  );
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
