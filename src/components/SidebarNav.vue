<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const items = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Admin', to: '/admin' },
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
];

const visibleItems = computed(() =>
  items.filter((item) => {
    if (item.to === '/login' || item.to === '/register') {
      return !authStore.isAuthenticated;
    }

    return true;
  }),
);

function logout() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <aside class="sidebar">
    <div>
      <p class="sidebar__eyebrow">Mocktest Pro</p>
      <h1>Candidate Console</h1>
    </div>

    <nav class="sidebar__nav">
      <RouterLink
        v-for="item in visibleItems"
        :key="item.to"
        :to="item.to"
        class="sidebar__link"
        :class="{ 'is-active': route.path === item.to }"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <button
      v-if="authStore.isAuthenticated"
      type="button"
      class="sidebar__logout"
      @click="logout"
    >
      Sign out
    </button>
  </aside>
</template>
