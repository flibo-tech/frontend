<template>
  <div class="bar" v-if="value <= maxValue && value >= 0">
    <div class="progress-bar">
      <div
        class="progress"
        :style="{
          width: value * 4 + '%'
        }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProgressBar",
  props: {
    value: {
      type: Number,
      default: 0
    },
    maxValue: {
      type: Number,
      default: 25
    }
  }
};
</script>

<style scoped>
.bar {
  width: 100%;
}
.progress-bar {
  background-color: #363340;
  border-radius: 5px;
  height: 16px;
}
.progress {
  background-color: #a2d194;
  height: 16px;
  border-radius: 5px;
  transition: width 500ms;
}
</style>