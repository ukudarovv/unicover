import { useState, useEffect } from 'react';
import { TrendingUp, Briefcase, FileText, Users, Calendar } from 'lucide-react';
import { vacanciesService, VacancyStatistics as VacancyStatisticsData } from '../../services/vacancies';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function VacancyStatistics() {
  const [statistics, setStatistics] = useState<VacancyStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const data = await vacanciesService.getStatistics();
        setStatistics(data);
      } catch (error: any) {
        console.error('Failed to fetch statistics:', error);
        toast.error('Ошибка загрузки статистики');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Статистика недоступна</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Статистика по вакансиям</h2>
        <p className="text-gray-600 mt-1">Аналитика вакансий и откликов</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего вакансий</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.vacancies.total}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <div>
              <span className="text-gray-500">Опубликовано:</span>
              <span className="ml-1 font-medium text-green-600">{statistics.vacancies.published}</span>
            </div>
            <div>
              <span className="text-gray-500">Черновики:</span>
              <span className="ml-1 font-medium text-gray-600">{statistics.vacancies.draft}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего откликов</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.applications.total}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <div>
              <span className="text-gray-500">Ожидают:</span>
              <span className="ml-1 font-medium text-yellow-600">{statistics.applications.pending}</span>
            </div>
            <div>
              <span className="text-gray-500">Рассмотрено:</span>
              <span className="ml-1 font-medium text-blue-600">{statistics.applications.reviewed}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Активных вакансий</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.vacancies.active}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="text-gray-500">Закрыто:</span>
            <span className="ml-1 font-medium text-red-600">{statistics.vacancies.closed}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Связались</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.applications.contacted}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="text-gray-500">Отклонено:</span>
            <span className="ml-1 font-medium text-red-600">{statistics.applications.rejected}</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Date */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Отклики по датам (последние 30 дней)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={statistics.applications_by_date}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}.${date.getMonth() + 1}`;
                }}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('ru-RU');
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Количество откликов"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Распределение по статусам
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statistics.status_distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {statistics.status_distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Vacancies */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Популярные вакансии (топ 10)
        </h3>
        {statistics.popular_vacancies.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Нет данных о популярных вакансиях</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={statistics.popular_vacancies} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="title" 
                type="category" 
                width={200}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="application_count" fill="#3B82F6" name="Количество откликов" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

