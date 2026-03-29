export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  username: string;
  email: string;
  token: string;
  subscriptionPlan: SubscriptionPlanSummary | null;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface CreateRolePayload {
  name: string;
  permissions: string[];
  description?: string;
  grantAll?: boolean;
}

export type ManageableRole = 'admin' | 'super_admin';

export interface ApiEnvelope<T> {
  data: T;
}

export interface TestSeries {
  id: string;
  title: string;
  focus: string;
  questions: number;
  duration: string;
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  completion: number;
  nextSlot: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  when: string;
}

export interface ExamCategory {
  id: string;
  title: string;
  exams: string[];
  accent: string;
}

export interface QuickMetric {
  label: string;
  value: string;
  caption: string;
}

export interface TestCatalogItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  accent: 'gold' | 'blue' | 'teal' | 'slate';
  visibleToPlans?: string[];
}

export interface TestCatalogSection {
  id: string;
  title: string;
  description?: string;
  accent?: 'gold' | 'blue' | 'teal' | 'slate';
  items: TestCatalogItem[];
}

export interface SubscriptionPlanSummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  priceLabel?: string | null;
  isDefault: boolean;
  features: string[];
}

export interface TestViewAccess {
  planSlug: string;
  planName: string;
  hasExamAccess: boolean;
}

export interface TestViewTab {
  key: 'prelims' | 'mains' | 'previous_year';
  label: string;
  testCount: number;
}

export interface TestViewSeries {
  slug: string;
  title: string;
  description: string;
  type: 'mock' | 'topic_group';
  testCount?: number;
  tabs?: TestViewTab[];
}

export interface TestViewExamSummary {
  slug: string;
  title: string;
  subtitle: string;
  category: {
    slug: string;
    title: string;
  } | null;
  accent: 'gold' | 'blue' | 'teal' | 'slate';
}

export interface TestViewResourcesResponse {
  exam: TestViewExamSummary;
  access: TestViewAccess;
  series: TestViewSeries[];
  defaultSelection: {
    seriesSlug: string | null;
    tab: TestViewTab['key'] | null;
  };
}

export interface TestViewTestItem {
  slug: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  accessType: 'free' | 'subscription';
  locked: boolean;
  ctaLabel: string;
}

export interface TestViewTestsResponse {
  exam: TestViewExamSummary;
  selection: {
    seriesSlug: string | null;
    tab: TestViewTab['key'] | null;
  };
  access: TestViewAccess;
  tests: TestViewTestItem[];
}

export interface TestInstructionSection {
  sectionNumber: number;
  sectionName: string;
  totalQuestions: number;
  maxScore: number;
}

export interface TestInstructionsResponse {
  test: {
    slug: string;
    title: string;
    examSlug: string;
    examTitle: string;
    category: {
      slug: string;
      title: string;
    } | null;
  };
  access: TestViewAccess & {
    locked: boolean;
    canBegin: boolean;
  };
  summary: {
    totalQuestions: number;
    durationMinutes: number;
    totalMarks: number;
  };
  sections: TestInstructionSection[];
  supportedLanguages: string[];
  defaultLanguage: string;
  instructions: {
    general: string[];
    navigation: string[];
    answering: string[];
  };
}

export interface TestQuestionAsset {
  type: 'image' | 'chart' | 'diagram';
  url: string;
  altText?: string;
  caption?: string;
}

export interface TestQuestionOption {
  key: string;
  text: string;
}

export type TestQuestionStatus =
  | 'notVisited'
  | 'notAnswered'
  | 'answered'
  | 'markedForReview'
  | 'answeredAndMarkedForReview';

export interface TestSessionSection {
  id: string;
  sectionNumber: number;
  sectionName: string;
  totalQuestions: number;
  maxScore: number;
}

export interface TestSessionQuestion {
  id: string;
  questionNumber: number;
  sectionId: string;
  prompt: string;
  assets: TestQuestionAsset[];
  options: TestQuestionOption[];
  marks: number;
  negativeMarks: number;
}

export interface TestSessionResponse {
  test: {
    slug: string;
    title: string;
    examSlug: string;
    examTitle: string;
    category: {
      slug: string;
      title: string;
    } | null;
  };
  access: TestViewAccess & {
    locked: boolean;
  };
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  defaultLanguage: string;
  supportedLanguages: string[];
  sections: TestSessionSection[];
  questions: TestSessionQuestion[];
}

export interface TestSubmitPayload {
  answers: Record<string, string | null>;
  questionStatuses: Record<string, TestQuestionStatus>;
  timeRemainingSeconds: number;
  selectedLanguage: string;
}

export interface TestResultSectionAnalysis {
  sectionId: string;
  sectionName: string;
  answered: number;
  notAnswered: number;
  markedForReview: number;
  notVisited: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  score: number;
  maxScore: number;
}

export interface TestResultQuestionAnalysis {
  questionId: string;
  questionNumber: number;
  sectionId: string;
  sectionName: string;
  prompt: string;
  selectedOptionKey: string | null;
  selectedOptionText: string | null;
  correctOptionKey: string;
  correctOptionText: string;
  status: TestQuestionStatus;
  outcome: 'correct' | 'incorrect' | 'unanswered';
  marksAwarded: number;
  maxMarks: number;
  negativeMarks: number;
}

export interface TestResultResponse {
  test: {
    slug: string;
    title: string;
    examSlug: string;
    examTitle: string;
  };
  summary: {
    totalQuestions: number;
    answered: number;
    notAnswered: number;
    markedForReview: number;
    notVisited: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unanswered: number;
    score: number;
    maxScore: number;
    percentage: number;
    submittedAt: string;
    selectedLanguage: string;
    timeSpentSeconds: number;
  };
  sections: TestResultSectionAnalysis[];
  questions: TestResultQuestionAnalysis[];
}
