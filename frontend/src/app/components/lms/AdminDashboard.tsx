import { useState, useEffect } from 'react';
import { Users, BookOpen, FileQuestion, Award, Settings, TrendingUp, Plus, Search, Filter, Download, Edit, Trash2, Eye, X, CheckCircle, XCircle, UserPlus, Tag, FileText, Mail } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CourseEditor } from '../admin/CourseEditor';
import { TestEditor } from '../admin/TestEditor';
import { UserEditor } from '../admin/UserEditor';
import { UserManagement } from '../admin/UserManagement';
import { LicenseManagement } from '../admin/LicenseManagement';
import { LicenseEditor } from '../admin/LicenseEditor';
import { ContactManagement } from '../admin/ContactManagement';
import { AddStudentsToCourseModal } from '../admin/AddStudentsToCourseModal';
import { Course, Test, User } from '../../types/lms';
import { License, licensesService } from '../../services/licenses';
import { useAnalytics, useEnrollmentTrend, useTestResultsDistribution, useCoursesPopularity, useTopStudents } from '../../hooks/useAnalytics';
import { useCourses } from '../../hooks/useCourses';
import { useTests } from '../../hooks/useTests';
import { coursesService } from '../../services/courses';
import { testsService } from '../../services/tests';
import { usersService } from '../../services/users';
import { categoriesService, Category } from '../../services/categories';
import { TablePagination } from '../ui/TablePagination';
import { toast } from 'sonner';

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'in_development': 'В разработке',
    'draft': 'Черновик',
    'published': 'Опубликован',
    'assigned': 'Назначен',
    'in_progress': 'В процессе',
    'exam_available': 'Экзамен доступен',
    'exam_passed': 'Экзамен пройден',
    'completed': 'Завершен',
    'failed': 'Не сдан',
    'annulled': 'Аннулирован',
  };
  return statusMap[status] || status;
}

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<'overview' | 'courses' | 'users' | 'tests' | 'reports' | 'categories' | 'licenses' | 'contacts'>('overview');
  const [showCourseEditor, setShowCourseEditor] = useState(false);
  const [showTestEditor, setShowTestEditor] = useState(false);
  const [showUserEditor, setShowUserEditor] = useState(false);
  const [showLicenseEditor, setShowLicenseEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<any>(null);
  const [coursesRefetch, setCoursesRefetch] = useState<(() => void) | null>(null);
  const [testsRefetch, setTestsRefetch] = useState<(() => void) | null>(null);
  const [usersRefreshTrigger, setUsersRefreshTrigger] = useState(0);
  const [licensesRefreshTrigger, setLicensesRefreshTrigger] = useState(0);

  const handleCreateCourse = () => {
    setEditingItem(null);
    setShowCourseEditor(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingItem(course);
    setShowCourseEditor(true);
  };

  const handleSaveCourse = async (course: Partial<Course>) => {
    try {
      // Валидация обязательных полей
      if (!course.title || !course.title.trim()) {
        toast.error('Введите название курса');
        return;
      }
      
      if (!course.category) {
        toast.error('Выберите категорию курса');
        return;
      }
      
      if (editingItem) {
        await coursesService.updateCourse(editingItem.id, course);
        toast.success('Курс успешно обновлен');
      } else {
        await coursesService.createCourse(course);
        toast.success('Курс успешно создан');
      }
      setShowCourseEditor(false);
      setEditingItem(null);
      // Обновить список курсов
      if (coursesRefetch) {
        coursesRefetch();
      }
    } catch (error: any) {
      toast.error(`Ошибка сохранения курса: ${error.message || 'Неизвестная ошибка'}`);
      console.error('Failed to save course:', error);
    }
  };

  const handleCreateTest = () => {
    setEditingItem(null);
    setShowTestEditor(true);
  };

  const handleEditTest = async (test: Test) => {
    try {
      // Загружаем тест заново, чтобы получить актуальные данные с courseId
      const fullTest = await testsService.getTest(test.id);
      setEditingItem(fullTest);
      setShowTestEditor(true);
    } catch (error: any) {
      toast.error(`Ошибка загрузки теста: ${error.message || 'Неизвестная ошибка'}`);
      console.error('Failed to load test:', error);
    }
  };

  const handleSaveTest = async (test: Partial<Test>) => {
    try {
      let savedTest: Test;
      if (editingItem) {
        savedTest = await testsService.updateTest(editingItem.id, test);
        toast.success('Тест успешно обновлен');
      } else {
        savedTest = await testsService.createTest(test);
        toast.success('Тест успешно создан');
      }
      setShowTestEditor(false);
      setEditingItem(null);
      // Обновить список тестов
      if (testsRefetch) {
        testsRefetch();
      }
    } catch (error: any) {
      toast.error(`Ошибка сохранения теста: ${error.message || 'Неизвестная ошибка'}`);
      console.error('Failed to save test:', error);
    }
  };

  const handleCreateUser = () => {
    setEditingItem(null);
    setShowUserEditor(true);
  };

  const handleEditUser = (user: any) => {
    setEditingItem(user);
    setShowUserEditor(true);
  };

  const handleCreateLicense = () => {
    setEditingItem(null);
    setShowLicenseEditor(true);
  };

  const handleEditLicense = (license: License) => {
    setEditingItem(license);
    setShowLicenseEditor(true);
  };

  const handleSaveLicense = async (license: Partial<License>, file?: File) => {
    try {
      if (editingItem) {
        await licensesService.updateLicense(editingItem.id, license, file);
        toast.success('Лицензия успешно обновлена');
      } else {
        await licensesService.createLicense(license, file);
        toast.success('Лицензия успешно создана');
      }
      setShowLicenseEditor(false);
      setEditingItem(null);
      setLicensesRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast.error(`Ошибка сохранения лицензии: ${error.message || 'Неизвестная ошибка'}`);
      console.error('Failed to save license:', error);
    }
  };

  const handleSaveUser = async (user: Partial<User & { password?: string }>) => {
    try {
      if (editingItem) {
        await usersService.updateUser(editingItem.id, user);
        toast.success('Пользователь успешно обновлен');
      } else {
        const createdUser = await usersService.createUser(user);
        const password = createdUser.generated_password || user.password;
        const userName = user.fullName || user.full_name || user.phone || 'пользователя';
        
        // Показываем пароль после создания
        if (password) {
          toast.success(
            `Пользователь "${userName}" успешно создан!`,
            {
              description: `Пароль: ${password}\n\nСкопируйте пароль для передачи пользователю.`,
              duration: 15000, // Показывать 15 секунд
            }
          );
          
          // Также показываем в консоли для удобства копирования
          console.log(`\n=== Пользователь создан ===`);
          console.log(`Имя: ${userName}`);
          console.log(`Телефон: ${user.phone}`);
          console.log(`Email: ${user.email || 'не указан'}`);
          console.log(`Пароль: ${password}`);
          console.log(`========================\n`);
        } else {
          toast.success('Пользователь успешно создан');
        }
      }
      setShowUserEditor(false);
      setEditingItem(null);
      // Обновление списка пользователей
      setUsersRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast.error(`Ошибка сохранения пользователя: ${error.message || 'Неизвестная ошибка'}`);
      console.error('Failed to save user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Панель администратора</h1>
          <p className="text-gray-600">Управление учебной платформой UNICOVER</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'overview'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">Обзор</span>
                </button>
                <button
                  onClick={() => setActiveSection('courses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'courses'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">Курсы</span>
                </button>
                <button
                  onClick={() => setActiveSection('users')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'users'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Пользователи</span>
                </button>
                <button
                  onClick={() => setActiveSection('tests')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'tests'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FileQuestion className="w-5 h-5" />
                  <span className="font-medium">Тесты</span>
                </button>
                <button
                  onClick={() => setActiveSection('reports')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'reports'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Award className="w-5 h-5" />
                  <span className="font-medium">Отчеты</span>
                </button>
                <button
                  onClick={() => setActiveSection('categories')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'categories'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Tag className="w-5 h-5" />
                  <span className="font-medium">Категории</span>
                </button>
                <button
                  onClick={() => setActiveSection('licenses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'licenses'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Лицензии</span>
                </button>
                <button
                  onClick={() => setActiveSection('contacts')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'contacts'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Mail className="w-5 h-5" />
                  <span className="font-medium">Обратная связь</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            {activeSection === 'overview' && (
              <OverviewSection 
                onCreateCourse={handleCreateCourse}
                onCreateTest={handleCreateTest}
                onCreateUser={handleCreateUser}
              />
            )}
            {activeSection === 'courses' && (
              <CoursesSection 
                onCreate={handleCreateCourse} 
                onEdit={handleEditCourse}
                onRefetch={(refetch) => setCoursesRefetch(() => refetch)}
              />
            )}
            {activeSection === 'users' && (
              <UserManagement 
                onCreate={handleCreateUser} 
                onEdit={handleEditUser}
                refreshTrigger={usersRefreshTrigger}
              />
            )}
            {activeSection === 'tests' && (
              <TestsSection 
                onCreate={handleCreateTest}
                onEdit={handleEditTest}
                onRefetch={(refetch) => setTestsRefetch(() => refetch)}
              />
            )}
            {activeSection === 'reports' && <ReportsSection />}
            {activeSection === 'categories' && <CategoriesSection />}
            {activeSection === 'licenses' && (
              <LicenseManagement
                onCreate={handleCreateLicense}
                onEdit={handleEditLicense}
                refreshTrigger={licensesRefreshTrigger}
              />
            )}
            {activeSection === 'contacts' && (
              <ContactManagement />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCourseEditor && (
        <CourseEditor
          course={editingItem}
          onSave={handleSaveCourse}
          onCancel={() => setShowCourseEditor(false)}
        />
      )}

      {showTestEditor && (
        <TestEditor
          test={editingItem}
          onSave={handleSaveTest}
          onCancel={() => setShowTestEditor(false)}
        />
      )}

      {showUserEditor && (
        <UserEditor
          user={editingItem}
          onSave={handleSaveUser}
          onCancel={() => setShowUserEditor(false)}
        />
      )}

      {showLicenseEditor && (
        <LicenseEditor
          license={editingItem}
          onSave={handleSaveLicense}
          onCancel={() => {
            setShowLicenseEditor(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

function OverviewSection({ 
  onCreateCourse, 
  onCreateTest, 
  onCreateUser 
}: { 
  onCreateCourse: () => void;
  onCreateTest: () => void;
  onCreateUser: () => void;
}) {
  const { stats, loading, error } = useAnalytics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Ошибка загрузки статистики: {error}</p>
        </div>
      </div>
    );
  }

  const statsData = stats ? [
    { label: 'Всего студентов', value: stats.total_students, change: `Активных: ${stats.active_students}`, color: 'blue' },
    { label: 'Активных курсов', value: stats.active_courses, change: `Завершено: ${stats.completed_courses}`, color: 'green' },
    { label: 'Тестов сегодня', value: stats.tests_today, change: `Успеваемость: ${stats.success_rate}%`, color: 'orange' },
    { label: 'Выдано сертификатов', value: stats.total_certificates, change: `За месяц: +${stats.certificates_this_month}`, color: 'purple' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">{stat.label}</span>
              <span className="text-xs text-green-600 font-semibold">{stat.change}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Последняя активность</h2>
        <div className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <p>Активность будет отображаться здесь</p>
            <p className="text-sm mt-1">Данные загружаются из системы</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={onCreateCourse}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left cursor-pointer"
        >
          <Plus className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Создать курс</h3>
          <p className="text-sm text-gray-600">Добавить новый учебный курс</p>
        </button>
        <button 
          onClick={onCreateUser}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left cursor-pointer"
        >
          <Users className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Добавить студента</h3>
          <p className="text-sm text-gray-600">Зарегистрировать нового слушателя</p>
        </button>
        <button 
          onClick={onCreateTest}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left cursor-pointer"
        >
          <FileQuestion className="w-8 h-8 text-orange-600 mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Создать тест</h3>
          <p className="text-sm text-gray-600">Добавить экзаменационный тест</p>
        </button>
      </div>
    </div>
  );
}

function CoursesSection({ 
  onCreate, 
  onEdit,
  onRefetch 
}: { 
  onCreate: () => void, 
  onEdit: (course: Course) => void,
  onRefetch?: (refetch: () => void) => void
}) {
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Параметры для запроса с пагинацией
  const courseParams: any = {
    page: currentPage,
    page_size: pageSize,
  };
  if (searchQuery) courseParams.search = searchQuery;
  if (filterStatus !== 'all') courseParams.status = filterStatus;
  if (filterCategory !== 'all') courseParams.category = filterCategory;
  
  const { courses, pagination, loading, error, refetch } = useCourses(courseParams);
  const [courseStudentsCount, setCourseStudentsCount] = useState<Record<string, number>>({});
  
  // Загружаем категории
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await categoriesService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Передаем функцию refetch родительскому компоненту
  useEffect(() => {
    if (onRefetch && refetch) {
      onRefetch(refetch);
    }
  }, [onRefetch, refetch]);

  // Загружаем количество студентов для каждого курса
  useEffect(() => {
    const fetchStudentsCount = async () => {
      const counts: Record<string, number> = {};
      const coursesArray = Array.isArray(courses) ? courses : [];
      for (const course of coursesArray) {
        try {
          const students = await coursesService.getCourseStudents(course.id);
          counts[course.id] = students.length;
        } catch (err) {
          console.error(`Failed to fetch students for course ${course.id}:`, err);
          counts[course.id] = 0;
        }
      }
      setCourseStudentsCount(counts);
    };
    if (Array.isArray(courses) && courses.length > 0) {
      fetchStudentsCount();
    }
  }, [courses]);

  // Сбрасываем страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterCategory]);
  
  const coursesArray = Array.isArray(courses) ? courses : [];
  const totalPages = pagination.count ? Math.ceil(pagination.count / pageSize) : 1;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка курсов...</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку, если есть
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Ошибка загрузки курсов: {error}</p>
          <button 
            onClick={() => refetch && refetch()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Управление курсами</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={onCreate}>
            <Plus className="w-4 h-4" />
            Создать курс
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск курсов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Фильтры
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Все категории</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Все статусы</option>
                  <option value="in_development">В разработке</option>
                  <option value="draft">Черновик</option>
                  <option value="published">Опубликован</option>
                </select>
              </div>

              <div className="flex items-end">
                <button 
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterCategory('all');
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
                >
                  Сбросить фильтры
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Courses Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Название курса</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Категория</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Студентов</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Статус</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Действия</th>
              </tr>
            </thead>
            <tbody>
              {coursesArray.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    {searchQuery || filterStatus !== 'all' || filterCategory !== 'all' ? 'Курсы не найдены' : 'Нет курсов. Создайте первый курс, нажав кнопку "Создать курс"'}
                  </td>
                </tr>
              ) : (
                coursesArray.map(course => {
                  const getCategoryName = (cat: any) => {
                    if (typeof cat === 'object' && cat !== null) {
                      return cat.name || cat.name_kz || cat.name_en || '—';
                    }
                    if (typeof cat === 'string') {
                      // Старый формат для обратной совместимости
                      const names: Record<string, string> = {
                        'industrial_safety': 'Промбезопасность',
                        'fire_safety': 'Пожарная безопасность',
                        'electrical_safety': 'Электробезопасность',
                        'labor_protection': 'Охрана труда',
                        'professions': 'Рабочие профессии',
                      };
                      return names[cat] || cat;
                    }
                    return '—';
                  };

                  const getStatusBadge = (status: string) => {
                    const statusMap: Record<string, { text: string; class: string }> = {
                      'in_development': { text: 'В разработке', class: 'bg-orange-100 text-orange-800' },
                      'draft': { text: 'Черновик', class: 'bg-gray-100 text-gray-800' },
                      'published': { text: 'Опубликован', class: 'bg-green-100 text-green-800' },
                      'assigned': { text: 'Назначен', class: 'bg-blue-100 text-blue-800' },
                      'in_progress': { text: 'В процессе', class: 'bg-yellow-100 text-yellow-800' },
                      'completed': { text: 'Завершен', class: 'bg-green-100 text-green-800' },
                    };
                    const statusInfo = statusMap[status] || { text: getStatusText(status), class: 'bg-gray-100 text-gray-800' };
                    return (
                      <span className={`px-2 py-1 ${statusInfo.class} text-xs font-semibold rounded`}>
                        {statusInfo.text}
                      </span>
                    );
                  };

                  return (
                    <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{course.title}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{getCategoryName(course.category)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">{courseStudentsCount[course.id] || 0}</span>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(course.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium" onClick={() => onEdit(course)}>
                            Редактировать
                          </button>
                          <button 
                            className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                            onClick={() => setSelectedCourseForStudents(course)}
                          >
                            Студенты
                          </button>
                          <button
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                            onClick={async () => {
                              if (window.confirm(`Вы уверены, что хотите удалить курс "${course.title}"?\n\nЭто действие невозможно отменить.`)) {
                                try {
                                  await coursesService.deleteCourse(course.id);
                                  toast.success('Курс успешно удален');
                                  if (refetch) {
                                    refetch();
                                  }
                                } catch (error: any) {
                                  toast.error(`Ошибка: ${error.message || 'Не удалось удалить курс'}`);
                                }
                              }
                            }}
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.count > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalCount={pagination.count}
            pageSize={pageSize}
          />
        )}
      </div>

      {/* Course Students Modal */}
      {selectedCourseForStudents && (
        <CourseStudentsModal 
          course={selectedCourseForStudents}
          onClose={() => setSelectedCourseForStudents(null)}
        />
      )}
    </div>
  );
}

function TestsSection({ 
  onCreate,
  onEdit,
  onRefetch 
}: { 
  onCreate: () => void,
  onEdit?: (test: Test) => void,
  onRefetch?: (refetch: () => void) => void
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Параметры для запроса с пагинацией
  const testParams: any = {
    page: currentPage,
    page_size: pageSize,
  };
  if (searchQuery) testParams.search = searchQuery;
  
  const { tests, pagination, loading, refetch } = useTests(testParams);
  
  // Загружаем курсы для отображения названий
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await coursesService.getCourses({ page_size: 1000 });
        setCourses(response.results);
      } catch (error) {
        console.error('Failed to load courses:', error);
        setCourses([]);
      }
    };
    loadCourses();
  }, []);
  
  // Функция для получения названия курса по ID
  const getCourseTitle = (courseId: string | number | undefined): string => {
    if (!courseId) return '—';
    const course = courses.find(c => String(c.id) === String(courseId));
    return course?.title || '—';
  };

  // Передаем функцию refetch родительскому компоненту
  useEffect(() => {
    if (onRefetch && refetch) {
      onRefetch(refetch);
    }
  }, [onRefetch, refetch]);
  
  // Сбрасываем страницу при изменении поиска
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const testsArray = Array.isArray(tests) ? tests : [];
  const totalPages = pagination.count ? Math.ceil(pagination.count / pageSize) : 1;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка тестов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Конструктор тестов</h2>
          <p className="text-gray-600">Управление экзаменационными тестами и банком вопросов</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={onCreate}>
          <Plus className="w-4 h-4" />
          Создать тест
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск тестов..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Tests List */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Название</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Курс</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Вопросов</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Действия</th>
            </tr>
          </thead>
          <tbody>
            {testsArray.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  {searchQuery ? 'Тесты не найдены' : 'Нет тестов. Создайте первый тест, нажав кнопку "Создать тест"'}
                </td>
              </tr>
            ) : (
              testsArray.map((test) => (
                <tr key={test.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{test.title}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">
                      {getCourseTitle(test.courseId || test.course)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">
                      {test.questions?.length || 0}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      {onEdit && (
                        <button 
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          onClick={() => onEdit(test)}
                        >
                          Редактировать
                        </button>
                      )}
                      <button
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                        onClick={async () => {
                          if (window.confirm(`Вы уверены, что хотите удалить тест "${test.title}"?\n\nЭто действие невозможно отменить.`)) {
                            try {
                              await testsService.deleteTest(test.id);
                              toast.success('Тест успешно удален');
                              if (refetch) {
                                refetch();
                              }
                            } catch (error: any) {
                              toast.error(`Ошибка: ${error.message || 'Не удалось удалить тест'}`);
                            }
                          }
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination.count > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalCount={pagination.count}
          pageSize={pageSize}
        />
      )}
    </div>
  );
}

function ReportsSection() {
  const { stats, loading: statsLoading } = useAnalytics();
  const { data: enrollmentData, loading: enrollmentLoading } = useEnrollmentTrend();
  const { data: testResultsData, loading: testResultsLoading } = useTestResultsDistribution();
  const { data: coursesPopularity, loading: coursesPopularityLoading } = useCoursesPopularity();
  const { data: topStudents, loading: topStudentsLoading } = useTopStudents();

  const loading = statsLoading || enrollmentLoading || testResultsLoading || coursesPopularityLoading || topStudentsLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка отчетов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Общая успеваемость</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{stats?.success_rate || 0}%</div>
          <p className="text-xs text-gray-500 mt-1">Процент сданных тестов</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Средний балл</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{stats?.avg_score || 0}</div>
          <p className="text-xs text-gray-500 mt-1">По всем попыткам</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Завершено курсов</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">{stats?.completed_courses || 0}</div>
          <p className="text-xs text-gray-500 mt-1">Всего завершено</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Активных студентов</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">{stats?.active_students || 0}</div>
          <p className="text-xs text-gray-500 mt-1">Из {stats?.total_students || 0} всего</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Динамика регистраций</h3>
          {enrollmentData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Нет данных для отображения</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} name="Студенты" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Test Results Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Распределение результатов тестов</h3>
          {testResultsData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Нет данных для отображения</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={testResultsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {testResultsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Популярность курсов</h3>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Экспорт
          </button>
        </div>
        {coursesPopularity.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Нет данных для отображения</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={coursesPopularity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#3b82f6" name="Студентов" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Students Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Лучшие студенты</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Место</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ФИО</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Завершено курсов</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Средний балл</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Сертификатов</th>
              </tr>
            </thead>
            <tbody>
              {topStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Нет данных о студентах
                  </td>
                </tr>
              ) : (
                topStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {student.rank === 1 && <span className="text-2xl">🥇</span>}
                        {student.rank === 2 && <span className="text-2xl">🥈</span>}
                        {student.rank === 3 && <span className="text-2xl">🥉</span>}
                        {student.rank > 3 && <span className="font-bold text-gray-600">{student.rank}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{student.courses}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-green-600">{student.avg_score}%</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{student.certificates}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Экспорт отчетов</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <Download className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Сводный отчет</div>
              <div className="text-xs text-gray-500">PDF / Excel</div>
            </div>
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <Download className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Результаты тестов</div>
              <div className="text-xs text-gray-500">Excel</div>
            </div>
          </button>
          <button className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <Download className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Выданные сертификаты</div>
              <div className="text-xs text-gray-500">PDF / Excel</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesService.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки категорий';
      setError(message);
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = () => {
    setEditingCategory(null);
    setShowEditor(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowEditor(true);
  };

  const handleSave = async (category: Partial<Category>) => {
    try {
      if (editingCategory) {
        await categoriesService.updateCategory(editingCategory.id, category);
        toast.success('Категория успешно обновлена');
      } else {
        await categoriesService.createCategory(category);
        toast.success('Категория успешно создана');
      }
      setShowEditor(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(`Ошибка сохранения категории: ${error.message || 'Неизвестная ошибка'}`);
      console.error('Failed to save category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту категорию?\n\nЭто действие невозможно отменить.')) {
      return;
    }
    try {
      await categoriesService.deleteCategory(id);
      toast.success('Категория успешно удалена');
      fetchCategories();
    } catch (error: any) {
      toast.error(`Ошибка удаления категории: ${error.message || 'Неизвестная ошибка'}`);
      console.error('Failed to delete category:', error);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.name_kz && cat.name_kz.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (cat.name_en && cat.name_en.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка категорий...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Ошибка загрузки категорий: {error}</p>
          <button 
            onClick={fetchCategories} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Управление категориями</h2>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" 
            onClick={handleCreate}
          >
            <Plus className="w-4 h-4" />
            Создать категорию
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск категорий..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Название</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Название (КЗ)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Название (EN)</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Порядок</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Курсов</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Статус</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    {searchQuery ? 'Категории не найдены' : 'Нет категорий. Создайте первую категорию, нажав кнопку "Создать категорию"'}
                  </td>
                </tr>
              ) : (
                filteredCategories.map(category => (
                  <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{category.name_kz || '—'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{category.name_en || '—'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{category.order}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{category.courses_count || 0}</span>
                    </td>
                    <td className="py-4 px-4">
                      {category.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          <CheckCircle className="w-3 h-3" />
                          Активна
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                          <XCircle className="w-3 h-3" />
                          Неактивна
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button 
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium" 
                          onClick={() => handleEdit(category)}
                        >
                          Редактировать
                        </button>
                        <button
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                          onClick={() => handleDelete(category.id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Editor Modal */}
      {showEditor && (
        <CategoryEditorModal
          category={editingCategory}
          onSave={handleSave}
          onCancel={() => {
            setShowEditor(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}

function CategoryEditorModal({ 
  category, 
  onSave, 
  onCancel 
}: { 
  category: Category | null;
  onSave: (category: Partial<Category>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Category>>(category || {
    name: '',
    name_kz: '',
    name_en: '',
    description: '',
    order: 0,
    is_active: true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        name_kz: category.name_kz || '',
        name_en: category.name_en || '',
        description: category.description || '',
        order: category.order || 0,
        is_active: category.is_active !== undefined ? category.is_active : true,
      });
    }
  }, [category?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
      toast.error('Введите название категории');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl ring-4 ring-white ring-opacity-50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {category ? 'Редактировать категорию' : 'Создать категорию'}
            </h2>
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название (RU) *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введите название категории"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название (KZ)
                </label>
                <input
                  type="text"
                  value={formData.name_kz}
                  onChange={(e) => setFormData({ ...formData, name_kz: e.target.value })}
                  placeholder="Название на казахском"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название (EN)
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Название на английском"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Описание категории"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Порядок отображения
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active !== undefined ? formData.is_active : true}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Активна</span>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function CourseStudentsModal({ course, onClose }: { course: any, onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await coursesService.getCourseStudents(course.id);
        setEnrollments(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки студентов');
        console.error('Failed to fetch course students:', err);
      } finally {
        setLoading(false);
      }
    };

    if (course?.id) {
      fetchStudents();
    }
  }, [course?.id]);

  const handleAddStudents = async (userIds: string[], deadline?: string) => {
    try {
      await coursesService.enrollStudents(course.id, userIds);
      // Обновляем список студентов
      const data = await coursesService.getCourseStudents(course.id);
      setEnrollments(data);
      setShowAddStudents(false);
    } catch (error: any) {
      alert(`Ошибка: ${error.message || 'Не удалось добавить студентов'}`);
    }
  };

  const students = enrollments.map(enrollment => {
    const student = enrollment.student || enrollment;
    const courseData = enrollment.course || {};
    
    // Получаем средний балл из попыток тестов (если есть)
    // Пока используем прогресс как приблизительную оценку
    const score = enrollment.progress || 0;
    
    return {
      id: student.id || enrollment.id,
      name: student.full_name || student.fullName || 'Неизвестно',
      email: student.email || '',
      phone: student.phone || '',
      company: student.organization || '',
      progress: enrollment.progress || 0,
      score: score,
      status: enrollment.status || 'assigned',
      enrolledDate: enrollment.enrolled_at 
        ? new Date(enrollment.enrolled_at).toLocaleDateString('ru-RU')
        : '',
      completedDate: enrollment.completed_at
        ? new Date(enrollment.completed_at).toLocaleDateString('ru-RU')
        : null,
    };
  });

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedCount = students.filter(s => s.status === 'completed' || s.status === 'exam_passed').length;
  const inProgressCount = students.filter(s => s.status === 'in_progress' || s.status === 'assigned').length;
  const averageScore = students.length > 0 
    ? (students.reduce((sum, s) => sum + s.score, 0) / students.length).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-2xl ring-4 ring-white ring-opacity-50 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка студентов...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-2xl ring-4 ring-white ring-opacity-50 p-8 max-w-md">
          <div className="text-center">
            <p className="text-red-600 mb-4">Ошибка: {error}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl ring-4 ring-white ring-opacity-50 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Студенты курса
              </h2>
              <p className="text-gray-600">{course.title}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">Всего студентов</p>
              <p className="text-2xl font-bold text-blue-700">{students.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-1">Завершили курс</p>
              <p className="text-2xl font-bold text-green-700">{completedCount}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-600 mb-1">В процессе</p>
              <p className="text-2xl font-bold text-orange-700">{inProgressCount}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 mb-1">Средний балл</p>
              <p className="text-2xl font-bold text-purple-700">{averageScore}%</p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по имени, email, компании..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Студент</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Контакты</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Компания</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Прогресс</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Оценка</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Статус</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-xs text-gray-500">
                          Зачислен: {student.enrolledDate}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm space-y-1">
                        <div className="text-gray-600">{student.email}</div>
                        <div className="text-gray-500">{student.phone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{student.company}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              student.progress === 100 ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-semibold ${
                        student.score >= 90 ? 'text-green-600' :
                        student.score >= 80 ? 'text-blue-600' :
                        student.score >= 70 ? 'text-orange-600' :
                        'text-gray-600'
                      }`}>
                        {student.score}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        {student.status === 'completed' || student.status === 'exam_passed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded w-fit">
                            <CheckCircle className="w-3 h-3" />
                            Завершен
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded w-fit">
                            <BookOpen className="w-3 h-3" />
                            {getStatusText(student.status)}
                          </span>
                        )}
                        {student.completedDate && (
                          <span className="text-xs text-gray-500">
                            {student.completedDate}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Студенты не найдены</p>
                <p className="text-sm text-gray-400 mt-1">Попробуйте изменить параметры поиска</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAddStudents(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Добавить студентов
            </button>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors">
                <Download className="w-4 h-4" />
                Экспорт списка
              </button>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>

        {/* Add Students Modal */}
        {showAddStudents && (
          <AddStudentsToCourseModal
            course={course}
            onClose={() => setShowAddStudents(false)}
            onAdd={handleAddStudents}
          />
        )}
      </div>
    </div>
  );
}