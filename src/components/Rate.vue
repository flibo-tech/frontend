<template>
  <Swipe
    :cardHeight="card_height"
    :marginTop="margin_top"
    :showPlatforms="true"
    :tapOpen="true"
  />
</template>

<script>
import Swipe from "./molecular/Swipe";
import axios from "axios";

export default {
  name: "App",
  components: {
    Swipe
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      card_height: Math.min(
        window.innerHeight - 105 - 56,
        1.5 * (window.innerWidth - 56)
      ),
      margin_top:
        50 +
        (window.innerHeight -
          105 -
          Math.min(
            window.innerHeight - 105 - 56,
            1.5 * (window.innerWidth - 56)
          )) /
          2,
      store: this.$store.state
    };
  },
  created() {
    if (this.$store.state.suggestions.rate_counter_all < 25) {
      this.$router.push("/onboarding");
    } else {
      this.$store.state.current_path = "/rate";
    }
  }
};
</script>

<style lang="scss">
@import "./../styles/mixins.scss";

#app {
  text-align: center;
}
</style>
