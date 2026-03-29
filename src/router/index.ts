import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AdminView from '@/views/AdminView.vue';
import DashboardView from '@/views/DashboardView.vue';
import LandingView from '@/views/LandingView.vue';
import TestInstructionsView from '@/views/TestInstructionsView.vue';
import TestResultView from '@/views/TestResultView.vue';
import TestRunnerView from '@/views/TestRunnerView.vue';
import TestsView from '@/views/TestsView.vue';
import ViewTestView from '@/views/ViewTestView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/login',
      name: 'login',
      component: LandingView,
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: LandingView,
      meta: { guestOnly: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/tests',
      name: 'tests',
      component: TestsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/tests/:examSlug',
      name: 'test-view',
      component: ViewTestView,
      meta: { requiresAuth: true },
    },
    {
      path: '/tests/:examSlug/:testSlug/instructions',
      name: 'test-instructions',
      component: TestInstructionsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/tests/:examSlug/:testSlug/start',
      name: 'test-runner',
      component: TestRunnerView,
      meta: { requiresAuth: true },
    },
    {
      path: '/tests/:examSlug/:testSlug/result',
      name: 'test-result',
      component: TestResultView,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  authStore.hydrate();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'dashboard' };
  }

  return true;
});
