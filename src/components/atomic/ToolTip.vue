<template>
  <div class="tooltip-container" :style="containerStyle">
    <div class="tooltip-text" :style="textStyle">
      {{ text }}
    </div>
    <div class="tooltip-triangle-box" :style="triangleBoxStyle">
      <div class="tooltip-triangle" :style="triangleStyle" />
    </div>
  </div>
</template>

<script>
export default {
  name: "ToolTip",
  props: {
    text: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: false,
      default: "#939393",
    },
    bg: {
      type: String,
      required: false,
      default: "#E4E4E4",
    },
    fontSize: {
      type: Number,
      required: false,
      default: 12,
    },
    tip: {
      type: String,
      required: false,
      default: "left",
    },
    reverse: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    textStyle() {
      return (
        `color: ` +
        this.color +
        `;
                  font-size: ` +
        this.fontSize +
        `px;
                  background-color: ` +
        this.bg +
        `;`
      );
    },
    containerStyle() {
      return (
        `flex-direction: ` + (this.reverse ? "column-reverse" : "column") + `;`
      );
    },
    triangleBoxStyle() {
      return (
        `justify-items: ` +
        (this.tip == "left"
          ? "flex-start"
          : this.tip == "right"
          ? "flex-end"
          : "center") +
        `;`
      );
    },
    triangleStyle() {
      return (
        `border-bottom: 10px solid ` +
        this.bg +
        `;
              transform: rotate(` +
        (this.reverse ? 0 : 180) +
        `deg);`
      );
    },
  },
};
</script>

<style scoped>
.tooltip-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.tooltip-triangle-box {
  display: flex;
  width: 85%;
  overflow: hidden;
}
.tooltip-triangle {
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
}
.tooltip-text {
  white-space: normal;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  line-height: 1.6;
  font-family: "Roboto", sans-serif;
  padding: 8px 10px;
  text-align: center;
  border-radius: 8px;
  cursor: none;
  white-space: nowrap;
}
</style>