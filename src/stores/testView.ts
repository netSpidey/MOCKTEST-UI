import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/lib/api';
import type {
  TestViewResourcesResponse,
  TestViewSeries,
  TestViewTab,
  TestViewTestItem,
} from '@/types/api';

export const useTestViewStore = defineStore('test-view', () => {
  const resources = ref<TestViewResourcesResponse | null>(null);
  const tests = ref<TestViewTestItem[]>([]);
  const status = ref<'idle' | 'loading'>('idle');
  const error = ref('');
  const selectedSeriesSlug = ref<string | null>(null);
  const selectedTab = ref<TestViewTab['key'] | null>(null);
  const currentExamSlug = ref<string | null>(null);

  const exam = computed(() => resources.value?.exam ?? null);
  const access = computed(() => resources.value?.access ?? null);
  const series = computed(() => resources.value?.series ?? []);
  const activeSeries = computed<TestViewSeries | null>(
    () =>
      series.value.find((item) => item.slug === selectedSeriesSlug.value) ?? null,
  );

  async function loadResources(examSlug: string, token?: string | null) {
    status.value = 'loading';
    error.value = '';

    try {
      const response = await api.getExamResources(examSlug, token);
      resources.value = response;
      currentExamSlug.value = examSlug;
      selectedSeriesSlug.value = response.defaultSelection.seriesSlug;
      selectedTab.value = response.defaultSelection.tab;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to load test resources';
      throw err;
    } finally {
      status.value = 'idle';
    }
  }

  async function loadTests(examSlug: string, token?: string | null) {
    if (!selectedSeriesSlug.value) {
      tests.value = [];
      return;
    }

    status.value = 'loading';
    error.value = '';

    try {
      const response = await api.getExamTests(
        examSlug,
        {
          seriesSlug: selectedSeriesSlug.value,
          tab: selectedTab.value,
        },
        token,
      );
      tests.value = response.tests;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to load tests';
      throw err;
    } finally {
      status.value = 'idle';
    }
  }

  async function initialize(examSlug: string, token?: string | null) {
    await loadResources(examSlug, token);
    await loadTests(examSlug, token);
  }

  async function selectSeries(seriesSlug: string, token?: string | null) {
    selectedSeriesSlug.value = seriesSlug;
    const matched = series.value.find((item) => item.slug === seriesSlug) ?? null;
    selectedTab.value = matched?.type === 'topic_group' ? matched.tabs?.[0]?.key ?? null : null;

    if (currentExamSlug.value) {
      await loadTests(currentExamSlug.value, token);
    }
  }

  async function selectTab(tab: TestViewTab['key'], token?: string | null) {
    selectedTab.value = tab;
    if (currentExamSlug.value) {
      await loadTests(currentExamSlug.value, token);
    }
  }

  return {
    resources,
    tests,
    status,
    error,
    selectedSeriesSlug,
    selectedTab,
    exam,
    access,
    series,
    activeSeries,
    initialize,
    selectSeries,
    selectTab,
  };
});
