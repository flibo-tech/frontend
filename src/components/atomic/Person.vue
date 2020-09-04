<template>
  <div class="main-container" :style="adjustPosition">
    <div
      class="image-container"
      :style="{ width: width + 'px', height: height + 'px' }"
      @click="$emit('clicked')"
    >
      <img :src="image" :style="scale ? 'transform: scale(1.5);' : ''" />
    </div>
    <p
      :style="{
        'margin-top': (position == 'bottom' ? 8 + spacing : 0) + 'px',
        'margin-left': (position == 'right' ? 16 : 0) + 'px',
        width: position == 'bottom' ? width + 'px' : 'fit-content',
        'font-size': (fontSize ? fontSize : is_mobile ? 10 : 12) + 'px',
        'font-weight': fontWeight,
        'white-space': position == 'right' ? 'nowrap' : 'normal',
      }"
      @click="$emit('clicked')"
    >
      {{ name }}
    </p>
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
      require: false,
    },
    scale: {
      type: Boolean,
      default: false,
      require: false,
    },
    fontSize: {
      type: Number,
      default: null,
      require: false,
    },
    fontWeight: {
      type: String,
      default: "700",
      require: false,
    },
  },

  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
    };
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
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  text-align: center;
  text-transform: capitalize;
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
