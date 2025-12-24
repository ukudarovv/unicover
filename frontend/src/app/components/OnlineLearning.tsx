import { Monitor, BookOpen, FileCheck, Clock, Video, Award } from 'lucide-react';

export function OnlineLearning() {
  const features = [
    {
      icon: Monitor,
      title: 'Дистанционный доступ',
      description: 'Учитесь из любой точки мира в удобное время',
    },
    {
      icon: Video,
      title: 'Видео-лекции',
      description: 'Качественные обучающие материалы от экспертов',
    },
    {
      icon: FileCheck,
      title: 'Онлайн-тестирование',
      description: 'Проверка знаний через систему тестов',
    },
    {
      icon: Award,
      title: 'Сертификаты',
      description: 'Автоматическая выдача документов после сдачи',
    },
    {
      icon: Clock,
      title: 'Гибкий график',
      description: 'Обучение в своем темпе без привязки к расписанию',
    },
    {
      icon: BookOpen,
      title: 'История обучения',
      description: 'Доступ к пройденным курсам и материалам',
    },
  ];

  return (
    <section id="elearning" className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Monitor className="w-5 h-5" />
            <span className="font-medium">E-Learning</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Онлайн обучение
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Современная платформа дистанционного обучения с доступом к курсам, тестированию и получением сертификатов
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/15 transition-colors"
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-blue-100 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
