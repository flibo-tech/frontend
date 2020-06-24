<template>
  <div
    v-if="open_instructions || !store.instructions_seen"
    class="instructions-container"
    :style="`--window_height:` + window_height + `px;`"
  ></div>
</template>

<script>
import axios from "axios";

export default {
  name: "App",
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      filters_applied: this.$store.state.rate_filters.filters_applied,
      filters_meta: this.$store.state.rate_filters.filters_meta,
      card_height: Math.min(
        0.7875 * window.innerHeight,
        1.425 * window.innerWidth
      ),
      window_height: window.innerHeight,
      store: this.$store.state,
      open_instructions: false,
      internal_fetch_check: false
    };
  },
  created() {}
};
</script>

<style lang="scss">
@import "./../styles/mixins.scss";

.instructions-container {
  display: grid;
  grid-template-columns: 24px auto 24px;
  grid-template-rows: 16px 40px 31px 35px 12px auto auto 48px 32px;
  height: var(--window_height);
  background-color: #272431;
}
</style>
