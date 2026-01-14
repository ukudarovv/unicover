"""
Base serializers and mixins for multilingual support
"""
from rest_framework import serializers
from .utils import get_request_language, get_multilingual_field_value


class MultilingualSerializerMixin:
    """
    Миксин для автоматического выбора языка в сериализаторах.
    
    Автоматически заменяет базовые поля (title, description, etc.) на языковые версии
    в зависимости от языка запроса. Если перевода нет, используется русская версия.
    
    Использование:
        class MySerializer(MultilingualSerializerMixin, serializers.ModelSerializer):
            multilingual_fields = ['title', 'description']  # Поля для многоязычности
            
            class Meta:
                model = MyModel
                fields = ['id', 'title', 'description', ...]
    """
    
    # Список полей, которые должны быть многоязычными
    # Переопределяется в дочерних классах
    multilingual_fields = []
    
    def to_representation(self, instance):
        """
        Переопределение сериализации для поддержки многоязычности.
        """
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        if not request or not self.multilingual_fields:
            return data
        
        lang = get_request_language(request)
        
        # Для всех языков (включая русский) удаляем языковые поля из ответа
        # и заменяем базовые поля на языковые версии, если язык не русский
        for field_name in self.multilingual_fields:
            if lang != 'ru':
                # Для других языков заменяем базовое поле на языковую версию
                if field_name in data:
                    lang_value = get_multilingual_field_value(instance, field_name, lang)
                    if lang_value:
                        data[field_name] = lang_value
            
            # Удаляем все языковые поля из ответа (они не нужны клиенту)
            for lang_suffix in ['_kz', '_en']:
                lang_field = f"{field_name}{lang_suffix}"
                if lang_field in data:
                    del data[lang_field]
        
        return data


def get_multilingual_options(options, lang='ru'):
    """
    Получить опции вопроса с учетом языка.
    
    Args:
        options: Список опций (может содержать text, text_kz, text_en)
        lang: Код языка
        
    Returns:
        Список опций с текстом на выбранном языке
    """
    if not options or not isinstance(options, list):
        return options
    
    result = []
    for opt in options:
        if not isinstance(opt, dict):
            result.append(opt)
            continue
        
        opt_copy = opt.copy()
        
        # Если есть языковая версия текста, используем её
        if lang == 'kz' and 'text_kz' in opt and opt['text_kz']:
            opt_copy['text'] = opt['text_kz']
        elif lang == 'en' and 'text_en' in opt and opt['text_en']:
            opt_copy['text'] = opt['text_en']
        # Иначе используем базовый text (русский)
        elif 'text' in opt:
            opt_copy['text'] = opt['text']
        
        # Удаляем языковые поля из ответа
        opt_copy.pop('text_kz', None)
        opt_copy.pop('text_en', None)
        
        result.append(opt_copy)
    
    return result
