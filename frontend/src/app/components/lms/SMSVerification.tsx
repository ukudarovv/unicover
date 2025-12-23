import { useState, useEffect } from 'react';
import { Phone, Shield, CheckCircle } from 'lucide-react';

interface SMSVerificationProps {
  phone: string;
  onVerified: (otp: string) => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export function SMSVerification({ 
  phone, 
  onVerified, 
  onCancel,
  title = 'Подтверждение по SMS',
  description = 'Введите код подтверждения из SMS'
}: SMSVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120); // 2 минуты
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    setIsVerifying(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Demo: accept any 6-digit code or "123456"
    if (code.length === 6) {
      onVerified(code);
    } else {
      setError('Неверный код. Попробуйте еще раз.');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    }

    setIsVerifying(false);
  };

  const handleResend = () => {
    setTimeLeft(120);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
    // TODO: Call API to resend SMS
    console.log('SMS отправлена повторно на', phone);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskPhone = (phone: string) => {
    return phone.replace(/(\+7)(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 ($2) ***-**-$5');
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl ring-4 ring-white ring-opacity-50 max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 text-sm mb-4">{description}</p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <Phone className="w-4 h-4" />
            <span>Код отправлен на {maskPhone(phone)}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* OTP Input */}
        <div className="mb-6">
          <div className="flex gap-2 justify-center mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                disabled={isVerifying}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="text-center">
            {!canResend ? (
              <p className="text-sm text-gray-500">
                Код действителен: <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Отправить код повторно
              </button>
            )}
          </div>
        </div>

        {/* Demo Info */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800 text-center">
            <strong>Демо-режим:</strong> Введите любой 6-значный код для подтверждения
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={isVerifying}
          >
            Отмена
          </button>
          <button
            onClick={() => handleVerify(otp.join(''))}
            disabled={otp.some(d => !d) || isVerifying}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Проверка...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Подтвердить
              </>
            )}
          </button>
        </div>

        {/* Security Notice */}
        <p className="mt-6 text-xs text-gray-500 text-center">
          Код подтверждения действителен в течение 2 минут. Не сообщайте код третьим лицам.
        </p>
      </div>
    </div>
  );
}
