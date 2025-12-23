import { Target, Award, Users, Shield } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function AboutUnicover() {
  const principles = [
    {
      icon: Shield,
      title: 'Качество',
      description: 'Высокие стандарты выполнения работ',
    },
    {
      icon: Award,
      title: 'Безопасность',
      description: 'Соблюдение норм промышленной безопасности',
    },
    {
      icon: Users,
      title: 'Ответственность',
      description: 'Профессиональный подход к каждому проекту',
    },
    {
      icon: Target,
      title: 'Прозрачность',
      description: 'Открытость и честность в работе',
    },
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-4">
            О компании
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ТОО «Unicover»
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Content */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Многопрофильная инженерная и проектно-строительная компания
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              ТОО «Unicover» оказывает полный комплекс услуг в сфере <strong>промышленной безопасности, 
              изысканий, проектирования и строительных работ</strong>. Мы работаем на рынке Казахстана, 
              соблюдая высокие стандарты качества, безопасности и нормативного соответствия.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Компания располагает всеми необходимыми <strong>лицензиями и аттестатами</strong>, 
              подтверждающими компетентность и право выполнения работ повышенной технической сложности.
            </p>
            
            <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-600 mb-6">
              <p className="text-gray-800 font-medium mb-3">
                Мы объединяем:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Профессионализм инженерной команды</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Современные технологии</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Глубокое знание нормативной базы</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-xl">
              <p className="text-lg font-semibold mb-2">Наша цель</p>
              <p className="text-blue-100">Создавать надёжные решения, которые работают долгие годы</p>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBidWlsZGluZ3xlbnwwfHx8fDE3MzQ4MDA2NDV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="О компании UNICOVER"
                className="w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>

        {/* Principles */}
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Наши принципы</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{principle.title}</h4>
                  <p className="text-gray-600 text-sm">{principle.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
