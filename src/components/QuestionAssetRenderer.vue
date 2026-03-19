<script setup lang="ts">
import type { TestQuestionAsset } from '@/types/api';

defineProps<{
  asset: TestQuestionAsset;
}>();
</script>

<template>
  <figure class="question-asset">
    <img :src="asset.url" :alt="asset.altText ?? asset.caption ?? 'Question asset'" />
    <figcaption v-if="asset.caption">{{ asset.caption }}</figcaption>
  </figure>
</template>
