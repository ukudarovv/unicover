import { useState, useEffect } from 'react';
import { X, Save, Upload, FileText, Trash2 } from 'lucide-react';
import { License } from '../../services/licenses';

interface LicenseEditorProps {
  license?: License;
  onSave: (license: Partial<License>, file?: File) => void;
  onCancel: () => void;
}

export function LicenseEditor({ license, onSave, onCancel }: LicenseEditorProps) {
  const [formData, setFormData] = useState<Partial<License>>({
    title: '',
    number: '',
    category: 'other',
    description: '',
    issued_date: '',
    valid_until: '',
    is_active: true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (license) {
      setFormData({
        title: license.title || '',
        number: license.number || '',
        category: license.category || 'other',
        description: license.description || '',
        issued_date: license.issued_date ? license.issued_date.split('T')[0] : '',
        valid_until: license.valid_until ? license.valid_until.split('T')[0] : undefined,
        is_active: license.is_active !== undefined ? license.is_active : true,
      });
      if (license.file_url) {
        setExistingFileUrl(license.file_url);
      }
    }
  }, [license]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.title || !formData.number || !formData.issued_date) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (!license && !selectedFile) {
      const proceed = window.confirm('Вы не выбрали файл для загрузки. Продолжить без файла?');
      if (!proceed) {
        return;
      }
    }

    // Очищаем valid_until если поле пустое
    const dataToSave = {
      ...formData,
      valid_until: formData.valid_until || undefined,
    };

    onSave(dataToSave, selectedFile || undefined);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Проверяем тип файла (допустим только PDF)
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Пожалуйста, выберите PDF файл');
        return;
      }
      setSelectedFile(file);
      setExistingFileUrl(null); // Скрываем старый файл при выборе нового
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setExistingFileUrl(null);
  };

  const categoryOptions = [
    { value: 'surveying', label: 'Изыскания и проектирование' },
    { value: 'construction', label: 'Строительство' },
    { value: 'other', label: 'Прочее' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {license ? 'Редактировать лицензию' : 'Добавить лицензию'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название лицензии <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Номер лицензии <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.number || ''}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category || 'other'}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Issued Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата выдачи <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.issued_date || ''}
              onChange={(e) => setFormData({ ...formData, issued_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Valid Until */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Действует до
            </label>
            <input
              type="date"
              value={formData.valid_until || ''}
              onChange={(e) => setFormData({ ...formData, valid_until: e.target.value || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active !== undefined ? formData.is_active : true}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
              Активна
            </label>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Файл лицензии (PDF)
              {!license && <span className="text-red-500"> *</span>}
            </label>
            
            {existingFileUrl && !selectedFile && (
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Текущий файл</p>
                    <a
                      href={existingFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Открыть в новой вкладке
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Удалить файл"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {selectedFile && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  {selectedFile || existingFileUrl ? 'Изменить файл' : 'Выберите файл'}
                </span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">Только PDF файлы</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

