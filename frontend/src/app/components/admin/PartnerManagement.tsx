import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, Handshake } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { partnersService } from '../../services/partners';
import { Partner } from '../../types/partners';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface PartnerManagementProps {
  onCreate: () => void;
  onEdit: (partner: Partner) => void | Promise<void>;
  refreshTrigger?: number;
}

export function PartnerManagement({ onCreate, onEdit, refreshTrigger }: PartnerManagementProps) {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      // Для админа получаем всех партнеров (включая неактивных)
      const data = await partnersService.getPartners();
      setPartners(data);
    } catch (error: any) {
      console.error('Failed to fetch partners:', error);
      toast.error(t('partners.loadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('partners.deleteConfirm'))) {
      return;
    }

    try {
      await partnersService.deletePartner(id);
      toast.success(t('partners.deleteSuccess'));
      fetchPartners();
    } catch (error: any) {
      console.error('Failed to delete partner:', error);
      toast.error(t('partners.deleteError'));
    }
  };

  const getActiveBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          {t('common.active')}
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        {t('common.inactive')}
      </span>
    );
  };

  // Фильтрация партнеров
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = !searchQuery || 
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (partner.website && partner.website.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' && partner.is_active) ||
      (filterActive === 'inactive' && !partner.is_active);
    
    return matchesSearch && matchesActive;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('partners.management')}</h2>
          <p className="text-gray-600 mt-1">{t('partners.managementDescription')}</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('partners.addPartner')}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('partners.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            {t('common.filters')}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.status')}
                </label>
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t('common.all')}</option>
                  <option value="active">{t('common.active')}</option>
                  <option value="inactive">{t('common.inactive')}</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Partners List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Handshake className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('partners.noPartners')}</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterActive !== 'all' 
              ? t('partners.noPartnersFiltered')
              : t('partners.noPartnersCreate')}
          </p>
          {(!searchQuery && filterActive === 'all') && (
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('partners.addPartner')}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('partners.table.logo')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('partners.table.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('partners.table.website')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('partners.table.order')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('partners.table.status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {partner.logo_url ? (
                        <div className="w-16 h-16 flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <ImageWithFallback
                            src={partner.logo_url}
                            alt={partner.name}
                            className="max-w-full max-h-full object-contain"
                            fallback={
                              <div className="w-full h-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                <span className="font-bold text-sm">{partner.name.charAt(0).toUpperCase()}</span>
                              </div>
                            }
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">{t('partners.table.noLogo')}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{partner.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      {partner.website ? (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          {partner.website}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{partner.order}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActiveBadge(partner.is_active || false)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(partner)}
                          className="text-blue-600 hover:text-blue-900"
                          title={t('common.edit')}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(partner.id)}
                          className="text-red-600 hover:text-red-900"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

