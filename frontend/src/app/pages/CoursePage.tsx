import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { FooterUnicover } from '../components/FooterUnicover';
import { CoursePlayer } from '../components/lms/CoursePlayer';
import { useCourse } from '../hooks/useCourses';
import { coursesService } from '../services/courses';
import { toast } from 'sonner';

export function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { course, loading, error } = useCourse(courseId);

  const handleLessonComplete = async (lessonId: string) => {
    try {
      await coursesService.completeLesson(lessonId);
      toast.success('Урок отмечен как завершенный');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при завершении урока');
    }
  };

  const handleCourseComplete = () => {
    toast.success('Курс завершен!');
    navigate('/student/dashboard');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка курса...</p>
          </div>
        </div>
        <FooterUnicover />
      </>
    );
  }

  if (error || !course) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Курс не найден'}
            </h1>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться к курсам
            </button>
          </div>
        </div>
        <FooterUnicover />
      </>
    );
  }

  return (
    <>
      <Header />
      <CoursePlayer
        course={course}
        onLessonComplete={handleLessonComplete}
        onCourseComplete={handleCourseComplete}
      />
      <FooterUnicover />
    </>
  );
}
