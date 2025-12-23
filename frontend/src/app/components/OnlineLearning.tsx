import { Monitor, BookOpen, FileCheck, Clock, Video, Award, User } from 'lucide-react';

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

        {/* Login CTA */}
        <div className="bg-white text-gray-900 p-8 md:p-12 rounded-2xl max-w-2xl mx-auto text-center">
          <User className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold mb-4">Доступ к личному кабинету</h3>
          <p className="text-gray-600 mb-8">
            Войдите в систему для доступа к курсам, прохождения тестов и получения сертификатов
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#login"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <User className="w-5 h-5" />
              Войти в личный кабинет
            </a>
            <a
              href="#contacts"
              className="inline-flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Зарегистрироваться
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
