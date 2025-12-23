import { MapPin, Phone, Mail, Clock, Building2 } from 'lucide-react';

export function ContactsUnicover() {
  return (
    <section id="contacts" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-4">
            Контакты
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Свяжитесь с нами
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Мы готовы ответить на ваши вопросы и обсудить возможности сотрудничества
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 whitespace-pre-line text-sm">{item.content}</p>
                  </div>
                );
              })}
            </div>

            {/* Map placeholder */}
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl h-64 flex items-center justify-center border border-blue-300">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <p className="text-gray-700 font-medium">г. Атырау, ул. Студенческий 25</p>
                <p className="text-gray-600 text-sm">БЦ Bayterek Plaza, 5 этаж</p>
              </div>
            </div>

            {/* Company Details */}
            <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Реквизиты компании</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Полное название:</strong> ТОО "UNICOVER"</p>
                <p><strong>БИН:</strong> 100240007639</p>
                <p><strong>Юридический адрес:</strong> г. Атырау, ул. Студенческий 25, БЦ Bayterek Plaza, 5 этаж</p>
                <p><strong>Email:</strong> info@unicover.kz</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Отправить запрос</h3>
            <form className="space-y-6">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Ваше имя *
                </label>
                <input
                  type="text"
                  id="contact-name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="Введите ваше имя"
                />
              </div>

              <div>
                <label htmlFor="contact-company" className="block text-sm font-medium text-gray-700 mb-2">
                  Компания
                </label>
                <input
                  type="text"
                  id="contact-company"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="Название вашей компании"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    id="contact-phone"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="+7 (___) ___-____"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-direction" className="block text-sm font-medium text-gray-700 mb-2">
                  Интересующее направление
                </label>
                <select
                  id="contact-direction"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Выберите направление</option>
                  <option value="construction">Строительство и проектирование</option>
                  <option value="engineering">Инженерные изыскания</option>
                  <option value="education">Обучение</option>
                  <option value="safety">Промышленная безопасность</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-2">
                  Сообщение *
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Опишите ваш запрос подробнее..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
              >
                Отправить запрос
              </button>

              <p className="text-sm text-gray-500 text-center">
                * Обязательные поля для заполнения
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

const contactInfo = [
  {
    icon: Building2,
    title: 'БИН',
    content: '100240007639',
  },
  {
    icon: MapPin,
    title: 'Адрес',
    content: 'г.Атырау, ул. Студенческий 25\nБЦ Bayterek Plaza, 5 этаж',
  },
  {
    icon: Phone,
    title: 'Телефоны',
    content: '+7 (7122) 20-80-92\n+7 708 420-80-92',
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'info@unicover.kz',
  },
  {
    icon: Clock,
    title: 'Режим работы',
    content: 'Пн-Пт: 9:00 - 18:00\nСб-Вс: Выходной',
  },
];