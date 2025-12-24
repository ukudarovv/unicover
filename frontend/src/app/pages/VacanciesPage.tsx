import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { FooterUnicover } from '../components/FooterUnicover';
import { Briefcase, MapPin, DollarSign, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { vacanciesService, Vacancy } from '../services/vacancies';
import { toast } from 'sonner';

export function VacanciesPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string>('Все');

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        setLoading(true);
        const data = await vacanciesService.getVacancies({ is_active: true, status: 'published' });
        setVacancies(data);
      } catch (error: any) {
        console.error('Failed to fetch vacancies:', error);
        toast.error('Ошибка загрузки вакансий');
      } finally {
        setLoading(false);
      }
    };

    fetchVacancies();
  }, []);

  const locations = ['Все', ...Array.from(new Set(vacancies.map(v => v.location)))];
  const filteredVacancies = selectedLocation === 'Все' 
    ? vacancies 
    : vacancies.filter(v => v.location === selectedLocation);

  const formatSalary = (min?: number, max?: number): string => {
    if (!min && !max) return 'По договоренности';
    if (min && max) return `${min.toLocaleString('ru-RU')} - ${max.toLocaleString('ru-RU')} ₸`;
    if (min) return `от ${min.toLocaleString('ru-RU')} ₸`;
    if (max) return `до ${max.toLocaleString('ru-RU')} ₸`;
    return 'По договоренности';
  };

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Briefcase className="w-5 h-5" />
                <span className="font-medium">Карьера</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Вакансии</h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Присоединяйтесь к команде ТОО «Unicover»! Мы предлагаем интересные проекты, 
                профессиональное развитие и достойные условия работы.
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
              <span className="text-gray-900 font-medium">Вакансии</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Filter */}
          <div className="mb-8 flex flex-wrap gap-3">
            {locations.map((location) => (
              <button
                key={location}
                onClick={() => setSelectedLocation(location)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedLocation === location
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {location}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600">Загрузка вакансий...</span>
            </div>
          ) : filteredVacancies.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">В данный момент нет открытых вакансий</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredVacancies.map((vacancy) => (
                <div
                  key={vacancy.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{vacancy.title}</h3>
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full">
                      Открыта
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{vacancy.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatSalary(vacancy.salary_min, vacancy.salary_max)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{vacancy.employment_type_display || vacancy.employment_type}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">{vacancy.description}</p>

                  <Link
                    to={`/construction/vacancies/${vacancy.id}`}
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Подробнее
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Не нашли подходящую вакансию?</h3>
            <p className="text-gray-700 mb-4">
              Отправьте нам свое резюме, и мы свяжемся с вами, когда появится подходящая позиция.
            </p>
            <Link
              to="/contacts"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Связаться с нами
            </Link>
          </div>
        </div>
      </main>
      <FooterUnicover />
    </>
  );
}

