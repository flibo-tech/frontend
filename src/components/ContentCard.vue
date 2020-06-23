<template>
  <div
    v-if="isShowing"
    ref="interactElement"
    :class="{
      isAnimating: isInteractAnimating,
      isCurrent: isCurrent
    }"
    class="card"
    :style="{ transform: transformString }"
    v-bind:id="content_id"
  >
    <img
      v-if="
        poster !=
          'https://flibo-images.s3-us-west-2.amazonaws.com/posters/no-poster.png'
      "
      :src="poster"
      :style="
        `--margin-top:` +
          ((window_height - card_height) / 2 - 5) +
          `px;
                  --card-width:` +
          card_width +
          `px;
                  --card-height:` +
          card_height +
          `px;
                 `
      "
    />
    <div
      v-if="
        poster ==
          'https://flibo-images.s3-us-west-2.amazonaws.com/posters/no-poster.png'
      "
      class="no-poster"
      :style="
        `--margin-top:` +
          ((window_height - card_height) / 2 - 5) +
          `px;
                  --card-width:` +
          card_width +
          `px;
                  --card-height:` +
          card_height +
          `px;
                 `
      "
    >
      <span
        :style="
          `--margin-top:` +
            75 +
            `px;
                               --text-width:` +
            0.8 * (card_width - 20) +
            `px;
                              `
        "
      >
        {{ title }}
      </span>
    </div>
    <div v-bind:class="potential_rating"></div>
  </div>
</template>

<script>
import interact from "interact.js";
import axios from "axios";

const LIKE_CARD = "cardLiked";
const DISLIKE_CARD = "cardDisliked";
const SKIP_CARD = "cardSkipped";
const LOVE_CARD = "cardLoved";

