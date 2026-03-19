<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { RegisterPayload } from '@/types/api';

const props = defineProps<{
  mode: 'login' | 'register';
}>();

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const loginForm = reactive({
  email: '',
  password: '',
});

const registerForm = reactive<RegisterPayload>({
  name: '',
  email: '',
  password: '',
  phoneNumber: '',
});

const localError = ref('');
const successMessage = ref('');

const title = computed(() => (props.mode === 'login' ? 'Login' : 'Sign Up'));
const subtitle = computed(() =>
  props.mode === 'login'
    ? 'Continue your mock-test journey with your saved progress and dashboards.'
    : 'Create your practice account and start with the default user flow.',
);
const primaryLabel = computed(() => {
  if (props.mode === 'login') {
    return authStore.status === 'loading' ? 'Signing in...' : 'Next';
  }

  return authStore.status === 'loading' ? 'Creating account...' : 'REGISTER';
});

function closeDialog() {
  router.push('/');
}

function switchMode(nextMode: 'login' | 'register') {
  const redirect =
    typeof route.query.redirect === 'string' ? `?redirect=${route.query.redirect}` : '';
  router.push(`/${nextMode}${redirect}`);
}

async function submit() {
  localError.value = '';
  successMessage.value = '';

  try {
    if (props.mode === 'login') {
      await authStore.login(loginForm);
      const redirect =
        typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard';
      router.push(redirect);
      return;
    }

    await authStore.register(registerForm);
    successMessage.value = 'Registration complete. You can now sign in.';
    setTimeout(() => {
      switchMode('login');
    }, 900);
  } catch (error) {
    localError.value =
      error instanceof Error ? error.message : 'Unable to complete this request';
  }
}
</script>

<template>
  <div class="auth-overlay" @click.self="closeDialog">
    <section class="auth-modal-card auth-dialog">
      <button type="button" class="auth-dialog__close" @click="closeDialog">x</button>

      <div class="auth-dialog__hero">
        <p class="auth-dialog__eyebrow">
          {{ mode === 'login' ? 'Welcome Back' : 'Start Free Trial' }}
        </p>
        <h1 class="auth-modal-title">{{ title }}</h1>
        <p class="auth-dialog__subtitle">{{ subtitle }}</p>
      </div>

      <button
        v-if="mode === 'register'"
        type="button"
        class="auth-google-button auth-google-button--top"
      >
        <span class="auth-google-button__icon">G</span>
        <span>Continue with Google</span>
      </button>

      <p v-if="mode === 'register'" class="auth-separator">Or, register with email</p>

      <form class="auth-modal-form" @submit.prevent="submit">
        <template v-if="mode === 'login'">
          <label class="auth-field">
            <span class="auth-field__label">Email Id</span>
            <div class="auth-field__input">
              <span class="auth-field__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9A1.5 1.5 0 0 1 19.5 18h-15A1.5 1.5 0 0 1 3 16.5v-9Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                  <path
                    d="m4 7 7.027 5.268a1.64 1.64 0 0 0 1.946 0L20 7"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <input v-model.trim="loginForm.email" type="email" placeholder="testuser@test.com" />
            </div>
          </label>

          <label class="auth-field">
            <span class="auth-field__label">Password</span>
            <div class="auth-field__input">
              <span class="auth-field__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 10V8a5 5 0 0 1 10 0v2"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="1.8"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                </svg>
              </span>
              <input v-model.trim="loginForm.password" type="password" placeholder="password123" />
            </div>
          </label>

          <button type="button" class="auth-link auth-link--center">Forgot Password?</button>
        </template>

        <template v-else>
          <label class="auth-field">
            <span class="auth-field__label">Email Id</span>
            <div class="auth-field__input">
              <span class="auth-field__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9A1.5 1.5 0 0 1 19.5 18h-15A1.5 1.5 0 0 1 3 16.5v-9Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                  <path
                    d="m4 7 7.027 5.268a1.64 1.64 0 0 0 1.946 0L20 7"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <input v-model.trim="registerForm.email" type="email" placeholder="aarav@example.com" />
            </div>
          </label>

          <label class="auth-field">
            <span class="auth-field__label">Mobile Number</span>
            <div class="auth-field__input auth-field__input--soft">
              <span class="auth-field__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect
                    x="7"
                    y="3.5"
                    width="10"
                    height="17"
                    rx="2"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                  <path
                    d="M11 17.5h2"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
              </span>
              <input v-model.trim="registerForm.phoneNumber" type="tel" placeholder="9876543210" />
            </div>
          </label>

          <label class="auth-field">
            <span class="auth-field__label">Password</span>
            <div class="auth-field__input auth-field__input--soft">
              <span class="auth-field__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 10V8a5 5 0 0 1 10 0v2"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="1.8"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                </svg>
              </span>
              <input v-model.trim="registerForm.password" type="password" placeholder="Minimum 6 characters" />
            </div>
          </label>

          <label class="auth-field">
            <span class="auth-field__label">Full Name</span>
            <div class="auth-field__input auth-field__input--soft">
              <span class="auth-field__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.8" />
                  <path
                    d="M5.5 18a6.5 6.5 0 0 1 13 0"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
              </span>
              <input v-model.trim="registerForm.name" type="text" placeholder="Aarav Sharma" />
            </div>
          </label>
        </template>

        <p v-if="localError || authStore.error" class="form-message is-error">
          {{ localError || authStore.error }}
        </p>
        <p v-if="successMessage" class="form-message is-success">
          {{ successMessage }}
        </p>

        <button class="auth-primary-button" type="submit" :disabled="authStore.status === 'loading'">
          {{ primaryLabel }}
        </button>
      </form>

      <p v-if="mode === 'login'" class="auth-separator">Or, login with</p>

      <button v-if="mode === 'login'" type="button" class="auth-google-button">
        <span class="auth-google-button__icon">G</span>
        <span>Continue with Google</span>
      </button>

      <p class="auth-footer auth-footer--center">
        <template v-if="mode === 'login'">
          New to PracticeMock?
          <button type="button" class="auth-inline-link" @click="switchMode('register')">
            Register
          </button>
        </template>
        <template v-else>
          Already a user?
          <button type="button" class="auth-inline-link" @click="switchMode('login')">
            Login
          </button>
        </template>
      </p>
    </section>
  </div>
</template>
