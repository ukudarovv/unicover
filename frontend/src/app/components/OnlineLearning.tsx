import { Monitor, BookOpen, FileCheck, Clock, Video, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function OnlineLearning() {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: Monitor,
      title: t('education.online.features.remoteAccess.title'),
      description: t('education.online.features.remoteAccess.description'),
    },
    {
      icon: Video,
      title: t('education.online.features.videoLectures.title'),
      description: t('education.online.features.videoLectures.description'),
    },
    {
      icon: FileCheck,
      title: t('education.online.features.onlineTesting.title'),
      description: t('education.online.features.onlineTesting.description'),
    },
    {
      icon: Award,
      title: t('education.online.features.certificates.title'),
      description: t('education.online.features.certificates.description'),
    },
    {
      icon: Clock,
      title: t('education.online.features.flexibleSchedule.title'),
      description: t('education.online.features.flexibleSchedule.description'),
    },
    {
      icon: BookOpen,
      title: t('education.online.features.learningHistory.title'),
      description: t('education.online.features.learningHistory.description'),
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
            {t('education.online.title')}
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            {t('education.online.subtitle')}
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
      </div>
    </section>
  );
}
