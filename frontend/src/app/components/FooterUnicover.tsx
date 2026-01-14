import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, Building2, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function FooterUnicover() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const constructionLinks = [
    { name: t('construction.about'), href: '/construction/about', isLink: true },
    { name: t('construction.licenses'), href: '/construction/licenses', isLink: true },
    { name: t('construction.completedWorks'), href: '/projects', isLink: true },
    { name: t('construction.partners'), href: '#partners', isLink: false },
  ];

  const educationLinks = [
    { name: t('education.about'), href: '#education-about' },
    { name: t('education.programs'), href: '#courses' },
    { name: t('education.online'), href: '#elearning' },
    { name: t('education.certificateVerification'), href: '/verify', isLink: true },
    { name: t('education.cabinet'), href: '#login' },
  ];

  const quickLinks = [
    { name: t('common.home'), href: '#home' },
    { name: t('common.about'), href: '#about' },
    { name: t('common.contacts'), href: '#contacts' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <img 
                src="/logo.jpg" 
                alt="UNICOVER Logo" 
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-sm mb-6">
              {t('footer.companyDescription')}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Construction Links */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white">{t('footer.construction')}</h3>
            </div>
            <ul className="space-y-3">
              {constructionLinks.map((link, index) => (
                <li key={index}>
                  {link.isLink ? (
                    <Link to={link.href} className="text-sm hover:text-blue-400 transition-colors">
                      {link.name}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-sm hover:text-blue-400 transition-colors">
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Education Links */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-white">{t('footer.education')}</h3>
            </div>
            <ul className="space-y-3">
              {educationLinks.map((link, index) => (
                <li key={index}>
                  {link.isLink ? (
                    <Link to={link.href} className="text-sm hover:text-blue-400 transition-colors">
                      {link.name}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-sm hover:text-blue-400 transition-colors">
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-white mb-4">{t('footer.contacts')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>{t('contacts.addressValue')}</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <a href="tel:+77122208092" className="hover:text-blue-400 transition-colors block">
                    +7 (7122) 20-80-92
                  </a>
                  <a href="tel:+77084208092" className="hover:text-blue-400 transition-colors block">
                    +7 708 420-80-92
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <a href="mailto:info@unicover.kz" className="hover:text-blue-400 transition-colors">
                  info@unicover.kz
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              {t('footer.copyright', { year: currentYear })}
            </p>
            <div className="flex gap-6 text-sm">
              {quickLinks.map((link, index) => (
                <a key={index} href={link.href} className="text-gray-400 hover:text-blue-400 transition-colors">
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
