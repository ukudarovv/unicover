import { Header } from '../components/Header';
import { CoursesUnicover } from '../components/CoursesUnicover';
import { OnlineLearning } from '../components/OnlineLearning';
import { FooterUnicover } from '../components/FooterUnicover';

export function EducationPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Учебный центр UNICOVER</h1>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl">
            Профессиональное обучение с выдачей сертификатов и удостоверений по промышленной безопасности, охране труда и другим направлениям.
          </p>
        </div>
        <CoursesUnicover />
        <OnlineLearning />
      </main>
      <FooterUnicover />
    </>
  );
}