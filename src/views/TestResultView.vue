<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTestRunnerStore } from '@/stores/testRunner';
import type { TestResultQuestionAnalysis } from '@/types/api';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const testRunnerStore = useTestRunnerStore();

const result = computed(() => testRunnerStore.submissionResult);
const sectionQuestions = computed(() => {
  const questionGroups = new Map<string, TestResultQuestionAnalysis[]>();

  result.value?.questions.forEach((question) => {
    const existing = questionGroups.get(question.sectionId) ?? [];
    existing.push(question);
    questionGroups.set(question.sectionId, existing);
  });

  return result.value?.sections.map((section) => ({
    ...section,
    questions: questionGroups.get(section.sectionId) ?? [],
  })) ?? [];
});

const formattedSubmittedAt = computed(() => {
  if (!result.value) {
    return '';
  }

  return new Date(result.value.summary.submittedAt).toLocaleString();
});

const formattedTimeSpent = computed(() => {
  if (!result.value) {
    return '';
  }

  const totalSeconds = result.value.summary.timeSpentSeconds;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
});

function startAgain() {
  router.push(`/tests/${route.params.examSlug}/${route.params.testSlug}/instructions`);
}

function goToTestPage() {
  router.push(`/tests/${route.params.examSlug}`);
}

onMounted(() => {
  if (!result.value) {
    router.replace(`/tests/${route.params.examSlug}/${route.params.testSlug}/instructions`);
  }
});
</script>

<template>
  <main class="result-shell">
    <header class="runner-header">
      <div class="runner-header__brand">
        <span class="instruction-brand__logo">m</span>
        <strong>{{ result?.test.title ?? 'Test Result' }}</strong>
      </div>

      <div class="runner-header__meta">
        <span class="runner-chip runner-chip--muted">{{ authStore.displayName }}</span>
      </div>
    </header>

    <section v-if="result" class="result-layout">
      <article class="result-hero panel">
        <div>
          <p class="result-hero__eyebrow">Test Result</p>
          <h1>{{ result.test.examTitle }}</h1>
          <p class="result-hero__meta">
            Submitted {{ formattedSubmittedAt }}
            <span aria-hidden="true">&middot;</span>
            Language {{ result.summary.selectedLanguage }}
            <span aria-hidden="true">&middot;</span>
            Time Spent {{ formattedTimeSpent }}
          </p>

          <div class="result-hero__actions">
            <button type="button" class="runner-secondary" @click="goToTestPage">
              GO TO TEST PAGE
            </button>
            <button type="button" class="runner-primary" @click="startAgain">
              TAKE TEST AGAIN
            </button>
          </div>
        </div>

        <div class="result-score-card">
          <span>Total Score</span>
          <strong>{{ result.summary.score }} / {{ result.summary.maxScore }}</strong>
          <p>{{ result.summary.percentage }}% overall</p>
        </div>
      </article>

      <section class="result-stats">
        <article class="instruction-stat">
          <strong>{{ result.summary.correctAnswers }}</strong>
          <span>Correct</span>
        </article>
        <article class="instruction-stat">
          <strong>{{ result.summary.incorrectAnswers }}</strong>
          <span>Incorrect</span>
        </article>
        <article class="instruction-stat">
          <strong>{{ result.summary.unanswered }}</strong>
          <span>Unanswered</span>
        </article>
        <article class="instruction-stat">
          <strong>{{ result.summary.markedForReview }}</strong>
          <span>Marked for Review</span>
        </article>
      </section>

      <section class="result-block">
        <div class="panel__header">
          <div>
            <h2>Section Analysis</h2>
            <p class="tests-state">Score and attempt summary for each section.</p>
          </div>
        </div>

        <div class="result-section-grid">
          <article
            v-for="section in result.sections"
            :key="section.sectionId"
            class="result-section-card"
          >
            <div class="result-section-card__header">
              <h3>{{ section.sectionName }}</h3>
              <strong>{{ section.score }} / {{ section.maxScore }}</strong>
            </div>
            <p>Answered {{ section.answered }} | Not Answered {{ section.notAnswered }}</p>
            <p>Marked for Review {{ section.markedForReview }} | Not Visited {{ section.notVisited }}</p>
            <p>Correct {{ section.correctAnswers }} | Incorrect {{ section.incorrectAnswers }} | Unanswered {{ section.unanswered }}</p>
          </article>
        </div>
      </section>

      <section class="result-block">
        <div class="panel__header">
          <div>
            <h2>Detailed Analysis</h2>
            <p class="tests-state">Question-wise review with your answer, the correct answer, and marks awarded.</p>
          </div>
        </div>

        <div class="result-question-sections">
          <section
            v-for="section in sectionQuestions"
            :key="section.sectionId"
            class="result-question-section"
          >
            <h3>{{ section.sectionName }}</h3>

            <article
              v-for="question in section.questions"
              :key="question.questionId"
              class="result-question-card"
              :class="`is-${question.outcome}`"
            >
              <div class="result-question-card__header">
                <strong>Question {{ question.questionNumber }}</strong>
                <span>{{ question.marksAwarded }} / {{ question.maxMarks }}</span>
              </div>

              <p class="result-question-card__prompt">{{ question.prompt }}</p>

              <div class="result-question-card__meta">
                <span>Status: {{ question.status }}</span>
                <span>Your Answer: {{ question.selectedOptionText ?? 'Not Answered' }}</span>
                <span>Correct Answer: {{ question.correctOptionText }}</span>
                <span>Outcome: {{ question.outcome }}</span>
              </div>
            </article>
          </section>
        </div>
      </section>
    </section>
  </main>
</template>
