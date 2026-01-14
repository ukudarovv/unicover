import { Handshake } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { partnersService } from '../services/partners';
import { Partner } from '../types/partners';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Partners() {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const data = await partnersService.getPartners();
        setPartners(data);
      } catch (error) {
        console.error('Failed to fetch partners:', error);
        setPartners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <section id="partners" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-4">
              <Handshake className="w-5 h-5" />
              <span className="font-medium">{t('partners.title')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('partners.heading')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('partners.description')}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return null; // Не показываем секцию, если нет партнеров
  }

  return (
    <section id="partners" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-4">
              <Handshake className="w-5 h-5" />
              <span className="font-medium">{t('partners.title')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('partners.heading')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('partners.description')}
            </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner) => (
            <a
              key={partner.id}
              href={partner.website || '#'}
              target={partner.website ? '_blank' : '_self'}
              rel={partner.website ? 'noopener noreferrer' : ''}
              className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 flex items-center justify-center hover:border-blue-600 hover:bg-blue-50 transition-colors group"
            >
              <div className="text-center w-full">
                {partner.logo_url ? (
                  <div className="w-full h-20 flex items-center justify-center mb-2">
                    <ImageWithFallback
                      src={partner.logo_url}
                      alt={partner.name}
                      className="max-w-full max-h-16 object-contain"
                      fallback={
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <span className="font-bold text-sm">{partner.name.charAt(0).toUpperCase()}</span>
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <span className="font-bold">{partner.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <p className="text-sm font-medium text-gray-700">{partner.name}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}