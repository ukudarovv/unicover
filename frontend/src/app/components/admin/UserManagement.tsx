import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Download, Upload, Plus, Edit, Trash2, Eye, Mail, Phone, BookOpen, CheckCircle, XCircle, MoreVertical, UserPlus, Users as UsersIcon } from 'lucide-react';
import { User } from '../../types/lms';
import { AssignCoursesModal } from './AssignCoursesModal';
import { usersService } from '../../services/users';
import { coursesService } from '../../services/courses';
import { certificatesService } from '../../services/certificates';
import { examsService } from '../../services/exams';
import { ApiError } from '../../services/api';
import { TablePagination } from '../ui/TablePagination';
import { toast } from 'sonner';

interface UserManagementProps {
  onCreate: () => void;
  onEdit: (user: any) => void;
  refreshTrigger?: number;
}

export function UserManagement({ onCreate, onEdit, refreshTrigger }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [userToAssignCourses, setUserToAssignCourses] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<{ count: number; next: string | null; previous: string | null }>({
    count: 0,
    next: null,
    previous: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        page_size: pageSize,
      };
      if (filterRole !== 'all') {
        params.role = filterRole;
      }
      if (filterStatus !== 'all') {
        if (filterStatus === 'verified') {
          params.verified = true;
        } else if (filterStatus === 'unverified') {
          params.verified = false;
        } else if (filterStatus === 'active') {
          params.is_active = true;
        } else if (filterStatus === 'inactive') {
          params.is_active = false;
        }
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const data = await usersService.getUsers(params);
      setUsers(data.results);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Ошибка загрузки пользователей';
      setError(message);
      console.error('Failed to fetch users:', err);
      setUsers([]);
      setPagination({ count: 0, next: null, previous: null });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filterRole, filterStatus, searchQuery]);

  // Сбрасываем страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [filterRole, filterStatus, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshTrigger]);


  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.has(userId)) {
      setSelectedUsers(new Set([...selectedUsers].filter(id => id !== userId)));
    } else {
      setSelectedUsers(new Set([...selectedUsers, userId]));
    }
  };
  
  const totalPages = pagination.count ? Math.ceil(pagination.count / pageSize) : 1;

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      'student': 'Студент',
      'pdek_member': 'Член ПДЭК',
      'pdek_chairman': 'Председатель ПДЭК',
      'teacher': 'Преподаватель',
      'admin': 'Администратор',
    };
    return roles[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'student': 'bg-blue-100 text-blue-700',
      'pdek_member': 'bg-purple-100 text-purple-700',
      'pdek_chairman': 'bg-red-100 text-red-700',
      'teacher': 'bg-green-100 text-green-700',
      'admin': 'bg-gray-100 text-gray-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка пользователей...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">Ошибка загрузки пользователей: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Всего пользователей</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
            <UsersIcon className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Активных студентов</p>
              <p className="text-3xl font-bold text-green-600">
                {users.filter(u => u.role === 'student' && u.verified).length}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Членов ПДЭК</p>
              <p className="text-3xl font-bold text-purple-600">
                {users.filter(u => u.role === 'pdek_member' || u.role === 'pdek_chairman').length}
              </p>
            </div>
            <UsersIcon className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ожидают проверки</p>
              <p className="text-3xl font-bold text-orange-600">
                {users.filter(u => !u.verified).length}
              </p>
            </div>
            <XCircle className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Управление пользователями</h2>
            <div className="flex gap-3">
              <button 
                onClick={async () => {
                  try {
                    const blob = await usersService.exportUsers();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `users_${new Date().toISOString().split('T')[0]}.xlsx`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    toast.success('Пользователи успешно экспортированы');
                  } catch (error: any) {
                    const message = error instanceof ApiError ? error.message : 'Ошибка экспорта пользователей';
                    toast.error(message);
                    console.error('Failed to export users:', error);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Экспорт
              </button>
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Импорт
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const result = await usersService.importUsers(file);
                      toast.success(`Импортировано пользователей: ${result.imported}`);
                      if (result.errors && result.errors.length > 0) {
                        console.warn('Import errors:', result.errors);
                        toast.warning(`Ошибок при импорте: ${result.errors.length}`);
                      }
                      fetchUsers();
                    } catch (error: any) {
                      const message = error instanceof ApiError ? error.message : 'Ошибка импорта пользователей';
                      toast.error(message);
                      console.error('Failed to import users:', error);
                    } finally {
                      e.target.value = '';
                    }
                  }}
                />
              </label>
              <button 
                onClick={onCreate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Добавить пользователя
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по имени, email, телефону, ИИН..."
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
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Роль</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Все роли</option>
                    <option value="student">Студенты</option>
                    <option value="pdek_member">Члены ПДЭК</option>
                    <option value="pdek_chairman">Председатели ПДЭК</option>
                    <option value="teacher">Преподаватели</option>
                    <option value="admin">Администраторы</option>
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
                    <option value="active">Активный</option>
                    <option value="inactive">Неактивный</option>
                    <option value="verified">Подтвержденные</option>
                    <option value="unverified">Неподтвержденные</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button 
                    onClick={() => {
                      setFilterRole('all');
                      setFilterStatus('all');
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
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                Выбрано: {selectedUsers.size} пользователей
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setUserToAssignCourses({ id: 'bulk' } as User);
                  }}
                  className="px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50 transition-colors"
                >
                  Назначить на курс
                </button>
                <button 
                  onClick={() => {
                    toast.info('Функционал отправки сообщений пока не реализован');
                  }}
                  className="px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50 transition-colors"
                >
                  Отправить сообщение
                </button>
                <button 
                  onClick={async () => {
                    if (!window.confirm(`Вы уверены, что хотите удалить ${selectedUsers.size} пользователей?\n\nЭто действие невозможно отменить.`)) {
                      return;
                    }
                    try {
                      await Promise.all(Array.from(selectedUsers).map(userId => usersService.deleteUser(userId)));
                      toast.success(`${selectedUsers.size} пользователей успешно удалены`);
                      setSelectedUsers(new Set());
                      fetchUsers();
                    } catch (error: any) {
                      const message = error instanceof ApiError ? error.message : 'Ошибка удаления пользователей';
                      toast.error(message);
                      console.error('Failed to delete users:', error);
                    }
                  }}
                  className="px-3 py-1 text-sm bg-white border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Пользователь</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Контакты</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Роль</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Организация</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Курсы</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Прогресс</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Статус</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-gray-900">{user.full_name || user.fullName || 'Неизвестно'}</div>
                        <div className="text-xs text-gray-500">
                          {user.iin && `ИИН: ${user.iin}`}
                          {user.created_at && ` • ${new Date(user.created_at).toLocaleDateString('ru-RU')}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        {user.email || '—'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        {user.phone || '—'}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getRoleBadgeColor(user.role)}`}>
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{user.organization || user.company || '—'}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-500">—</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-400">—</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-2">
                      {/* Статус активности */}
                      {user.is_active !== false ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded w-fit">
                          <CheckCircle className="w-3 h-3" />
                          Активен
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded w-fit">
                          <XCircle className="w-3 h-3" />
                          Неактивен
                        </span>
                      )}
                      {/* Статус подтверждения */}
                      {user.verified ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded w-fit">
                          <CheckCircle className="w-3 h-3" />
                          Подтвержден
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded w-fit">
                          <XCircle className="w-3 h-3" />
                          Не подтвержден
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Просмотр"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onEdit(user)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async () => {
                          const userName = user.full_name || user.fullName || 'пользователя';
                          if (window.confirm(`Вы уверены, что хотите удалить пользователя "${userName}"?\n\nЭто действие невозможно отменить.`)) {
                            try {
                              await usersService.deleteUser(user.id);
                              // Обновляем список пользователей
                              fetchUsers();
                            } catch (error: any) {
                              alert(`Ошибка: ${error.message || 'Не удалось удалить пользователя'}`);
                            }
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && !loading && (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Пользователи не найдены</p>
              <p className="text-sm text-gray-400 mt-1">Попробуйте изменить параметры поиска</p>
            </div>
          )}
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

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)}
          onEdit={() => {
            onEdit(selectedUser);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Assign Courses Modal */}
      {userToAssignCourses && (
        <AssignCoursesModal
          user={userToAssignCourses.id === 'bulk' ? undefined : userToAssignCourses}
          users={userToAssignCourses.id === 'bulk' ? Array.from(selectedUsers).map(id => users.find(u => u.id === id)).filter(Boolean) as User[] : undefined}
          onClose={() => {
            setUserToAssignCourses(null);
            setSelectedUsers(new Set());
          }}
          onAssign={async (userIds: string[], courseIds: string[], deadline?: string) => {
            if (!userIds || userIds.length === 0) {
              toast.error('Не выбраны пользователи для назначения курсов');
              return;
            }
            if (!courseIds || courseIds.length === 0) {
              toast.error('Не выбраны курсы для назначения');
              return;
            }
            try {
              let successCount = 0;
              let errorCount = 0;
              for (const courseId of courseIds) {
                try {
                  await coursesService.enrollStudents(courseId, userIds);
                  successCount++;
                } catch (err) {
                  errorCount++;
                  console.error(`Failed to enroll users in course ${courseId}:`, err);
                }
              }
              if (successCount > 0) {
                toast.success(`Назначено курсов: ${successCount} для ${userIds.length} пользователей${errorCount > 0 ? ` (ошибок: ${errorCount})` : ''}`);
              } else {
                toast.error('Не удалось назначить курсы. Проверьте логи для деталей.');
              }
              setUserToAssignCourses(null);
              setSelectedUsers(new Set());
              fetchUsers();
            } catch (error: any) {
              const message = error instanceof ApiError ? error.message : 'Ошибка назначения курсов';
              toast.error(message);
              console.error('Failed to assign courses:', error);
            }
          }}
        />
      )}
    </div>
  );
}

