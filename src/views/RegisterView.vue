<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { RegisterPayload } from '@/types/api';

const authStore = useAuthStore();
const router = useRouter();

const form = reactive<RegisterPayload>({
  name: '',
  email: '',
  password: '',
  phoneNumber: '',
  role: 'user',
});

const successMessage = ref('');
const localError = ref('');

async function submit() {
  successMessage.value = '';
  localError.value = '';

  try {
    await authStore.register(form);
    successMessage.value = 'Registration complete. You can now sign in.';
    setTimeout(() => {
      router.push('/login');
    }, 900);
  } catch (error) {
    localError.value =
      error instanceof Error ? error.message : 'Unable to complete registration';
  }
}
</script>

<template>
  <div class="auth-shell">
    <section class="auth-panel auth-panel--brand">
      <p class="section-label">Candidate Onboarding</p>
      <h1>Register new learners and route them into the right exam track.</h1>
      <p>
        This form connects directly to the backend registration endpoint and uses
        the same role options supported by the API today.
      </p>
    </section>

    <section class="auth-panel">
      <p class="section-label">Register</p>
      <form class="form" @submit.prevent="submit">
        <label>
          <span>Full name</span>
          <input v-model.trim="form.name" type="text" placeholder="Aarav Sharma" />
        </label>

        <label>
          <span>Email</span>
          <input v-model.trim="form.email" type="email" placeholder="aarav@example.com" />
        </label>

        <label>
          <span>Password</span>
          <input v-model.trim="form.password" type="password" placeholder="Minimum 6 characters" />
        </label>

        <label>
          <span>Phone number</span>
          <input v-model.trim="form.phoneNumber" type="tel" placeholder="9876543210" />
        </label>

        <label>
          <span>Role</span>
          <select v-model="form.role">
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </label>

        <p v-if="localError || authStore.error" class="form-message is-error">
          {{ localError || authStore.error }}
        </p>
        <p v-if="successMessage" class="form-message is-success">
          {{ successMessage }}
        </p>

        <button type="submit" :disabled="authStore.status === 'loading'">
          {{ authStore.status === 'loading' ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <p class="auth-footer">
        Already registered?
        <RouterLink to="/login">Go to login</RouterLink>
      </p>
    </section>
  </div>
</template>
