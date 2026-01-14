import { User, BookOpen, FileCheck, Award, Clock, CheckCircle2, Download, LogOut, Settings, Bell } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useMyEnrollments } from '../hooks/useMyEnrollments';
import { useMyAttempts } from '../hooks/useMyAttempts';
import { certificatesService } from '../services/certificates';
import { useState, useEffect } from 'react';
import { Certificate } from '../types/lms';
import { Link, useNavigate } from 'react-router-dom';
import { adaptTestAttempt } from '../utils/typeAdapters';

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'assigned': 'Назначен',
    'in_progress': 'В процессе',
    'exam_available': 'Экзамен доступен',
    'exam_passed': 'Экзамен пройден',
    'completed': 'Завершен',
    'failed': 'Не сдан',
  };
  return statusMap[status] || status;
}

export function Dashboard() {
  const { user, logout } = useUser();
  const { courses, loading: coursesLoading } = useMyEnrollments();
  const { attempts, loading: attemptsLoading } = useMyAttempts();
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

  const completedCourses = courses.filter(c => c.status === 'completed');
  const inProgressCourses = courses.filter(c => 
    c.status === 'in_progress' || 
    c.status === 'assigned' || 
    c.status === 'pending_pdek' ||
    c.status === 'exam_available' ||
    c.status === 'exam_passed'
  );
  
  const passedAttempts = attempts.filter(a => a.passed);
  const failedAttempts = attempts.filter(a => !a.passed && a.completed_at);

  if (coursesLoading || attemptsLoading || certificatesLoading) {
    return (
      <section id="dashboard" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка данных...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="dashboard" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* User Header */}
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user?.full_name || user?.fullName || 'Пользователь'}</h2>
                  <p className="text-gray-600">{user?.email || ''}</p>
                  {user?.organization && <p className="text-sm text-gray-500">{user.organization}</p>}
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                  <Bell className="w-5 h-5" />
                  <span className="hidden sm:inline">Уведомления</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200">
                  <Settings className="w-5 h-5" />
                  <span className="hidden sm:inline">Настройки</span>
                </button>
                <button
                  onClick={async () => {
                    await logout();
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Выйти</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">{courses.length}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Всего курсов</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-600">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {completedCourses.length}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">Завершено</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-600">
              <div className="flex items-center justify-between mb-2">
                <FileCheck className="w-8 h-8 text-orange-600" />
                <span className="text-3xl font-bold text-gray-900">{passedAttempts.length}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Тесты сданы</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-600">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-purple-600" />
                <span className="text-3xl font-bold text-gray-900">{certificates.length}</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Сертификаты</p>
            </div>
          </div>

          {/* My Courses */}
          <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Мои курсы</h3>
              <a href="#courses" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Все курсы →
              </a>
            </div>
            <div className="space-y-4">
              {courses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>У вас пока нет курсов</p>
                  <p className="text-sm mt-1">Курсы будут назначены администратором</p>
                </div>
              ) : (
                courses.map((course) => {
                  const isCompleted = course.status === 'completed' || course.status === 'exam_passed';
                  const hasCertificate = certificates.some(c => c.course?.id === course.id || c.courseId === course.id);
                  
                  return (
                    <div key={course.id} className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-2">{course.title}</h4>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                              {getStatusText(course.status)}
                            </span>
                            {course.modules && (
                              <span>Модули: {course.modules.length}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {hasCertificate && (
                            <Link
                              to="/student/documents"
                              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              <Award className="w-4 h-4" />
                              Сертификат
                            </Link>
                          )}
                          <Link
                            to={`/student/course/${course.id}`}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            {isCompleted ? 'Повторить' : 'Продолжить'}
                          </Link>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Прогресс обучения</span>
                          <span className="font-medium text-gray-900">{course.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isCompleted ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Test Results */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">История тестирования</h3>
              <div className="space-y-4">
                {attempts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>У вас пока нет попыток тестов</p>
                  </div>
                ) : (
                  attempts.slice(0, 5).map((attempt) => {
                    const adapted = adaptTestAttempt(attempt);
                    const testName = typeof attempt.test === 'object' ? attempt.test?.title : 'Тест';
                    const date = adapted.completedAt 
                      ? new Date(adapted.completedAt).toLocaleDateString('ru-RU')
                      : new Date(adapted.startedAt).toLocaleDateString('ru-RU');
                    
                    return (
                      <div key={adapted.id} className="border border-gray-200 p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{testName}</h4>
                            <p className="text-sm text-gray-600">Дата: {date}</p>
                          </div>
                          {adapted.passed ? (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                              Сдан
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                              Не сдан
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-gray-900">{adapted.score || 0}</span>
                            <span className="text-gray-600">/100</span>
                            <span className="text-sm text-gray-600 ml-2">баллов</span>
                          </div>
                          <Link
                            to="/student/documents"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Протокол
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Certificates */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Мои сертификаты</h3>
              <div className="space-y-4">
                {certificates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>У вас пока нет сертификатов</p>
                    <p className="text-sm mt-1">Завершите курсы и сдайте тесты</p>
                  </div>
                ) : (
                  certificates.slice(0, 5).map((cert) => {
                    const courseName = typeof cert.course === 'object' ? cert.course?.title : cert.courseName || 'Курс';
                    const issueDate = cert.issued_at || cert.issuedAt;
                    const validUntil = cert.valid_until || cert.validUntil;
                    
                    return (
                      <div key={cert.id} className="border border-gray-200 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                            <Award className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-2">{courseName}</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>№ {cert.number}</p>
                              {issueDate && (
                                <p>Выдан: {new Date(issueDate).toLocaleDateString('ru-RU')}</p>
                              )}
                              {validUntil && (
                                <p>Действителен до: {new Date(validUntil).toLocaleDateString('ru-RU')}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const blob = await certificatesService.downloadPDF(cert.id);
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `certificate_${cert.number}.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            } catch (error) {
                              console.error('Failed to download certificate:', error);
                            }
                          }}
                          className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                          Скачать сертификат
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
