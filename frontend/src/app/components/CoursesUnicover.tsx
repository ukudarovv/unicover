import { Shield, Flame, Zap, Briefcase, Wrench, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesService } from '../services/courses';
import { categoriesService, Category } from '../services/categories';
import { Course } from '../types/lms';
import { useUser } from '../contexts/UserContext';
import { toast } from 'sonner';

// Fallback иконки для категорий, если в базе нет icon
const categoryIcons: Record<string, typeof Shield> = {
  'industrial_safety': Shield,
  'fire_safety': Flame,
  'electrical_safety': Zap,
  'labor_protection': Briefcase,
  'professions': Wrench,
};

export function CoursesUnicover() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Загружаем категории из API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoriesService.getCategories({ is_active: true });
        // Сортируем категории по полю order
        const sortedCategories = [...categoriesData].sort((a, b) => {
          if (a.order !== b.order) {
            return a.order - b.order;
          }
          return a.name.localeCompare(b.name);
        });
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Загружаем курсы
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Получаем курсы - API возвращает пагинированный ответ
        const response = await coursesService.getCourses({ status: 'published' });
        // Извлекаем массив курсов из пагинированного ответа
        let coursesList: Course[] = [];
        
        // coursesService.getCourses() всегда возвращает PaginatedResponse<Course>
        if (response && typeof response === 'object') {
          if ('results' in response && Array.isArray(response.results)) {
            coursesList = response.results;
          } else if (Array.isArray(response)) {
            // Fallback на случай, если вернулся массив напрямую
            coursesList = response;
          }
        }
        
        // Фильтруем только опубликованные курсы на frontend
        const activeCourses = coursesList.filter(course => 
          course && course.status && course.status !== 'draft' && course.status !== 'annulled'
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

  // Фильтруем курсы по выбранной категории
  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(course => {
        if (!course.category) return false;
        
        // course.category может быть строкой (старый формат) или объектом (новый формат)
        if (typeof course.category === 'string') {
          // Если category - строка, сравниваем с ID или name категорий
          return course.category === selectedCategory || 
                 categories.some(cat => (cat.id === selectedCategory && (cat.id === course.category || cat.name === course.category)));
        } else if (course.category && typeof course.category === 'object') {
          // Если category - объект, сравниваем по ID
          const categoryId = course.category.id || String(course.category.id);
          return categoryId === selectedCategory || String(categoryId) === selectedCategory;
        }
        return false;
      });

  // Получаем иконку для категории
  const getCategoryIcon = (category: string | { id?: string; name?: string; icon?: string } | null) => {
    if (!category) return Briefcase;
    
    // Если category - объект, используем icon из базы или name для поиска в fallback
    if (typeof category === 'object') {
      if (category.icon) {
        // Можно добавить логику для отображения иконок из базы данных
        // Пока используем fallback по name
      }
      const categoryName = category.name || '';
      return categoryIcons[categoryName.toLowerCase().replace(/\s+/g, '_')] || Briefcase;
    }
    
    // Если category - строка, ищем в fallback иконках
    return categoryIcons[category] || Briefcase;
  };

  // Получаем название категории для отображения
  const getCategoryName = (categoryId: string | null | undefined): string => {
    if (!categoryId || categoryId === 'all') return 'Все курсы';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Неизвестная категория';
  };

  const handleEnrollClick = (course: Course) => {
    if (!user) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      toast.info('Для записи на курс необходимо войти в систему');
      navigate('/login', { state: { returnTo: `/student/course/${course.id}` } });
      return;
    }

    // Если пользователь авторизован, переходим к курсу
    if (user.role === 'student') {
      navigate(`/student/course/${course.id}`);
    } else {
      toast.info('Эта функция доступна только для студентов');
    }
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
            {/* Кнопка "Все курсы" */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
              }`}
            >
              Все курсы
            </button>
            {/* Динамические категории из API */}
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
            // Получаем иконку для категории курса
            const categoryObj = typeof course.category === 'object' 
              ? course.category 
              : categories.find(cat => cat.id === course.category || cat.name === course.category);
            const Icon = getCategoryIcon(categoryObj || course.category);
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
                
                <button 
                  onClick={() => handleEnrollClick(course)}
                  className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {user ? 'Перейти к курсу' : 'Записаться на курс'}
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
