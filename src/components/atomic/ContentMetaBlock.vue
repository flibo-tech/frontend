<template>
  <div class="container" :style="'font-size: ' + fontSize + 'px;'">
    <span
      v-for="(item, index) in textArray"
      :key="index"
      :class="RegExp(/^\d*\.*\d+$/).test(item) ? 'highlight' : ''"
    >
      {{ item }}
    </span>
  </div>
</template>

<script>
export default {
  name: "ContentMetaBlock",
  props: {
    text: {
      required: true,
    },
    fontSize: {
      type: Number,
      default: 14,
      require: false,
    },
  },
  computed: {
    textArray() {
      return JSON.stringify(this.text).replace(/"/g, "").split(" ");
    },
  },
};
</script>

<style scoped>
.container {
  text-align: center;
  font-family: "Roboto", sans-serif;
  font-style: normal;
  font-weight: normal;
  line-height: 1.5;
  color: #222222;
  background: #f4f4f4;
  padding: 1px 5px;
  width: fit-content;
  border-radius: 4px;
}
.highlight {
  font-weight: bold;
}
</style>
