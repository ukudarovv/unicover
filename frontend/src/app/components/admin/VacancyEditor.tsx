import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Vacancy, vacanciesService } from '../../services/vacancies';
import { toast } from 'sonner';

interface VacancyEditorProps {
  vacancy?: Vacancy;
  onSave: (vacancy: Partial<Vacancy>) => void;
  onCancel: () => void;
}

export function VacancyEditor({ vacancy, onSave, onCancel }: VacancyEditorProps) {
  const [formData, setFormData] = useState<Partial<Vacancy>>({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    salary_min: undefined,
    salary_max: undefined,
    location: 'г. Атырау',
    employment_type: 'full_time',
    status: 'draft',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vacancy) {
      setFormData({
        title: vacancy.title || '',
        description: vacancy.description || '',
        requirements: vacancy.requirements || '',
        responsibilities: vacancy.responsibilities || '',
        salary_min: vacancy.salary_min,
        salary_max: vacancy.salary_max,
        location: vacancy.location || 'г. Атырау',
        employment_type: vacancy.employment_type || 'full_time',
        status: vacancy.status || 'draft',
        is_active: vacancy.is_active !== undefined ? vacancy.is_active : true,
      });
    }
  }, [vacancy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      toast.error('Название вакансии обязательно');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
    } catch (error: any) {
      console.error('Failed to save vacancy:', error);
      toast.error('Ошибка сохранения вакансии');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {vacancy ? 'Редактировать вакансию' : 'Создать вакансию'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Название вакансии <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Описание <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
              Требования <span className="text-red-500">*</span>
            </label>
            <textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700 mb-1">
              Обязанности <span className="text-red-500">*</span>
            </label>
            <textarea
              id="responsibilities"
              value={formData.responsibilities}
              onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700 mb-1">
                Минимальная зарплата (₸)
              </label>
              <input
                type="number"
                id="salary_min"
                value={formData.salary_min || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  // Validate: max 8 digits before decimal (99999999.99)
                  if (value === undefined || value <= 99999999.99) {
                    setFormData(prev => ({ ...prev, salary_min: value }));
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="99999999.99"
                step="0.01"
                placeholder="Макс. 99,999,999.99"
              />
            </div>
            <div>
              <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700 mb-1">
                Максимальная зарплата (₸)
              </label>
              <input
                type="number"
                id="salary_max"
                value={formData.salary_max || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  // Validate: max 8 digits before decimal (99999999.99)
                  if (value === undefined || value <= 99999999.99) {
                    setFormData(prev => ({ ...prev, salary_max: value }));
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="99999999.99"
                step="0.01"
                placeholder="Макс. 99,999,999.99"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Местоположение
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="employment_type" className="block text-sm font-medium text-gray-700 mb-1">
              Тип занятости
            </label>
            <select
              id="employment_type"
              value={formData.employment_type}
              onChange={(e) => setFormData(prev => ({ ...prev, employment_type: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="full_time">Полная занятость</option>
              <option value="part_time">Частичная занятость</option>
              <option value="contract">Договор</option>
              <option value="internship">Стажировка</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Черновик</option>
                <option value="published">Опубликована</option>
                <option value="closed">Закрыта</option>
              </select>
            </div>
            <div className="flex items-center pt-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Активна</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Сохранение...' : 'Сохранить'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

