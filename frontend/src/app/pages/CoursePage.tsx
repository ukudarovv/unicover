import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { FooterUnicover } from '../components/FooterUnicover';
import { CoursePlayer } from '../components/lms/CoursePlayer';
import { coursesService } from '../services/courses';
import { Course } from '../types/lms';
import { toast } from 'sonner';

export function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Используем getCourseWithProgress для получения курса с прогрессом студента
        const data = await coursesService.getCourseWithProgress(courseId);
        setCourse(data);
      } catch (err: any) {
        // Если курс не найден или студент не зачислен, пробуем загрузить обычный курс
        if (err.status === 404) {
          try {
            const data = await coursesService.getCourse(courseId);
            setCourse(data);
          } catch (fallbackErr: any) {
            setError(fallbackErr.message || 'Курс не найден');
          }
        } else {
          setError(err.message || 'Ошибка загрузки курса');
        }
        console.error('Failed to fetch course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleLessonComplete = async (lessonId: string) => {
    try {
      const response = await coursesService.completeLesson(lessonId);
      toast.success('Урок отмечен как завершенный');
      
      // Обновляем курс с прогрессом после завершения урока
      if (courseId) {
        try {
          const updatedCourse = await coursesService.getCourseWithProgress(courseId);
          setCourse(updatedCourse);
        } catch (err) {
          // Если не удалось загрузить с прогрессом, обновляем локально
          if (course) {
            const updatedCourse = { ...course };
            if (updatedCourse.progress !== undefined) {
              updatedCourse.progress = response.progress;
            }
            // Обновляем статус урока в локальном состоянии
            if (updatedCourse.modules) {
              updatedCourse.modules = updatedCourse.modules.map(module => ({
                ...module,
                lessons: module.lessons.map(lesson => 
                  lesson.id === lessonId ? { ...lesson, completed: true } : lesson
                )
              }));
            }
            setCourse(updatedCourse);
          }
        }
      }
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
