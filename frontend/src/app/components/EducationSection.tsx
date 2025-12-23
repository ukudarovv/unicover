import { GraduationCap, Shield, BookOpen, Award, Users, CheckCircle2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function EducationSection() {
  const features = [
    {
      icon: Shield,
      title: 'Аттестат на право выполнения работ',
      description: 'Официальное разрешение на подготовку специалистов в области промышленной безопасности',
    },
    {
      icon: Users,
      title: 'Опытные преподаватели',
      description: 'Профессиональный состав с практическим опытом работы на опасных объектах',
    },
    {
      icon: BookOpen,
      title: 'Современные программы',
      description: 'Актуальные образовательные программы, соответствующие стандартам РК',
    },
    {
      icon: Award,
      title: 'Официальные документы',
      description: 'Выдача сертификатов и протоколов установленного образца',
    },
  ];

  return (
    <section id="education" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-4">
            <GraduationCap className="w-5 h-5" />
            <span className="font-medium">Образовательное направление</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Учебный центр UNICOVER
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Подготовка и переподготовка специалистов в сфере промышленной безопасности
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Content */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Промышленная безопасность
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Компания имеет <strong>аттестат на право проведения работ в области промышленной безопасности</strong>, включающий:
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700">
                  <strong>Подготовку и переподготовку</strong> специалистов и работников в сфере промышленной безопасности
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700">
                  <strong>Обучение требованиям безопасности</strong> при эксплуатации опасных производственных объектов
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-600">
              <p className="text-gray-800">
                Мы обеспечиваем высокий уровень компетенций персонала предприятий, реализуя образовательные программы, 
                соответствующие отраслевым нормам и стандартам Республики Казахстан.
              </p>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBwcmVzZW50YXRpb258ZW58MXx8fHwxNzY2MzI1MDQxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Учебный центр"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}