import { ImageWithFallback } from './figma/ImageWithFallback';
import { Building2, Calendar, MapPin } from 'lucide-react';

export function Projects() {
  const projects = [
    {
      title: 'Промышленный комплекс',
      category: 'Производственное строительство',
      location: 'г. Атырау',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBidWlsZGluZ3xlbnwwfHx8fDE3MzQ4MDA2NDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Полный цикл работ: проектирование, изыскания, строительство производственного объекта',
    },
    {
      title: 'Офисный центр',
      category: 'Гражданское строительство',
      location: 'г. Атырау',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1694702740570-0a31ee1525c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjYzMDk4MjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Архитектурное проектирование и строительство современного бизнес-центра',
    },
    {
      title: 'Инженерные сети',
      category: 'Инфраструктурные работы',
      location: 'Атырауская область',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBwcmVzZW50YXRpb258ZW58MXx8fHwxNzY2MzI1MDQxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Проектирование и монтаж инженерных систем для промышленного объекта',
    },
    {
      title: 'Реконструкция объекта',
      category: 'Реконструкция',
      location: 'г. Атырау',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1709715357520-5e1047a2b691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBtZWV0aW5nfGVufDF8fHx8MTc2NjI5NTA4OHww&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Капитальный ремонт и модернизация производственного здания',
    },
  ];

  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-4">
            <Building2 className="w-5 h-5" />
            <span className="font-medium">Портфолио</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Выполненные работы
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Примеры успешно реализованных проектов в области проектирования и строительства
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
            >
              <div className="relative overflow-hidden h-64">
                <ImageWithFallback
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {project.category}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{project.year}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
