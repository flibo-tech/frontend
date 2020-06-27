<template>
  <div class="rate_contents">
    <div v-if="showRating">
      <RatingLabel
        class="liked"
        :style="
          `--liked-margin-top:` +
            (marginTop + cardHeight / 2) +
            `px;--liked-margin-left:translateX(calc(-50% + ` +
            cardHeight / 3 +
            `px)) translateY(-50%)`
        "
        rating="liked"
        :active="isLiked"
      />

      <RatingLabel
        class="disliked"
        :style="
          `--disliked-margin-top:` +
            (marginTop + cardHeight / 2) +
            `px;--disliked-margin-left:translateX(calc(-50% - ` +
            cardHeight / 3 +
            `px)) translateY(-50%)`
        "
        rating="disliked"
        :active="isDisliked"
      />

      <RatingLabel
        class="loved"
        :style="`--loved-margin-top:` + marginTop + `px;`"
        rating="loved"
        :active="isLoved"
      />

      <RatingLabel
        class="haventSeen"
        :style="`--not-seen-margin-top:` + (marginTop + cardHeight) + `px;`"
        rating="haventSeen"
        :active="isHaventSeen"
      />
    </div>

    <div
      class="container"
      :style="`--margin-top:` + marginTop + `px;`"
      v-if="store.rate.visible_cards.length && !store.rate.fetching_cards"
    >
      <SwipeCard
        v-for="(card_data, index) in store.rate.visible_cards"
        :key="index + '-' + card_data.content_id"
        :contentId="card_data.content_id"
        :title="card_data.title"
        :poster="card_data.poster"
        :contentType="card_data.type"
        :whereToWatch="card_data.where_to_watch"
        :isCurrent="index === index"
        :cardHeight="cardHeight"
        :tapOpen="tapOpen"
        @hideCard="removeCardFromDeck(index)"
        @swipe-api-counter="swipeApiCounter"
        @hideLastcardButton="show_last_card_button = false"
        @showLastcardButton="show_last_card_button = true"
        @potentialRating="checkPotentialRating"
        @swipeStart="swipeStart"
        @swipeEnd="swipeEnd"
        @destroyCC="destroyCC"
      />
    </div>

    <div v-if="!is_mobile" class="browser-swipe-alert">
      <h1>
        Rating functionality for desktop is being developed.
      </h1>
      <h1>
        To use 'Swipe to Rate' feature, please use our
        <a
          href="https://play.google.com/store/apps/details?id=com.pivot.flibo"
          target="_blank"
        >
          Android app
        </a>
        or a mobile browser.
      </h1>
    </div>

    <div
      class="no-card-message"
      v-if="
        store.rate.fetching_cards & !store.rate.visible_cards.length & is_mobile
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

    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <button
        v-if="is_mobile && show_last_card_button && this.$store.state.last_card"
        :style="
          `--last-card-button-top-margin:` +
            (marginTop + 15) +
            `px;	
                      --last-card-button-left-margin:translateX(calc(-` +
            cardHeight / 3 +
            `px + 15px))`
        "
        v-bind:class="[
          this.$store.state.last_card ? 'last-card-true' : 'last-card-false'
        ]"
        @click="showLastCard"
      />
    </transition>

    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div
        class="rate-item-platforms"
        :style="
          `--platforms-top-margin:` +
            (marginTop + cardHeight) +
            `px;
                      --platforms-left-margin:translateX(calc(-` +
            cardHeight / 3 +
            `px + 1px)) translateY(-100%);
                      --card-width:` +
            cardHeight * (2 / 3) +
            `px;`
        "
        v-if="
          showPlatforms &&
            !removingCard &&
            show_last_card_button &&
            Object.keys(store.rate.visible_cards[0].where_to_watch || {})
              .length != 0
        "
      >
        <div
          class="rate-item-platforms-container"
          v-for="(link, index) in store.rate.visible_cards[0].where_to_watch"
          :key="index"
        >
          <div
            @click="
              goToPlatform(
                link,
                store.rate.visible_cards[0].content_id,
                'swipe_poster'
              )
            "
            class="rate-item-platform-cropper"
          >
            <img
              v-bind:src="
                'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                  index +
                  '.jpg'
              "
              class="rate-item-platform-icon"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import SwipeCard from "./../atomic/SwipeCard";
