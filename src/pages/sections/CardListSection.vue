<template>
  <section class="card-list-section no-drag">
    <div class="card-list-section__greeting">
      <p class="card-list-section__greeting__text">
        <span class="grow-anim">✨</span>자주 사용하는 AI Agent
      </p>
    </div>

    <div class="card-carousel">
      <div
        class="card-carousel__inner"
        :style="{
          transform: `translateX(-${currentCardIndex * 100}%)`,
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }"
      >
        <AgentCard
          :card-index="0"
          :card-info="aiAgentCards[0]"
          type="normal"
          @agent-select="handleAgentSelect"
        />
        <AgentCard
          :card-index="1"
          :card-info="aiAgentCards[1]"
          type="normal"
          @agent-select="handleAgentSelect"
        />
        <AgentCard
          :card-index="2"
          :card-info="aiAgentCards[2]"
          type="faq"
          @agent-select="handleAgentSelect"
        />
      </div>

      <div class="card-carousel__indicators">
        <button
          v-for="(_, index) in 3"
          :key="index"
          class="carousel-dot"
          :class="{ 'carousel-dot--active': index === currentCardIndex }"
          @click="goToCard(index)"
          :aria-label="`Go to agent card ${index + 1}`"
          type="button"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import AgentCard from "@/components/main/card/AgentCard.vue";
import { useDataStore } from "@/stores/model/dataStore";

const dataStore = useDataStore();

const props = defineProps({
  currentCardIndex: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["update:currentCardIndex", "agent-select"]);

const aiAgentCards = computed(() => {
  console.log("📊 aiAgentCards computed 업데이트:", dataStore.aiAgentInfoList);
  return dataStore.aiAgentInfoList || [];
});

const goToCard = (index) => {
  emit("update:currentCardIndex", index);
};

const handleAgentSelect = (payload) => {
  emit("agent-select", payload);
};
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;

.card-list-section {
  animation: fadeInDown 2s ease-out;
  margin-bottom: 5rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }

  &__greeting {
    width: 100%;
    max-width: 984px;
    margin: 0 auto $spacing-6;
    color: $primary-text;

    &__text {
      text-align: left;
      font-size: 1.5rem;
      font-weight: 500;
      margin: 0;
      display: flex;
      align-items: center;
      gap: $spacing-3;

      @media (max-width: 768px) {
        font-size: 20px;
      }
    }

    .grow-anim {
      display: inline-block;
      animation: textGlow 1s ease-in-out infinite;
    }
  }
}

.card-carousel {
  position: relative;
  width: 100%;

  @media (max-width: 768px) {
    overflow: hidden;
    padding-bottom: 30px;
  }

  &__inner {
    display: flex;
    gap: 24px;
    align-items: stretch;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
    max-width: 1064px;
    margin: 0 auto;

    @media (max-width: 768px) {
      flex-wrap: nowrap;
      gap: 0 !important;

      > * {
        flex-shrink: 0;
        flex-basis: 100%;
        width: 100%;
      }
    }
  }

  &__indicators {
    display: none;

    @media (max-width: 768px) {
      display: flex;
      justify-content: center;
      gap: 8px;
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
    }
  }
}

.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.5);
    transform: scale(1.2);
  }

  &--active {
    background-color: var(--primary-color);
    width: 10px;
    height: 10px;
    box-shadow: 0 0 0 2px rgba(208, 2, 27, 0.2);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes textGlow {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
