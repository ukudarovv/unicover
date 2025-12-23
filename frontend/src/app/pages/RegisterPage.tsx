import { Header } from '../components/Header';
import { RegisterForm } from '../components/RegisterForm';
import { FooterUnicover } from '../components/FooterUnicover';

export function RegisterPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <RegisterForm />
      </main>
      <FooterUnicover />
    </>
  );
}
