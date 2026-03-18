<script setup lang="ts">
import { reactive } from 'vue';
import SidebarNav from '@/components/SidebarNav.vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/dashboard';
import type { ManageableRole } from '@/types/api';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

const roleForms = reactive<Record<ManageableRole, { permissions: string; description: string }>>({
  admin: {
    permissions: 'VIEW_REPORTS, MANAGE_MOCKS, MANAGE_USERS',
    description: 'Operational admin for exam and learner management',
  },
  super_admin: {
    permissions: 'VIEW_REPORTS, MANAGE_MOCKS, MANAGE_USERS, MANAGE_ADMINS, GRANT_ALL',
    description: 'Top-level platform administration role',
  },
});

const roleLabels: Record<ManageableRole, string> = {
  admin: 'Admin',
  super_admin: 'Super Admin',
};

async function createManagedRole(role: ManageableRole) {
  const current = roleForms[role];
  const permissions = current.permissions
    .split(',')
    .map((permission) => permission.trim())
    .filter(Boolean);

  await dashboardStore.createRole(
    {
      name: role,
      description: current.description.trim(),
      permissions,
      grantAll: role === 'super_admin',
    },
    authStore.user?.token ?? null,
  );
}
</script>

<template>
  <div class="dashboard-shell">
    <SidebarNav />

    <main class="dashboard-main">
      <section class="hero-banner dashboard-hero">
        <div class="hero-copy">
          <p class="section-label">Admin Management</p>
          <h1>Manage elevated roles in one dedicated workspace.</h1>
          <p>
            Standard registrations now create users by default. Use this page to
            create and maintain `admin` and `super_admin` roles for the backend.
          </p>
        </div>

        <div class="hero-spotlight">
          <p class="hero-spotlight__label">Admin rules</p>
          <ul class="hero-spotlight__list">
            <li>`admin` is for day-to-day operational control</li>
            <li>`super_admin` is for platform-wide control</li>
            <li>Both actions call the live `/roles/register` endpoint</li>
          </ul>
        </div>
      </section>

      <section class="admin-grid">
        <article class="panel" v-for="role in ['admin', 'super_admin']" :key="role">
          <div class="panel__header">
            <div>
              <p class="section-label">Role Template</p>
              <h2>{{ roleLabels[role as ManageableRole] }}</h2>
            </div>
            <span class="pill pill--outline">{{ role }}</span>
          </div>

          <form class="form" @submit.prevent="createManagedRole(role as ManageableRole)">
            <label>
              <span>Permissions</span>
              <input
                v-model.trim="roleForms[role as ManageableRole].permissions"
                type="text"
                placeholder="VIEW_REPORTS, MANAGE_MOCKS"
              />
            </label>

            <label>
              <span>Description</span>
              <input
                v-model.trim="roleForms[role as ManageableRole].description"
                type="text"
                placeholder="Role description"
              />
            </label>

            <button type="submit" :disabled="dashboardStore.roleStatus === 'loading'">
              {{
                dashboardStore.roleStatus === 'loading'
                  ? 'Saving role...'
                  : `Create ${roleLabels[role as ManageableRole]}`
              }}
            </button>
          </form>
        </article>
      </section>

      <section class="panel">
        <div class="panel__header">
          <div>
            <p class="section-label">API Feedback</p>
            <h2>Role creation status</h2>
          </div>
        </div>

        <p v-if="dashboardStore.roleError" class="form-message is-error">
          {{ dashboardStore.roleError }}
        </p>
        <p v-if="dashboardStore.roleMessage" class="form-message is-success">
          {{ dashboardStore.roleMessage }}
        </p>
        <p v-if="!dashboardStore.roleError && !dashboardStore.roleMessage" class="admin-note">
          Choose a role template above to create `admin` or `super_admin`.
        </p>
      </section>
    </main>
  </div>
</template>
