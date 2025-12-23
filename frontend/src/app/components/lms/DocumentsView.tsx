import { useState, useEffect } from 'react';
import { Award, FileText, Download, ExternalLink, QrCode, Calendar, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import { Certificate, Protocol } from '../../types/lms';
import { certificatesService } from '../../services/certificates';
import { protocolsService } from '../../services/protocols';
import { adaptProtocol } from '../../utils/typeAdapters';
import { toast } from 'sonner';

export function DocumentsView() {
  const [activeTab, setActiveTab] = useState<'certificates' | 'protocols'>('certificates');
  const [searchQuery, setSearchQuery] = useState('');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [certsData, protocolsData] = await Promise.all([
          certificatesService.getCertificates(),
          protocolsService.getProtocols(),
        ]);
        setCertificates(certsData);
        setProtocols(protocolsData.map(adaptProtocol));
      } catch (error) {
        console.error('Failed to fetch documents:', error);
        toast.error('Ошибка загрузки документов');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCertificates = certificates.filter(cert =>
    cert.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProtocols = protocols.filter(protocol =>
    protocol.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    protocol.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои документы</h1>
          <p className="text-gray-600">Сертификаты, протоколы и справки об обучении</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('certificates')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === 'certificates'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Award className="w-5 h-5" />
                Сертификаты
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  {certificates.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('protocols')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === 'protocols'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-5 h-5" />
                Протоколы
                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                  {protocols.length}
                </span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по названию курса или номеру документа..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            {filteredCertificates.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {searchQuery ? 'Ничего не найдено' : 'Нет сертификатов'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'Завершите курс и сдайте экзамен для получения сертификата'}
                </p>
              </div>
            ) : (
              filteredCertificates.map(cert => (
                <CertificateCard key={cert.id} certificate={cert} />
              ))
            )}
          </div>
        )}

        {/* Protocols Tab */}
        {activeTab === 'protocols' && (
          <div className="space-y-4">
            {filteredProtocols.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {searchQuery ? 'Ничего не найдено' : 'Нет протоколов'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'Протоколы экзаменов появятся здесь после сдачи тестов'}
                </p>
              </div>
            ) : (
              filteredProtocols.map(protocol => (
                <ProtocolCard key={protocol.id} protocol={protocol} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CertificateCard({ certificate }: { certificate: Certificate }) {
  const handleDownloadPDF = async () => {
    try {
      const blob = await certificatesService.downloadPDF(certificate.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${certificate.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Сертификат скачан');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при скачивании сертификата');
    }
  };

  const verifyUrl = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}/verify/${certificate.qr_code}`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {certificate.course?.title || certificate.courseName}
              </h3>
              <p className="text-sm text-gray-600 mb-2">Сертификат №{certificate.number}</p>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Выдан: {new Date(certificate.issued_at || certificate.issuedAt).toLocaleDateString('ru-RU')}</span>
                </div>
                {certificate.valid_until || certificate.validUntil ? (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Действителен до: {new Date(certificate.valid_until || certificate.validUntil).toLocaleDateString('ru-RU')}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            Действителен
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Скачать PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <QrCode className="w-4 h-4" />
            QR-код: {certificate.qr_code || certificate.qrCode}
          </button>
          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Проверить подлинность
          </a>
        </div>
      </div>
    </div>
  );
}

function ProtocolCard({ protocol }: { protocol: Protocol }) {
  const handleDownloadPDF = async () => {
    try {
      const blob = await protocolsService.downloadPDF(protocol.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `protocol_${protocol.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Протокол скачан');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при скачивании протокола');
    }
  };

  const getStatusIcon = () => {
    switch (protocol.status) {
      case 'signed_chairman':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'signed_members':
      case 'pending_pdek':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (protocol.status) {
      case 'signed_chairman':
        return 'Утвержден';
      case 'signed_members':
        return 'Ожидает председателя';
      case 'pending_pdek':
        return 'На утверждении ПДЭК';
      case 'rejected':
        return 'Отклонен';
      default:
        return 'Сформирован';
    }
  };

  const getStatusColor = () => {
    switch (protocol.status) {
      case 'signed_chairman':
        return 'bg-green-100 text-green-800';
      case 'signed_members':
      case 'pending_pdek':
        return 'bg-orange-100 text-orange-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const signedCount = (protocol.signatures || []).filter(s => s.otp_verified || s.otpVerified).length;
  const totalSignatures = (protocol.signatures || []).length;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900">Протокол №{protocol.number}</h3>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
                {getStatusIcon()}
                {getStatusText()}
              </span>
            </div>
            <p className="text-gray-600 mb-3">{protocol.course?.title || protocol.courseName}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Дата экзамена:</span>
                <p className="font-medium text-gray-900">
                  {new Date(protocol.examDate).toLocaleDateString('ru-RU')}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Результат:</span>
                <p className={`font-medium ${protocol.result === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                  {protocol.score}% ({protocol.result === 'passed' ? 'Сдал' : 'Не сдал'})
                </p>
              </div>
              <div>
                <span className="text-gray-500">Проходной балл:</span>
                <p className="font-medium text-gray-900">{protocol.passingScore}%</p>
              </div>
              <div>
                <span className="text-gray-500">Подписи:</span>
                <p className="font-medium text-gray-900">{signedCount}/{totalSignatures}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Signatures Progress */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Подписи комиссии ПДЭК:</h4>
          <div className="space-y-2">
            {(protocol.signatures || []).map((sig, idx) => (
              <div key={sig.userId || sig.signer?.id || idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {(sig.otp_verified || sig.otpVerified) ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-gray-700">
                    {sig.signer?.full_name || sig.userName} ({sig.role === 'chairman' ? 'Председатель' : 'Член'})
                  </span>
                </div>
                {(sig.otp_verified || sig.otpVerified) && (sig.signed_at || sig.signedAt) && (
                  <span className="text-gray-500 text-xs">
                    {new Date(sig.signed_at || sig.signedAt).toLocaleString('ru-RU')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {protocol.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-red-900 mb-1">Причина отклонения:</h4>
            <p className="text-sm text-red-700">{protocol.rejectionReason}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <FileText className="w-4 h-4" />
            Просмотр протокола
          </button>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Скачать PDF
          </button>
        </div>
      </div>
    </div>
  );
}
