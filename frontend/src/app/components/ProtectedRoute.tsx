import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { UserRole } from '../types/lms';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useUser();

  // Показываем загрузку пока проверяем пользователя
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Если требуется определенная роль
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      // Перенаправляем на соответствующий дашборд
      switch (user.role) {
        case 'student':
          return <Navigate to="/student/dashboard" replace />;
        case 'pdek_member':
        case 'pdek_chairman':
          return <Navigate to="/pdek/dashboard" replace />;
        case 'admin':
          return <Navigate to="/admin/dashboard" replace />;
        default:
          return <Navigate to={redirectTo} replace />;
      }
    }
  }

  return <>{children}</>;
}

