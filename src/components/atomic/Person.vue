<template>
  <div class="main-container" :style="adjustPosition">
    <div
      class="image-container"
      :style="{ width: width + 'px', height: height + 'px' }"
    >
      <img :src="image" />
    </div>
    <p :style="{ top: 8 + spacing + 'px', width: width + 'px' }">{{ name }}</p>
  </div>
</template>

<script>
export default {
  name: "Person",

  props: {
    name: {
      type: String,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    spacing: {
      type: Number,
      default: 0,
      require: false,
    },
    position: {
      type: String,
      default: "bottom",
    },
  },

  computed: {
    adjustPosition() {
      switch (this.position) {
        case "right":
          return {
            "flex-direction": "row",
          };
        case "left":
          return {
            "flex-direction": "row-reverse",
          };
        case "top":
          return {
            "flex-direction": "column-reverse",
          };
        default:
          return {
            "flex-direction": "column",
          };
      }
    },
  },
};
</script>

<style scoped>
.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-container {
  overflow: hidden;
  border-radius: 5px;
}

img {
  width: 100%;
}

p {
  position: relative;
  white-space: normal;
  font-size: 10px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  text-align: center;
  color: #222222;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
</style>
