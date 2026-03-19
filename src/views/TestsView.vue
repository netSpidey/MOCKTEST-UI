<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import SidebarNav from '@/components/SidebarNav.vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/dashboard';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const selectedFilter = ref('all');

const filterOptions = computed(() => [
  { value: 'all', label: 'All Categories' },
  ...dashboardStore.testFilterOptions,
]);

const visibleSections = computed(() => dashboardStore.getFilteredTestCatalog(selectedFilter.value));

function getInitials(title: string) {
  return title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

onMounted(async () => {
  const activePlanSlug = authStore.currentPlan?.slug ?? 'basic';

  if (!authStore.plans.length) {
    try {
      await authStore.fetchPlans();
    } catch (error) {
      console.error('Unable to load subscription plans', error);
    }
  }

  if (!dashboardStore.hasLoadedCatalog || dashboardStore.loadedCatalogPlan !== activePlanSlug) {
    try {
      await dashboardStore.fetchTestCatalog(activePlanSlug);
    } catch (error) {
      console.error('Unable to load test catalog', error);
    }
  }
});
</script>

<template>
  <div class="dashboard-shell">
    <SidebarNav />

    <main class="dashboard-main">
      <section class="hero-banner dashboard-hero tests-hero">
        <div class="tests-filter-card">
          <label class="tests-filter-card__label" for="test-category">Category</label>
          <div class="tests-filter-card__select">
            <select id="test-category" v-model="selectedFilter">
              <option v-for="option in filterOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <p class="tests-filter-card__hint">
            {{ visibleSections.length }} section{{ visibleSections.length === 1 ? '' : 's' }} available
          </p>
          <p class="tests-filter-card__hint">
            Current plan: {{ authStore.currentPlanName }}
          </p>
          <div v-if="authStore.plans.length" class="tests-plan-list">
            <p class="tests-filter-card__label">Plans</p>
            <div class="chip-row">
              <span
                v-for="plan in authStore.plans"
                :key="plan.id"
                :class="{ 'tests-plan-chip--active': plan.slug === (authStore.currentPlan?.slug ?? 'basic') }"
                class="tests-plan-chip"
              >
                {{ plan.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="hero-copy">
          <p class="section-label">Test Library</p>
          <h1>Pick the right mock shelf for your next exam push.</h1>
          <p>
            Browse exam-wise collections, switch between categories, and jump into
            the mock track that fits your current target.
          </p>
        </div>
      </section>

      <section class="tests-library">
        <p v-if="dashboardStore.catalogStatus === 'loading'" class="panel tests-state">
          Loading categories and exams from the catalog...
        </p>

        <p v-else-if="dashboardStore.catalogError" class="form-message is-error">
          {{ dashboardStore.catalogError }}
        </p>

        <p v-else-if="visibleSections.length === 0" class="panel tests-state">
          No exams are available for this category yet.
        </p>

        <article v-for="section in visibleSections" :key="section.id" class="tests-section">
          <div class="tests-section__header">
            <div>
              <p class="section-label">Available series</p>
              <h2>{{ section.title }}</h2>
              <p v-if="section.description" class="tests-section__description">
                {{ section.description }}
              </p>
            </div>
            <span class="pill pill--outline">{{ section.items.length }} tests</span>
          </div>

          <div class="tests-grid">
            <article
              v-for="item in section.items"
              :key="item.id"
              class="test-tile"
              :data-accent="item.accent"
            >
              <div class="test-tile__mark">{{ getInitials(item.title) }}</div>
              <div class="test-tile__body">
                <div class="test-tile__top">
                  <h3>{{ item.title }}</h3>
                  <span v-if="item.badge" class="test-tile__badge">{{ item.badge }}</span>
                </div>
                <p>{{ item.subtitle }}</p>
              </div>
              <button type="button" class="test-tile__cta">View tests</button>
            </article>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>
