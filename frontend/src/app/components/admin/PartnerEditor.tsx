import { useState, useEffect } from 'react';
import { X, Save, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Partner } from '../../types/partners';
import { partnersService } from '../../services/partners';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface PartnerEditorProps {
  partner?: Partner;
  onSave: (partner: Partial<Partner>, logoFile?: File) => Promise<Partner>;
  onCancel: () => void;
}

export function PartnerEditor({ partner, onSave, onCancel }: PartnerEditorProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Partner>>({
    name: '',
    website: '',
    order: 0,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || '',
        website: partner.website || '',
        order: partner.order || 0,
        is_active: partner.is_active !== undefined ? partner.is_active : true,
      });
      
      if (partner.logo_url) {
        setLogoPreview(partner.logo_url);
      }
    }
  }, [partner]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.name.trim()) {
      toast.error(t('partners.nameRequired'));
      return;
    }

    if (!partner && !logoFile) {
      toast.error(t('partners.logoRequired'));
      return;
    }

    try {
      setLoading(true);
      await onSave(formData, logoFile || undefined);
    } catch (error: any) {
      console.error('Failed to save partner:', error);
      toast.error(`${t('partners.saveError')}: ${error.message || t('messages.error.generic')}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {partner ? t('partners.editPartner') : t('partners.createPartner')}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Название компании */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('partners.companyName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('partners.companyNamePlaceholder')}
              required
            />
          </div>

          {/* Логотип */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('partners.logo')} {!partner && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  <ImageWithFallback
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {logoFile ? t('partners.fileSelected') : logoPreview ? t('partners.changeLogo') : t('partners.uploadLogo')}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                    key={logoFile ? 'file-selected' : 'no-file'}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {t('partners.logoRecommendation')}
                </p>
              </div>
            </div>
          </div>

          {/* Веб-сайт */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('partners.website')}
            </label>
            <input
              type="url"
              value={formData.website || ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('partners.websitePlaceholder')}
            />
          </div>

          {/* Порядок отображения */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('partners.order')}
            </label>
            <input
              type="number"
              value={formData.order || 0}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('partners.orderHint')}
            </p>
          </div>

          {/* Активен */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active !== undefined ? formData.is_active : true}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              {t('partners.isActive')}
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

