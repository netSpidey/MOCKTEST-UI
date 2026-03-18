<script setup lang="ts">
import { reactive } from 'vue';
import SidebarNav from '@/components/SidebarNav.vue';
import StatCard from '@/components/StatCard.vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/dashboard';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

const roleForm = reactive({
  name: 'reviewer',
  permissions: 'VIEW_REPORTS, MANAGE_MOCKS',
  description: 'Dashboard operator role',
});

async function createRole() {
  const permissions = roleForm.permissions
    .split(',')
    .map((permission) => permission.trim())
    .filter(Boolean);

  await dashboardStore.createRole(
    {
      name: roleForm.name.trim(),
      description: roleForm.description.trim(),
      permissions,
    },
    authStore.user?.token ?? null,
  );
}
</script>

<template>
  <div class="dashboard-shell">
    <SidebarNav />

    <main class="dashboard-main">
      <section class="hero-banner">
        <div>
          <p class="section-label">Performance Dashboard</p>
          <h1>Welcome back, {{ authStore.displayName }}.</h1>
          <p>
            Your workspace combines live authentication with dashboard planning
            modules, so the app is already useful while the backend expands.
          </p>
        </div>
        <div class="hero-banner__badge">
          API base: {{ apiBaseUrl }}
        </div>
      </section>

      <section class="stats-grid">
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
              <p class="section-label">Upcoming Test Queue</p>
              <h2>Recommended mock schedule</h2>
            </div>
            <span class="pill">Synced with Pinia</span>
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
              <p class="section-label">Recent Signals</p>
              <h2>Learner activity</h2>
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
              <p class="section-label">Role Management</p>
              <h2>Create a backend role</h2>
            </div>
            <span class="pill pill--outline">POST /roles/register</span>
          </div>

          <form class="form" @submit.prevent="createRole">
            <label>
              <span>Role name</span>
              <input v-model.trim="roleForm.name" type="text" placeholder="reviewer" />
            </label>

            <label>
              <span>Permissions</span>
              <input
                v-model.trim="roleForm.permissions"
                type="text"
                placeholder="VIEW_REPORTS, MANAGE_MOCKS"
              />
            </label>

            <label>
              <span>Description</span>
              <input
                v-model.trim="roleForm.description"
                type="text"
                placeholder="Dashboard operator role"
              />
            </label>

            <p v-if="dashboardStore.roleError" class="form-message is-error">
              {{ dashboardStore.roleError }}
            </p>
            <p v-if="dashboardStore.roleMessage" class="form-message is-success">
              {{ dashboardStore.roleMessage }}
            </p>

            <button type="submit" :disabled="dashboardStore.roleStatus === 'loading'">
              {{
                dashboardStore.roleStatus === 'loading'
                  ? 'Creating role...'
                  : 'Create role'
              }}
            </button>
          </form>
        </article>
      </section>
    </main>
  </div>
</template>
