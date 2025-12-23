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
  return {
    id: String(backendProtocol.id),
    number: backendProtocol.number,
    userId: String(backendProtocol.student?.id || backendProtocol.student),
    userName: backendProtocol.student?.full_name || backendProtocol.student_name || '',
    userIIN: backendProtocol.student?.iin,
    userPhone: backendProtocol.student?.phone || backendProtocol.student_phone || '',
    courseId: String(backendProtocol.course?.id || backendProtocol.course),
    courseName: backendProtocol.course?.title || backendProtocol.course_name || '',
    attemptId: String(backendProtocol.attempt?.id || backendProtocol.attempt),
    examDate: new Date(backendProtocol.exam_date),
    score: backendProtocol.score,
    passingScore: backendProtocol.passing_score,
    result: backendProtocol.result,
    status: backendProtocol.status,
    signatures: (backendProtocol.signatures || []).map((sig: any) => adaptSignature(sig)),
    rejectionReason: backendProtocol.rejection_reason,
  };
}

/**
 * Преобразование подписи из backend в frontend формат
 */
export function adaptSignature(backendSignature: any): Signature {
  return {
    userId: String(backendSignature.signer?.id || backendSignature.user_id || backendSignature.signer),
    userName: backendSignature.signer?.full_name || backendSignature.user_name || '',
    role: backendSignature.role,
    phone: backendSignature.signer?.phone || backendSignature.phone || '',
    signedAt: backendSignature.signed_at ? new Date(backendSignature.signed_at) : undefined,
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

