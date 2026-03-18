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
  role: 'user' | 'admin' | 'super_admin';
}

export interface CreateRolePayload {
  name: string;
  permissions: string[];
  description?: string;
  grantAll?: boolean;
}

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
