<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

type MenuItem = {
  key: string;
  label: string;
  to?: string;
  badge?: string;
  action?: 'logout';
};

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const primaryItems: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { key: 'courses', label: 'Courses' },
  { key: 'videos', label: 'Concept Videos' },
  { key: 'tests', label: 'Tests', to: '/tests' },
  { key: 'mentorship', label: 'Personalised Mentorship', badge: 'New!' },
  { key: 'search', label: 'Search' },
];

const secondaryItems = computed<MenuItem[]>(() => {
  const base: MenuItem[] = [
    { key: 'bookmarks', label: 'My Bookmarks' },
    { key: 'subscriptions', label: 'My Subscriptions' },
    { key: 'current-affairs', label: 'Current Affairs' },
    { key: 'success', label: 'Success Stories' },
    { key: 'admin', label: 'Admin', to: '/admin' },
  ];

  if (authStore.isAuthenticated) {
    base.push({ key: 'logout', label: 'Logout', action: 'logout' });
  }

  return base;
});

function isActive(item: MenuItem) {
  return item.to ? route.path === item.to : false;
}

function handleItem(item: MenuItem) {
  if (item.action === 'logout') {
    authStore.logout();
    router.push('/login');
    return;
  }

  if (item.to) {
    router.push(item.to);
  }
}
</script>

<template>
  <aside class="sidebar sidebar--mocktest">
    <div class="sidebar__brand">
      <span class="sidebar__brand-mark">m</span>
      <div class="sidebar__brand-copy">
        <p class="sidebar__eyebrow">Mocktest Pro</p>
        <h1>Prep Hub</h1>
      </div>
    </div>

    <div class="sidebar__stack">
      <div class="sidebar__section">
        <p class="sidebar__section-title">Learn</p>

        <component
          :is="item.to ? RouterLink : 'button'"
          v-for="item in primaryItems"
          :key="item.key"
          :to="item.to"
          type="button"
          class="sidebar__menu-item"
          :class="{ 'is-active': isActive(item), 'is-static': !item.to }"
          @click="handleItem(item)"
        >
          <span class="sidebar__menu-main">
            <span v-if="item.key === 'dashboard'" class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="6" height="6" rx="1.3" fill="currentColor" />
                <rect x="14" y="4" width="6" height="6" rx="1.3" fill="currentColor" />
                <rect x="4" y="14" width="6" height="6" rx="1.3" fill="currentColor" />
                <rect x="14" y="14" width="6" height="6" rx="1.3" fill="currentColor" />
              </svg>
            </span>
            <span v-else-if="item.key === 'courses'" class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 7.5h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <path d="M7 19h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <path d="M8 7.5V17" stroke="currentColor" stroke-width="1.8" />
                <path d="M16 7.5V17" stroke="currentColor" stroke-width="1.8" />
              </svg>
            </span>
            <span v-else-if="item.key === 'videos'" class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.8" />
                <path d="m10 10 5 2-5 2v-4Z" fill="currentColor" />
              </svg>
            </span>
            <span v-else-if="item.key === 'tests'" class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M8 6h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <path d="M7 4h10v16H7z" stroke="currentColor" stroke-width="1.8" />
                <path d="m9.5 12 1.5 1.5 3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span v-else-if="item.key === 'mentorship'" class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="1.8" />
                <path d="M5 19a7 7 0 0 1 14 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </span>
            <span v-else class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="1.8" />
                <path d="m16 16 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </span>
            <span class="sidebar__menu-label">{{ item.label }}</span>
          </span>
          <small v-if="item.badge" class="sidebar__badge">{{ item.badge }}</small>
        </component>
      </div>

      <div class="sidebar__section sidebar__section--secondary">
        <p class="sidebar__section-title">Library</p>

        <component
          :is="item.to ? RouterLink : 'button'"
          v-for="item in secondaryItems"
          :key="item.key"
          :to="item.to"
          type="button"
          class="sidebar__menu-item"
          :class="{ 'is-active': isActive(item), 'is-static': !item.to && !item.action }"
          @click="handleItem(item)"
        >
          <span class="sidebar__menu-main">
            <span v-if="item.key === 'bookmarks'" class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M7 4h10v16l-5-3-5 3V4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
              </svg>
            </span>
            <span v-else-if="item.key === 'subscriptions'" class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="1.8" />
                <path d="M5 19a7 7 0 0 1 14 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </span>
            <span v-else-if="item.key === 'current-affairs'" class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M10 4h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <path d="M12 4v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <path d="m9 14 2 2 4-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M7 20h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </span>
            <span v-else-if="item.key === 'success'" class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 4 7 12h4l-1 8 7-10h-4l2-6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
              </svg>
            </span>
            <span v-else-if="item.key === 'admin'" class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 3 4 7v5c0 5 3.4 8.5 8 9 4.6-.5 8-4 8-9V7l-8-4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
                <path d="m9.5 12 1.5 1.5 3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span v-else class="menu-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 4v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <path d="M7 7.5a7 7 0 1 0 10 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </span>
            <span class="sidebar__menu-label">{{ item.label }}</span>
          </span>
        </component>
      </div>
    </div>
  </aside>
</template>
