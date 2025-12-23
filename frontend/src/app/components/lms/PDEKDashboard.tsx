import { useState } from 'react';
import { FileText, CheckCircle, Clock, AlertTriangle, Phone } from 'lucide-react';
import { Protocol } from '../../types/lms';
import { SMSVerification } from './SMSVerification';
import { useProtocols } from '../../hooks/useProtocols';
import { protocolsService } from '../../services/protocols';
import { useUser } from '../../contexts/UserContext';
import { toast } from 'sonner';

export function PDEKDashboard() {
  const { user: currentUser } = useUser();
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [protocolToSign, setProtocolToSign] = useState<Protocol | null>(null);
  const [loading, setLoading] = useState(false);

  const isChairman = currentUser?.role === 'pdek_chairman';
  
  // Получаем протоколы через API
  const { protocols, loading: protocolsLoading, refetch } = useProtocols();
  
  // Фильтруем протоколы для подписания
  const pendingProtocols = protocols.filter(p => 
    p.status === 'pending_pdek' || (isChairman && p.status === 'signed_members')
  );

  const signedProtocols = protocols.filter(p => {
    if (!currentUser) return false;
    const userSignature = p.signatures?.find(s => s.signer?.id === currentUser.id || s.userId === currentUser.id);
    return userSignature?.otp_verified || userSignature?.otpVerified;
  });

  const handleSignRequest = async (protocol: Protocol) => {
    try {
      setLoading(true);
      await protocolsService.requestSignature(protocol.id);
      setProtocolToSign(protocol);
      setShowSMSModal(true);
      toast.success('OTP код отправлен на ваш телефон');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при запросе подписи');
    } finally {
      setLoading(false);
    }
  };

  const handleSMSVerified = async (otp: string) => {
    if (!protocolToSign) return;

    try {
      setLoading(true);
      await protocolsService.signProtocol(protocolToSign.id, otp);
      toast.success('Протокол успешно подписан');
      setShowSMSModal(false);
      setProtocolToSign(null);
      refetch(); // Обновляем список протоколов
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при подписании протокола');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isChairman ? 'Председатель ПДЭК' : 'Член комиссии ПДЭК'}
          </h1>
          <p className="text-gray-600">
            {currentUser.fullName || 'Комиссия по проверке и допуску к экзаменационным квалификациям'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-orange-600">{pendingProtocols.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Ожидают подписи</h3>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">{signedProtocols.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Подписано мной</h3>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {pendingProtocols.length + signedProtocols.length}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Всего протоколов</h3>
          </div>
        </div>

        {/* Pending Protocols */}
        {pendingProtocols.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Протоколы на подпись</h2>
            <div className="space-y-4">
              {pendingProtocols.map(protocol => (
                <div key={protocol.id} className="bg-white rounded-lg shadow-md border-l-4 border-orange-500">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">Протокол №{protocol.number}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            protocol.status === 'pending_pdek' 
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {protocol.status === 'pending_pdek' ? 'Ожидает подписи' : 'Подписан членами'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{protocol.courseName}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Слушатель:</span>
                            <p className="font-medium text-gray-900">{protocol.userName}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">ИИН:</span>
                            <p className="font-medium text-gray-900">{protocol.userIIN}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Дата экзамена:</span>
                            <p className="font-medium text-gray-900">
                              {new Date(protocol.examDate).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Результат:</span>
                            <p className="font-medium text-green-600">{protocol.score}% (сдал)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Signatures Status */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Статус подписей:</h4>
                      <div className="space-y-2">
                        {protocol.signatures.map(sig => (
                          <div key={sig.userId} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {sig.otpVerified ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-sm">
                                {sig.userName} ({sig.role === 'chairman' ? 'Председатель' : 'Член комиссии'})
                              </span>
                            </div>
                            {sig.otpVerified && sig.signedAt && (
                              <span className="text-xs text-gray-500">
                                {new Date(sig.signedAt).toLocaleString('ru-RU')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedProtocol(protocol)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Подробнее
                      </button>
                      <button
                        onClick={() => handleSignRequest(protocol)}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <Phone className="w-4 h-4" />
                        Подписать (SMS)
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signed Protocols */}
        {signedProtocols.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Подписанные протоколы</h2>
            <div className="space-y-4">
              {signedProtocols.map(protocol => (
                <div key={protocol.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">Протокол №{protocol.number}</h3>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Подписан
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{protocol.courseName}</p>
                      <p className="text-sm text-gray-500">{protocol.userName}</p>
                    </div>
                    <button
                      onClick={() => setSelectedProtocol(protocol)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Просмотр
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No protocols message */}
        {pendingProtocols.length === 0 && signedProtocols.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Нет протоколов</h3>
            <p className="text-gray-600">Протоколы для подписи появятся здесь после сдачи экзаменов</p>
          </div>
        )}
      </div>

      {/* Protocol Details Modal */}
      {selectedProtocol && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl ring-4 ring-white ring-opacity-50 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Протокол №{selectedProtocol.number}</h2>
                <button
                  onClick={() => setSelectedProtocol(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Информация о слушателе</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">ФИО:</span>
                    <p className="font-medium">{selectedProtocol.userName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">ИИН:</span>
                    <p className="font-medium">{selectedProtocol.userIIN}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Телефон:</span>
                    <p className="font-medium">{selectedProtocol.userPhone}</p>
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Информация об экзамене</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Курс:</span>
                    <p className="font-medium">{selectedProtocol.courseName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Дата экзамена:</span>
                    <p className="font-medium">
                      {new Date(selectedProtocol.examDate).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Балл:</span>
                    <p className="font-medium text-green-600">{selectedProtocol.score}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Проходной балл:</span>
                    <p className="font-medium">{selectedProtocol.passingScore}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Результат:</span>
                    <p className="font-medium text-green-600">Сдал</p>
                  </div>
                  <div>
                    <span className="text-gray-500">ID попытки:</span>
                    <p className="font-medium font-mono text-xs">{selectedProtocol.attemptId}</p>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Подписи комиссии ПДЭК</h3>
                <div className="space-y-3">
                  {selectedProtocol.signatures.map(sig => (
                    <div key={sig.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{sig.userName}</p>
                        <p className="text-sm text-gray-600">
                          {sig.role === 'chairman' ? 'Председатель комиссии' : 'Член комиссии'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{sig.phone}</p>
                      </div>
                      <div className="text-right">
                        {sig.otpVerified && sig.signedAt ? (
                          <>
                            <CheckCircle className="w-6 h-6 text-green-600 ml-auto mb-1" />
                            <p className="text-xs text-gray-500">
                              {new Date(sig.signedAt).toLocaleString('ru-RU')}
                            </p>
                          </>
                        ) : (
                          <>
                            <Clock className="w-6 h-6 text-gray-400 ml-auto mb-1" />
                            <p className="text-xs text-gray-500">Ожидает подписи</p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedProtocol(null)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
              <button
                onClick={() => {
                  handleSignRequest(selectedProtocol);
                  setSelectedProtocol(null);
                }}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Подписать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Verification Modal */}
      {showSMSModal && protocolToSign && (
        <SMSVerification
          phone={currentUser.phone}
          onVerified={handleSMSVerified}
          onCancel={() => {
            setShowSMSModal(false);
            setProtocolToSign(null);
          }}
          title={`Подписание протокола №${protocolToSign.number}`}
          description="Для подтверждения вашей подписи введите код из SMS"
        />
      )}
    </div>
  );
}
