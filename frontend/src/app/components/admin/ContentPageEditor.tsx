import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { ContentPage, ContentPageUpdate, contentPagesService } from '../../services/contentPages';
import { useTranslation } from 'react-i18next';

interface ContentPageEditorProps {
  pageType: 'terms' | 'privacy';
  onSave: () => void;
  onCancel: () => void;
}

export function ContentPageEditor({ pageType, onSave, onCancel }: ContentPageEditorProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ContentPageUpdate>({
    content_ru: '',
    content_kz: '',
    content_en: '',
  });

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const pages = await contentPagesService.getAll();
        const page = pages.find(p => p.page_type === pageType);
        
        if (page) {
          setFormData({
            content_ru: page.content_ru || '',
            content_kz: page.content_kz || '',
            content_en: page.content_en || '',
          });
        }
      } catch (error: any) {
        console.error('Failed to load content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [pageType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const pages = await contentPagesService.getAll();
      const existingPage = pages.find(p => p.page_type === pageType);
      
      if (existingPage) {
        await contentPagesService.update(existingPage.id, formData);
      } else {
        await contentPagesService.create({ ...formData, page_type: pageType });
      }
      
      onSave();
    } catch (error: any) {
      console.error('Failed to save content:', error);
      alert(error.message || 'Ошибка сохранения контента');
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = pageType === 'terms' 
    ? (t('admin.contentPages.termsTitle') || 'Условия использования')
    : (t('admin.contentPages.privacyTitle') || 'Политика конфиденциальности');

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">{pageTitle}</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Russian Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.contentPages.contentRu') || 'Содержание (русский)'} *
              </label>
              <textarea
                value={formData.content_ru}
                onChange={(e) => setFormData({ ...formData, content_ru: e.target.value })}
                required
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                placeholder="Введите содержимое страницы на русском языке..."
              />
            </div>

            {/* Kazakh Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.contentPages.contentKz') || 'Содержание (казахский)'}
              </label>
              <textarea
                value={formData.content_kz}
                onChange={(e) => setFormData({ ...formData, content_kz: e.target.value })}
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                placeholder="Введите содержимое страницы на казахском языке..."
              />
            </div>

            {/* English Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.contentPages.contentEn') || 'Содержание (английский)'}
              </label>
              <textarea
                value={formData.content_en}
                onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                placeholder="Enter page content in English..."
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {t('common.cancel') || 'Отмена'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? (t('common.saving') || 'Сохранение...') : (t('common.save') || 'Сохранить')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
