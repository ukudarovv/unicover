import { Shield, Flame, Zap, Briefcase, Wrench, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { coursesService } from '../services/courses';
import { Course } from '../types/lms';

const categoryIcons: Record<string, typeof Shield> = {
  'industrial_safety': Shield,
  'fire_safety': Flame,
  'electrical_safety': Zap,
  'labor_protection': Briefcase,
  'professions': Wrench,
};

export function CoursesUnicover() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Пробуем получить курсы без фильтра по статусу, так как статус 'active' может не существовать
        // Backend может использовать другие статусы (например, 'draft', 'published')
        const data = await coursesService.getCourses();
        // Фильтруем только опубликованные курсы на frontend
        const activeCourses = data.filter(course => 
          course.status !== 'draft' && course.status !== 'annulled'
        );
        setCourses(activeCourses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const categories = [
    { id: 'all', name: 'Все курсы' },
    { id: 'industrial_safety', name: 'Промышленная безопасность' },
    { id: 'fire_safety', name: 'Пожарная безопасность' },
    { id: 'electrical_safety', name: 'Электробезопасность' },
    { id: 'labor_protection', name: 'Охрана труда' },
    { id: 'professions', name: 'Рабочие профессии' },
  ];

  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || Briefcase;
  };

  if (loading) {
    return (
      <section id="courses" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка курсов...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-4">
            Образовательные программы
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Программы обучения
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Широкий спектр курсов для подготовки и повышения квалификации специалистов
          </p>
        </div>

        {/* Filter */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4 text-gray-700">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Фильтр по категориям:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {filteredCourses.map((course) => {
            const Icon = getCategoryIcon(course.category);
            return (
              <div
                key={course.id}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow border border-gray-200"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-sm text-blue-600 font-medium">{course.duration} часов</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">{course.description || 'Описание курса'}</p>
                
                {course.modules && course.modules.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">Модули курса:</h4>
                    <ul className="space-y-2">
                      {course.modules.slice(0, 4).map((module, idx) => (
                        <li key={module.id || idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>{module.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <button className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Записаться на курс
                </button>
              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Курсы в данной категории скоро появятся</p>
          </div>
        )}
      </div>
    </section>
  );
}
