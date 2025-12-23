import { Header } from '../components/Header';
import { FooterUnicover } from '../components/FooterUnicover';
import { AdminDashboard } from '../components/lms/AdminDashboard';

export function AdminDashboardPage() {
  return (
    <>
      <Header />
      <AdminDashboard />
      <FooterUnicover />
    </>
  );
}
