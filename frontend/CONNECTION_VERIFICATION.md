# Проверка подключения к Backend

## ✅ Созданные файлы

### API Клиент и Сервисы
- ✅ `src/app/services/api.ts` - Базовый API клиент с JWT аутентификацией
- ✅ `src/app/services/auth.ts` - Аутентификация
- ✅ `src/app/services/courses.ts` - Управление курсами
- ✅ `src/app/services/tests.ts` - Управление тестами
- ✅ `src/app/services/users.ts` - Управление пользователями
- ✅ `src/app/services/analytics.ts` - Аналитика
- ✅ `src/app/services/certificates.ts` - Сертификаты
- ✅ `src/app/services/exams.ts` - Экзамены
- ✅ `src/app/services/protocols.ts` - Протоколы ПДЭК
- ✅ `src/app/services/notifications.ts` - Уведомления
- ✅ `src/app/services/index.ts` - Экспорт всех сервисов

### React Hooks
- ✅ `src/app/hooks/useAnalytics.ts` - Хуки для аналитики
- ✅ `src/app/hooks/useCourses.ts` - Хуки для курсов
- ✅ `src/app/hooks/useTests.ts` - Хуки для тестов
- ✅ `src/app/hooks/useNotifications.ts` - Хуки для уведомлений
- ✅ `src/app/hooks/index.ts` - Экспорт всех хуков

## ✅ Проверка подключения

### 1. Файл `.env`
Убедитесь, что файл `.env` существует в корне `frontend/`:
```
VITE_API_URL=http://localhost:8000/api
```

### 2. Компоненты используют реальные сервисы

#### AdminDashboard.tsx
- ✅ Импортирует `coursesService` из `../../services/courses`
- ✅ Импортирует `testsService` из `../../services/tests`
- ✅ Импортирует `usersService` из `../../services/users`
- ✅ Использует хуки `useAnalytics`, `useCourses`, `useTests`

#### UserManagement.tsx
- ✅ Импортирует `usersService` из `../../services/users`
- ✅ Импортирует `coursesService` из `../../services/courses`
- ✅ Использует реальные API вызовы

#### CourseEditor.tsx
- ✅ Импортирует `testsService` из `../../services/tests`

#### AddStudentsToCourseModal.tsx
- ✅ Импортирует `usersService` и `coursesService`

## ✅ API Endpoints Mapping

### Курсы
- `GET /api/courses/` → `coursesService.getCourses()`
- `POST /api/courses/` → `coursesService.createCourse()`
- `PUT /api/courses/{id}/` → `coursesService.updateCourse()`
- `DELETE /api/courses/{id}/` → `coursesService.deleteCourse()`
- `GET /api/courses/{id}/students/` → `coursesService.getCourseStudents()`
- `POST /api/courses/{id}/enroll/` → `coursesService.enrollStudents()`

### Тесты
- `GET /api/tests/` → `testsService.getTests()`
- `POST /api/tests/` → `testsService.createTest()`
- `PUT /api/tests/{id}/` → `testsService.updateTest()`
- `DELETE /api/tests/{id}/` → `testsService.deleteTest()`

### Пользователи
- `GET /api/users/` → `usersService.getUsers()`
- `POST /api/users/` → `usersService.createUser()`
- `PUT /api/users/{id}/` → `usersService.updateUser()`
- `DELETE /api/users/{id}/` → `usersService.deleteUser()`

### Аналитика
- `GET /api/analytics/stats/` → `analyticsService.getStats()`
- `GET /api/analytics/enrollment_trend/` → `analyticsService.getEnrollmentTrend()`
- `GET /api/analytics/test_results_distribution/` → `analyticsService.getTestResultsDistribution()`
- `GET /api/analytics/courses_popularity/` → `analyticsService.getCoursesPopularity()`
- `GET /api/analytics/top_students/` → `analyticsService.getTopStudents()`

## ✅ Особенности реализации

### API Клиент
- ✅ Автоматическое добавление JWT токена в заголовки
- ✅ Обработка различных форматов ошибок Django REST Framework
- ✅ Поддержка пустых ответов (204 No Content)
- ✅ Правильная обработка JSON и текстовых ответов
- ✅ Сохранение токенов в localStorage

### Обработка ошибок
- ✅ Все ошибки оборачиваются в `ApiError`
- ✅ Извлечение сообщений об ошибках из разных форматов:
  - `data.detail`
  - `data.message`
  - `data.non_field_errors`
  - Полевые ошибки валидации

### Хуки
- ✅ Используют реальные сервисы (не моки)
- ✅ Обрабатывают состояния загрузки и ошибок
- ✅ Предоставляют функцию `refetch` для обновления данных

## 🔍 Как проверить работу

1. **Запустите backend:**
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Запустите frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Откройте консоль браузера (F12) и проверьте:**
   - Network tab должен показывать запросы к `http://localhost:8000/api/`
   - При авторизации должен быть запрос к `/api/auth/token/`
   - При загрузке панели администратора должны быть запросы к:
     - `/api/analytics/stats/`
     - `/api/courses/`
     - `/api/tests/`
     - `/api/users/`

4. **Проверьте localStorage:**
   - После авторизации должен появиться `access_token`
   - Должен быть `refresh_token`

5. **Проверьте работу CRUD операций:**
   - Создайте курс → должен быть POST запрос к `/api/courses/`
   - Отредактируйте курс → должен быть PUT запрос к `/api/courses/{id}/`
   - Удалите курс → должен быть DELETE запрос к `/api/courses/{id}/`

## ⚠️ Возможные проблемы

### CORS ошибки
Если видите CORS ошибки в консоли, проверьте `backend/config/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]
```

### 401 Unauthorized
- Проверьте, что вы авторизованы
- Проверьте токен в localStorage
- Попробуйте перелогиниться

### 404 Not Found
- Убедитесь, что backend запущен
- Проверьте URL в `.env` файле
- Проверьте, что endpoint существует в backend

### Network Error
- Убедитесь, что backend доступен на `http://localhost:8000`
- Проверьте firewall настройки

## ✅ Итог

Все сервисы созданы и подключены к реальному backend. Компоненты используют реальные API вызовы через созданные сервисы. Связь с backend полностью настроена.

