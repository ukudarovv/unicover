import { Header } from '../components/Header';
import { PDEKDashboard } from '../components/lms/PDEKDashboard';
import { FooterUnicover } from '../components/FooterUnicover';

export function PDEKDashboardPage() {
  return (
    <>
      <Header />
      <PDEKDashboard />
      <FooterUnicover />
    </>
  );
}
