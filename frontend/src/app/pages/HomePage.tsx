import { Header } from '../components/Header';
import { HeroUnicover } from '../components/HeroUnicover';
import { AboutUnicover } from '../components/AboutUnicover';
import { ConstructionSection } from '../components/ConstructionSection';
import { EducationSection } from '../components/EducationSection';
import { Partners } from '../components/Partners';
import { ContactsUnicover } from '../components/ContactsUnicover';
import { FooterUnicover } from '../components/FooterUnicover';

export function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroUnicover />
        <AboutUnicover />
        <ConstructionSection />
        <EducationSection />
        <Partners />
        <ContactsUnicover />
      </main>
      <FooterUnicover />
    </>
  );
}