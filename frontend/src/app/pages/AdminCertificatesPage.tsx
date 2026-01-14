import { Header } from '../components/Header';
import { FooterUnicover } from '../components/FooterUnicover';
import { CertificateManagement } from '../components/admin/CertificateManagement';

export function AdminCertificatesPage() {
  return (
    <>
      <Header />
      <CertificateManagement />
      <FooterUnicover />
    </>
  );
}
