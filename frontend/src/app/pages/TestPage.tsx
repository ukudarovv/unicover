import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { FooterUnicover } from '../components/FooterUnicover';
import { TestInterface } from '../components/lms/TestInterface';
import { Answer } from '../types/lms';
import { CheckCircle, XCircle } from 'lucide-react';
import { useTest } from '../hooks/useTests';
import { examsService } from '../services/exams';
import { toast } from 'sonner';

export function TestPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { test, loading: testLoading } = useTest(testId);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResult, setTestResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [starting, setStarting] = useState(false);

  // Начинаем попытку при загрузке теста
  useEffect(() => {
    if (test && !attemptId && !starting) {
      const startAttempt = async () => {
        try {
          setStarting(true);
          const attempt = await examsService.startTestAttempt(test.id);
          const attemptIdNum = Number(attempt.id);
          setAttemptId(attemptIdNum);
          // Сохраняем attemptId в localStorage для автосохранения
          localStorage.setItem(`test_${test.id}_progress`, JSON.stringify({
            attemptId: attemptIdNum,
          }));
        } catch (error: any) {
          toast.error(error.message || 'Ошибка при начале теста');
          navigate('/student/dashboard');
        } finally {
          setStarting(false);
        }
      };
      startAttempt();
    }
  }, [test, attemptId, starting, navigate]);

  const handleTestComplete = async (answers: Answer[], timeSpent: number) => {
    if (!attemptId) return;

    try {
      const result = await examsService.submitTestAttempt(String(attemptId));
      setTestResult({ 
        score: result.score || 0, 
        passed: result.passed || false 
      });
      setTestCompleted(true);
      
      if (result.passed) {
        toast.success('Тест успешно сдан!');
      } else {
        toast.error('Тест не сдан. Попробуйте еще раз.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при завершении теста');
    }
  };

  const handleCancel = () => {
    navigate('/student/dashboard');
  };

  if (testCompleted && testResult) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              {testResult.passed ? (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Тест успешно сдан!</h1>
                  <p className="text-gray-600 mb-6">Поздравляем с успешным прохождением экзамена</p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Тест не сдан</h1>
                  <p className="text-gray-600 mb-6">К сожалению, вы не набрали проходной балл</p>
                </>
              )}

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ваш результат</p>
                    <p className={`text-3xl font-bold ${testResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {testResult.score}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Проходной балл</p>
                    <p className="text-3xl font-bold text-gray-900">80%</p>
                  </div>
                </div>
              </div>

              {testResult.passed ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    Протокол экзамена сформирован и отправлен на утверждение комиссии ПДЭК.
                    После подписания протокола вы получите сертификат.
                  </p>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-orange-800">
                    У вас осталось 2 попытки. Рекомендуем повторить материал курса перед следующей попыткой.
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/student/dashboard')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Вернуться к курсам
                </button>
                {testResult.passed && (
                  <button
                    onClick={() => navigate('/student/documents')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Посмотреть протокол
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <FooterUnicover />
      </>
    );
  }

  if (testLoading || starting || !test || !attemptId) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {starting ? 'Начало теста...' : 'Загрузка теста...'}
            </p>
          </div>
        </div>
        <FooterUnicover />
      </>
    );
  }

  if (!test.questions || test.questions.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Тест не найден</h1>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться к курсам
            </button>
          </div>
        </div>
        <FooterUnicover />
      </>
    );
  }

  return (
    <>
      <Header />
      <TestInterface
        testId={testId || test.id}
        attemptId={attemptId}
        title={test.title}
        timeLimit={test.timeLimit || test.time_limit || 30}
        questions={test.questions || []}
        onComplete={handleTestComplete}
        onCancel={handleCancel}
      />
      <FooterUnicover />
    </>
  );
}
