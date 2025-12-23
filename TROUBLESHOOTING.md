# Устранение проблем с авторизацией и регистрацией

## Исправленные проблемы

### 1. Дублирование URL путей
**Проблема:** В `backend/apps/accounts/urls.py` пути начинались с `auth/`, но в `backend/config/urls.py` уже был префикс `api/auth/`, что приводило к неправильным URL типа `api/auth/auth/register/`.

**Решение:** Убрал `auth/` из путей в `apps/accounts/urls.py`. Теперь пути:
- ✅ `api/auth/register/`
- ✅ `api/auth/login/`
- ✅ `api/auth/logout/`
- ✅ `api/auth/me/`

### 2. Построение URL в API клиенте
**Проблема:** `buildURL` использовал `window.location.origin`, что могло вызывать проблемы.

**Решение:** Улучшена логика построения URL с правильной обработкой слэшей.

### 3. RegisterForm не был подключен к API
**Проблема:** Форма регистрации не отправляла данные на backend.

**Решение:** Обновлен `RegisterForm.tsx` для использования `authService.register()`.

## Проверка работы

### 1. Убедитесь, что backend запущен
```bash
cd backend
python manage.py runserver
```

Проверьте доступность API:
- http://localhost:8000/api/docs/ - Swagger документация
- http://localhost:8000/api/auth/register/ - Endpoint регистрации

### 2. Убедитесь, что frontend настроен
```bash
cd frontend
# Создайте .env файл если его нет
echo "VITE_API_URL=http://localhost:8000/api" > .env
npm run dev
```

### 3. Проверьте CORS настройки
В `backend/config/settings.py` должны быть:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True
```

### 4. Проверьте в браузере
1. Откройте DevTools (F12)
2. Перейдите на вкладку Network
3. Попробуйте зарегистрироваться или войти
4. Проверьте запросы:
   - Должен быть запрос на `http://localhost:8000/api/auth/register/` или `/api/auth/login/`
   - Проверьте статус ответа (200, 201, 400, 500)
   - Проверьте тело ответа

### 5. Проверьте консоль браузера
В development режиме API клиент логирует все запросы и ответы в консоль.

## Типичные ошибки

### Ошибка 404 (Not Found)
- Проверьте, что backend запущен
- Проверьте URL в запросе (должен быть `http://localhost:8000/api/auth/register/`)
- Проверьте, что `VITE_API_URL` правильно настроен

### Ошибка CORS
- Проверьте настройки CORS в `backend/config/settings.py`
- Убедитесь, что frontend запущен на порту из списка разрешенных
- Перезапустите backend после изменения CORS настроек

### Ошибка 400 (Bad Request)
- Проверьте формат данных в запросе
- Для регистрации требуются: `phone`, `password`, `password_confirm`, `full_name`
- Для входа требуются: `phone`, `password`
- Проверьте консоль браузера для деталей ошибки

### Ошибка 500 (Internal Server Error)
- Проверьте логи backend в терминале
- Убедитесь, что миграции применены: `python manage.py migrate`
- Проверьте, что база данных создана

### Ошибка сети (Network Error)
- Проверьте, что backend запущен
- Проверьте URL в `.env` файле
- Проверьте firewall/антивирус

## Тестирование

### Тест регистрации
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+77081234567",
    "password": "test123",
    "password_confirm": "test123",
    "full_name": "Test User",
    "language": "ru"
  }'
```

### Тест входа
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+77081234567",
    "password": "test123"
  }'
```

## Дополнительная отладка

Если проблемы остаются:

1. **Включите подробное логирование в backend:**
   В `backend/config/settings.py` добавьте:
   ```python
   LOGGING = {
       'version': 1,
       'disable_existing_loggers': False,
       'handlers': {
           'console': {
               'class': 'logging.StreamHandler',
           },
       },
       'root': {
           'handlers': ['console'],
           'level': 'DEBUG',
       },
   }
   ```

2. **Проверьте логи backend** в терминале где запущен `runserver`

3. **Проверьте Network tab** в DevTools браузера для деталей запросов

4. **Проверьте Response** в Network tab - там будет детальная информация об ошибке

