import { Building2, Compass, PenTool, Hammer, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ConstructionSection() {
  const { t } = useTranslation();
  
  const services = [
    {
      icon: Compass,
      title: t('homepage.construction.services.surveys.title'),
      items: [
        t('homepage.construction.services.surveys.items.geological'),
        t('homepage.construction.services.surveys.items.hydrogeological'),
        t('homepage.construction.services.surveys.items.geodetic'),
        t('homepage.construction.services.surveys.items.equipment'),
      ],
    },
    {
      icon: PenTool,
      title: t('homepage.construction.services.design.title'),
      items: [
        t('homepage.construction.services.design.items.technological'),
        t('homepage.construction.services.design.items.architectural'),
        t('homepage.construction.services.design.items.urban'),
        t('homepage.construction.services.design.items.engineering'),
        t('homepage.construction.services.design.items.reconstruction'),
      ],
    },
    {
      icon: Hammer,
      title: t('homepage.construction.services.construction.title'),
      items: [
        t('homepage.construction.services.construction.items.category'),
        t('homepage.construction.services.construction.items.buildings'),
        t('homepage.construction.services.construction.items.installation'),
        t('homepage.construction.services.construction.items.modernization'),
        t('homepage.construction.services.construction.items.standards'),
      ],
    },
  ];

  return (
    <section id="construction" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-4">
            <Building2 className="w-5 h-5" />
            <span className="font-medium">{t('homepage.construction.badge')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('homepage.construction.title')}
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {t('homepage.construction.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-xl hover:shadow-xl transition-shadow border border-gray-200"
              >
                <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                <ul className="space-y-3">
                  {service.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Licenses Section */}
        <div id="licenses" className="bg-gradient-to-br from-blue-900 to-blue-800 text-white p-8 md:p-12 rounded-2xl">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">{t('homepage.construction.licenses.title')}</h3>
          <p className="text-blue-100 mb-8 text-center max-w-3xl mx-auto">
            {t('homepage.construction.licenses.description')}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h4 className="font-bold text-lg mb-4">{t('homepage.construction.licenses.surveys.title')}</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5"></span>
                  <span>{t('homepage.construction.licenses.surveys.items.surveys')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5"></span>
                  <span>{t('homepage.construction.licenses.surveys.items.design')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5"></span>
                  <span>{t('homepage.construction.licenses.surveys.items.architectural')}</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h4 className="font-bold text-lg mb-4">{t('homepage.construction.licenses.construction.title')}</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5"></span>
                  <span>{t('homepage.construction.licenses.construction.items.category')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5"></span>
                  <span>{t('homepage.construction.licenses.construction.items.reconstruction')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5"></span>
                  <span>{t('homepage.construction.licenses.construction.items.repair')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}