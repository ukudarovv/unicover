import { Header } from '../components/Header';
import { FooterUnicover } from '../components/FooterUnicover';
import { Building2, Compass, PenTool, Hammer, CheckCircle2, Target, Award, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ConstructionAboutPage() {
  const services = [
    {
      icon: Compass,
      title: 'Инженерные изыскания',
      items: [
        'Инженерно-геологические исследования',
        'Инженерно-гидрогеологические работы',
        'Инженерно-геодезические изыскания',
        'Высокоточное оборудование',
      ],
    },
    {
      icon: PenTool,
      title: 'Проектирование',
      items: [
        'Технологическое проектирование производственных объектов',
        'Архитектурное проектирование (I-III уровни ответственности)',
        'Градостроительное проектирование и планирование',
        'Проектирование инженерных систем и сетей',
        'Реконструкция и капитальный ремонт',
      ],
    },
    {
      icon: Hammer,
      title: 'Строительно-монтажные работы',
      items: [
        'СМР III категории',
        'Строительство объектов различного назначения',
        'Монтаж оборудования',
        'Реконструкция и модернизация',
        'Соблюдение СНиП и стандартов РК',
      ],
    },
  ];

  const advantages = [
    {
      icon: Target,
      title: 'Опыт и профессионализм',
      description: 'Многолетний опыт работы в сфере проектирования и строительства',
    },
    {
      icon: Award,
      title: 'Лицензии и сертификаты',
      description: 'Полный пакет государственных лицензий и отраслевых аттестатов',
    },
    {
      icon: Users,
      title: 'Квалифицированная команда',
      description: 'Высококвалифицированные специалисты с большим опытом работы',
    },
  ];

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Building2 className="w-5 h-5" />
                <span className="font-medium">Строительное направление</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">О компании</h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                ТОО «Unicover» — многопрофильная инженерная и проектно-строительная компания, 
                предоставляющая полный комплекс услуг в сфере промышленной безопасности, 
                изысканий, проектирования и строительства.
              </p>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-blue-600 transition-colors">Главная</Link>
              <span>/</span>
              <Link to="/construction" className="hover:text-blue-600 transition-colors">Строительство</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">О компании</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* About Section */}
          <section className="mb-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Наша деятельность</h2>
              <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                <p>
                  ТОО «Unicover» специализируется на выполнении полного цикла работ от инженерных 
                  изысканий до ввода объекта в эксплуатацию. Мы работаем в различных отраслях 
                  промышленности и гражданского строительства.
                </p>
                <p>
                  Компания располагает всеми необходимыми лицензиями и аттестатами, подтверждающими 
                  право выполнения работ в области изысканий, проектирования и строительства. 
                  Наши специалисты имеют большой опыт работы с объектами различной сложности.
                </p>
                <p>
                  Мы гарантируем высокое качество выполняемых работ, соблюдение всех нормативных 
                  требований и стандартов Республики Казахстан, а также индивидуальный подход 
                  к каждому проекту.
                </p>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Направления деятельности</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Полный спектр услуг в сфере проектирования и строительства
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div
                    key={index}
                    className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-200"
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
          </section>

          {/* Advantages Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Наши преимущества</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {advantages.map((advantage, index) => {
                const Icon = advantage.icon;
                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl border border-blue-200"
                  >
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{advantage.title}</h3>
                    <p className="text-gray-700">{advantage.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 rounded-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">Готовы начать проект?</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Свяжитесь с нами для обсуждения вашего проекта. Наши специалисты готовы ответить 
              на все ваши вопросы и предложить оптимальное решение.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/contacts"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Связаться с нами
              </Link>
              <Link
                to="/construction"
                className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Наши проекты
              </Link>
            </div>
          </section>
        </div>
      </main>
      <FooterUnicover />
    </>
  );
}

