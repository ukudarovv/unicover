import { Header } from '../components/Header';
import { FooterUnicover } from '../components/FooterUnicover';
import { useMyEnrollments } from '../hooks/useMyEnrollments';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function getCategoryName(category: any, t: any): string {
  if (typeof category === 'object' && category !== null) {
    return category.name || category.name_kz || category.name_en || '—';
  }
  const names: Record<string, string> = {
    'industrial_safety': t('lms.student.historyPage.categories.industrial_safety'),
    'fire_safety': t('lms.student.historyPage.categories.fire_safety'),
    'electrical_safety': t('lms.student.historyPage.categories.electrical_safety'),
    'labor_protection': t('lms.student.historyPage.categories.labor_protection'),
    'professions': t('lms.student.historyPage.categories.professions'),
  };
  return names[category] || category || '—';
}

export function StudentHistoryPage() {
  const { t } = useTranslation();
  const { courses, loading, error } = useMyEnrollments();

  const completedCourses = Array.isArray(courses) ? courses.filter(c => c.status === 'completed' || c.status === 'exam_passed') : [];

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('lms.student.historyPage.loading')}</p>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('lms.student.historyPage.loadError')}</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link
              to="/student/dashboard"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('lms.student.historyPage.backToDashboardButton')}
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
              {t('lms.student.historyPage.backToDashboard')}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('lms.student.historyPage.title')}</h1>
            <p className="text-gray-600">{t('lms.student.historyPage.subtitle')}</p>
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
                          {getCategoryName(course.category, t)}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{course.duration} {t('lms.student.coursesPage.hours')}</p>
                        <div className="flex items-center text-sm text-green-600 mb-4">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          <span>{t('lms.student.historyPage.courseCompleted')}</span>
                        </div>
                        {course.progress === 100 && (
                          <div className="flex items-center text-sm text-purple-600 mb-4">
                            <Award className="w-4 h-4 mr-1" />
                            <span>{t('lms.student.historyPage.progress100')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/student/course/${course.id}`}
                        className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        {t('lms.student.historyPage.viewCourse')}
                      </Link>
                      <Link
                        to="/student/documents"
                        className="flex-1 text-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors"
                      >
                        {t('lms.student.historyPage.certificates')}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('lms.student.historyPage.noHistory')}</h3>
              <p className="text-gray-600 mb-4">{t('lms.student.historyPage.noHistoryDesc')}</p>
              <Link
                to="/student/courses"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('lms.student.historyPage.goToCourses')}
              </Link>
            </div>
          )}
        </div>
      </div>
      <FooterUnicover />
    </>
  );
}

