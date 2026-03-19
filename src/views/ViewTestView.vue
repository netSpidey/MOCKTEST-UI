<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SidebarNav from '@/components/SidebarNav.vue';
import ViewTestCard from '@/components/ViewTestCard.vue';
import { useAuthStore } from '@/stores/auth';
import { useTestRunnerStore } from '@/stores/testRunner';
import { useTestViewStore } from '@/stores/testView';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const testRunnerStore = useTestRunnerStore();
const testViewStore = useTestViewStore();

async function loadViewTestPage(examSlug: string) {
  try {
    await testViewStore.initialize(examSlug, authStore.user?.token ?? null);
  } catch (error) {
    console.error('Unable to load exam view', error);
  }
}

function startTest(testSlug: string, resumable: boolean) {
  const examSlug = typeof route.params.examSlug === 'string' ? route.params.examSlug : '';
  if (!examSlug) {
    return;
  }

  if (resumable) {
    router.push(`/tests/${examSlug}/${testSlug}/start?resume=1`);
    return;
  }

  router.push(`/tests/${examSlug}/${testSlug}/instructions`);
}

onMounted(async () => {
  const examSlug = typeof route.params.examSlug === 'string' ? route.params.examSlug : '';
  if (examSlug) {
    await loadViewTestPage(examSlug);
  }
});

watch(
  () => route.params.examSlug,
  async (examSlug) => {
    if (typeof examSlug === 'string' && examSlug) {
      await loadViewTestPage(examSlug);
    }
  },
);
</script>

<template>
  <div class="dashboard-shell">
    <SidebarNav />

    <main class="dashboard-main">
      <section class="hero-banner dashboard-hero view-test-hero">
        <div class="hero-copy">
          <p class="section-label">Exam Resource View</p>
          <h1>{{ testViewStore.exam?.title ?? 'Loading exam resources...' }}</h1>
          <p>{{ testViewStore.exam?.subtitle ?? 'Preparing your test shelf and test cards.' }}</p>
        </div>

        <div class="view-test-access">
          <p class="hero-spotlight__label">Access Summary</p>
          <div class="view-test-access__summary">
            <span class="pill">Plan: {{ testViewStore.access?.planName ?? authStore.currentPlanName }}</span>
            <span class="pill pill--outline">
              {{ testViewStore.access?.hasExamAccess ? 'Unlocked for your plan' : 'Locked for your plan' }}
            </span>
          </div>
          <p class="view-test-access__copy">
            {{ testViewStore.exam?.category?.title ?? 'Selected exam' }}
          </p>
        </div>
      </section>

      <section class="tests-library">
        <p v-if="testViewStore.status === 'loading' && !testViewStore.resources" class="panel tests-state">
          Loading exam resources and tests...
        </p>

        <p v-else-if="testViewStore.error" class="form-message is-error">
          {{ testViewStore.error }}
        </p>

        <template v-else-if="testViewStore.resources">
          <section class="view-test-series-grid">
            <button
              v-for="item in testViewStore.series"
              :key="item.slug"
              type="button"
              class="view-test-series-card"
              :class="{ 'is-active': testViewStore.selectedSeriesSlug === item.slug }"
              @click="testViewStore.selectSeries(item.slug, authStore.user?.token ?? null)"
            >
              <div class="view-test-series-card__header">
                <h2>{{ item.title }}</h2>
                <span v-if="item.testCount" class="pill pill--outline">{{ item.testCount }} tests</span>
              </div>
              <p>{{ item.description }}</p>

              <div v-if="item.type === 'topic_group' && item.tabs?.length" class="view-test-tabs">
                <button
                  v-for="tab in item.tabs"
                  :key="tab.key"
                  type="button"
                  class="view-test-tab"
                  :class="{ 'is-active': testViewStore.selectedTab === tab.key }"
                  @click.stop="testViewStore.selectTab(tab.key, authStore.user?.token ?? null)"
                >
                  {{ tab.label }}
                </button>
              </div>
            </button>
          </section>

          <section class="panel view-test-panel">
            <div class="panel__header">
              <div>
                <p class="section-label">Available Tests</p>
                <h2>
                  {{ testViewStore.activeSeries?.title ?? 'Test List' }}
                  <span v-if="testViewStore.selectedTab" class="view-test-heading__tab">
                    {{ testViewStore.selectedTab.replace('_', ' ') }}
                  </span>
                </h2>
              </div>
              <span class="pill">{{ testViewStore.tests.length }} tests</span>
            </div>

            <p v-if="testViewStore.status === 'loading'" class="tests-state">
              Refreshing tests for this selection...
            </p>
            <p v-else-if="!testViewStore.tests.length" class="tests-state">
              No tests are available for this selection yet.
            </p>

            <div v-else class="view-test-grid">
              <ViewTestCard
                v-for="test in testViewStore.tests"
                :key="test.slug"
                :test="test"
                :resumable="testRunnerStore.isResumableTest(test.slug)"
                @start="startTest"
              />
            </div>
          </section>
        </template>
      </section>
    </main>
  </div>
</template>