import RatingLabel from "./../atomic/RatingLabel";
import axios from "axios";

export default {
  name: "App",
  components: {
    SwipeCard,
    RatingLabel
  },
  props: {
    cardHeight: {
      type: Number,
      default: this.card_height,
      required: true
    },
    marginTop: {
      type: Number,
      required: true
    },
    showPlatforms: {
      type: Boolean,
      default: true,
      required: false
    },
    tapOpen: {
      type: Boolean,
      default: true,
      required: false
    }
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      filters_meta: this.$store.state.rate_filters.filters_meta,
      show_last_card_button: true,
      window_height: window.innerHeight,
      window_width: window.innerWidth,
      card_height: Math.min(
        0.7875 * window.innerHeight,
        1.425 * window.innerWidth
      ),
      card_width: Math.min(
        0.525 * window.innerHeight,
        0.95 * window.innerWidth
      ),
      store: this.$store.state,
      internal_fetch_check: false,
      isLiked: false,
      isDisliked: false,
      isLoved: false,
      isHaventSeen: false,
      showRating: false,
      removingCard: false
    };
  },
  created() {
    var self = this;
    if (
      this.$store.state.rate.visible_cards.length == 0 &&
      !this.store.rate.fetching_cards &&
      this.$store.state.user.profile.country != null
    ) {
      this.store.rate.fetching_cards = true;
      axios
        .post(self.$store.state.api_host + "get_contents_to_rate", {
          session_id: self.$store.state.session_id,
          content_ids: null,
          rest_of_queue: null,
          visible_cards: null,
          country: self.$store.state.user.profile.country
        })
        .then(
          response => (
            (self.$store.state.rate.visible_cards = response.data.contents),
            (self.$store.state.rate.content_ids = response.data.content_ids),
            (self.store.rate.fetching_cards = false)
          )
        );
    }
    axios
      .post(self.$store.state.api_host + "get_favorite_artists_search", {
        session_id: self.$store.state.session_id
      })
      .then(function(response) {
        if ([200].includes(response.status)) {
          self.$store.state.rate_filters.filters_meta.artists =
            response.data.favorite_artists;
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

  computed: {
    visible_cards_count: function() {
      return this.$store.state.rate.visible_cards.length;
    }
  },
  watch: {
    visible_cards_count: {
      handler(count) {
        if (count <= 25 && !this.internal_fetch_check) {
          this.internal_fetch_check = true;
          var visible_cards = [];
          for (
            var i = 0;
            i < this.$store.state.rate.visible_cards.length;
            ++i
          ) {
            visible_cards.push(
              this.$store.state.rate.visible_cards[i].content_id
            );
          }
          var self = this;
          axios
            .post(self.$store.state.api_host + "get_contents_to_rate", {
              session_id: self.$store.state.session_id,
              content_ids: self.$store.state.rate.content_ids.slice(0, 25),
              rest_of_queue: self.$store.state.rate.content_ids.slice(25),
              visible_cards: visible_cards,
              country: self.$store.state.user.profile.country
            })
            .then(function(response) {
              if ([200].includes(response.status)) {
                var new_visible_cards = [];
                for (var i = 0; i < response.data.contents.length; ++i) {
                  if (
                    self.$store.state.rate.prev_swipes.indexOf(
                      response.data.contents[i].content_id
                    ) == -1
                  ) {
                    new_visible_cards.push(response.data.contents[i]);
                  }
                }
                self.$store.state.rate.visible_cards.push(...new_visible_cards);
                self.$store.state.rate.content_ids.splice(0, 25);
                self.internal_fetch_check = false;
              } else {
                // console.log(response.status);
              }
            })
            .catch(function(error) {
              self.internal_fetch_check = false;
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
      }
    }
  },

  methods: {
    removeCardFromDeck(index) {
      var temp_content_id = this.$store.state.rate.visible_cards.splice(
        index,
        1
      )[0].content_id;
      if (this.$store.state.rate.prev_swipes.length >= 100) {
        this.$store.state.rate.prev_swipes.splice(0, 1);
      }
      this.$store.state.rate.prev_swipes.push(temp_content_id);
      this.removingCard = false;
    },
    checkPotentialRating(potential_rating) {
      if (potential_rating === "potential-liked") {
        this.isLiked = true;
        this.isDisliked = false;
        this.isLoved = false;
        this.isHaventSeen = false;
      } else if (potential_rating === "potential-disliked") {
        this.isLiked = false;
        this.isDisliked = true;
        this.isLoved = false;
        this.isHaventSeen = false;
      } else if (potential_rating === "potential-loved") {
        this.isLiked = false;
        this.isDisliked = false;
        this.isLoved = true;
        this.isHaventSeen = false;
      } else if (potential_rating === "potential-haventSeen") {
        this.isLiked = false;
        this.isDisliked = false;
        this.isLoved = false;
        this.isHaventSeen = true;
      }
    },
    swipeStart() {
      this.showRating = true;
    },
    swipeEnd() {
      this.showRating = false;
      this.isLiked = false;
      this.isDisliked = false;
      this.isLoved = false;
      this.isHaventSeen = false;
    },
    destroyCC() {
      this.showRating = false;
    },
    showLastCard() {
      var self = this;
      self.store.suggestions.rate_counter_all =
        self.store.suggestions.rate_counter_all - 1;
      if (this.$store.state.last_card) {
        var last_content_id = this.$store.state.last_card.content_id;
        axios
          .post(this.$store.state.api_host + "submit_rating", {
            session_id: this.$store.state.session_id,
            content_ids: [last_content_id],
            rating: 0
          })
          .then(function(response) {
            var index = self.$store.state.suggestions.rate_counter.indexOf(
              last_content_id
            );
            if (index == -1) {
              self.$store.state.suggestions.rate_counter.push(last_content_id);
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
        this.$store.state.rate.visible_cards.unshift(
          this.$store.state.last_card
        );
      }
      this.$store.state.last_card = null;
    },
    swipeApiCounter(activity) {
      this.removingCard = true;
      this.$emit("update-api-counter", activity);
      this.showRating = false;
    },
    goToPlatform(link, content_id, traffic_origin) {
      var activity = {
        api: "outbound_traffic",
        content_id: content_id,
        url: link,
        traffic_origin: traffic_origin
      };
      this.$emit("update-api-counter", activity);
    }
  }
};
</script>

<style lang="scss">
@import "./../../styles/mixins.scss";

#app {
  text-align: center;
}

.liked {
  position: absolute;
  transform: var(--liked-margin-left);
  left: 50%;
  top: var(--liked-margin-top);
  z-index: 2;
}

.disliked {
  position: absolute;
  transform: var(--disliked-margin-left);
  left: 50%;
  top: var(--disliked-margin-top);
  z-index: 2;
}

.loved {
  position: absolute;
  top: var(--loved-margin-top);
  transform: translateX(-50%) translateY(-50%);
  left: 50%;
  z-index: 2;
}

.haventSeen {
  position: absolute;
  transform: translateX(-50%) translateY(-50%);
  left: 50%;
  top: var(--not-seen-margin-top);
  z-index: 2;
}

.info {
  position: fixed;
  top: 15px;
  right: 5%;
  height: 5vw;
  width: 5vw;
  background-image: url("./../../images/question-mark.svg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  z-index: 10000;
}
.no-card-message {
  position: fixed;
  top: calc(50% - 36px);
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 95%;
}
.container {
  position: fixed;
  // width: 50%;
  left: 9%;
  top: var(--margin-top);
}

/* Make the image responsive */
.container SwipeCardsStack {
  vertical-align: bottom;
}

.container .btn {
  position: relative; /* Position the background text */
  bottom: -625px; /* At the bottom. Use top:0 to append it to the top */
  left: 40%;
  background: rgb(0, 0, 0); /* Fallback color */
  background: rgba(0, 0, 0, 0.5); /* Black background with 0.5 opacity */
  color: #f1f1f1; /* Grey text */
  width: 120%; /* Full width */
  padding: 10px; /* Some padding */
  border-radius: 10px;
  vertical-align: top;
}
.last-card-true {
  position: fixed;
  top: var(--last-card-button-top-margin);
  left: 50%;
  transform: var(--last-card-button-left-margin);
  height: 50px;
  width: 50px;
  background-image: url("./../../images/last_card.svg");
  background-color: #ffffffce;
  border-radius: 50%;
  background-size: 70% 70%;
  background-position: center;
  background-repeat: no-repeat;
  border: none;
  outline: 0;
  z-index: 10000;
}
.last-card-false {
  position: fixed;
  top: var(--top);
  left: var(--left);
  height: 50px;
  width: 50px;
  background-image: url("./../../images/last_card_false.png");
  background-color: #ffffffce;
  border-radius: 50%;
  background-size: 70% 70%;
  background-position: center;
  background-repeat: no-repeat;
  border: none;
  outline: 0;
  z-index: 10000;
}
.filter {
  position: fixed;
  top: 9px;
  right: 5%;
  height: 32px;
  width: 32px;
  background-image: url("./../../images/filter.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  z-index: 10000;
}
.filter-active {
  position: absolute;
  right: 15%;
  margin-top: 0px;
  height: 7px;
  width: 7px;
  background-image: url("./../../images/red_dot.png");
  background-color: #e9f3f8;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  z-index: 10000;
}
.filters-background {
  position: absolute;
  z-index: 10001;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  display: table;
}
.slideInUp {
  animation: slideInUp 0.3s;
}
.slideOutDown {
  animation: slideOutDown 0.6s;
}
.fadeIn {
  animation: fadeIn 0.3s;
}
.fadeOut {
  animation: fadeOut 0s;
}
.rate-bar {
  top: 50px;
  width: 100%;
  background-color: #ebebeb;
  height: 5px;
  position: fixed;
}
.rate-bar-filled {
  top: 50px;
  width: var(--width);
  max-width: 100%;
  background-color: #a1a0a0;
  height: 5px;
  position: fixed;
}
.rate-content-type-tabs {
  margin-top: 50px;
  width: 100%;
  background-color: #f8f8f8;
  position: fixed;
  overflow: hidden;
  padding: 5px;
  z-index: 4;
  text-align: center;
  display: grid;
  grid-column-gap: 10px;
}
.rate-content-type-tabs a {
  position: relative;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  padding: 6px 0px;
  transition: background-color 0.2s;
  border-radius: 5px 3px 0 0;
  font-weight: normal;
  font-size: 15px;
  text-transform: uppercase;
  display: inline-grid;
  grid-row-start: 1;
  grid-row-end: 3;
}
.rate-content-type-tabs a.is-active {
  font-weight: bold;
}
.rate-content-type-tabs a.is-active:after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: calc(50% - 7.5px);
  width: 15px;
  height: 3px;
  background-color: #333333;
  border-radius: 3px;
}
.show-suggestions {
  position: relative;
  margin-top: 25px;
  margin-left: 50%;
  transform: translateX(-50%);
  border: none;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.36;
  letter-spacing: normal;
  padding: 5px;
  border-radius: 5px;
  color: #ffffff;
  background-color: #294ed2;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.suggestions-ready-message {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.85);
  display: table;
  top: 0%;
  left: 0%;
  z-index: 100000;
}
.suggestions-ready-message h1 {
  position: relative;
  left: 50%;
  margin-top: 40vh;
  width: 95%;
  font-size: 28px;
  transform: translateX(-50%);
  font-style: normal;
  font-stretch: normal;
  line-height: 2;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
  z-index: 100001;
}
.suggestions-ready-message p {
  position: relative;
  left: 50%;
  top: 40vh;
  width: 95%;
  font-size: 17px;
  transform: translateX(-50%);
  font-style: normal;
  font-stretch: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
  z-index: 100001;
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

.quote-font {
  font-size: 23px;
  font-weight: bold;
  line-height: 1.5;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  color: #adaaaa;
  font-family: "Poiret One", cursive;
}
.browser-swipe-alert {
  position: fixed;
  top: 40vh;
  width: 950px;
  left: 50%;
  transform: translateX(-50%);
  font-family: "Open Sans", sans-serif;
  line-height: 2;
}
.rate-item-platforms {
  text-align: center;
  position: absolute;
  overflow-x: scroll;
  top: var(--platforms-top-margin);
  left: 50%;
  transform: var(--platforms-left-margin);
  width: var(--card-width);
  padding: 5px 0px;
  border-radius: 0 0 10px 10px;
  background-color: rgba(0, 0, 0, 0.5);
}
.rate-item-platform-cropper {
  width: 35px;
  height: 35px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.rate-item-platform-icon {
  display: inline-block;
  position: absolute;
  width: 100%;
  margin-left: -50%;
}
.rate-item-platforms-container {
  display: inline-block;
  vertical-align: top;
  text-align: center;
  margin-left: 5px;
  margin-right: 5px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
</style>