import { Header } from '../components/Header';
import { ContactsUnicover } from '../components/ContactsUnicover';
import { FooterUnicover } from '../components/FooterUnicover';

export function ContactsPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <ContactsUnicover />
      </main>
      <FooterUnicover />
    </>
  );
}