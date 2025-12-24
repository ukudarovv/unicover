import { X, CheckCircle, XCircle, Clock, RotateCcw, ArrowLeft } from 'lucide-react';
import { Test, TestAttempt } from '../../types/lms';

interface TestResultModalProps {
  test: Test;
  result: TestAttempt;
  attemptsUsed: number;
  attemptsTotal: number;
  timeSpent: number; // в секундах
  onClose: () => void;
  onRetry?: () => void;
  onBackToCourse?: () => void;
}

export function TestResultModal({
  test,
  result,
  attemptsUsed,
  attemptsTotal,
  timeSpent,
  onClose,
  onRetry,
  onBackToCourse,
}: TestResultModalProps) {
  const score = result.score || 0;
  const passed = result.passed || false;
  const passingScore = test.passingScore || test.passing_score || 80;
  const remainingAttempts = attemptsTotal - attemptsUsed;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} мин ${secs} сек`;
    }
    return `${secs} сек`;
  };

  // Форматирование даты для отображения
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '—';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div className="bg-white rounded-lg shadow-2xl ring-4 ring-white ring-opacity-50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900">Результаты теста</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Result Icon and Title */}
          <div className="text-center mb-6">
            {passed ? (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Тест успешно пройден!</h3>
                <p className="text-gray-600">Поздравляем с успешным прохождением проверочного теста</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Тест не пройден</h3>
                <p className="text-gray-600">К сожалению, вы не набрали проходной балл</p>
              </>
            )}
          </div>

          {/* Statistics */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Ваш результат</p>
                <p className={`text-4xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {score.toFixed(1)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Проходной балл</p>
                <p className="text-4xl font-bold text-gray-900">{passingScore}%</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Время прохождения</p>
                    <p className="text-sm font-semibold text-gray-900">{formatTime(timeSpent)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Попытки</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {attemptsUsed} из {attemptsTotal}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Прогресс выполнения</span>
              <span>{score.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  passed ? 'bg-green-600' : 'bg-red-600'
                }`}
                style={{ width: `${Math.min(score, 100)}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>0%</span>
              <span className="font-semibold">{passingScore}% (проходной балл)</span>
              <span>100%</span>
            </div>
          </div>

          {/* Messages */}
          {passed ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Урок будет автоматически отмечен как завершенный. Вы можете продолжить изучение курса.
              </p>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-orange-800 mb-2">
                {remainingAttempts > 0 
                  ? `У вас осталось ${remainingAttempts} ${remainingAttempts === 1 ? 'попытка' : remainingAttempts < 5 ? 'попытки' : 'попыток'}. Рекомендуем повторить материал урока перед следующей попыткой.`
                  : 'Все попытки использованы. Обратитесь к администратору для получения дополнительных попыток.'
                }
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            {onBackToCourse && (
              <button
                onClick={onBackToCourse}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Вернуться к курсу
              </button>
            )}
            {!passed && remainingAttempts > 0 && onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                Попробовать снова
              </button>
            )}
            {!onBackToCourse && (
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Закрыть
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

