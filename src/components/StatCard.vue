<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
  tone: string;
}>();
</script>

<template>
  <article class="stat-card" :data-tone="tone">
    <p>{{ label }}</p>
    <strong>{{ value }}</strong>
  </article>
</template>
