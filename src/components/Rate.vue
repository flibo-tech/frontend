<template>
  <Swipe
    :cardHeight="card_height"
    :marginTop="margin_top"
    :showPlatforms="true"
    :tapOpen="true"
    :tapOpenInstruction="tapOpenInstruction"
    @update-api-counter="updateApiCounter"
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
      store: this.$store.state,
      tapOpenInstruction: false
    };
  },
  created() {
    var self = this;
    axios
      .post(self.$store.state.api_host + "counts", {
        session_id: self.$store.state.session_id
      })
      .then(function(response) {
        self.$store.state.suggestions.rate_counter_all =
          response.data.contents_rated;
        if (response.data.contents_rated < 25) {
          self.$router.push("/onboarding");
        } else {
          self.$store.state.current_path = "/rate";
          if (self.store.rate.never_tapped_any_card) {
            setTimeout(self.showTapOpenInstruction, 5000);
          }
        }
      });
  },
  methods: {
    showTapOpenInstruction() {
      if (this.store.rate.never_tapped_any_card) {
        this.tapOpenInstruction = true;
      }
    },
    updateApiCounter(activity) {
      this.$emit("update-api-counter", activity);
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
