<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTestRunnerStore } from '@/stores/testRunner';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const testRunnerStore = useTestRunnerStore();

const hasResumableAttempt = computed(
  () =>
    testRunnerStore.hasActiveAttempt &&
    testRunnerStore.instructions?.test.slug === route.params.testSlug,
);

async function loadInstructionsPage(testSlug: string) {
  try {
    await testRunnerStore.loadInstructions(testSlug, authStore.user?.token ?? null);
  } catch (error) {
    console.error('Unable to load instructions', error);
  }
}

function beginTest() {
  if (!testRunnerStore.instructions?.access.canBegin) {
    return;
  }

  router.push(`/tests/${route.params.examSlug}/${route.params.testSlug}/start`);
}

function resumeTest() {
  router.push(`/tests/${route.params.examSlug}/${route.params.testSlug}/start?resume=1`);
}

onMounted(async () => {
  const testSlug = typeof route.params.testSlug === 'string' ? route.params.testSlug : '';
  if (testSlug) {
    await loadInstructionsPage(testSlug);
  }
});

watch(
  () => route.params.testSlug,
  async (testSlug) => {
    if (typeof testSlug === 'string' && testSlug) {
      await loadInstructionsPage(testSlug);
    }
  },
);
</script>

<template>
  <main class="instruction-shell">
    <header class="instruction-header">
      <div class="instruction-brand">
        <span class="instruction-brand__logo">m</span>
        <div>
          <strong>Mocktest Pro</strong>
          <p>{{ testRunnerStore.instructions?.test.title ?? 'Loading instructions...' }}</p>
        </div>
      </div>
      <div class="instruction-user">
        <span>{{ authStore.displayName }}</span>
      </div>
    </header>

    <section class="instruction-panel">
      <p v-if="testRunnerStore.status === 'loading' && !testRunnerStore.instructions" class="tests-state">
        Loading test instructions...
      </p>

      <p v-else-if="testRunnerStore.error" class="form-message is-error">
        {{ testRunnerStore.error }}
      </p>

      <template v-else-if="testRunnerStore.instructions">
        <div class="instruction-topline">
          <div>
            <h1>Please read the instructions carefully</h1>
            <p class="instruction-summary">
              {{ testRunnerStore.instructions.test.examTitle }}
              <span aria-hidden="true">&middot;</span>
              {{ testRunnerStore.instructions.access.planName }} plan
            </p>
          </div>
          <div class="instruction-language">
            <label for="instruction-language">Choose default language</label>
            <select id="instruction-language" v-model="testRunnerStore.selectedLanguage">
              <option
                v-for="language in testRunnerStore.instructions.supportedLanguages"
                :key="language"
                :value="language"
              >
                {{ language }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="hasResumableAttempt" class="instruction-resume-card">
          <div>
            <strong>Paused attempt found</strong>
            <p>Your timer is stopped and your answers are saved on this device. You can resume from where you left off.</p>
          </div>
          <button type="button" class="runner-primary instruction-resume-button" @click="resumeTest">
            RESUME TEST
          </button>
        </div>

        <div class="instruction-stats">
          <article class="instruction-stat">
            <strong>{{ testRunnerStore.instructions.summary.totalQuestions }}</strong>
            <span>Total Questions</span>
          </article>
          <article class="instruction-stat">
            <strong>{{ testRunnerStore.instructions.summary.durationMinutes }} Min</strong>
            <span>Total Time</span>
          </article>
          <article class="instruction-stat">
            <strong>{{ testRunnerStore.instructions.summary.totalMarks }}</strong>
            <span>Total Marks</span>
          </article>
        </div>

        <section class="instruction-table-card">
          <table class="instruction-table">
            <thead>
              <tr>
                <th>Section #</th>
                <th>Section Name</th>
                <th>Total Questions</th>
                <th>Max Score</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="section in testRunnerStore.instructions.sections" :key="section.sectionNumber">
                <td>{{ section.sectionNumber }}</td>
                <td>{{ section.sectionName }}</td>
                <td>{{ section.totalQuestions }}</td>
                <td>{{ section.maxScore }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="instruction-block">
          <h2>General Instructions</h2>
          <ol>
            <li v-for="item in testRunnerStore.instructions.instructions.general" :key="item">
              {{ item }}
            </li>
          </ol>
        </section>

        <section class="instruction-block">
          <h2>Navigating to a Question</h2>
          <ol>
            <li v-for="item in testRunnerStore.instructions.instructions.navigation" :key="item">
              {{ item }}
            </li>
          </ol>
        </section>

        <section class="instruction-block">
          <h2>Answering a Question</h2>
          <ol>
            <li v-for="item in testRunnerStore.instructions.instructions.answering" :key="item">
              {{ item }}
            </li>
          </ol>
        </section>

        <footer class="instruction-footer">
          <div class="instruction-footer__legend">
            <span class="legend-pill is-not-visited">Not Visited</span>
            <span class="legend-pill is-not-answered">Not Answered</span>
            <span class="legend-pill is-answered">Answered</span>
            <span class="legend-pill is-review">Review</span>
          </div>
          <div class="instruction-footer__actions">
            <button
              v-if="hasResumableAttempt"
              type="button"
              class="runner-secondary instruction-footer__secondary"
              @click="resumeTest"
            >
              RESUME TEST
            </button>
            <button
              type="button"
              class="instruction-begin-button"
              :disabled="!testRunnerStore.instructions.access.canBegin"
              @click="beginTest"
            >
              {{
                testRunnerStore.instructions.access.canBegin
                  ? hasResumableAttempt
                    ? 'RESTART TEST'
                    : 'I AM READY TO BEGIN'
                  : 'LOCKED FOR YOUR PLAN'
              }}
            </button>
          </div>
        </footer>
      </template>
    </section>
  </main>
</template>
