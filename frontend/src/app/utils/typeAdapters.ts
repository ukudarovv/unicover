/**
 * Адаптеры для преобразования типов между frontend и backend
 */
import { Question, Protocol, Signature, TestAttempt as FrontendTestAttempt } from '../types/lms';

/**
 * Преобразование вопроса из backend в frontend формат
 */
export function adaptQuestion(backendQuestion: any): Question {
  return {
    id: String(backendQuestion.id),
    type: backendQuestion.type,
    text: backendQuestion.text,
    options: backendQuestion.options?.map((opt: any) => opt.text) || [],
    correctAnswer: backendQuestion.options?.find((opt: any) => opt.is_correct)?.text || 
                   backendQuestion.options?.filter((opt: any) => opt.is_correct).map((opt: any) => opt.text),
    order: backendQuestion.order,
    weight: backendQuestion.weight || 1,
  };
}

/**
 * Преобразование протокола из backend в frontend формат
 */
export function adaptProtocol(backendProtocol: any): Protocol {
  console.log('adaptProtocol - raw backend data:', backendProtocol);
  console.log('adaptProtocol - student:', backendProtocol.student);
  console.log('adaptProtocol - course:', backendProtocol.course);
  console.log('adaptProtocol - attempt:', backendProtocol.attempt);
  
  // Обработка даты экзамена
  let examDate: Date;
  if (backendProtocol.exam_date) {
    examDate = new Date(backendProtocol.exam_date);
    // Проверка на валидность даты
    if (isNaN(examDate.getTime())) {
      examDate = new Date(); // Fallback к текущей дате если дата невалидна
    }
  } else {
    examDate = new Date(); // Fallback к текущей дате если дата отсутствует
  }
  
  // Извлекаем данные студента
  const studentFullName = backendProtocol.student?.full_name || backendProtocol.student_name || null;
  const studentIIN = backendProtocol.student?.iin || null;
  const studentPhone = backendProtocol.student?.phone || backendProtocol.student_phone || null;
  
  // Извлекаем данные курса
  const courseTitle = backendProtocol.course?.title || backendProtocol.course_name || null;
  
  console.log('adaptProtocol - extracted data:', {
    studentFullName,
    studentIIN,
    studentPhone,
    courseTitle,
  });
  
  const adapted = {
    id: String(backendProtocol.id),
    number: backendProtocol.number,
    userId: String(backendProtocol.student?.id || backendProtocol.student || ''),
    userName: studentFullName || 'Не указано',
    userIIN: studentIIN || 'Не указано',
    userPhone: studentPhone || 'Не указано',
    courseId: String(backendProtocol.course?.id || backendProtocol.course || ''),
    courseName: courseTitle || 'Не указано',
    attemptId: backendProtocol.attempt?.id 
      ? String(backendProtocol.attempt.id) 
      : backendProtocol.attempt 
        ? String(backendProtocol.attempt)
        : 'Не указано',
    examDate: examDate,
    score: backendProtocol.score || 0,
    passingScore: backendProtocol.passing_score || 0,
    result: backendProtocol.result || 'passed',
    status: backendProtocol.status,
    signatures: (backendProtocol.signatures || []).map((sig: any) => adaptSignature(sig)),
    rejectionReason: backendProtocol.rejection_reason,
  };
  
  console.log('adaptProtocol - adapted result:', adapted);
  
  return adapted;
}

/**
 * Преобразование подписи из backend в frontend формат
 */
export function adaptSignature(backendSignature: any): Signature {
  const signerId = backendSignature.signer?.id || backendSignature.user_id || backendSignature.signer;
  return {
    signer: backendSignature.signer ? {
      id: String(backendSignature.signer.id),
      full_name: backendSignature.signer.full_name || '',
      phone: backendSignature.signer.phone || '',
    } : undefined,
    userId: signerId ? String(signerId) : undefined,
    userName: backendSignature.signer?.full_name || backendSignature.user_name || '',
    role: backendSignature.role,
    phone: backendSignature.signer?.phone || backendSignature.phone || '',
    signed_at: backendSignature.signed_at,
    signedAt: backendSignature.signed_at ? new Date(backendSignature.signed_at) : undefined,
    otp_verified: backendSignature.otp_verified,
    otpVerified: backendSignature.otp_verified || backendSignature.otpVerified || false,
  };
}

/**
 * Преобразование попытки теста из backend в frontend формат
 */
export function adaptTestAttempt(backendAttempt: any): FrontendTestAttempt {
  return {
    id: String(backendAttempt.id),
    testId: String(backendAttempt.test?.id || backendAttempt.test),
    userId: String(backendAttempt.student?.id || backendAttempt.student),
    startedAt: new Date(backendAttempt.started_at),
    completedAt: backendAttempt.completed_at ? new Date(backendAttempt.completed_at) : undefined,
    score: backendAttempt.score,
    passed: backendAttempt.passed,
    answers: (backendAttempt.answers || []).map((ans: any) => ({
      questionId: String(ans.question?.id || ans.question),
      answer: ans.answer_text || ans.selected_options?.map((opt: any) => opt.text) || ans.answer || '',
      isCorrect: ans.is_correct,
    })),
    ipAddress: backendAttempt.ip_address,
    userAgent: backendAttempt.user_agent,
  };
}

