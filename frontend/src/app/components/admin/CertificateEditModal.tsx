import { useState, useEffect } from 'react';
import { X, FileText, Calendar } from 'lucide-react';
import { Certificate, CertificateTemplate } from '../../types/lms';
import { certificatesService } from '../../services/certificates';
import { toast } from 'sonner';

interface CertificateEditModalProps {
  certificate: Certificate;
  onClose: () => void;
  onSuccess: () => void;
}

export function CertificateEditModal({ certificate, onClose, onSuccess }: CertificateEditModalProps) {
  const [number, setNumber] = useState<string>('');
  const [templateId, setTemplateId] = useState<string>('');
  const [validUntil, setValidUntil] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  useEffect(() => {
    fetchTemplates();
    // Загружаем текущие данные сертификата
    setNumber(certificate.number || '');
    if (certificate.template?.id) {
      setTemplateId(certificate.template.id);
    }
    if (certificate.valid_until || certificate.validUntil) {
      const date = new Date(certificate.valid_until || certificate.validUntil || '');
      setValidUntil(date.toISOString().split('T')[0]);
    }
  }, [certificate]);

  const fetchTemplates = async () => {
    try {
      const data = await certificatesService.getTemplates();
      setTemplates(data.filter(t => t.is_active));
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      await certificatesService.updateCertificate(certificate.id, {
        number: number,
        templateId: templateId,
        validUntil: validUntil,
        file: file || undefined,
      });
      
      toast.success('Сертификат обновлен');
      onSuccess();
    } catch (error: any) {
      console.error('Failed to update certificate:', error);
      toast.error(error.message || 'Ошибка при обновлении сертификата');
    } finally {
      setLoading(false);
    }
  };

  const studentName = certificate.student?.full_name || certificate.userName || 'Неизвестно';
  const courseName = certificate.course?.title || certificate.courseName || 'Неизвестно';
  const certificateNumber = certificate.number || '';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Редактировать сертификат
              </h2>
              <p className="text-gray-600">
                Номер: <span className="font-semibold">{certificateNumber}</span>
              </p>
              <p className="text-gray-600">
                Студент: <span className="font-semibold">{studentName}</span>
              </p>
              <p className="text-gray-600">
                Курс: <span className="font-semibold">{courseName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Certificate Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Номер сертификата <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                maxLength={50}
              />
              <p className="mt-1 text-sm text-gray-500">
                Уникальный номер сертификата (макс. 50 символов)
              </p>
            </div>

            {/* Template Selection */}
            {!loadingTemplates && templates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Шаблон
                </label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Без шаблона</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Valid Until */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Действителен до
                </div>
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Оставьте пустым, если срок действия не ограничен
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Файл сертификата
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload-edit"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Выберите файл</span>
                      <input
                        id="file-upload-edit"
                        name="file-upload-edit"
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          const selectedFile = e.target.files?.[0];
                          if (selectedFile) {
                            setFile(selectedFile);
                          }
                        }}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                    </label>
                    <p className="pl-1">или перетащите сюда</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, JPG, PNG, DOC, DOCX до 10MB</p>
                  {certificate.file && !file && (
                    <p className="text-sm text-gray-600 mt-2">
                      Текущий файл: <span className="font-medium">Загружен</span>
                    </p>
                  )}
                  {file && (
                    <p className="text-sm text-gray-900 mt-2">
                      Новый файл: <span className="font-medium">{file.name}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
