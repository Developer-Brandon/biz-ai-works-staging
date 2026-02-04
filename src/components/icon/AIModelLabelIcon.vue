<template>
  <img
    v-if="modelName.toLowerCase().includes('gpt')"
    src="@/assets/images/icon/chat-gpt.png"
    :alt="alt"
    :width="size"
    :height="size"
  />
  <img
    v-else-if="modelName.toLowerCase().includes('sonnet')"
    src="@/assets/images/icon/sonnet.png"
    :alt="alt"
    :width="size"
    :height="size"
  />
</template>

<script setup>
const props = defineProps({
  modelName: { type: String, required: true },
  alt: String,
  size: { type: Number, default: 18 },
});
</script>
