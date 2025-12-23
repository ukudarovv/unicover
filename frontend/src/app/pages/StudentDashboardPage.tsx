import { Header } from '../components/Header';
import { StudentDashboard } from '../components/lms/StudentDashboard';
import { FooterUnicover } from '../components/FooterUnicover';

export function StudentDashboardPage() {
  return (
    <>
      <Header />
      <StudentDashboard />
      <FooterUnicover />
    </>
  );
}
