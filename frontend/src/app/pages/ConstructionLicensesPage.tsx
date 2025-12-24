import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { FooterUnicover } from '../components/FooterUnicover';
import { FileText, Download, Award, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { licensesService, License } from '../services/licenses';
import { toast } from 'sonner';

export function ConstructionLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');

  const categories = [
    { value: 'Все', label: 'Все' },
    { value: 'surveying', label: 'Изыскания и проектирование' },
    { value: 'construction', label: 'Строительство' },
  ];

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        setLoading(true);
        const data = await licensesService.getLicenses({ is_active: true });
        setLicenses(data);
      } catch (error: any) {
        console.error('Failed to fetch licenses:', error);
        toast.error('Ошибка загрузки лицензий');
      } finally {
        setLoading(false);
      }
    };

    fetchLicenses();
  }, []);

  const filteredLicenses = selectedCategory === 'Все' 
    ? licenses 
    : licenses.filter(license => license.category === selectedCategory);

  const getCategoryLabel = (category: string): string => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const handleDownload = async (license: License) => {
    if (!license.file_url) {
      toast.error('Файл недоступен для скачивания');
      return;
    }

    try {
      if (license.id) {
        const blob = await licensesService.downloadLicense(license.id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${license.number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Файл успешно скачан');
      } else {
        // Fallback to direct URL
        window.open(license.file_url, '_blank');
      }
    } catch (error: any) {
      console.error('Failed to download license:', error);
      toast.error('Ошибка при скачивании файла');
    }
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
                <Award className="w-5 h-5" />
                <span className="font-medium">Лицензии и сертификаты</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Лицензии</h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                ТОО «Unicover» обладает полным пакетом государственных лицензий и отраслевых 
                аттестатов, подтверждающих право выполнения работ в различных областях.
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
              <span className="text-gray-900 font-medium">Лицензии</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Filter */}
          <div className="mb-8 flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600">Загрузка лицензий...</span>
            </div>
          ) : filteredLicenses.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Лицензии не найдены</p>
            </div>
          ) : (
            <>
              {/* Licenses Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {filteredLicenses.map((license) => (
                  <div
                    key={license.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                        {license.category_display || getCategoryLabel(license.category)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{license.title}</h3>
                    {license.description && (
                      <p className="text-sm text-gray-600 mb-4">{license.description}</p>
                    )}
                    
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Номер:</span>
                        <span className="font-medium text-gray-900">{license.number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Выдана:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(license.issued_date).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      {license.valid_until && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Действует до:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(license.valid_until).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      )}
                    </div>

                    {license.file_url ? (
                      <button
                        onClick={() => handleDownload(license)}
                        className="flex items-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Скачать документ
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
                        <FileText className="w-4 h-4" />
                        Файл недоступен
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">О лицензиях</h3>
            <p className="text-gray-700 mb-4">
              Все лицензии выданы уполномоченными органами Республики Казахстан и подтверждают 
              право ТОО «Unicover» на выполнение соответствующих видов работ. Лицензии регулярно 
              обновляются и проходят необходимые процедуры переоформления.
            </p>
            <p className="text-gray-700">
              Для получения дополнительной информации о лицензиях или запроса копий документов, 
              пожалуйста, свяжитесь с нами через{' '}
              <Link to="/contacts" className="text-blue-600 hover:underline font-medium">
                форму обратной связи
              </Link>.
            </p>
          </div>
        </div>
      </main>
      <FooterUnicover />
    </>
  );
}

