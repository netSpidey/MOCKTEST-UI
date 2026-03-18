<script setup lang="ts">
import SidebarNav from '@/components/SidebarNav.vue';
import StatCard from '@/components/StatCard.vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/dashboard';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';
</script>

<template>
  <div class="dashboard-shell">
    <SidebarNav />

    <main class="dashboard-main">
      <section class="hero-banner dashboard-hero">
        <div class="hero-copy">
          <p class="section-label">Performance Dashboard</p>
          <h1>Welcome back, {{ authStore.displayName }}.</h1>
          <p>
            Monitor readiness, discover your next recommended mock, and use the live
            backend connection for account and role workflows.
          </p>
          <div class="cta-row">
            <RouterLink to="/" class="cta-button">Explore landing page</RouterLink>
            <span class="hero-banner__badge">API base: {{ apiBaseUrl }}</span>
          </div>
        </div>
        <div class="hero-spotlight">
          <p class="hero-spotlight__label">Account summary</p>
          <ul class="hero-spotlight__list">
            <li>Signed in as: {{ authStore.displayName }}</li>
            <li>Protected routes are active for dashboard access</li>
            <li>Admin and super admin roles are managed on the Admin page</li>
          </ul>
        </div>
      </section>

      <section class="stats-grid stats-grid--hero">
        <StatCard
          v-for="item in dashboardStore.stats"
          :key="item.label"
          :label="item.label"
          :value="item.value"
          :tone="item.tone"
        />
      </section>

      <section class="content-grid">
        <article class="panel panel--wide">
          <div class="panel__header">
            <div>
              <p class="section-label">Popular Test Series</p>
              <h2>Mock shelves inspired by high-conversion prep platforms</h2>
            </div>
            <span class="pill">Live dashboard data</span>
          </div>

          <div class="test-list">
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

              <div class="progress-row">
                <div class="progress-bar">
                  <div class="progress-bar__value" :style="{ width: `${test.completion}%` }" />
                </div>
                <strong>{{ test.completion }}%</strong>
              </div>
            </article>
          </div>
        </article>

        <article class="panel">
          <div class="panel__header">
            <div>
              <p class="section-label">Preparation Signals</p>
              <h2>Recent learner activity</h2>
            </div>
          </div>

          <div class="activity-list">
            <article
              v-for="item in dashboardStore.activity"
              :key="item.id"
              class="activity-card"
            >
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.detail }}</p>
              </div>
              <span>{{ item.when }}</span>
            </article>
          </div>
        </article>

        <article class="panel">
          <div class="panel__header">
            <div>
              <p class="section-label">Administration</p>
              <h2>Manage elevated roles separately</h2>
            </div>
            <span class="pill pill--outline">Dedicated admin workspace</span>
          </div>
          <p class="admin-note">
            Standard sign-ups are created as normal users. Visit the Admin page to
            create or update `admin` and `super_admin` roles through the backend API.
          </p>
          <RouterLink to="/admin" class="cta-button">Go to Admin page</RouterLink>
        </article>
      </section>
    </main>
  </div>
</template>
