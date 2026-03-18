export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  username: string;
  email: string;
  token: string;
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
