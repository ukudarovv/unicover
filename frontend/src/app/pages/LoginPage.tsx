import { Header } from '../components/Header';
import { LoginForm } from '../components/LoginForm';
import { FooterUnicover } from '../components/FooterUnicover';

export function LoginPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <LoginForm />
      </main>
      <FooterUnicover />
    </>
  );
}
