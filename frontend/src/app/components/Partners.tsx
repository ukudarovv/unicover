import { Handshake } from 'lucide-react';

export function Partners() {
  const partners = [
    { name: 'Партнер 1', logo: 'P1' },
    { name: 'Партнер 2', logo: 'P2' },
    { name: 'Партнер 3', logo: 'P3' },
    { name: 'Партнер 4', logo: 'P4' },
    { name: 'Партнер 5', logo: 'P5' },
    { name: 'Партнер 6', logo: 'P6' },
  ];

  return (
    <section id="partners" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full mb-4">
            <Handshake className="w-5 h-5" />
            <span className="font-medium">Наши партнеры</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Партнеры и клиенты
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Мы гордимся доверием ведущих компаний Казахстана
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 flex items-center justify-center hover:border-blue-600 hover:bg-blue-50 transition-colors group"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <span className="font-bold">{partner.logo}</span>
                </div>
                <p className="text-sm font-medium text-gray-700">{partner.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}