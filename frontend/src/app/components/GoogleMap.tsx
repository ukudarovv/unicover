import { MapPin } from 'lucide-react';

interface GoogleMapProps {
  address?: string;
  latitude?: number;
  longitude?: number;
  height?: string;
  className?: string;
}

export function GoogleMap({ 
  address = 'г. Атырау, ул. Студенческий 25, БЦ Bayterek Plaza',
  latitude = 47.1,
  longitude = 51.9,
  height = '400px',
  className = ''
}: GoogleMapProps) {
  // Google Maps Embed API URL
  // Можно использовать либо координаты, либо адрес
  const mapUrl = address
    ? `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(address)}`
    : `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&q=${latitude},${longitude}`;

  // Fallback: если нет API key, используем публичный embed с координатами
  const fallbackUrl = `https://www.google.com/maps?q=${latitude},${longitude}&hl=ru&z=15&output=embed`;

  const finalUrl = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? mapUrl : fallbackUrl;

  return (
    <div className={`rounded-xl overflow-hidden border border-gray-300 shadow-md ${className}`} style={{ height }}>
      {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
        <iframe
          src={finalUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Карта расположения офиса UniCover"
        />
      ) : (
        <div className="relative w-full h-full">
          <iframe
            src={fallbackUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Карта расположения офиса UniCover"
          />
          <div className="absolute bottom-2 right-2 bg-white px-3 py-1 rounded-lg shadow-sm text-xs text-gray-600">
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <MapPin className="w-3 h-3" />
              Открыть в Google Maps
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

