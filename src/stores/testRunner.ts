import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/lib/api';
import type {
  TestInstructionsResponse,
  TestQuestionOption,
  TestSessionQuestion,
  TestSessionResponse,
} from '@/types/api';

type QuestionStatus =
  | 'notVisited'
  | 'notAnswered'
  | 'answered'
  | 'markedForReview'
  | 'answeredAndMarkedForReview';

type AnswerMap = Record<string, string | null>;
type StatusMap = Record<string, QuestionStatus>;

type PersistedAttempt = {
  testSlug: string;
  session: TestSessionResponse;
  selectedLanguage: string;
  currentQuestionIndex: number;
  timeRemainingSeconds: number;
  answers: AnswerMap;
  questionStatuses: StatusMap;
  paused: boolean;
};

const STORAGE_KEY = 'mocktest-active-attempt';

let timerHandle: ReturnType<typeof setInterval> | null = null;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export const useTestRunnerStore = defineStore('test-runner', () => {
  const instructions = ref<TestInstructionsResponse | null>(null);
  const session = ref<TestSessionResponse | null>(null);
  const status = ref<'idle' | 'loading'>('idle');
  const error = ref('');
  const selectedLanguage = ref('English');
  const currentQuestionIndex = ref(0);
  const timeRemainingSeconds = ref(0);
  const answers = ref<AnswerMap>({});
  const questionStatuses = ref<StatusMap>({});
  const currentTestSlug = ref<string | null>(null);
  const submitted = ref(false);
  const paused = ref(false);
  const pauseMessageVisible = ref(false);

  const currentQuestion = computed<TestSessionQuestion | null>(
    () => session.value?.questions[currentQuestionIndex.value] ?? null,
  );

  const hasActiveAttempt = computed(
    () =>
      Boolean(session.value && currentTestSlug.value && !submitted.value) ||
      Boolean(getPersistedAttempt()),
  );

  const resumableTestSlug = computed(() => {
    const persistedAttempt = getPersistedAttempt();
    if (persistedAttempt?.paused) {
      return persistedAttempt.testSlug;
    }

    return null;
  });

  const formattedTimer = computed(() => {
    const minutes = Math.floor(timeRemainingSeconds.value / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (timeRemainingSeconds.value % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  });

  const paletteCounts = computed(() => {
    const counts: Record<QuestionStatus, number> = {
      notVisited: 0,
      notAnswered: 0,
      answered: 0,
      markedForReview: 0,
      answeredAndMarkedForReview: 0,
    };

    Object.values(questionStatuses.value).forEach((state) => {
      counts[state] += 1;
    });

    return counts;
  });

  function getPersistedAttempt(): PersistedAttempt | null {
    if (!canUseStorage()) {
      return null;
    }

    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as PersistedAttempt;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  function persistAttempt() {
    if (!canUseStorage() || !session.value || !currentTestSlug.value || submitted.value) {
      return;
    }

    const payload: PersistedAttempt = {
      testSlug: currentTestSlug.value,
      session: session.value,
      selectedLanguage: selectedLanguage.value,
      currentQuestionIndex: currentQuestionIndex.value,
      timeRemainingSeconds: timeRemainingSeconds.value,
      answers: answers.value,
      questionStatuses: questionStatuses.value,
      paused: paused.value,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function clearPersistedAttempt() {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }

  function resetTimer() {
    if (timerHandle) {
      clearInterval(timerHandle);
      timerHandle = null;
    }
  }

  function resetTransientFlags() {
    submitted.value = false;
    paused.value = false;
    pauseMessageVisible.value = false;
  }

  function initializeQuestionState(questions: TestSessionQuestion[]) {
    answers.value = {};
    questionStatuses.value = {};

    for (const question of questions) {
      answers.value[question.id] = null;
      questionStatuses.value[question.id] = 'notVisited';
    }
  }

  function setCurrentQuestion(index: number) {
    const questions = session.value?.questions ?? [];
    if (index < 0 || index >= questions.length) {
      return;
    }

    currentQuestionIndex.value = index;
    const question = questions[index];
    if (questionStatuses.value[question.id] === 'notVisited') {
      questionStatuses.value[question.id] = 'notAnswered';
    }
    persistAttempt();
  }

  async function loadInstructions(testSlug: string, token?: string | null) {
    status.value = 'loading';
    error.value = '';

    try {
      instructions.value = await api.getTestInstructions(testSlug, token);
      currentTestSlug.value = testSlug;

      const persistedAttempt = getPersistedAttempt();
      if (persistedAttempt?.testSlug === testSlug) {
        selectedLanguage.value = persistedAttempt.selectedLanguage;
        paused.value = persistedAttempt.paused;
      } else {
        selectedLanguage.value = instructions.value.defaultLanguage;
        paused.value = false;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to load test instructions';
      throw err;
    } finally {
      status.value = 'idle';
    }
  }

  async function startSession(testSlug: string, token?: string | null) {
    status.value = 'loading';
    error.value = '';
    resetTransientFlags();

    try {
      session.value = await api.getTestSession(testSlug, token);
      currentTestSlug.value = testSlug;
      selectedLanguage.value = session.value.defaultLanguage;
      timeRemainingSeconds.value = session.value.durationMinutes * 60;
      initializeQuestionState(session.value.questions);
      setCurrentQuestion(0);
      startTimer();
      persistAttempt();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to start test session';
      throw err;
    } finally {
      status.value = 'idle';
    }
  }

  async function resumeSession(testSlug: string, token?: string | null) {
    const persistedAttempt = getPersistedAttempt();

    if (!persistedAttempt || persistedAttempt.testSlug !== testSlug) {
      await startSession(testSlug, token);
      return;
    }

    status.value = 'loading';
    error.value = '';

    try {
      currentTestSlug.value = persistedAttempt.testSlug;
      session.value = persistedAttempt.session;
      selectedLanguage.value = persistedAttempt.selectedLanguage;
      currentQuestionIndex.value = persistedAttempt.currentQuestionIndex;
      timeRemainingSeconds.value = persistedAttempt.timeRemainingSeconds;
      answers.value = persistedAttempt.answers;
      questionStatuses.value = persistedAttempt.questionStatuses;
      resetTransientFlags();
      setCurrentQuestion(currentQuestionIndex.value);
      startTimer();
      persistAttempt();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to resume test session';
      throw err;
    } finally {
      status.value = 'idle';
    }
  }

  function startTimer() {
    if (paused.value) {
      return;
    }

    resetTimer();
    timerHandle = setInterval(() => {
      if (timeRemainingSeconds.value <= 1) {
        timeRemainingSeconds.value = 0;
        resetTimer();
        submitted.value = true;
        clearPersistedAttempt();
        return;
      }

      timeRemainingSeconds.value -= 1;
      persistAttempt();
    }, 1000);
  }

  function selectOption(option: TestQuestionOption) {
    if (!currentQuestion.value || paused.value) {
      return;
    }

    answers.value[currentQuestion.value.id] = option.key;
    persistAttempt();
  }

  function clearResponse() {
    if (!currentQuestion.value || paused.value) {
      return;
    }

    answers.value[currentQuestion.value.id] = null;
    questionStatuses.value[currentQuestion.value.id] = 'notAnswered';
    persistAttempt();
  }

  function moveToNextQuestion() {
    const nextIndex = currentQuestionIndex.value + 1;
    if (session.value && nextIndex < session.value.questions.length) {
      setCurrentQuestion(nextIndex);
    }
  }

  function saveAndNext() {
    if (!currentQuestion.value || paused.value) {
      return;
    }

    questionStatuses.value[currentQuestion.value.id] = answers.value[currentQuestion.value.id]
      ? 'answered'
      : 'notAnswered';
    persistAttempt();
    moveToNextQuestion();
  }

  function markForReviewAndNext() {
    if (!currentQuestion.value || paused.value) {
      return;
    }

    questionStatuses.value[currentQuestion.value.id] = answers.value[currentQuestion.value.id]
      ? 'answeredAndMarkedForReview'
      : 'markedForReview';
    persistAttempt();
    moveToNextQuestion();
  }

  function goToQuestion(index: number) {
    if (paused.value) {
      return;
    }

    setCurrentQuestion(index);
  }

  function pauseTest() {
    if (!session.value || submitted.value) {
      return;
    }

    paused.value = true;
    pauseMessageVisible.value = true;
    resetTimer();
    persistAttempt();
  }

  function dismissPauseMessage() {
    pauseMessageVisible.value = false;
  }

  function isResumableTest(testSlug: string) {
    return resumableTestSlug.value === testSlug;
  }

  function submitTest() {
    submitted.value = true;
    pauseMessageVisible.value = false;
    paused.value = false;
    resetTimer();
    clearPersistedAttempt();
  }

  function teardown() {
    resetTimer();
  }

  return {
    instructions,
    session,
    status,
    error,
    selectedLanguage,
    currentQuestionIndex,
    currentQuestion,
    timeRemainingSeconds,
    formattedTimer,
    answers,
    questionStatuses,
    paletteCounts,
    submitted,
    paused,
    pauseMessageVisible,
    hasActiveAttempt,
    resumableTestSlug,
    loadInstructions,
    startSession,
    resumeSession,
    setCurrentQuestion,
    selectOption,
    clearResponse,
    saveAndNext,
    markForReviewAndNext,
    goToQuestion,
    pauseTest,
    dismissPauseMessage,
    isResumableTest,
    submitTest,
    teardown,
  };
});
