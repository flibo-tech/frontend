<template>
  <span class="timesince">
    {{ timeSince }}
  </span>
</template>

<script>
export default {
  name: "TimeSince",
  props: {
    timestamp: {
      type: Number,
      required: true,
    },
    short: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    timeSince() {
      var seconds = Math.floor(Date.now() / 1000 - this.timestamp);

      var interval = seconds / (365 * 24 * 60 * 60);

      if (interval >= 1) {
        return (
          Math.floor(interval) +
          (this.short
            ? "y"
            : " year" + (Math.floor(interval) > 1 ? "s" : "") + " ago")
        );
      }

      interval = seconds / (30 * 24 * 60 * 60);
      if (interval >= 1) {
        return (
          Math.floor(interval) +
          (this.short
            ? "mo"
            : " month" + (Math.floor(interval) > 1 ? "s" : "") + " ago")
        );
      }

      interval = seconds / (7 * 24 * 60 * 60);
      if (interval >= 1) {
        return (
          Math.floor(interval) +
          (this.short
            ? "w"
            : " week" + (Math.floor(interval) > 1 ? "s" : "") + " ago")
        );
      }

      interval = seconds / (24 * 60 * 60);
      if (interval >= 1) {
        return (
          Math.floor(interval) +
          (this.short
            ? "d"
            : " day" + (Math.floor(interval) > 1 ? "s" : "") + " ago")
        );
      }

      interval = seconds / (60 * 60);
      if (interval >= 1) {
        return (
          Math.floor(interval) +
          (this.short
            ? "h"
            : " hour" + (Math.floor(interval) > 1 ? "s" : "") + " ago")
        );
      }

      interval = seconds / 60;
      if (interval >= 1) {
        return (
          Math.floor(interval) +
          (this.short
            ? "m"
            : " minute" + (Math.floor(interval) > 1 ? "s" : "") + " ago")
        );
      }

      return this.short ? "Just now" : "Few seconds ago";
    },
  },
};
</script>

<style scoped>
.timesince {
  width: fit-content;
  font-family: "Roboto", sans-serif;
  font-style: normal;
  font-size: 12px;
  font-weight: normal;
  line-height: inherit;
  color: #8e8e8e;
  background: transparent;
  user-select: none;
  cursor: auto;
  text-align: left;
  white-space: nowrap;
}
</style>