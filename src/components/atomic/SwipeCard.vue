<template>
  <div
    v-if="isShowing"
    ref="interactElement"
    :class="{
      isAnimating: isInteractAnimating,
      isCurrent: isCurrent,
    }"
    class="card"
    :style="{ transform: transformString }"
    v-bind:id="contentId"
  >
    <div
      v-if="tapOpenInstruction"
      class="card-tap-instruction"
      :style="
        `--card-width:` +
        cardWidth +
        `px;
                  --card-height:` +
        cardHeight +
        `px;
                 `
      "
    >
      <p>
        Tap to see more details about the
        {{ contentType == "movie" ? "movie" : "show" }}
      </p>
    </div>
    <img
      v-if="
        poster !=
        'https://flibo-images.s3-us-west-2.amazonaws.com/posters/no-poster.png'
      "
      :src="poster"
      :style="
        `--card-width:` +
        cardWidth +
        `px;
                  --card-height:` +
        cardHeight +
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
        `--card-width:` +
        cardWidth +
        `px;
                  --card-height:` +
        cardHeight +
        `px;
                 `
      "
    >
      <span
        :style="
          `--text-width:` +
          0.8 * (cardWidth - 20) +
          `px;
                              `
        "
      >
        {{ title }}
      </span>
    </div>
  </div>
</template>

<script>
import interact from "interact.js";
import axios from "axios";

const LIKE_CARD = "liked";
const DISLIKE_CARD = "disliked";
const SKIP_CARD = "haventSeen";
const LOVE_CARD = "loved";

