<template>
  <div class="animation-box" @click="$emit('tapped')">
    <div class="shadow wave"></div>

    <ToolTip
      :style="toolTipMargin"
      :text="text"
      :reverse="true"
      :fontSize="14"
      color="#666"
      bg="#f1f1f1"
    />
  </div>
</template>

<script>
import ToolTip from "./../atomic/ToolTip";

export default {
  name: "TapInstruction",
  components: { ToolTip },
  props: {
    text: {
      type: String,
      required: true,
    },
    toolTipMargin: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.animation-box {
  position: absolute;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.shadow {
  position: absolute;
  border-radius: 50%;
}

@keyframes tap_wave {
  from {
    width: 0px;
    height: 0px;
    background: #405ded;
  }
  to {
    width: 60px;
    height: 60px;
    background: #405ded67;
  }
}

.wave {
  animation: tap_wave 0.75s cubic-bezier(0.25, 0.1, 0.25, 1) 0s infinite;
}
</style>