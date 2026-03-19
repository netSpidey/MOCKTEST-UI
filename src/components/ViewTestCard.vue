<script setup lang="ts">
import type { TestViewTestItem } from '@/types/api';

const emit = defineEmits<{
  start: [testSlug: string, resumable: boolean];
}>();

defineProps<{
  test: TestViewTestItem;
  resumable?: boolean;
}>();
</script>

<template>
  <article class="view-test-card" :class="{ 'is-locked': test.locked }">
    <div class="view-test-card__header">
      <h3>{{ test.title }}</h3>
      <span class="view-test-card__pill">{{ test.accessType }}</span>
    </div>

    <div class="view-test-card__meta">
      <span>{{ test.totalQuestions }} Questions</span>
      <span>{{ test.durationMinutes }} Min</span>
      <span>{{ test.totalMarks }} Marks</span>
    </div>

    <button
      type="button"
      class="view-test-card__cta"
      :class="{ 'is-locked': test.locked }"
      :disabled="test.locked"
      @click="emit('start', test.slug, Boolean(resumable))"
    >
      {{ resumable ? 'Resume Test' : test.ctaLabel }}
    </button>
  </article>
</template>
