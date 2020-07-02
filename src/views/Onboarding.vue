<template>
  <div
    v-if="open_instructions || !store.instructions_seen"
    class="instructions-container"
    :style="`--window_height:` + window_height + `px;`"
  >
    <Logo logoColor="light" height="40" class="onboarding-logo" />

    <h1 class="onboarding-username">
      Hi, {{ store.user.name.split(" ")[0] }}.
    </h1>

    <p class="onboarding-rating-text">
      Please rate some movies and tv shows to let us know about your taste.
    </p>

    <CardAnimation
      class="onboarding-swipe-animation"
      :containerHeight="animation_height"
    />

    <Button
      buttonType="primary"
      class="onboarding-start-rating"
      text="Start Rating"
      v-on:clicked="startRating"
    />
  </div>

  <div
    v-else-if="
      start_rating && store.suggestions.rate_counter_all <= ratingThreshold
    "
    class="onboarding-rate-container"
    :style="`--window_height:` + window_height + `px;`"
  >
    <div class="onboarding-rate-top-bar">
      <Button
        buttonType="iconOnly"
        icon="back"
        class="onboarding-rating-back"
        v-on:clicked="open_instructions = true"
      />

      <h2 class="onboarding-rating-counter">
        Rate
        <span style="font-weight: normal;"
          >{{
            store.suggestions.rate_counter_all > 9
              ? "" + store.suggestions.rate_counter_all
              : "0" + store.suggestions.rate_counter_all
          }}/{{ ratingThreshold }}</span
        >
      </h2>

      <Button
        buttonType="textOnly"
        text="SKIP, I'll Rate Later"
        class="onboarding-rating-skip"
        v-on:clicked="startDiscovering(false)"
      />
    </div>

    <div class="onboarding-rate-body">
      <ProgressBar
        class="onboarding-rate-progress-bar"
        :value="store.suggestions.rate_counter_all"
        :maxValue="ratingThreshold"
      />
      <Swipe
        class="onboarding-rate-swipe"
        :cardHeight="card_height"
        :marginTop="margin_top"
        :showPlatforms="false"
        :tapOpen="false"
      />
    </div>
  </div>

  <div
    v-else-if="store.suggestions.rate_counter_all == ratingThreshold + 1"
    class="onboarding-success-container"
    :style="`--window_height:` + window_height + `px;`"
  >
    <Logo logoColor="light" height="40" class="onboarding-logo" />

    <div class="onboarding-success-icon" />

    <h1 class="onboarding-success-username">
      Awesome, {{ store.user.name.split(" ")[0] }}.
    </h1>

    <p class="onboarding-success-text">
      You’ve rated
      <span style="font-weight: 700; color: #a2d194;"
        >{{ ratingThreshold }} movies and shows</span
      >
      so far. Now FLIBO has started collecting suggestions for your taste.
      <br />
      The more you swipe, the better we suggest.
    </p>

    <Button
      buttonType="primary"
      class="onboarding-lets-discover"
      text="Let's Discover"
      v-on:clicked="startDiscovering(true)"
    />
  </div>
</template>

<script>
import Button from "./../components/atomic/Button";
import ProgressBar from "./../components/atomic/ProgressBar";
import Logo from "./../components/atomic/Logo";
import Swipe from "./../components/molecular/Swipe";
import CardAnimation from "./../components/CardAnimation";
import axios from "axios";

export default {
  name: "App",
  components: {
    Button,
    ProgressBar,
    Logo,
    Swipe,
    CardAnimation
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      filters_applied: this.$store.state.rate_filters.filters_applied,
      filters_meta: this.$store.state.rate_filters.filters_meta,
      window_height: window.innerHeight,
      animation_height: Math.min(
        window.innerHeight - 257 - 20,
        1.5 * (window.innerWidth - 48)
      ),
      card_height: Math.min(
        window.innerHeight - 128 - 56,
        1.5 * (window.innerWidth - 56)
      ),
      margin_top:
        104 +
        (window.innerHeight -
          120 -
          Math.min(
            window.innerHeight - 120 - 56,
            1.5 * (window.innerWidth - 56)
          )) /
          2,
      store: this.$store.state,
      open_instructions: false,
      internal_fetch_check: false,
      start_rating: true,
      ratingThreshold: 25
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
        if (response.data.contents_rated >= self.ratingThreshold) {
          this.$router.push("/rate");
        }
      });
  },
  computed: {
    rate_counter: function() {
      return this.store.suggestions.rate_counter_all;
    }
  },
  watch: {
    rate_counter: {
      handler(count) {
        var self = this;
        if (count == self.ratingThreshold) {
          self.timeout = setTimeout(function() {
            self.store.suggestions.rate_counter_all = self.ratingThreshold + 1;
          }, 750);
        }
      }
    }
  },
  methods: {
    startRating() {
      this.start_rating = true;
      this.open_instructions = false;
      this.store.instructions_seen = true;
      var self = this;
      axios
        .post(self.$store.state.api_host + "update_profile", {
          session_id: self.$store.state.session_id,
          instructions_seen: true
        })
        .then(function(response) {
          if ([200].includes(response.status)) {
          } else {
            // console.log(response.status);
          }
        })
        .catch(function(error) {
          // console.log(error);
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.$emit("logging-out");
          } else {
            // console.log(error.response.status);
          }
        });
    },
    startDiscovering(show_suggestions_only) {
      if (show_suggestions_only) {
        this.$store.state.suggestions.discover_type_tab = ["flibo"];
      }
      this.$router.push("/discover");
    }
  }
};
</script>

