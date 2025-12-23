import { Header } from '../components/Header';
import { FooterUnicover } from '../components/FooterUnicover';
import { Link } from 'react-router-dom';
import { Mail, Phone, MessageCircle, ArrowLeft } from 'lucide-react';

export function StudentSupportPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/student/dashboard"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Вернуться в личный кабинет
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Поддержка</h1>
            <p className="text-gray-600">Свяжитесь с нами, если у вас возникли вопросы</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Контактная информация</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Телефон</h3>
                    <a href="tel:+77001234567" className="text-blue-600 hover:text-blue-700">
                      +7 (700) 123-45-67
                    </a>
                    <p className="text-sm text-gray-600 mt-1">Пн-Пт: 9:00 - 18:00</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href="mailto:support@unicover.kz" className="text-blue-600 hover:text-blue-700">
                      support@unicover.kz
                    </a>
                    <p className="text-sm text-gray-600 mt-1">Ответим в течение 24 часов</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Часто задаваемые вопросы</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Как начать обучение?</h3>
                  <p className="text-gray-600">
                    Перейдите в раздел "Мои курсы" и выберите курс для начала обучения. 
                    После назначения курса администратором, он появится в вашем личном кабинете.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Как пройти тест?</h3>
                  <p className="text-gray-600">
                    Выберите доступный тест в разделе "Тесты" и нажмите "Начать тестирование". 
                    У вас есть ограниченное количество попыток для прохождения теста.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Где получить сертификат?</h3>
                  <p className="text-gray-600">
                    После успешного завершения курса и прохождения экзамена, сертификат будет 
                    доступен в разделе "Документы" вашего личного кабинета.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Что делать, если возникли технические проблемы?</h3>
                  <p className="text-gray-600">
                    Свяжитесь с нашей службой поддержки по телефону или email, указанным выше. 
                    Мы поможем решить возникшие проблемы.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Полезные ссылки</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/student/courses"
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <MessageCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-gray-900">Мои курсы</span>
                  </div>
                  <p className="text-sm text-gray-600">Просмотр всех ваших курсов</p>
                </Link>

                <Link
                  to="/student/tests"
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <MessageCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-gray-900">Тесты</span>
                  </div>
                  <p className="text-sm text-gray-600">Доступные тесты для прохождения</p>
                </Link>

                <Link
                  to="/student/documents"
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center mb-2">
                    <MessageCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-gray-900">Документы</span>
                  </div>
                  <p className="text-sm text-gray-600">Сертификаты и протоколы</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FooterUnicover />
    </>
  );
}

