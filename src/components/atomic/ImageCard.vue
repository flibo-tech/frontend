<template>
  <div class="main-container" :style="adjustPosition">
    <div
      class="image-container"
      :style="{ width: width + 'px', height: height + 'px' }"
      @click="$emit('clicked')"
    >
      <img :src="image" :style="scale ? 'transform: scale(1.5);' : ''" />
    </div>
    <div
      class="text-container"
      :style="customStyleTextContainer"
      @click="$emit('clicked')"
    >
      <p :style="customStyleText">
        {{ name }}
      </p>
      <p
        v-if="subText"
        style="
          font-size: 12px;
          font-weight: normal;
          color: #676767;
          margin-top: 4px;
        "
      >
        {{ subText }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "ImageCard",
  props: {
    name: {
      type: String,
      required: true,
    },
    subText: {
      type: String,
      required: false,
      default: null,
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
    customStyleTextContainer() {
      return {
        "margin-top": (this.position == "bottom" ? 8 + this.spacing : 0) + "px",
        "margin-left": (this.position == "right" ? 16 : 0) + "px",
        width: this.position == "bottom" ? this.width + "px" : "fit-content",
      };
    },
    customStyleText() {
      return {
        width: this.position == "bottom" ? this.width + "px" : "fit-content",
        "font-size":
          (this.fontSize ? this.fontSize : this.is_mobile ? 10 : 12) + "px",
        "font-weight": this.fontWeight,
        "white-space": this.position == "right" ? "nowrap" : "normal",
      };
    },
  },
};
</script>

<style scoped>
.main-container {
  display: flex;
  width: fit-content;
  justify-content: center;
  align-items: center;
}
.image-container {
  overflow: hidden;
  border-radius: 5px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
img {
  width: 100%;
}
.text-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}
.text-container p {
  position: relative;
  margin: 0;
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