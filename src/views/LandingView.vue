<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import AuthDialog from '@/components/AuthDialog.vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/dashboard';

const authStore = useAuthStore();
authStore.hydrate();

const route = useRoute();
const dashboardStore = useDashboardStore();

const trialTarget = computed(() =>
  authStore.isAuthenticated ? '/dashboard' : '/login?redirect=/dashboard',
);

const authMode = computed(() => {
  if (route.name === 'login') {
    return 'login';
  }

  if (route.name === 'register') {
    return 'register';
  }

  return null;
});
</script>

<template>
  <main class="landing-page" :class="{ 'landing-page--modal-open': Boolean(authMode) }">
    <section class="landing-topbar">
      <div>
        <p class="section-label">Mocktest Pro</p>
        <strong class="landing-brand">Exam Prep Platform</strong>
      </div>

      <div class="landing-topbar__actions">
        <RouterLink to="/login" class="topbar-link">Login</RouterLink>
        <RouterLink to="/register" class="topbar-link topbar-link--solid">
          Sign up
        </RouterLink>
      </div>
    </section>

    <section class="hero-banner hero-banner--pm">
      <div class="hero-copy">
        <p class="section-label">Practice | Analyse | Excel</p>
        <h1>Start your mock-test journey with the right exam track.</h1>
        <p>
          Explore banking, regulatory, SSC, and state exam preparation in one
          place with smart test discovery, performance tracking, and fast access
          to the next mock.
        </p>
        <div class="cta-row">
          <RouterLink :to="trialTarget" class="cta-button">Start free trial</RouterLink>
          <RouterLink to="/register" class="topbar-link">Create account</RouterLink>
        </div>
      </div>

      <div class="hero-spotlight">
        <p class="hero-spotlight__label">What you get</p>
        <ul class="hero-spotlight__list">
          <li>Full mock tests, mini mocks, and sectional practice</li>
          <li>Exam-wise shelves for faster discovery</li>
          <li>Progress signals and dashboards after login</li>
        </ul>
      </div>
    </section>

    <section class="category-strip">
      <article
        v-for="category in dashboardStore.categories"
        :key="category.id"
        class="category-card"
        :data-accent="category.accent"
      >
        <p>{{ category.title }}</p>
        <div class="chip-row">
          <span v-for="exam in category.exams" :key="exam">{{ exam }}</span>
        </div>
      </article>
    </section>

    <section class="quick-metrics">
      <article
        v-for="metric in dashboardStore.quickMetricsCards"
        :key="metric.label"
        class="metric-card"
      >
        <p>{{ metric.label }}</p>
        <strong>{{ metric.value }}</strong>
        <span>{{ metric.caption }}</span>
      </article>
    </section>

    <section class="panel landing-series">
      <div class="panel__header">
        <div>
          <p class="section-label">Popular Test Series</p>
          <h2>Browse the kind of mock shelves aspirants expect</h2>
        </div>
        <RouterLink :to="trialTarget" class="pill">Unlock dashboard</RouterLink>
      </div>

      <div class="test-list landing-series__grid">
        <article v-for="test in dashboardStore.tests" :key="test.id" class="test-card">
          <div class="test-card__top">
            <div>
              <h3>{{ test.title }}</h3>
              <p>{{ test.focus }}</p>
            </div>
            <span>{{ test.difficulty }}</span>
          </div>

          <div class="test-card__meta">
            <span>{{ test.questions }} questions</span>
            <span>{{ test.duration }}</span>
            <span>{{ test.nextSlot }}</span>
          </div>
        </article>
      </div>
    </section>

    <AuthDialog v-if="authMode" :mode="authMode" />
  </main>
</template>
