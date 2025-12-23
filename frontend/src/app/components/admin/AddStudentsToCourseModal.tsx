import { useState, useEffect } from 'react';
import { X, Search, Users, CheckCircle, Mail, Phone, Building } from 'lucide-react';
import { usersService } from '../../services/users';
import { coursesService } from '../../services/courses';
import { ApiError } from '../../services/api';

interface AddStudentsToCourseModalProps {
  course: any;
  onClose: () => void;
  onAdd: (userIds: string[], deadline?: string) => void;
}

export function AddStudentsToCourseModal({ course, onClose, onAdd }: AddStudentsToCourseModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [deadline, setDeadline] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Получаем всех студентов
        const response = await usersService.getUsers({ role: 'student' });
        
        // Извлекаем массив из пагинированного ответа
        // response всегда должен быть PaginatedResponse<User>
        const allStudents = response?.results || (Array.isArray(response) ? response : []);
        
        if (!Array.isArray(allStudents)) {
          console.error('getUsers returned non-array:', response);
          setAvailableUsers([]);
          setError('Ошибка формата данных');
          return;
        }
        
        // Получаем студентов, которые уже на курсе
        let enrolledStudentIds: string[] = [];
        try {
          const enrollments = await coursesService.getCourseStudents(course.id);
          enrolledStudentIds = enrollments.map(e => {
            const student = e.student || e.user || e;
            return student?.id || student;
          }).filter(id => id != null);
        } catch (err) {
          // Если курс новый, может не быть студентов
          console.log('No enrolled students yet');
        }
        
        // Исключаем студентов, которые уже на курсе
        const available = allStudents.filter(student => 
          student.id && !enrolledStudentIds.includes(String(student.id))
        );
        
        setAvailableUsers(available);
        setError(null);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Ошибка загрузки студентов';
        setError(message);
        console.error('Failed to fetch students:', err);
        setAvailableUsers([]);
      } finally {
        setLoading(false);
      }
    };

    if (course?.id) {
      fetchUsers();
    }
  }, [course?.id]);


  const filteredUsers = availableUsers.filter(user => {
    const fullName = user.full_name || user.fullName || '';
    const email = user.email || '';
    const organization = user.organization || '';
    
    const matchesSearch = 
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      organization.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleToggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleAdd = () => {
    if (selectedUsers.size === 0) {
      alert('Выберите хотя бы одного студента');
      return;
    }
    onAdd(Array.from(selectedUsers), deadline);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl ring-4 ring-white ring-opacity-50 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Добавить студентов
              </h2>
              <p className="text-gray-600">
                Курс: <span className="font-semibold">{course.title}</span>
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
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

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Срок прохождения (опционально)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Загрузка студентов...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Ошибка: {error}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">
                  Доступные студенты ({filteredUsers.length})
                </h3>
                {filteredUsers.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedUsers.size === filteredUsers.length ? 'Снять все' : 'Выбрать все'}
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {filteredUsers.map((user) => {
                  const fullName = user.full_name || user.fullName || 'Неизвестно';
                  const email = user.email || '';
                  const phone = user.phone || '';
                  const organization = user.organization || '';
                  
                  return (
                    <div
                      key={user.id}
                      onClick={() => handleToggleUser(user.id)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedUsers.has(user.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center h-6">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => handleToggleUser(user.id)}
                            className="w-5 h-5 rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{fullName}</h4>
                            </div>
                            {selectedUsers.has(user.id) && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            {email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {email}
                              </div>
                            )}
                            {phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {phone}
                              </div>
                            )}
                            {organization && (
                              <div className="flex items-center gap-1 col-span-2">
                                <Building className="w-4 h-4" />
                                {organization}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Студенты не найдены</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchQuery ? 'Попробуйте изменить параметры поиска' : 'Все студенты уже добавлены на курс'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Выбрано студентов: <span className="font-semibold text-gray-900">{selectedUsers.size}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleAdd}
                disabled={selectedUsers.size === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Добавить {selectedUsers.size > 0 && `(${selectedUsers.size})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
