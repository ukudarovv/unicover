import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { GoogleMap } from './GoogleMap';
import { contactsService, ContactMessageCreate } from '../services/contacts';
import { toast } from 'sonner';

export function ContactsUnicover() {
  const [formData, setFormData] = useState<ContactMessageCreate>({
    name: '',
    company: '',
    email: '',
    phone: '',
    direction: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Очищаем пустые поля перед отправкой
      const dataToSend: ContactMessageCreate = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      };

      if (formData.company && formData.company.trim()) {
        dataToSend.company = formData.company.trim();
      }

      if (formData.direction && formData.direction.trim()) {
        dataToSend.direction = formData.direction as any;
      }

      await contactsService.createMessage(dataToSend);
      toast.success('Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.');
      setSubmitted(true);
      
      // Очищаем форму
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        direction: '',
        message: '',
      });
      
      // Сбрасываем состояние через 3 секунды
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при отправке сообщения. Попробуйте еще раз.');
      console.error('Failed to send contact message:', error);
    } finally {
      setLoading(false);
    }
  };

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

            {/* Google Maps */}
            <GoogleMap 
              address="г. Атырау, ул. Студенческий 25, БЦ Bayterek Plaza"
              latitude={47.1}
              longitude={51.9}
              height="256px"
            />

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
            
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-green-900 mb-2">Спасибо за ваше сообщение!</h4>
                <p className="text-green-700">Мы свяжемся с вами в ближайшее время.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="Введите ваше имя"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="contact-company" className="block text-sm font-medium text-gray-700 mb-2">
                    Компания
                  </label>
                  <input
                    type="text"
                    id="contact-company"
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="Название вашей компании"
                    disabled={loading}
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="your@email.com"
                      disabled={loading}
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
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="+7 (___) ___-____"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-direction" className="block text-sm font-medium text-gray-700 mb-2">
                    Интересующее направление
                  </label>
                  <select
                    id="contact-direction"
                    value={formData.direction || ''}
                    onChange={(e) => setFormData({ ...formData, direction: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    disabled={loading}
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
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Опишите ваш запрос подробнее..."
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Отправка...' : 'Отправить запрос'}
                </button>

                <p className="text-sm text-gray-500 text-center">
                  * Обязательные поля для заполнения
                </p>
              </form>
            )}
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