<style lang="scss">
@import "./../styles/mixins.scss";

.instructions-container {
  display: grid;
  grid-template-columns: 24px auto 24px;
  grid-template-rows: 16px auto 32px auto 16px auto 1fr 48px 32px;
  height: var(--window_height);
  background-color: #272431;
  justify-items: center;
}
.onboarding-logo {
  grid-row-start: 2;
  grid-column-start: 2;
  justify-self: left;
}
.onboarding-username {
  grid-row-start: 4;
  grid-column-start: 2;
  font-family: "Roboto", sans-serif;
  font-weight: 900;
  font-size: 27px;
  color: #d6f0dc;
  justify-self: start;
}
.onboarding-rating-text {
  grid-row-start: 6;
  grid-column-start: 2;
  font-family: "Roboto", sans-serif;
  font-size: 17px;
  color: #bfbfbf;
  text-align: left;
}
.onboarding-swipe-animation {
  grid-row-start: 7;
  grid-column-start: 2;
  min-height: fit-content;
  margin-top: 10px;
}
.onboarding-start-rating {
  grid-row-start: 8;
  grid-column-start: 2;
}

.onboarding-rate-container {
  display: grid;
  grid-template-rows: 56px 1fr;
  height: var(--window_height);
  background-color: #272431;
  justify-items: center;
}
.onboarding-rate-top-bar {
  grid-row-start: 1;
  width: 100%;
  background-color: #1b1922;
  display: grid;
  grid-template-columns: 24px auto 8px auto 1fr auto 24px;
  z-index: 2;
}
.onboarding-rating-back {
  grid-column-start: 2;
  align-self: center;
}
.onboarding-rating-counter {
  grid-column-start: 4;
  font-family: "Roboto", sans-serif;
  font-size: 20px;
  font-weight: 900;
  color: #ffffff;
  text-align: left;
  align-self: center;
}
.onboarding-rating-skip {
  grid-column-start: 6;
  width: fit-content;
  float: right;
}
.onboarding-rate-body {
  display: grid;
  grid-template-columns: 24px auto 24px;
  grid-template-rows: 24px auto 8px 1fr;
  justify-items: center;
  width: 100%;
}
.onboarding-rate-progress-bar {
  grid-row-start: 2;
  grid-column-start: 2;
  z-index: 1;
}
.onboarding-rate-swipe {
  grid-row-start: 4;
  grid-column-start: 2;
  z-index: 1;
}

.onboarding-success-container {
  display: grid;
  grid-template-columns: 24px auto 24px;
  grid-template-rows: 16px auto 64px auto 24px auto 16px auto 40px auto 1fr;
  height: var(--window_height);
  background-color: #272431;
  justify-items: center;
}
.onboarding-success-icon {
  grid-row-start: 4;
  grid-column-start: 2;
  background-image: url("./../assets/icons/success.svg");
  background-size: auto 64px;
  background-position: center;
  border-radius: 50%;
  background-color: #a2d194;
  background-repeat: no-repeat;
  width: 112px;
  height: 112px;
}
.onboarding-success-username {
  grid-row-start: 6;
  grid-column-start: 2;
  font-family: "Roboto", sans-serif;
  font-weight: 900;
  font-size: 27px;
  color: #d6f0dc;
  justify-self: center;
}
.onboarding-success-text {
  grid-row-start: 8;
  grid-column-start: 2;
  font-family: "Roboto", sans-serif;
  font-size: 15px;
  color: #bfbfbf;
  text-align: left;
  line-height: 1.75;
}
.onboarding-lets-discover {
  grid-row-start: 10;
  grid-column-start: 2;
}
</style>
