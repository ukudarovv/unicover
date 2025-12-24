import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Circle, AlertTriangle, ArrowLeft, ArrowRight, Flag } from 'lucide-react';
import { Question, Answer } from '../../types/lms';
import { examsService } from '../../services/exams';

interface TestInterfaceProps {
  testId: string;
  attemptId?: number; // ID попытки для автосохранения
  title: string;
  timeLimit?: number; // минуты
  questions: Question[];
  onComplete: (answers: Answer[], timeSpent: number) => void;
  onCancel: () => void;
  inModal?: boolean; // Флаг для использования в модальном окне
}

export function TestInterface({ 
  testId,
  attemptId,
  title, 
  timeLimit, 
  questions, 
  onComplete, 
  onCancel,
  inModal = false
}: TestInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(
    questions.map(q => ({ questionId: q.id, answer: '' }))
  );
  const [timeLeft, setTimeLeft] = useState(timeLimit ? timeLimit * 60 : null); // секунды
  const [startTime] = useState(Date.now());
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  // Таймер
  useEffect(() => {
    if (timeLeft === null) return;
    
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Автосохранение
  useEffect(() => {
    const saveAnswer = async () => {
      if (answers[currentQuestionIndex]?.questionId) {
        setAutoSaveStatus('saving');
        try {
          // Получаем attempt_id из localStorage или пропсов
          const savedProgress = localStorage.getItem(`test_${testId}_progress`);
          const progress = savedProgress ? JSON.parse(savedProgress) : null;
          const attemptId = progress?.attemptId;
          
          const currentAttemptId = attemptId || (() => {
            const savedProgress = localStorage.getItem(`test_${testId}_progress`);
            if (savedProgress) {
              const progress = JSON.parse(savedProgress);
              return progress.attemptId;
            }
            return null;
          })();
          
          if (currentAttemptId && answers[currentQuestionIndex]) {
            const answer = answers[currentQuestionIndex];
            const questionId = answer.questionId;
            
            // Определяем тип ответа
            let answerData: any = { question: questionId };
            if (Array.isArray(answer.answer)) {
              answerData.selected_options = answer.answer;
            } else {
              answerData.answer_text = answer.answer;
            }
            
            await examsService.saveAnswer(Number(currentAttemptId), answerData);
            setAutoSaveStatus('saved');
          } else {
            // Fallback на localStorage если attempt_id нет
            localStorage.setItem(`test_${testId}_progress`, JSON.stringify({
              answers,
              currentQuestionIndex,
              timeLeft,
              attemptId: currentAttemptId,
            }));
            setAutoSaveStatus('saved');
          }
        } catch (error) {
          console.error('Auto-save error:', error);
          setAutoSaveStatus('error');
          // Fallback на localStorage
          localStorage.setItem(`test_${testId}_progress`, JSON.stringify({
            answers,
            currentQuestionIndex,
            timeLeft,
          }));
        }
      }
    };

    const saveTimer = setTimeout(saveAnswer, 1000);
    return () => clearTimeout(saveTimer);
  }, [answers, currentQuestionIndex, testId]);

  // Предотвращение случайного закрытия
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleAnswerChange = (answer: string | string[]) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      answer,
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    localStorage.removeItem(`test_${testId}_progress`);
    onComplete(answers, timeSpent);
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isAnswered = (index: number) => {
    const answer = answers[index].answer;
    if (Array.isArray(answer)) {
      return answer.length > 0;
    }
    return answer !== '';
  };

  const answeredCount = answers.filter((_, i) => isAnswered(i)).length;

  return (
    <div className={inModal ? "bg-gray-50" : "min-h-screen bg-gray-50 pt-20"}>
      <div className={inModal ? "px-4 py-4 max-w-6xl" : "container mx-auto px-4 py-8 max-w-6xl"}>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Вопрос {currentQuestionIndex + 1} из {questions.length}
              </p>
            </div>
            
            {timeLeft !== null && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Прогресс прохождения</span>
              <span>{answeredCount} из {questions.length} отвечено</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Auto-save indicator */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              {autoSaveStatus === 'saved' && <CheckCircle className="w-3 h-3 text-green-600" />}
              {autoSaveStatus === 'saving' && <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
              <span>{autoSaveStatus === 'saved' ? 'Сохранено' : 'Сохранение...'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-3">Вопросы</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`aspect-square rounded-lg font-medium text-sm transition-all ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                        : isAnswered(index)
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="text-gray-600">Текущий</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span className="text-gray-600">Отвечено</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span className="text-gray-600">Не отвечено</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-8">
              {/* Question Text */}
              <div className="mb-8">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                    {currentQuestionIndex + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-lg text-gray-900 leading-relaxed">
                      {currentQuestion.text}
                    </p>
                    {currentQuestion.weight && currentQuestion.weight > 1 && (
                      <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                        {currentQuestion.weight} балла
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.type === 'single_choice' && currentQuestion.options?.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      currentAnswer.answer === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={currentAnswer.answer === option}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="mt-1"
                    />
                    <span className="flex-1 text-gray-800">{option}</span>
                  </label>
                ))}

                {currentQuestion.type === 'multiple_choice' && currentQuestion.options?.map((option, index) => {
                  const selectedAnswers = Array.isArray(currentAnswer.answer) ? currentAnswer.answer : [];
                  return (
                    <label
                      key={index}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAnswers.includes(option)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={option}
                        checked={selectedAnswers.includes(option)}
                        onChange={(e) => {
                          const newAnswers = e.target.checked
                            ? [...selectedAnswers, option]
                            : selectedAnswers.filter(a => a !== option);
                          handleAnswerChange(newAnswers);
                        }}
                        className="mt-1"
                      />
                      <span className="flex-1 text-gray-800">{option}</span>
                    </label>
                  );
                })}

                {currentQuestion.type === 'yes_no' && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleAnswerChange('Да')}
                      className={`p-4 border-2 rounded-lg font-medium transition-all ${
                        currentAnswer.answer === 'Да'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300 text-gray-700'
                      }`}
                    >
                      Да
                    </button>
                    <button
                      onClick={() => handleAnswerChange('Нет')}
                      className={`p-4 border-2 rounded-lg font-medium transition-all ${
                        currentAnswer.answer === 'Нет'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-red-300 text-gray-700'
                      }`}
                    >
                      Нет
                    </button>
                  </div>
                )}

                {currentQuestion.type === 'short_answer' && (
                  <textarea
                    value={currentAnswer.answer as string}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Введите ваш ответ..."
                    rows={4}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </button>

                <div className="flex gap-3">
                  {currentQuestionIndex === questions.length - 1 ? (
                    <button
                      onClick={() => setShowConfirmSubmit(true)}
                      className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                    >
                      <Flag className="w-4 h-4" />
                      Завершить тест
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Далее
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl ring-4 ring-white ring-opacity-50 max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Завершить тестирование?</h2>
            </div>
            
            <div className="mb-6 space-y-3">
              <p className="text-gray-600">
                Вы ответили на <strong>{answeredCount}</strong> из <strong>{questions.length}</strong> вопросов.
              </p>
              {answeredCount < questions.length && (
                <p className="text-yellow-600 text-sm">
                  ⚠️ Некоторые вопросы остались без ответа. Они будут засчитаны как неправильные.
                </p>
              )}
              <p className="text-sm text-gray-500">
                После завершения вы не сможете изменить ответы.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Продолжить тест
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                Завершить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
