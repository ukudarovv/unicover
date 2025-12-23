import { Building2, Compass, PenTool, Hammer, CheckCircle2 } from 'lucide-react';

export function ConstructionSection() {
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

  return (
    <section id="construction" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-4">
            <Building2 className="w-5 h-5" />
            <span className="font-medium">Строительное направление</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Проектирование и строительство
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Полный цикл работ от инженерных изысканий до ввода объекта в эксплуатацию
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
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">Лицензии и аттестаты</h3>
          <p className="text-blue-100 mb-8 text-center max-w-3xl mx-auto">
            ТОО «Unicover» обладает полным пакетом государственных лицензий и отраслевых аттестатов, 
            подтверждающих право выполнения работ в следующих областях:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h4 className="font-bold text-lg mb-4">Изыскания и проектирование</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5"></span>
                  <span>Лицензия на инженерные изыскания</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5"></span>
                  <span>Лицензия на проектирование</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5"></span>
                  <span>Архитектурное проектирование I-III уровней</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h4 className="font-bold text-lg mb-4">Строительство</h4>
              <ul className="space-y-2 text-sm text-blue-100">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5"></span>
                  <span>Лицензия на СМР III категории</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5"></span>
                  <span>Реконструкция и модернизация объектов</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full mt-1.5"></span>
                  <span>Капитальный ремонт зданий</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}