<template>
  <img :src="resolvedSrc" :alt="alt" :width="size" :height="size" />
</template>

<script setup>
const props = defineProps({
  src: { type: String, required: true },
  alt: String,
  size: { type: Number, default: 18 },
});
const resolvedSrc = props.src;
</script>
