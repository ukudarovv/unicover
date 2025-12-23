import { useState } from 'react';
import { User, Mail, Lock, UserPlus, Phone, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, RegisterData } from '../services/auth';
import { ApiError } from '../services/api';
import { useUser } from '../contexts/UserContext';

export function RegisterForm() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState<RegisterData>({
    phone: '',
    password: '',
    password_confirm: '',
    full_name: '',
    email: '',
    language: 'ru',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.register(formData);
      
      // Автоматически логиним пользователя после регистрации
      if (response.user) {
        // Пользователь уже сохранен в localStorage через authService
        const user = response.user;
        
        // Перенаправляем в зависимости от роли
        switch (user.role) {
          case 'student':
            navigate('/student/dashboard');
            break;
          case 'pdek_member':
          case 'pdek_chairman':
            navigate('/pdek/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        // Обрабатываем ошибки валидации
        if (err.data) {
          const errors = Object.values(err.data).flat();
          setError(Array.isArray(errors) ? errors.join(', ') : err.message);
        } else {
          setError(err.message || 'Ошибка при регистрации');
        }
      } else {
        setError('Ошибка при регистрации. Попробуйте снова.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="register" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Регистрация
              </h2>
              <p className="text-gray-600 text-sm">
                Создайте аккаунт для доступа к курсам
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-2">
                  ФИО *
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="reg-name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="Введите ваше ФИО"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="reg-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон *
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    id="reg-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="+77081234567"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  На этот номер будет отправлен SMS-код подтверждения
                </p>
              </div>

              <div>
                <label htmlFor="reg-company" className="block text-sm font-medium text-gray-700 mb-2">
                  Компания
                </label>
                <input
                  type="text"
                  id="reg-company"
                  name="organization"
                  value={formData.organization || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  placeholder="Название вашей компании (опционально)"
                />
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="reg-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reg-password-confirm" className="block text-sm font-medium text-gray-700 mb-2">
                  Подтвердите пароль *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    id="reg-password-confirm"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 rounded"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  Я согласен с{' '}
                  <a href="#terms" className="text-blue-600 hover:text-blue-700">
                    условиями использования
                  </a>
                  {' '}и{' '}
                  <a href="#privacy" className="text-blue-600 hover:text-blue-700">
                    политикой конфиденциальности
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="w-5 h-5" />
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
                  Войдите
                </Link>
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Важно:</strong> После регистрации вы получите SMS с кодом подтверждения на указанный номер телефона для активации аккаунта.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}