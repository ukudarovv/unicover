"""
Utility functions for language detection and multilingual support
"""


def get_request_language(request):
    """
    Получить язык из запроса.
    
    Приоритет:
    1. Параметр запроса ?lang= (ru, kz, en)
    2. Заголовок Accept-Language
    3. По умолчанию 'ru'
    
    Args:
        request: Django REST Framework request object
        
    Returns:
        str: Код языка ('ru', 'kz', 'en')
    """
    # Проверка параметра запроса
    if hasattr(request, 'query_params'):
        lang = request.query_params.get('lang', '').lower()
        if lang in ['ru', 'kz', 'en']:
            return lang
    
    # Проверка заголовка Accept-Language
    accept_lang = request.META.get('HTTP_ACCEPT_LANGUAGE', '')
    if accept_lang:
        # Парсинг Accept-Language заголовка
        # Формат: "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7"
        languages = []
        for lang_item in accept_lang.split(','):
            lang_item = lang_item.strip()
            # Извлечь код языка (до точки с запятой или пробела)
            lang_code = lang_item.split(';')[0].split('-')[0].lower()
            if lang_code in ['ru', 'kz', 'en']:
                languages.append(lang_code)
        
        if languages:
            # Вернуть первый подходящий язык
            return languages[0]
    
    # Fallback на русский
    return 'ru'


def get_multilingual_field_value(instance, field_name, lang='ru'):
    """
    Получить значение многоязычного поля в зависимости от языка.
    
    Args:
        instance: Экземпляр модели Django
        field_name: Базовое имя поля (например, 'title')
        lang: Код языка ('ru', 'kz', 'en')
        
    Returns:
        Значение поля для указанного языка или fallback на русский
    """
    if lang == 'ru':
        # Для русского языка используем базовое поле
        return getattr(instance, field_name, None)
    else:
        # Для других языков используем поле с суффиксом
        lang_field = f"{field_name}_{lang}"
        value = getattr(instance, lang_field, None)
        # Если перевода нет, возвращаем русскую версию
        if not value:
            return getattr(instance, field_name, None)
        return value