export default {
  static: {
    interactMaxRotation: 7.5,
    interactOutOfSightXCoordinate: 500,
    interactOutOfSightYCoordinate: 600,
    interactYThreshold: 50,
    interactXThreshold: 50
  },

  props: {
    content_id: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    poster: {
      type: String,
      required: true
    },
    content_type: {
      type: String,
      required: true
    },
    where_to_watch: {
      type: Object,
      required: true
    },
    isCurrent: {
      type: Boolean,
      required: true
    },
    potential_rating: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      isShowing: true,
      isInteractAnimating: true,
      isInteractDragged: null,
      interactPosition: {
        x: 0,
        y: 0,
        rotation: 0
      },
      window_height: window.innerHeight,
      card_height: Math.min(
        0.7875 * window.innerHeight,
        1.425 * window.innerWidth
      ),
      card_width: Math.min(0.525 * window.innerHeight, 0.95 * window.innerWidth)
    };
  },

  computed: {
    transformString() {
      if (!this.isInteractAnimating || this.isInteractDragged) {
        const { x, y, rotation } = this.interactPosition;
        return `translate3D(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
      }

      return null;
    }
  },

  mounted() {
    const element = this.$refs.interactElement;

    interact(element).on({
      tap: () => {
        this.openContentPage();
      }
    });

    interact(element).draggable({
      onstart: () => {
        this.isInteractAnimating = false;
      },

      onmove: event => {
        const {
          interactMaxRotation,
          interactXThreshold,
          interactYThreshold
        } = this.$options.static;
        let x = this.interactPosition.x + event.dx;
        let y = this.interactPosition.y + event.dy;

        if ((x != 0) | (y != 0)) {
          this.$emit("hideLastcardButton");
        }

        if (x > interactXThreshold) {
          this.potential_rating = "potential-thumbs-up-true";
        } else if (x < -interactXThreshold) {
          this.potential_rating = "potential-thumbs-down-true";
        } else if (y < -interactYThreshold) {
          this.potential_rating = "potential-love-true";
        } else if (y > interactYThreshold) {
          this.potential_rating = "potential-havnt-watched";
        }

        let rotation = interactMaxRotation * (x / interactXThreshold);

        if (rotation > interactMaxRotation) {
          rotation = interactMaxRotation;
        } else if (rotation < -interactMaxRotation) {
          rotation = -interactMaxRotation;
        }

        this.interactSetPosition({ x, y, rotation });
      },

      onend: () => {
        this.$emit("showLastcardButton");
        const { x, y } = this.interactPosition;
        const { interactXThreshold, interactYThreshold } = this.$options.static;
        this.isInteractAnimating = true;

        if (x > interactXThreshold) this.playCard(LIKE_CARD);
        else if (x < -interactXThreshold) this.playCard(DISLIKE_CARD);
        else if (y > interactYThreshold) this.playCard(SKIP_CARD);
        else if (y < -interactYThreshold) this.playCard(LOVE_CARD);
        else this.resetCardPosition();
      }
    });
  },

  beforeDestroy() {
    interact(this.$refs.interactElement).unset();
  },

  methods: {
    openContentPage() {
      this.$store.state.content_page.origin = "rate_page";
      this.$router.push(
        "/content/" +
          this.content_id +
          "/" +
          this.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
    },
    hideCard() {
      setTimeout(() => {
        this.isShowing = false;
        this.$emit("hideCard", this.card);
      }, 150);
    },

    playCard(interaction) {
      const {
        interactOutOfSightXCoordinate,
        interactOutOfSightYCoordinate,
        interactMaxRotation
      } = this.$options.static;

      this.interactUnsetElement();
      var self = this;

      switch (interaction) {
        case LIKE_CARD:
          this.interactSetPosition({
            x: interactOutOfSightXCoordinate,
            rotation: interactMaxRotation
          });
          this.$emit(LIKE_CARD);
          self.$store.state.suggestions.rate_counter_all =
            self.$store.state.suggestions.rate_counter_all + 1;
          axios
            .post(this.$store.state.api_host + "submit_rating", {
              session_id: this.$store.state.session_id,
              content_ids: [this.content_id],
              rating: 2
            })
            .then(function(response) {
              var index = self.$store.state.suggestions.rate_counter.indexOf(
                self.content_id
              );
              if (index == -1) {
                self.$store.state.suggestions.rate_counter.push(
                  self.content_id
                );
                if (
                  self.$store.state.suggestions.rate_counter.length ==
                  self.$store.state.suggestions.calc_after
                ) {
                  self.$store.state.suggestions.rate_counter = [];
                  axios
                    .post(
                      self.$store.state.ai_host +
                        "calculate_contents_to_recommend",
                      {
                        session_id: self.$store.state.session_id
                      }
                    )
                    .then(function(response) {
                      self.$store.state.suggestions.refresh_recommendation = true;
                      self.$store.state.suggestions.notify = true;
                    });
                }
              }
            })
            .catch(function(error) {
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
          var activity = {
            api: "swipe",
            content_id: this.content_id,
            rating: 2
          };
          this.$emit("swipe-api-counter", activity);
          break;
        case DISLIKE_CARD:
          this.interactSetPosition({
            x: -interactOutOfSightXCoordinate,
            rotation: -interactMaxRotation
          });
          this.$emit(DISLIKE_CARD);
          self.$store.state.suggestions.rate_counter_all =
            self.$store.state.suggestions.rate_counter_all + 1;
          axios
            .post(this.$store.state.api_host + "submit_rating", {
              session_id: this.$store.state.session_id,
              content_ids: [this.content_id],
              rating: 1
            })
            .then(function(response) {
              var index = self.$store.state.suggestions.rate_counter.indexOf(
                self.content_id
              );
              if (index == -1) {
                self.$store.state.suggestions.rate_counter.push(
                  self.content_id
                );
                if (
                  self.$store.state.suggestions.rate_counter.length ==
                  self.$store.state.suggestions.calc_after
                ) {
                  self.$store.state.suggestions.rate_counter = [];
                  axios
                    .post(
                      self.$store.state.ai_host +
                        "calculate_contents_to_recommend",
                      {
                        session_id: self.$store.state.session_id
                      }
                    )
                    .then(function(response) {
                      self.$store.state.suggestions.refresh_recommendation = true;
                      self.$store.state.suggestions.notify = true;
                    });
                }
              }
            })
            .catch(function(error) {
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
          var activity = {
            api: "swipe",
            content_id: this.content_id,
            rating: 1
          };
          this.$emit("swipe-api-counter", activity);
          break;
        case SKIP_CARD:
          this.interactSetPosition({
            y: interactOutOfSightYCoordinate
          });
          this.$emit(SKIP_CARD);
          axios
            .post(this.$store.state.api_host + "submit_rating", {
              session_id: this.$store.state.session_id,
              content_ids: [this.content_id],
              rating: 0
            })
            .then(function(response) {
              // console.log(response);
            })
            .catch(function(error) {
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
          var activity = {
            api: "swipe",
            content_id: this.content_id,
            rating: 0
          };
          this.$emit("swipe-api-counter", activity);
          break;
        case LOVE_CARD:
          this.interactSetPosition({
            y: -interactOutOfSightYCoordinate
          });
          this.$emit(LOVE_CARD);
          self.$store.state.suggestions.rate_counter_all =
            self.$store.state.suggestions.rate_counter_all + 1;
          axios
            .post(this.$store.state.api_host + "submit_rating", {
              session_id: this.$store.state.session_id,
              content_ids: [this.content_id],
              rating: 3
            })
            .then(function(response) {
              var index = self.$store.state.suggestions.rate_counter.indexOf(
                self.content_id
              );
              if (index == -1) {
                self.$store.state.suggestions.rate_counter.push(
                  self.content_id
                );
                if (
                  self.$store.state.suggestions.rate_counter.length ==
                  self.$store.state.suggestions.calc_after
                ) {
                  self.$store.state.suggestions.rate_counter = [];
                  axios
                    .post(
                      self.$store.state.ai_host +
                        "calculate_contents_to_recommend",
                      {
                        session_id: self.$store.state.session_id
                      }
                    )
                    .then(function(response) {
                      self.$store.state.suggestions.refresh_recommendation = true;
                      self.$store.state.suggestions.notify = true;
                    });
                }
              }
            })
            .catch(function(error) {
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
          var activity = {
            api: "swipe",
            content_id: this.content_id,
            rating: 3
          };
          this.$emit("swipe-api-counter", activity);
          break;
        default:
        // do nothing
      }
      this.$store.state.last_card = {
        content_id: this.content_id,
        poster: this.poster,
        title: this.title,
        type: this.content_type,
        where_to_watch: this.where_to_watch
      };

      this.hideCard();
    },

    interactSetPosition(coordinates) {
      const { x = 0, y = 0, rotation = 0 } = coordinates;
      this.interactPosition = { x, y, rotation };
    },

    interactUnsetElement() {
      interact(this.$refs.interactElement).unset();
      this.isInteractDragged = true;
    },

    resetCardPosition() {
      this.interactSetPosition({ x: 0, y: 0, rotation: 0 });
      this.potential_rating = "";
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../styles/index.scss";

$cardsTotal: 3;
$cardsWidth: 300px;
$cardsPositionOffset: 55vh * 0.06;
$cardsScaleOffset: 0.08;
$defaultTranslation: $cardsPositionOffset * $cardsTotal;
$defaultScale: 1 - ($cardsScaleOffset * $cardsTotal);
$fs-card-title: 1.125em;

.potential-thumbs-up-true {
  position: absolute;
  height: 55vw;
  width: 55vw;
  background-image: url("./../images/thumbs_up_true.svg");
  background-size: 100% 100%;
  background-color: none;
  margin-top: -140%;
  margin-left: -32.5%;
}
.potential-thumbs-down-true {
  position: absolute;
  height: 55vw;
  width: 55vw;
  background-image: url("./../images/thumbs_down_true.svg");
  background-size: 100% 100%;
  background-color: none;
  margin-top: -140%;
  margin-left: -32.5%;
}
.potential-love-true {
  position: absolute;
  height: 55vw;
  width: 55vw;
  background-image: url("./../images/love_true.svg");
  background-size: 100% 100%;
  background-color: none;
  margin-top: -140%;
  margin-left: -32.5%;
}
.potential-havnt-watched {
  position: absolute;
  height: 30vw;
  width: 75vw;
  background-image: url("./../images/havent_watched.svg");
  background-size: 75vw 30vw;
  background-position-x: 0vw;
  background-repeat: no-repeat;
  margin-top: -140%;
  margin-left: -38.5vw;
  border-radius: 12px;
}
.card {
  @include card();
  @include absolute(0);
  // @include sizing(112.5% 80vw);
  // @include flex-center();

  @include after() {
    @include sizing(21px 3px);
    @include absolute(right 0 bottom 11px left 0);

    margin: auto;
    border-radius: 100px;
    // background: rgba($c-black, 0.3);
  }

  // display: flex;
  margin: 0 auto;
  font-size: $fs-h2;
  font-weight: $fw-bold;
  // color: $c-white;
  // background-image: linear-gradient(
  //   -180deg,
  //   $primary-gradient-start 2%,
  //   $primary-gradient-end 100%
  // );
  opacity: 0;
  transform: translateY($defaultTranslation) scale($defaultScale);
  // transform-origin: 50%, 100%;
  box-shadow: 0 0 0px rgba(0, 0, 0, 0.1);
  user-select: none;
  pointer-events: none;
  will-change: transform, opacity;

  // height: 130vw;
  // left: 3.5%;

  // display: block;
  // margin-left: 8%;
  // margin-top: 9%;
  // height: auto;

  &.isCurrent {
    pointer-events: auto;
  }

  &.isAnimating {
    transition: transform 0.7s $ease-out-back;
  }
}

.card img {
  width: var(--card-width);
  height: var(--card-height);
  margin-top: var(--margin-top);
  margin-left: -102%;
  border-radius: 10px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}

.no-poster {
  width: var(--card-width);
  height: var(--card-height);
  margin-top: var(--margin-top);
  margin-left: -51%;
  background-color: #f3f2f2;
  border-radius: 10px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}
.no-poster span {
  position: absolute;
  width: var(--text-width);
  margin-top: var(--margin-top);
  font-size: 10vw;
  transform: translateX(-50%);
}

.card .cardTitle {
  position: absolute; /* Position the background text */
  bottom: 0px; /* At the bottom. Use top:0 to append it to the top */
  background: rgb(0, 0, 0); /* Fallback color */
  background: rgba(0, 0, 0, 0.5); /* Black background with 0.5 opacity */
  color: #f1f1f1; /* Grey text */
  width: 100%; /* Full width */
  padding: 0px; /* Some padding */
  border-radius: 10px;
}

@for $i from 1 through $cardsTotal {
  @if $i == 1 {
    $index: $i - 1;
    $translation: $cardsPositionOffset * $index;
    $scale: 1 - ($cardsScaleOffset * $index);
    // }
    // @if  $i != 1 {
    //   $index: $i - 1;
    //   $translation: $cardsPositionOffset * 0;
    //   $scale: 0;
    // }

    .card:nth-child(#{$i}) {
      z-index: $cardsTotal - $index;
      opacity: 1;
      transform: translateY($translation) scale($scale);
      margin-left: 42vw;

      // @if $i == 3 {
      //   color: $c-red-25;
      //   background-color: $c-red-25;
      // } @else if $i == 2 {
      //   color: $c-red-50;
      //   background-color: $c-red-50;
      // }

      @if $i != 1 {
        background-image: none;

        @include after() {
          @include sizing(0 0);
        }
      }
    }
  }
}
</style>
