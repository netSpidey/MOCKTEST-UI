import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/lib/api';
import type {
  ActivityItem,
  CreateRolePayload,
  ExamCategory,
  QuickMetric,
  TestCatalogSection,
  TestSeries,
} from '@/types/api';

const demoTests: TestSeries[] = [
  {
    id: 'banking-001',
    title: 'IBPS PO Full Mock 12',
    focus: 'Prelims mixed practice',
    questions: 100,
    duration: '60 min',
    difficulty: 'Moderate',
    completion: 72,
    nextSlot: 'Today, 7:30 PM',
  },
  {
    id: 'banking-002',
    title: 'SBI Clerk Speed Drill',
    focus: 'Reasoning + English',
    questions: 50,
    duration: '35 min',
    difficulty: 'Easy',
    completion: 48,
    nextSlot: 'Tomorrow, 6:00 AM',
  },
  {
    id: 'banking-003',
    title: 'Quant Accuracy Challenge',
    focus: 'Arithmetic and DI',
    questions: 40,
    duration: '30 min',
    difficulty: 'Advanced',
    completion: 85,
    nextSlot: 'Saturday, 9:00 AM',
  },
];

const demoActivity: ActivityItem[] = [
  {
    id: 'activity-1',
    title: 'Mock submitted',
    detail: 'IBPS PO Full Mock 11 completed with 82 percentile.',
    when: '2 hours ago',
  },
  {
    id: 'activity-2',
    title: 'Weak area detected',
    detail: 'Data interpretation accuracy dropped below 60%.',
    when: 'Yesterday',
  },
  {
    id: 'activity-3',
    title: 'Study streak',
    detail: 'You are on a 9-day revision streak.',
    when: 'This week',
  },
];

const examCategories: ExamCategory[] = [
  {
    id: 'banking',
    title: 'Banking & Insurance',
    accent: 'gold',
    exams: ['SBI PO', 'IBPS PO', 'IBPS Clerk', 'RBI Assistant'],
  },
  {
    id: 'regulatory',
    title: 'Regulatory',
    accent: 'blue',
    exams: ['RBI Grade B', 'SEBI Grade A', 'NABARD Grade A', 'SIDBI Grade A'],
  },
  {
    id: 'ssc',
    title: 'SSC/Railway',
    accent: 'teal',
    exams: ['SSC CGL', 'SSC CHSL', 'RRB NTPC', 'SSC MTS'],
  },
  {
    id: 'state',
    title: 'State Exams',
    accent: 'slate',
    exams: ['UPPSC APS', 'UPSSSC PET', 'BSSC Inter Level', 'AAI ATC'],
  },
];

const quickMetrics: QuickMetric[] = [
  {
    label: 'App Downloads',
    value: '1M+',
    caption: 'Learners reached through mobile practice.',
  },
  {
    label: 'Mock Tests Taken',
    value: '50M+',
    caption: 'High-volume practice sessions completed.',
  },
  {
    label: 'Avg. Rating',
    value: '4.6/5',
    caption: 'A strong trust signal for aspirant outcomes.',
  },
];

export const useDashboardStore = defineStore('dashboard', () => {
  const tests = ref<TestSeries[]>(demoTests);
  const activity = ref<ActivityItem[]>(demoActivity);
  const categories = ref<ExamCategory[]>(examCategories);
  const quickMetricsCards = ref<QuickMetric[]>(quickMetrics);
  const testCatalog = ref<TestCatalogSection[]>([]);
  const catalogStatus = ref<'idle' | 'loading'>('idle');
  const catalogError = ref('');
  const hasLoadedCatalog = ref(false);
  const loadedCatalogPlan = ref<string | null>(null);
  const roleStatus = ref<'idle' | 'loading'>('idle');
  const roleMessage = ref('');
  const roleError = ref('');

  const testFilterOptions = computed(() =>
    testCatalog.value.map((section) => ({
      value: section.id,
      label: section.title,
    })),
  );

  const stats = computed(() => {
    const completionAverage = Math.round(
      tests.value.reduce((sum, test) => sum + test.completion, 0) / tests.value.length,
    );

    return [
      { label: 'Mock Tests Scheduled', value: String(tests.value.length).padStart(2, '0'), tone: 'gold' },
      { label: 'Average Completion', value: `${completionAverage}%`, tone: 'teal' },
      { label: 'Focus Accuracy', value: '84%', tone: 'blue' },
      { label: 'Current Streak', value: '09 days', tone: 'slate' },
    ];
  });

  function getFilteredTestCatalog(filterId: string) {
    if (filterId === 'all') {
      return testCatalog.value;
    }

    return testCatalog.value.filter((section) => section.id === filterId);
  }

  async function fetchTestCatalog(plan?: string | null) {
    catalogStatus.value = 'loading';
    catalogError.value = '';

    try {
      testCatalog.value = await api.getTestCatalog(plan);
      hasLoadedCatalog.value = true;
      loadedCatalogPlan.value = plan ?? 'basic';
    } catch (err) {
      catalogError.value = err instanceof Error ? err.message : 'Unable to load test catalog';
      throw err;
    } finally {
      catalogStatus.value = 'idle';
    }
  }

  async function createRole(payload: CreateRolePayload, token?: string | null) {
    roleStatus.value = 'loading';
    roleError.value = '';
    roleMessage.value = '';

    try {
      await api.createRole(payload, token);
      roleMessage.value = `Role "${payload.name}" created successfully.`;
    } catch (err) {
      roleError.value = err instanceof Error ? err.message : 'Unable to create role';
      throw err;
    } finally {
      roleStatus.value = 'idle';
    }
  }

  return {
    tests,
    activity,
    categories,
    quickMetricsCards,
    testCatalog,
    catalogStatus,
    catalogError,
    hasLoadedCatalog,
    loadedCatalogPlan,
    testFilterOptions,
    stats,
    getFilteredTestCatalog,
    fetchTestCatalog,
    roleStatus,
    roleMessage,
    roleError,
    createRole,
  };
});
