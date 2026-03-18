<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const form = reactive({
  email: '',
  password: '',
});

const localError = ref('');

async function submit() {
  localError.value = '';

  try {
    await authStore.login(form);
    const redirect =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard';
    router.push(redirect);
  } catch (error) {
    localError.value =
      error instanceof Error ? error.message : 'Unable to complete login';
  }
}
</script>

<template>
  <div class="auth-shell">
    <section class="auth-panel auth-panel--brand">
      <p class="section-label">Banking Mock Platform</p>
      <h1>Track performance, daily mocks, and readiness in one place.</h1>
      <p>
        Sign in to access your live dashboard, monitor progress trends, and manage
        test operations from a single screen.
      </p>
    </section>

    <section class="auth-panel">
      <p class="section-label">Login</p>
      <form class="form" @submit.prevent="submit">
        <label>
          <span>Email</span>
          <input v-model.trim="form.email" type="email" placeholder="testuser@gmail.com" />
        </label>

        <label>
          <span>Password</span>
          <input v-model.trim="form.password" type="password" placeholder="password123" />
        </label>

        <p v-if="localError || authStore.error" class="form-message is-error">
          {{ localError || authStore.error }}
        </p>

        <button type="submit" :disabled="authStore.status === 'loading'">
          {{ authStore.status === 'loading' ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <p class="auth-footer">
        New here?
        <RouterLink to="/register">Create an account</RouterLink>
      </p>
    </section>
  </div>
</template>
