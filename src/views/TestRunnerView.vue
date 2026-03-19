<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import QuestionAssetRenderer from '@/components/QuestionAssetRenderer.vue';
import { useAuthStore } from '@/stores/auth';
import { useTestRunnerStore } from '@/stores/testRunner';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const testRunnerStore = useTestRunnerStore();

const paletteQuestions = computed(() => testRunnerStore.session?.questions ?? []);

async function loadRunner(testSlug: string, shouldResume: boolean) {
  try {
    if (shouldResume) {
      await testRunnerStore.resumeSession(testSlug, authStore.user?.token ?? null);
      return;
    }

    await testRunnerStore.startSession(testSlug, authStore.user?.token ?? null);
  } catch (error) {
    console.error('Unable to start session', error);
  }
}

function pauseAndReturn() {
  testRunnerStore.pauseTest();
}

function handlePausedAcknowledge() {
  testRunnerStore.dismissPauseMessage();
  router.push(`/tests/${route.params.examSlug}`);
}

onMounted(async () => {
  const testSlug = typeof route.params.testSlug === 'string' ? route.params.testSlug : '';
  const shouldResume = route.query.resume === '1';

  if (testSlug) {
    await loadRunner(testSlug, shouldResume);
  }
});

watch(
  () => testRunnerStore.submitted,
  (submitted) => {
    if (submitted) {
      router.push(`/tests/${route.params.examSlug}/${route.params.testSlug}/instructions`);
    }
  },
);

onBeforeUnmount(() => {
  testRunnerStore.teardown();
});
</script>

<template>
  <main class="runner-shell">
    <header class="runner-header">
      <div class="runner-header__brand">
        <span class="instruction-brand__logo">m</span>
        <strong>{{ testRunnerStore.session?.test.title ?? 'Starting test...' }}</strong>
      </div>

      <div class="runner-header__meta">
        <span class="runner-chip">Time Left {{ testRunnerStore.formattedTimer }}</span>
        <button type="button" class="runner-pause-button" @click="pauseAndReturn">
          Pause Test
        </button>
        <span class="runner-chip runner-chip--muted">{{ authStore.displayName }}</span>
      </div>
    </header>

    <section class="runner-layout">
      <article class="runner-main panel">
        <p v-if="testRunnerStore.status === 'loading' && !testRunnerStore.session" class="tests-state">
          Starting test session...
        </p>

        <p v-else-if="testRunnerStore.error" class="form-message is-error">
          {{ testRunnerStore.error }}
        </p>

        <template v-else-if="testRunnerStore.currentQuestion">
          <div class="runner-section-tag">
            {{
              testRunnerStore.session?.sections.find(
                (section) => section.id === testRunnerStore.currentQuestion?.sectionId,
              )?.sectionName ?? 'Section'
            }}
          </div>

          <div class="runner-question-header">
            <strong>Question No.{{ testRunnerStore.currentQuestion.questionNumber }}</strong>
            <select v-model="testRunnerStore.selectedLanguage" class="runner-language">
              <option
                v-for="language in testRunnerStore.session?.supportedLanguages ?? []"
                :key="language"
                :value="language"
              >
                {{ language }}
              </option>
            </select>
          </div>

          <p class="runner-question-prompt">{{ testRunnerStore.currentQuestion.prompt }}</p>

          <div
            v-if="testRunnerStore.currentQuestion.assets?.length"
            class="runner-question-assets"
          >
            <QuestionAssetRenderer
              v-for="asset in testRunnerStore.currentQuestion.assets"
              :key="asset.url"
              :asset="asset"
            />
          </div>

          <div class="runner-options">
            <label
              v-for="option in testRunnerStore.currentQuestion.options"
              :key="option.key"
              class="runner-option"
            >
              <input
                type="radio"
                name="selected-option"
                :checked="testRunnerStore.answers[testRunnerStore.currentQuestion.id] === option.key"
                @change="testRunnerStore.selectOption(option)"
              />
              <span>{{ option.text }}</span>
            </label>
          </div>
        </template>
      </article>

      <aside class="runner-sidebar">
        <section class="panel runner-sidebar__panel">
          <div class="runner-sidebar__summary">
            <span class="legend-pill is-answered">
              {{ testRunnerStore.paletteCounts.answered }}
            </span>
            <span>Answered</span>
          </div>
          <div class="runner-sidebar__summary">
            <span class="legend-pill is-review">
              {{ testRunnerStore.paletteCounts.markedForReview + testRunnerStore.paletteCounts.answeredAndMarkedForReview }}
            </span>
            <span>Marked</span>
          </div>
          <div class="runner-sidebar__summary">
            <span class="legend-pill is-not-visited">
              {{ testRunnerStore.paletteCounts.notVisited }}
            </span>
            <span>Not Visited</span>
          </div>
          <div class="runner-sidebar__summary">
            <span class="legend-pill is-not-answered">
              {{ testRunnerStore.paletteCounts.notAnswered }}
            </span>
            <span>Not Answered</span>
          </div>

          <div class="runner-palette">
            <button
              v-for="(question, index) in paletteQuestions"
              :key="question.id"
              type="button"
              class="runner-palette__item"
              :class="`is-${testRunnerStore.questionStatuses[question.id]}`"
              @click="testRunnerStore.goToQuestion(index)"
            >
              {{ question.questionNumber }}
            </button>
          </div>
        </section>
      </aside>
    </section>

    <footer class="runner-footer">
      <div class="runner-footer__left">
        <button type="button" class="runner-secondary" @click="testRunnerStore.markForReviewAndNext()">
          MARK FOR REVIEW & NEXT
        </button>
        <button type="button" class="runner-secondary runner-secondary--muted" @click="testRunnerStore.clearResponse()">
          CLEAR RESPONSE
        </button>
      </div>

      <div class="runner-footer__right">
        <button type="button" class="runner-primary" @click="testRunnerStore.saveAndNext()">
          SAVE & NEXT
        </button>
        <button type="button" class="runner-primary runner-primary--submit" @click="testRunnerStore.submitTest()">
          SUBMIT TEST
        </button>
      </div>
    </footer>

    <div v-if="testRunnerStore.pauseMessageVisible" class="runner-pause-overlay">
      <div class="runner-pause-dialog">
        <p>Test has been paused. You can resume the test by visiting the main test page.</p>
        <button type="button" class="runner-primary runner-pause-dialog__button" @click="handlePausedAcknowledge">
          OK
        </button>
      </div>
    </div>
  </main>
</template>
