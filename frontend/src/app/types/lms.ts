// Роли пользователей
export type UserRole = 
  | 'guest'
  | 'student'
  | 'pdek_member'
  | 'pdek_chairman'
  | 'teacher'
  | 'admin';

// Статусы курса
export type CourseStatus =
  | 'in_development'
  | 'draft'
  | 'published'
  | 'assigned'
  | 'in_progress'
  | 'exam_available'
  | 'exam_passed'
  | 'completed'
  | 'failed'
  | 'annulled';

// Статусы протокола
export type ProtocolStatus =
  | 'generated'
  | 'pending_pdek'
  | 'signed_members'
  | 'signed_chairman'
  | 'rejected'
  | 'annulled';

// Статусы теста
export type TestStatus =
  | 'available'
  | 'in_progress'
  | 'pending_result'
  | 'passed'
  | 'failed';

// Категории курсов (старый формат для обратной совместимости)
export type CourseCategory =
  | 'industrial_safety'
  | 'fire_safety'
  | 'electrical_safety'
  | 'labor_protection'
  | 'professions'
  | string; // Для поддержки динамических категорий

// Интерфейс категории из API
export interface Category {
  id: string;
  name: string;
  name_kz?: string;
  name_en?: string;
  description?: string;
  icon?: string;
  order: number;
  is_active: boolean;
  courses_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Типы вопросов
export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'yes_no'
  | 'matching'
  | 'ordering'
  | 'short_answer';

// Интерфейсы

export interface User {
  id: string;
  role: UserRole;
  phone: string;
  iin?: string;
  full_name?: string; // Backend format
  fullName?: string; // Frontend format (for compatibility)
  email?: string;
  city?: string;
  organization?: string;
  verified: boolean;
  is_active?: boolean; // Backend format
  isActive?: boolean; // Frontend format (for compatibility)
  language: 'ru' | 'kz' | 'en';
  created_at?: string;
  updated_at?: string;
}

export interface Course {
  id: string;
  title: string;
  title_kz?: string; // Backend format
  titleKz?: string; // Frontend format (for compatibility)
  title_en?: string; // Backend format
  titleEn?: string; // Frontend format (for compatibility)
  category?: CourseCategory | Category | { id: string; name: string }; // Может быть строкой, объектом Category или объектом с id и name
  categoryId?: string; // ID категории для записи
  description: string;
  duration: number; // в часах
  format: 'online' | 'offline' | 'blended';
  passing_score?: number; // Backend format
  passingScore?: number; // Frontend format (for compatibility)
  max_attempts?: number; // Backend format
  maxAttempts?: number; // Frontend format (for compatibility)
  has_timer?: boolean; // Backend format
  hasTimer?: boolean; // Frontend format (for compatibility)
  timer_minutes?: number; // Backend format
  timerMinutes?: number; // Frontend format (for compatibility)
  modules?: Module[];
  pdek_commission?: string; // Backend format
  pdekCommission?: string; // Frontend format (for compatibility)
  status: CourseStatus;
  progress?: number; // процент (для enrollment)
  created_at?: string;
  updated_at?: string;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
  completed: boolean;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  type: 'text' | 'video' | 'pdf' | 'quiz';
  content?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  pdfUrl?: string;
  testId?: string;
  duration?: number; // минуты
  order: number;
  completed: boolean;
  required?: boolean;
  allowDownload?: boolean;
  trackProgress?: boolean;
  passingScore?: number;
  maxAttempts?: number;
}

export interface Test {
  id: string;
  course?: string | { id: string; title: string }; // Backend может вернуть ID или объект
  courseId?: string; // Frontend format
  title: string;
  passing_score?: number; // Backend format
  passingScore?: number; // Frontend format (for compatibility)
  time_limit?: number; // Backend format
  timeLimit?: number; // Frontend format (for compatibility)
  max_attempts?: number; // Backend format
  maxAttempts?: number; // Frontend format (for compatibility)
  is_active?: boolean; // Backend format
  questions_count?: number; // Backend format (readonly)
  questionsCount?: number; // Frontend format (for compatibility)
  attemptsUsed?: number; // Frontend only
  attemptsTotal?: number; // Frontend only
  status?: TestStatus; // Frontend only
  questions?: Question[];
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: Array<{ id: string; text: string; is_correct?: boolean }> | string[]; // Backend возвращает объекты
  correctAnswer?: string | string[]; // Frontend format (computed)
  order: number;
  weight: number;
}

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  passed?: boolean;
  answers: Answer[];
  ipAddress?: string;
  userAgent?: string;
}

export interface Answer {
  questionId: string;
  answer: string | string[];
  isCorrect?: boolean;
}

export interface Protocol {
  id: string;
  number: string;
  student?: { id: string; full_name: string; iin?: string; phone: string }; // Backend format
  userId?: string; // Frontend format (computed)
  userName?: string; // Frontend format (computed)
  userIIN?: string; // Frontend format (computed)
  userPhone?: string; // Frontend format (computed)
  course?: { id: string; title: string }; // Backend format
  courseId?: string; // Frontend format (computed)
  courseName?: string; // Frontend format (computed)
  attempt?: { id: string }; // Backend format
  attemptId?: string; // Frontend format (computed)
  exam_date?: string; // Backend format
  examDate?: Date | string; // Frontend format
  score: number;
  passing_score?: number; // Backend format
  passingScore?: number; // Frontend format (for compatibility)
  result: 'passed' | 'failed';
  status: ProtocolStatus;
  signatures?: Signature[];
  rejection_reason?: string; // Backend format
  rejectionReason?: string; // Frontend format (for compatibility)
  created_at?: string;
  updated_at?: string;
}

export interface Signature {
  signer?: { id: string; full_name: string; phone: string }; // Backend format
  userId?: string; // Frontend format (computed)
  userName?: string; // Frontend format (computed)
  role: 'member' | 'chairman';
  phone?: string; // Frontend format (computed)
  signed_at?: string; // Backend format
  signedAt?: Date | string; // Frontend format
  otp_verified?: boolean; // Backend format
  otpVerified?: boolean; // Frontend format (for compatibility)
}

export interface Certificate {
  id: string;
  number: string;
  student?: { id: string; full_name: string }; // Backend format
  userId?: string; // Frontend format (computed)
  userName?: string; // Frontend format (computed)
  course?: { id: string; title: string }; // Backend format
  courseId?: string; // Frontend format (computed)
  courseName?: string; // Frontend format (computed)
  protocol?: { id: string }; // Backend format
  protocolId?: string; // Frontend format (computed)
  issued_at?: string; // Backend format
  issuedAt?: Date | string; // Frontend format
  valid_until?: string; // Backend format
  validUntil?: Date | string; // Frontend format
  qr_code?: string; // Backend format
  qrCode?: string; // Frontend format (for compatibility)
  pdf_url?: string; // Backend format
  pdfUrl?: string; // Frontend format (for compatibility)
}

export interface PDEKCommission {
  id: string;
  name: string;
  chairman: User;
  members: User[];
  courses: string[]; // course IDs
}

export interface Notification {
  id: string;
  userId: string;
  type: 'course_assigned' | 'exam_available' | 'protocol_ready' | 'certificate_issued' | 'pdek_signature_request';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  status: 'created' | 'in_progress' | 'resolved';
  createdAt: Date;
  updatedAt?: Date;
  responses: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: Date;
}