export default {
  static: {
    interactMaxRotation: 7.5,
    interactOutOfSightXCoordinate: 500,
    interactOutOfSightYCoordinate: 600,
    interactYThreshold: 50,
    interactXThreshold: 50,
  },

  props: {
    contentId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    whereToWatch: {
      type: Object,
      required: false,
    },
    isCurrent: {
      type: Boolean,
      required: true,
    },
    cardHeight: {
      type: Number,
      required: true,
    },
    tapOpen: {
      type: Boolean,
      default: true,
      required: false,
    },
    tapOpenInstruction: {
      type: Boolean,
      default: false,
      required: false,
    },
  },

  data() {
    return {
      isShowing: true,
      isInteractAnimating: true,
      isInteractDragged: null,
      interactPosition: {
        x: 0,
        y: 0,
        rotation: 0,
      },
      windowHeight: window.innerHeight,
      cardWidth: (this.cardHeight * 2) / 3,
      potentialRating: "",
    };
  },

  computed: {
    transformString() {
      if (!this.isInteractAnimating || this.isInteractDragged) {
        const { x, y, rotation } = this.interactPosition;
        this.$emit("swipeStart");
        return `translate3D(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
      }

      return null;
    },
  },

  mounted() {
    const element = this.$refs.interactElement;

    interact(element).on({
      tap: () => {
        if (this.tapOpen) {
          if (this.$store.state.rate.never_tapped_any_card) {
            this.$store.state.rate.never_tapped_any_card = false;
            var self = this;
            axios
              .post(self.$store.state.api_host + "update_profile", {
                session_id: self.$store.state.session_id,
                never_tapped_any_card: false,
              })
              .then(function (response) {
                if ([200].includes(response.status)) {
                } else {
                  // console.log(response.status);
                }
              })
              .catch(function (error) {
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
          }
          this.openContentPage();
        }
      },
    });

    interact(element).draggable({
      onstart: () => {
        this.isInteractAnimating = false;
      },

      onmove: (event) => {
        const {
          interactMaxRotation,
          interactXThreshold,
          interactYThreshold,
        } = this.$options.static;
        let x = this.interactPosition.x + event.dx;
        let y = this.interactPosition.y + event.dy;

        if ((x != 0) | (y != 0)) {
          this.$emit("hideLastcardButton");
        }

        if (x > interactXThreshold) {
          this.potentialRating = "potential-liked";
          this.$emit("potentialRating", this.potentialRating);
        } else if (x < -interactXThreshold) {
          this.potentialRating = "potential-disliked";
          this.$emit("potentialRating", this.potentialRating);
        } else if (y < -interactYThreshold) {
          this.potentialRating = "potential-loved";
          this.$emit("potentialRating", this.potentialRating);
        } else if (y > interactYThreshold) {
          this.potentialRating = "potential-haventSeen";
          this.$emit("potentialRating", this.potentialRating);
        } else {
          this.$emit("resetLabels");
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
        this.$emit("swipeEnd");
        this.isInteractAnimating = true;

        if (x > interactXThreshold) this.playCard(LIKE_CARD);
        else if (x < -interactXThreshold) this.playCard(DISLIKE_CARD);
        else if (y > interactYThreshold) this.playCard(SKIP_CARD);
        else if (y < -interactYThreshold) this.playCard(LOVE_CARD);
        else this.resetCardPosition();
      },
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
          this.contentId +
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
        interactMaxRotation,
      } = this.$options.static;

      this.interactUnsetElement();
      var self = this;

      switch (interaction) {
        case LIKE_CARD:
          this.interactSetPosition({
            x: interactOutOfSightXCoordinate,
            rotation: interactMaxRotation,
          });
          this.$emit(LIKE_CARD);
          self.$store.state.suggestions.rate_counter_all =
            self.$store.state.suggestions.rate_counter_all + 1;
          axios
            .post(this.$store.state.api_host + "submit_rating", {
              session_id: this.$store.state.session_id,
              content_ids: [this.contentId],
              rating: 2,
              privacy:
                this.$store.state.user.profile.profile_status || "public",
            })
            .then(function (response) {
              var index = self.$store.state.suggestions.rate_counter.indexOf(
                self.contentId
              );
              if (index == -1) {
                self.$store.state.suggestions.rate_counter.push(self.contentId);
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
                        session_id: self.$store.state.session_id,
                      }
                    )
                    .then(function (response) {
                      if (self.$route.path == "/onboarding") {
                        self.$store.state.suggestions.refresh_feed = true;
                      } else {
                        if (response.data.notify) {
                          self.$store.state.notifications.notifications = 1;
                        }
                      }
                    });
                }
              }
            })
            .catch(function (error) {
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
            content_id: this.contentId,
            rating: 2,
          };
          this.$emit("swipe-api-counter", activity);
          break;
        case DISLIKE_CARD:
          this.interactSetPosition({
            x: -interactOutOfSightXCoordinate,
            rotation: -interactMaxRotation,
          });
          this.$emit(DISLIKE_CARD);
          self.$store.state.suggestions.rate_counter_all =
            self.$store.state.suggestions.rate_counter_all + 1;
          axios
            .post(this.$store.state.api_host + "submit_rating", {
              session_id: this.$store.state.session_id,
              content_ids: [this.contentId],
              rating: 1,
              privacy:
                this.$store.state.user.profile.profile_status || "public",
            })
            .then(function (response) {
              var index = self.$store.state.suggestions.rate_counter.indexOf(
                self.contentId
              );
              if (index == -1) {
                self.$store.state.suggestions.rate_counter.push(self.contentId);
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
                        session_id: self.$store.state.session_id,
                      }
                    )
                    .then(function (response) {
                      if (self.$route.path == "/onboarding") {
                        self.$store.state.suggestions.refresh_feed = true;
                      } else {
                        if (response.data.notify) {
                          self.$store.state.notifications.notifications = 1;
                        }
                      }
                    });
                }
              }
            })
            .catch(function (error) {
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
            content_id: this.contentId,
            rating: 1,
          };
          this.$emit("swipe-api-counter", activity);
          break;
        case SKIP_CARD:
          this.interactSetPosition({
            y: interactOutOfSightYCoordinate,
          });
          this.$emit(SKIP_CARD);
          axios
            .post(this.$store.state.api_host + "submit_rating", {
              session_id: this.$store.state.session_id,
              content_ids: [this.contentId],
              rating: 0,
              privacy:
                this.$store.state.user.profile.profile_status || "public",
            })
            .then(function (response) {
              // console.log(response);
            })
            .catch(function (error) {
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
            content_id: this.contentId,
            rating: 0,
          };
          this.$emit("swipe-api-counter", activity);
          break;
        case LOVE_CARD:
          this.interactSetPosition({
            y: -interactOutOfSightYCoordinate,
          });
          this.$emit(LOVE_CARD);
          self.$store.state.suggestions.rate_counter_all =
            self.$store.state.suggestions.rate_counter_all + 1;
          axios
            .post(this.$store.state.api_host + "submit_rating", {
              session_id: this.$store.state.session_id,
              content_ids: [this.contentId],
              rating: 3,
              privacy:
                this.$store.state.user.profile.profile_status || "public",
            })
            .then(function (response) {
              var index = self.$store.state.suggestions.rate_counter.indexOf(
                self.contentId
              );
              if (index == -1) {
                self.$store.state.suggestions.rate_counter.push(self.contentId);
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
                        session_id: self.$store.state.session_id,
                      }
                    )
                    .then(function (response) {
                      if (self.$route.path == "/onboarding") {
                        self.$store.state.suggestions.refresh_feed = true;
                      } else {
                        if (response.data.notify) {
                          self.$store.state.notifications.notifications = 1;
                        }
                      }
                    });
                }
              }
            })
            .catch(function (error) {
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
            content_id: this.contentId,
            rating: 3,
          };
          this.$emit("swipe-api-counter", activity);
          break;
        default:
        // do nothing
      }
      this.$store.state.last_card = {
        content_id: this.contentId,
        poster: this.poster,
        title: this.title,
        type: this.contentType,
        where_to_watch: this.whereToWatch,
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
      this.potentialRating = "";
    },
  },
  beforeDestroy() {
    this.$emit("destroyCC");
  },
};
</script>

<style lang="scss" scoped>
@import "./../../styles/index.scss";

$cardsTotal: 3;
$cardsWidth: 300px;
$cardsPositionOffset: 55vh * 0.06;
$cardsScaleOffset: 0.08;
$defaultTranslation: $cardsPositionOffset * $cardsTotal;
$defaultScale: 1 - ($cardsScaleOffset * $cardsTotal);
$fs-card-title: 1.125em;

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

.card-tap-instruction {
  position: absolute;
  width: var(--card-width);
  height: var(--card-height);
  margin-left: calc(-50% - 4px);
  border-radius: 10px;
  background-color: rgba(62, 100, 237, 0.9);
  background-image: url("./../../images/tap.svg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 35%;
  background-position: 50% 60%;
}
.card-tap-instruction p {
  position: absolute;
  width: 80%;
  top: 23%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: #ffffff;
  font-size: 24px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.25;
  letter-spacing: normal;
}

.card img {
  width: var(--card-width);
  height: var(--card-height);
  margin-left: -102%;
  border-radius: 10px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}

.no-poster {
  width: var(--card-width);
  height: var(--card-height);
  margin-left: -51%;
  background-color: #f3f2f2;
  border-radius: 10px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}
.no-poster span {
  position: absolute;
  width: var(--text-width);
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
