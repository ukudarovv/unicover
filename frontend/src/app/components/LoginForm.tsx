import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Lock, Phone, Eye, EyeOff, UserCircle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { ApiError } from '../services/api';

export function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Демо-аккаунты для быстрого входа
  const demoAccounts = [
    {
      role: t('forms.login.demoAccounts.student'),
      phone: '77771111111',
      password: 'student123',
      description: t('forms.login.demoAccounts.studentDesc'),
    },
    {
      role: t('forms.login.demoAccounts.pdekMember'),
      phone: '77775555555',
      password: 'pdek123',
      description: t('forms.login.demoAccounts.pdekMemberDesc'),
    },
    {
      role: t('forms.login.demoAccounts.pdekChairman'),
      phone: '77776666666',
      password: 'chairman123',
      description: t('forms.login.demoAccounts.pdekChairmanDesc'),
    },
    {
      role: t('forms.login.demoAccounts.admin'),
      phone: '77771234567',
      password: 'admin123',
      description: t('forms.login.demoAccounts.adminDesc'),
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(phone, password);
      
      // Проверяем, есть ли параметр returnTo для перенаправления после входа
      const returnTo = (location.state as any)?.returnTo;
      
      if (returnTo) {
        // Перенаправляем на запрошенную страницу
        navigate(returnTo);
        return;
      }
      
      // Получаем пользователя из localStorage для определения роли
      const userStr = localStorage.getItem('unicover_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        
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
        // Показываем детали ошибки из backend
        let errorMessage = err.message;
        
        // Если есть детали ошибки в data, показываем их
        if (err.data) {
          // Обрабатываем non_field_errors
          if (err.data.non_field_errors) {
            errorMessage = Array.isArray(err.data.non_field_errors) 
              ? err.data.non_field_errors.join(', ')
              : err.data.non_field_errors;
          }
          // Обрабатываем ошибки полей
          else {
            const fieldErrors = Object.entries(err.data)
              .map(([field, errors]) => {
                const errorList = Array.isArray(errors) ? errors : [errors];
                return `${field}: ${errorList.join(', ')}`;
              })
              .join('; ');
            if (fieldErrors) {
              errorMessage = fieldErrors;
            }
          }
        }
        
        setError(errorMessage || 'Неверный телефон или пароль');
      } else {
        setError('Ошибка при входе. Попробуйте снова.');
      }
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (account: typeof demoAccounts[0]) => {
    setPhone(account.phone);
    setPassword(account.password);
    setError('');
    setLoading(true);

    try {
      await login(account.phone, account.password);
      
      const userStr = localStorage.getItem('unicover_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        
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
        // Показываем детали ошибки из backend
        let errorMessage = err.message;
        
        // Если есть детали ошибки в data, показываем их
        if (err.data) {
          // Обрабатываем non_field_errors
          if (err.data.non_field_errors) {
            errorMessage = Array.isArray(err.data.non_field_errors) 
              ? err.data.non_field_errors.join(', ')
              : err.data.non_field_errors;
          }
          // Обрабатываем ошибки полей
          else {
            const fieldErrors = Object.entries(err.data)
              .map(([field, errors]) => {
                const errorList = Array.isArray(errors) ? errors : [errors];
                return `${field}: ${errorList.join(', ')}`;
              })
              .join('; ');
            if (fieldErrors) {
              errorMessage = fieldErrors;
            }
          }
        }
        
        setError(errorMessage || 'Неверный телефон или пароль');
      } else {
        setError('Ошибка при входе. Попробуйте снова.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <img 
                src="/logo.jpg" 
                alt="UNICOVER Logo" 
                className="h-16 w-auto object-contain mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold text-gray-900">{t('forms.login.title')}</h2>
              <p className="text-gray-600 mt-2">{t('forms.login.subtitle')}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('forms.login.phone')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('forms.login.phonePlaceholder')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('forms.login.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('forms.login.passwordPlaceholder')}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('forms.login.loggingIn') : t('forms.login.loginButton')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/register" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                {t('forms.login.noAccount')} {t('forms.login.register')}
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                {t('forms.login.demoAccounts.demoVersion')}
              </p>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">{t('forms.login.demoAccounts.title')}</h3>
              <p className="text-blue-100 text-sm mb-6">
                {t('forms.login.demoAccounts.subtitle')}
              </p>
            </div>

            {demoAccounts.map((account, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => quickLogin(account)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UserCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{account.role}</h4>
                    <p className="text-xs text-gray-600 mb-3">{account.description}</p>
                    <div className="space-y-1 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-mono text-gray-700">{account.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-mono text-gray-700">{account.password}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        quickLogin(account);
                      }}
                      disabled={loading}
                      className="mt-3 w-full text-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? t('forms.login.loggingIn') : t('forms.login.demoAccounts.loginAs', { role: account.role })}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}