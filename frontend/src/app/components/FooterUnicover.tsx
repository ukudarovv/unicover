import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, Building2, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FooterUnicover() {
  const currentYear = new Date().getFullYear();

  const constructionLinks = [
    { name: 'О компании', href: '/construction/about', isLink: true },
    { name: 'Лицензии', href: '/construction/licenses', isLink: true },
    { name: 'Выполненные работы', href: '/construction', isLink: true },
    { name: 'Партнеры', href: '#partners', isLink: false },
  ];

  const educationLinks = [
    { name: 'О центре', href: '#education-about' },
    { name: 'Программы обучения', href: '#courses' },
    { name: 'Онлайн обучение', href: '#elearning' },
    { name: 'Личный кабинет', href: '#login' },
  ];

  const quickLinks = [
    { name: 'Главная', href: '#home' },
    { name: 'О компании', href: '#about' },
    { name: 'Контакты', href: '#contacts' },
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
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">UC</span>
              </div>
              <div>
                <div className="font-bold text-white">UNICOVER</div>
                <div className="text-xs text-gray-400">ТОО "UNICOVER"</div>
              </div>
            </div>
            <p className="text-sm mb-6">
              Многопрофильная инженерная и проектно-строительная компания. Полный комплекс услуг в сфере промышленной безопасности, изысканий, проектирования и строительства.
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
              <h3 className="font-bold text-white">Строительство</h3>
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
              <h3 className="font-bold text-white">Учебный центр</h3>
            </div>
            <ul className="space-y-3">
              {educationLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm hover:text-blue-400 transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-white mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>г.Атырау, ул. Студенческий 25, БЦ Bayterek Plaza, 5 этаж</span>
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
              © {currentYear} ТОО «UNICOVER». БИН 100240007639. Все права защищены.
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
