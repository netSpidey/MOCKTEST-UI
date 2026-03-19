import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/lib/api';
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  SubscriptionPlanSummary,
} from '@/types/api';

const STORAGE_KEY = 'mocktest-ui-auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<LoginResponse | null>(null);
  const status = ref<'idle' | 'loading'>('idle');
  const error = ref('');
  const hasHydrated = ref(false);
  const plans = ref<SubscriptionPlanSummary[]>([]);
  const plansStatus = ref<'idle' | 'loading'>('idle');

  const isAuthenticated = computed(() => Boolean(user.value?.token));
  const displayName = computed(
    () => user.value?.username || user.value?.email || 'Candidate',
  );
  const currentPlan = computed(() => user.value?.subscriptionPlan ?? null);
  const currentPlanName = computed(() => currentPlan.value?.name ?? 'Basic');

  function hydrate() {
    if (hasHydrated.value) {
      return;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      user.value = JSON.parse(raw) as LoginResponse;
    }

    hasHydrated.value = true;
  }

  function persist() {
    if (user.value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user.value));
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }

  async function login(payload: LoginPayload) {
    status.value = 'loading';
    error.value = '';

    try {
      user.value = await api.login(payload);
      persist();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to sign in';
      throw err;
    } finally {
      status.value = 'idle';
    }
  }

  async function register(payload: RegisterPayload) {
    status.value = 'loading';
    error.value = '';

    try {
      await api.register(payload);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to create account';
      throw err;
    } finally {
      status.value = 'idle';
    }
  }

  async function fetchPlans() {
    plansStatus.value = 'loading';

    try {
      plans.value = await api.getSubscriptionPlans();
    } finally {
      plansStatus.value = 'idle';
    }
  }

  function logout() {
    user.value = null;
    error.value = '';
    persist();
  }

  return {
    user,
    status,
    error,
    plans,
    plansStatus,
    isAuthenticated,
    displayName,
    currentPlan,
    currentPlanName,
    hydrate,
    login,
    register,
    fetchPlans,
    logout,
  };
});
