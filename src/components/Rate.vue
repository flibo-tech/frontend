<template>
  <div>
    <Swipe
      :cardHeight="card_height"
      :marginTop="margin_top"
      :showPlatforms="true"
      :tapOpen="true"
      :tapOpenInstruction="tapOpenInstruction"
      @update-api-counter="updateApiCounter"
    />

    <div
      class="no-card-message"
      v-if="
        store.rate.fetching_cards &&
          !store.rate.visible_cards.length &&
          is_mobile
      "
    >
      <div class="sk-folding-cube">
        <div class="sk-cube1 sk-cube"></div>
        <div class="sk-cube2 sk-cube"></div>
        <div class="sk-cube4 sk-cube"></div>
        <div class="sk-cube3 sk-cube"></div>
      </div>
      <br />
      <div class="quote-font">
        {{ store.quotes[Math.floor(Math.random() * 22)] }}
      </div>
    </div>
    v>
  </div>
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
    this.$store.state.current_path = "/rate";
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
.no-card-message {
  position: fixed;
  top: calc(50% - 36px);
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 95%;
}
.sk-folding-cube {
  margin: 20px auto;
  width: 40px;
  height: 40px;
  position: relative;
  -webkit-transform: rotateZ(45deg);
  transform: rotateZ(45deg);
}

.sk-folding-cube .sk-cube {
  float: left;
  width: 50%;
  height: 50%;
  position: relative;
  -webkit-transform: scale(1.1);
  -ms-transform: scale(1.1);
  transform: scale(1.1);
}
.sk-folding-cube .sk-cube:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(235, 225, 225, 0.75);
  -webkit-animation: sk-foldCubeAngle 2.4s infinite linear both;
  animation: sk-foldCubeAngle 2.4s infinite linear both;
  -webkit-transform-origin: 100% 100%;
  -ms-transform-origin: 100% 100%;
  transform-origin: 100% 100%;
}
.sk-folding-cube .sk-cube2 {
  -webkit-transform: scale(1.1) rotateZ(90deg);
  transform: scale(1.1) rotateZ(90deg);
}
.sk-folding-cube .sk-cube3 {
  -webkit-transform: scale(1.1) rotateZ(180deg);
  transform: scale(1.1) rotateZ(180deg);
}
.sk-folding-cube .sk-cube4 {
  -webkit-transform: scale(1.1) rotateZ(270deg);
  transform: scale(1.1) rotateZ(270deg);
}
.sk-folding-cube .sk-cube2:before {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
.sk-folding-cube .sk-cube3:before {
  -webkit-animation-delay: 0.6s;
  animation-delay: 0.6s;
}
.sk-folding-cube .sk-cube4:before {
  -webkit-animation-delay: 0.9s;
  animation-delay: 0.9s;
}
@-webkit-keyframes sk-foldCubeAngle {
  0%,
  10% {
    -webkit-transform: perspective(140px) rotateX(-180deg);
    transform: perspective(140px) rotateX(-180deg);
    opacity: 0;
  }
  25%,
  75% {
    -webkit-transform: perspective(140px) rotateX(0deg);
    transform: perspective(140px) rotateX(0deg);
    opacity: 1;
  }
  90%,
  100% {
    -webkit-transform: perspective(140px) rotateY(180deg);
    transform: perspective(140px) rotateY(180deg);
    opacity: 0;
  }
}

@keyframes sk-foldCubeAngle {
  0%,
  10% {
    -webkit-transform: perspective(140px) rotateX(-180deg);
    transform: perspective(140px) rotateX(-180deg);
    opacity: 0;
  }
  25%,
  75% {
    -webkit-transform: perspective(140px) rotateX(0deg);
    transform: perspective(140px) rotateX(0deg);
    opacity: 1;
  }
  90%,
  100% {
    -webkit-transform: perspective(140px) rotateY(180deg);
    transform: perspective(140px) rotateY(180deg);
    opacity: 0;
  }
}
</style>
