import { Header } from '../components/Header';
import { Dashboard } from '../components/Dashboard';
import { FooterUnicover } from '../components/FooterUnicover';

export function DashboardPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <Dashboard />
      </main>
      <FooterUnicover />
    </>
  );
}
