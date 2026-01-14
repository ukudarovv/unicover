import { useState, useEffect } from 'react';
import { coursesService } from '../services/courses';
import { Course } from '../types/lms';
import { useUser } from '../contexts/UserContext';

export function useMyEnrollments() {
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Try to get enrollments directly from backend
        const enrollments = await coursesService.getMyEnrollments();
        
        if (enrollments.length > 0) {
          // Backend returned enrollments, convert to courses format
          const enrolledCourses: Course[] = [];
          for (const enrollment of enrollments) {
            try {
              const courseId = typeof enrollment.course === 'string' 
                ? enrollment.course 
                : enrollment.course?.id || '';
              if (courseId) {
                const course = await coursesService.getCourse(courseId);
                enrolledCourses.push({
                  ...course,
                  progress: enrollment.progress || 0,
                  status: enrollment.status || course.status,
                });
              }
            } catch (err) {
              // Skip if course not found
              console.error(`Failed to get course for enrollment:`, err);
            }
          }
          setCourses(enrolledCourses);
        } else {
          // Fallback: Get all courses and check enrollments
          // This is less efficient but works if backend doesn't have my_enrollments endpoint
          const allCourses = await coursesService.getCourses();
          const enrolledCourses: Course[] = [];
          
          // Check each course to see if user is enrolled
          // Limit to first 20 courses to avoid too many API calls
          const coursesToCheck = allCourses.results.slice(0, 20);
          
          for (const course of coursesToCheck) {
            try {
              const students = await coursesService.getCourseStudents(course.id);
              const isEnrolled = students.some(
                enrollment => {
                  const studentId = enrollment.student?.id || 
                                  (typeof enrollment.student === 'string' ? enrollment.student : null) ||
                                  enrollment.userId;
                  return studentId === user.id || String(studentId) === String(user.id);
                }
              );
              if (isEnrolled) {
                const enrollment = students.find(
                  e => {
                    const studentId = e.student?.id || 
                                    (typeof e.student === 'string' ? e.student : null) ||
                                    e.userId;
                    return studentId === user.id || String(studentId) === String(user.id);
                  }
                );
                if (enrollment) {
                  enrolledCourses.push({
                    ...course,
                    progress: enrollment.progress || 0,
                    status: enrollment.status || course.status,
                  });
                }
              }
            } catch (err) {
              // Skip courses where we can't get students
            }
          }
          
          setCourses(enrolledCourses);
        }
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки записей на курсы');
        console.error('Failed to fetch enrollments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user?.id]);

  return { courses, loading, error };
}

