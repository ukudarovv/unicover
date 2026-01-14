import { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { ExtraAttemptRequest } from '../../types/lms';
import { examsService } from '../../services/exams';
import { toast } from 'sonner';

interface ExtraAttemptRequestModalProps {
  testId: string;
  existingRequest?: ExtraAttemptRequest | null;
  onSuccess: (request: ExtraAttemptRequest) => void;
  onCancel: () => void;
}

export function ExtraAttemptRequestModal({
  testId,
  existingRequest,
  onSuccess,
  onCancel,
}: ExtraAttemptRequestModalProps) {
  const [reason, setReason] = useState(existingRequest?.reason || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Пожалуйста, укажите причину запроса');
      return;
    }

    try {
      setLoading(true);
      const request = await examsService.createExtraAttemptRequest(testId, reason.trim());
      toast.success('Запрос успешно отправлен');
      onSuccess(request);
    } catch (error: any) {
      console.error('Error creating extra attempt request:', error);
      const errorMessage = error?.message || error?.data?.error || 'Ошибка при отправке запроса';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[70]">
      <div className="bg-white rounded-lg shadow-2xl ring-4 ring-white ring-opacity-50 max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Запрос на дополнительные попытки</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Причина запроса *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Опишите причину, по которой вам необходимы дополнительные попытки для прохождения теста..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="mt-2 text-xs text-gray-500">
              Администратор рассмотрит ваш запрос и примет решение в ближайшее время.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Отправка...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Отправить запрос
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