// User Detail Modal
interface UserDetailModalProps {
  user: any;
  onClose: () => void;
  onEdit: () => void;
}

function UserDetailModal({ user, onClose, onEdit }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'courses' | 'activity'>('info');
  const [showAssignCourses, setShowAssignCourses] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);

  // Функция для получения текста статуса
  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      'assigned': 'Назначен',
      'in_progress': 'В процессе',
      'exam_available': 'Экзамен доступен',
      'exam_passed': 'Экзамен пройден',
      'completed': 'Завершен',
      'failed': 'Не сдан',
      'annulled': 'Аннулирован',
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    if (activeTab === 'courses' || activeTab === 'info') {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          // Получаем все курсы и фильтруем по пользователю
          const coursesResponse = await coursesService.getCourses({ page_size: 1000 });
          const allCourses = coursesResponse.results;
          const allEnrollments: any[] = [];
          
          for (const course of allCourses) {
            try {
              const courseStudents = await coursesService.getCourseStudents(course.id);
              const userEnrollment = courseStudents.find((e: any) => {
                const student = e.student || e;
                return (student.id || student) === user.id;
              });
              if (userEnrollment) {
                allEnrollments.push({
                  ...userEnrollment,
                  course: course,
                });
              }
            } catch (err) {
              // Игнорируем ошибки для отдельных курсов
            }
          }
          
          setEnrollments(allEnrollments);
          
          // Получаем сертификаты пользователя
          try {
            const allCertificates = await certificatesService.getCertificates();
            // Убеждаемся, что allCertificates - это массив
            const certificatesArray = Array.isArray(allCertificates) ? allCertificates : [];
            const userCerts = certificatesArray.filter((c: any) => {
              const certUser = c.user || c.student;
              return (certUser?.id || certUser) === user.id;
            });
            setCertificates(userCerts);
          } catch (err) {
            console.error('Failed to fetch certificates:', err);
            setCertificates([]); // Устанавливаем пустой массив при ошибке
          }
          
          // Попытки тестов - пока не доступны для конкретного пользователя через API
          // Можно добавить endpoint для получения попыток пользователя
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserData();
    }
  }, [user.id, activeTab]);

  const handleAssignCourses = async (userIds: string[], courseIds: string[], deadline?: string) => {
    if (!userIds || userIds.length === 0) {
      toast.error('Не выбраны пользователи для назначения курсов');
      return;
    }
    if (!courseIds || courseIds.length === 0) {
      toast.error('Не выбраны курсы для назначения');
      return;
    }
    try {
      let successCount = 0;
      let errorCount = 0;
      for (const courseId of courseIds) {
        try {
          await coursesService.enrollStudents(courseId, userIds);
          successCount++;
        } catch (err) {
          errorCount++;
          console.error(`Failed to enroll users in course ${courseId}:`, err);
        }
      }
      if (successCount > 0) {
        toast.success(`Назначено курсов: ${successCount} для пользователя ${user.full_name || user.fullName || 'пользователя'}${errorCount > 0 ? ` (ошибок: ${errorCount})` : ''}`);
      } else {
        toast.error('Не удалось назначить курсы. Проверьте логи для деталей.');
        return;
      }
      setShowAssignCourses(false);
      // Обновляем список enrollments
      try {
        const coursesResponse = await coursesService.getCourses({ page_size: 1000 });
        const allCourses = coursesResponse.results;
        const allEnrollments: any[] = [];
        for (const course of allCourses) {
          try {
            const courseStudents = await coursesService.getCourseStudents(course.id);
            const userEnrollment = courseStudents.find((e: any) => {
              const student = e.student || e;
              return (student.id || student) === user.id;
            });
            if (userEnrollment) {
              allEnrollments.push({
                ...userEnrollment,
                course: course,
              });
            }
          } catch (err) {
            // Игнорируем ошибки для отдельных курсов
            console.warn(`Failed to fetch students for course ${course.id}:`, err);
          }
        }
        setEnrollments(allEnrollments);
      } catch (err) {
        console.error('Failed to refresh enrollments:', err);
      }
    } catch (error: any) {
      const message = error instanceof ApiError ? error.message : 'Не удалось назначить курсы';
      toast.error(message);
      console.error('Failed to assign courses:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl ring-4 ring-white ring-opacity-50 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {(() => {
                  const name = user.full_name || user.fullName || '';
                  if (!name) return 'NN';
                  const parts = name.split(' ').filter(Boolean);
                  if (parts.length === 0) return 'NN';
                  const initials = parts.map((n: string) => n[0] || '').join('').substring(0, 2).toUpperCase();
                  return initials || 'NN';
                })()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.full_name || user.fullName || 'Неизвестно'}</h2>
                <p className="text-sm text-gray-600">{user.email || 'Нет email'}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Информация
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === 'courses'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Курсы ({enrollments.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Активность
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Личные данные</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-600">ИИН</dt>
                      <dd className="text-sm font-medium text-gray-900">{user.iin}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Телефон</dt>
                      <dd className="text-sm font-medium text-gray-900">{user.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Email</dt>
                      <dd className="text-sm font-medium text-gray-900">{user.email}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Работа</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-600">Организация</dt>
                      <dd className="text-sm font-medium text-gray-900">{user.organization || user.company || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Город</dt>
                      <dd className="text-sm font-medium text-gray-900">{user.city || '—'}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4">Статистика обучения</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Загрузка статистики...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600 mb-1">Курсов назначено</p>
                      <p className="text-2xl font-bold text-blue-700">{enrollments.length}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600 mb-1">Завершено</p>
                      <p className="text-2xl font-bold text-green-700">
                        {enrollments.filter(e => e.status === 'completed' || e.status === 'exam_passed').length}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-purple-600 mb-1">Средний балл</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {enrollments.length > 0
                          ? Math.round(enrollments.reduce((sum, e) => {
                              // Используем прогресс как приблизительную оценку
                              const testScore = e.test_score || e.score || 0;
                              return sum + (testScore > 0 ? testScore : e.progress || 0);
                            }, 0) / enrollments.length)
                          : 0}%
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-sm text-orange-600 mb-1">Сертификатов</p>
                      <p className="text-2xl font-bold text-orange-700">{certificates.length}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">Назначенные курсы</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Загрузка курсов...</p>
                </div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Нет назначенных курсов</p>
                </div>
              ) : (
                enrollments.map((enrollment) => {
                  const course = enrollment.course || {};
                  const progress = enrollment.progress || 0;
                  const status = enrollment.status || 'assigned';
                  
                  return (
                    <div key={enrollment.id || course.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{course.title || 'Неизвестный курс'}</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          status === 'completed' || status === 'exam_passed'
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {status === 'completed' || status === 'exam_passed' ? 'Завершен' : getStatusText(status)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full ${
                            progress === 100 ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{progress}% завершено</span>
                        {enrollment.enrolled_at && (
                          <span className="text-gray-500">
                            Зачислен: {new Date(enrollment.enrolled_at).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">История активности</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Загрузка активности...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attempts.length === 0 && certificates.length === 0 && enrollments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Нет данных об активности</p>
                    </div>
                  ) : (
                    <>
                      {/* Certificates */}
                      {certificates.map((cert) => (
                        <div key={cert.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                          <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Получил сертификат</p>
                            <p className="text-sm text-gray-600">
                              {cert.course?.title || cert.courseName || 'Курс'}
                            </p>
                          </div>
                          {cert.issued_at && (
                            <span className="text-xs text-gray-500">
                              {new Date(cert.issued_at).toLocaleDateString('ru-RU')}
                            </span>
                          )}
                        </div>
                      ))}
                      
                      {/* Course Completions */}
                      {enrollments
                        .filter(e => e.status === 'completed' || e.status === 'exam_passed')
                        .map((enrollment) => (
                          <div key={enrollment.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">Завершил курс</p>
                              <p className="text-sm text-gray-600">
                                {(enrollment.course || {}).title || 'Курс'}
                              </p>
                            </div>
                            {enrollment.completed_at && (
                              <span className="text-xs text-gray-500">
                                {new Date(enrollment.completed_at).toLocaleDateString('ru-RU')}
                              </span>
                            )}
                          </div>
                        ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAssignCourses(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Назначить курсы
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
              <button
                onClick={onEdit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Редактировать
              </button>
            </div>
          </div>
        </div>

        {/* Assign Courses Modal (nested) */}
        {showAssignCourses && (
          <div className="absolute inset-0 z-10">
            <AssignCoursesModal
              user={user}
              onClose={() => setShowAssignCourses(false)}
              onAssign={handleAssignCourses}
            />
          </div>
        )}
      </div>
    </div>
  );
}