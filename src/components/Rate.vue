<template>
  <div id="rate_contents">
    <!-- <transition appear
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut">
      <div class="rate-content-type-tabs"
           v-if="show_last_card_button">
          <a :class="[ content_type_tab_string == '[movie,tv]' ? 'is-active' : '']" @click="switchRateContentTab(['movie','tv'])">All</a>
          <a :class="[ content_type_tab_string == '[movie]' ? 'is-active' : '']" @click="switchRateContentTab(['movie'])">Movies</a>
          <a :class="[ content_type_tab_string == '[tv]' ? 'is-active' : '']" @click="switchRateContentTab(['tv'])">TV Series</a>
          <a :class="[ content_type_tab_string == '[filter]' ? 'is-active' : '']" @click="openFilter">
              Filter

              <button v-if="(filters_applied.artists.length
                            ||
                            filters_applied.genres.length
                            ||
                            filters_applied.years.length
                            ||
                            filters_applied.platforms.length
                            ||
                            (filters_applied.rating != '10')
                            ||
                            (JSON.stringify(filters_applied.industry) != JSON.stringify(filters_meta.industries[0])))"
                      class="filter-active"/>
          </a>
      </div>
    </transition> -->

    <transition appear
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut">
      <div class="rate-bar"
           v-if="is_mobile
                 &
                 show_last_card_button
                 &
                 (store.suggestions.rate_counter_all<=25)"/>
    </transition>

    <transition appear
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut">
      <div class="rate-bar-filled"
           :style="`--width:`+(store.suggestions.rate_counter_all/0.25)+`%;`"
           v-if="show_last_card_button
                 &
                 (store.suggestions.rate_counter_all<=25)
                 &
                 is_mobile"/>
    </transition>

    <div class="container" v-if="((content_type_tab_string != '[filter]') ? (store.rate.visible_cards.length
                                                                            &&
                                                                            !store.rate.fetching_cards)
                                                                          : (this.$store.state.rate_filters.visible_cards.length
                                                                            &&
                                                                            !store.rate_filters.fetching_cards))
                                  &&
                                  is_mobile">
        <ContentCard
          v-for="(card_data, index) in (content_type_tab_string != '[filter]') ? store.rate.visible_cards : store.rate_filters.visible_cards"
          v-if="(content_type_tab_string != '[filter]') ? store.rate.content_type_tab.includes(card_data.type) : true"
          :key="index+'-'+card_data.content_id"
          :content_id="card_data.content_id"
          :title="card_data.title"
          :poster="card_data.poster"
          :content_type="card_data.type"
          :potential_rating="''"
          :is-current="index === index"
          @hideCard="removeCardFromDeck(index)"
          @swipe-api-counter="swipeApiCounter"
          @hideLastcardButton="show_last_card_button=false"
          @showLastcardButton="show_last_card_button=true"
        />
    </div>

    <div v-if="!is_mobile"
         class="browser-swipe-alert">
      <h1>
        Rating functionality for desktop is being developed.
      </h1>
      <h1>
        To use 'Swipe to Rate' feature, please use our
        <a href="https://play.google.com/store/apps/details?id=com.pivot.flibo"
           target="_blank">
           Android app
        </a>
        or a mobile browser.
      </h1>
    </div>

    <div class="no-card-message" v-if="store.rate.fetching_cards
                                       &
                                       (content_type_tab_string != '[filter]')
                                       &
                                       !store.rate.visible_cards.length
                                       &
                                       is_mobile">
      <div class="sk-folding-cube">
                <div class="sk-cube1 sk-cube"></div>
                <div class="sk-cube2 sk-cube"></div>
                <div class="sk-cube4 sk-cube"></div>
                <div class="sk-cube3 sk-cube"></div>
      </div>
      <br>
      <div class="quote-font">
          {{store.quotes[Math.floor(Math.random() * 22)]}}
      </div>
    </div>

    <div class="no-card-message" v-if="store.rate_filters.fetching_cards
                                       &
                                       (content_type_tab_string == '[filter]')
                                       &
                                       !store.rate_filters.visible_cards.length
                                       &
                                       is_mobile">
      <div class="sk-folding-cube">
                <div class="sk-cube1 sk-cube"></div>
                <div class="sk-cube2 sk-cube"></div>
                <div class="sk-cube4 sk-cube"></div>
                <div class="sk-cube3 sk-cube"></div>
      </div>
      <br>
      <div class="quote-font">
          {{store.quotes[Math.floor(Math.random() * 22)]}}
      </div>
    </div>

    <div class="no-card-message" v-if="!store.rate_filters.fetching_cards
                                       &
                                       (content_type_tab_string == '[filter]')
                                       &
                                       !store.rate_filters.visible_cards.length"
         :style="to_filter ? 'top: 125px;' : ''">
      <br>Use filters to rate your favorite Movies & TV Series:)</br>
    </div>

    <transition appear
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut">
      <button v-if="is_mobile && show_last_card_button && this.$store.state.last_card"
              :style="`--bottom:`+(((window_height-card_height)/2)+20)+`px;
                      --left:`+(((window_width-(card_width-20))/2)+5)+`px;`"
              v-bind:class="[ (this.$store.state.last_card) ? 'last-card-true' : 'last-card-false' ]"
              @click="showLastCard"/>
    </transition>

    <transition appear
                enter-active-class="animated slideInUp"
                leave-active-class="animated slideOutDown">
        <RateFilter v-if="to_filter"
                     @close-filter="to_filter=false"/>
    </transition>

    <transition appear
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut">
      <Instructions v-if="(!store.instructions_seen | open_instructions)"
                    @close-instructions="open_instructions=false"/>
    </transition>

    <transition appear
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut">
      <div v-if="(store.suggestions.rate_counter_all>=25)
                  &
                  !store.suggestions.suggestions_ready_message_seen"
           class="suggestions-ready-message">
          <h1>
            Suggestions for you are ready!
          </h1>

          <div class="show-suggestions"
                  @click="goToSuggestions">
            Go to Home > Suggestions
          </div>
      </div>
    </transition>

    <div class="info"
         v-if="is_mobile"
         @click="open_instructions=true"/>

  </div>
</template>

<script>
import ContentCard from "./ContentCard";
import RateFilter from "./RateFilter";
import Instructions from "./Instructions";
import axios from "axios";

export default {
  name: "App",
  components: {
    ContentCard,
    RateFilter,
    Instructions
  },
  props: {
    to_filter: {
      type: Boolean,
      required: true
    }
  },
  data() {
          return {
              is_mobile: window.screen.height>window.screen.width,
              filters_applied: this.$store.state.rate_filters.filters_applied,
              filters_meta: this.$store.state.rate_filters.filters_meta,
              show_last_card_button: true,
              window_height: window.innerHeight,
              window_width: window.innerWidth,
              card_height: Math.min(0.7875*window.innerHeight, 1.425*window.innerWidth),
              card_width: Math.min(0.525*window.innerHeight, 0.95*window.innerWidth),
              store: this.$store.state,
              open_instructions: false,
              internal_fetch_check: false
          }
  },
  created() {
      this.$store.state.current_path = '/rate';
      var self = this;
      if (this.$store.state.rate.visible_cards.length==0) {
        this.store.rate.fetching_cards = true;
        axios
          .post(self.$store.state.api_host+'get_contents_to_rate', {
                        session_id: self.$store.state.session_id,
                        content_ids: null,
                        rest_of_queue: null,
                        visible_cards: null,
                        country: self.$store.state.user.profile.country
                    })
          .then(response => (
            self.$store.state.rate.visible_cards = response.data.contents,
            self.$store.state.rate.content_ids = response.data.content_ids,
            self.store.rate.fetching_cards = false
            ))
      }
      axios
        .post(self.$store.state.api_host + 'get_favorite_artists_search', {
            session_id: self.$store.state.session_id
        })
        .then(function(response) {
            if ([200].includes(response.status)) {
                self.$store.state.rate_filters.filters_meta.artists = response.data.favorite_artists
            } else {
            // console.log(response.status);
            };
        })
        .catch(function(error) {
            // console.log(error);
            if ([401, 419].includes(error.response.status)) {
                window.location = self.$store.state.login_host+'logout?session_id='+self.$store.state.session_id;
                self.$store.state.session_id = null;
                self.$emit('logging-out');
            } else {
                // console.log(error.response.status);
            };
        });
  },

  computed: {
    filtered_cards: function() {
        return this.$store.state.rate_filters.visible_cards
    },
    visible_cards_count: function() {
        return this.$store.state.rate.visible_cards.length
    },
    content_type_tab_string() {
            return JSON.stringify(this.$store.state.rate.content_type_tab).replace(/['"]+/g, '')
    }
  },
  watch: {
    visible_cards_count: {
      handler(count){
        if ((count <= 25) && (!this.internal_fetch_check)) {
          this.internal_fetch_check = true;
          var visible_cards = [];
          for (var i = 0; i < this.$store.state.rate.visible_cards.length; ++i) {
              visible_cards.push(this.$store.state.rate.visible_cards[i].content_id);
          };
          var self = this;
          axios
            .post(self.$store.state.api_host + 'get_contents_to_rate', {
                session_id: self.$store.state.session_id,
                content_ids: self.$store.state.rate.content_ids.slice(0,25),
                rest_of_queue: self.$store.state.rate.content_ids.slice(25,),
                visible_cards: visible_cards,
                country: self.$store.state.user.profile.country
            })
            .then(function(response) {
                if ([200].includes(response.status)) {
                    self.$store.state.rate.visible_cards.push(...response.data.contents);
                    self.$store.state.rate.content_ids.splice(0,25);
                    self.internal_fetch_check = false;
                } else {
                // console.log(response.status);
                }
            })
            .catch(function(error) {
                self.internal_fetch_check = false;
                if ([401, 419].includes(error.response.status)) {
                    window.location = self.$store.state.login_host+'logout?session_id='+self.$store.state.session_id;
                    self.$store.state.session_id = null;
                    self.$emit('logging-out');
                } else {
                    // console.log(error.response.status);
                    }
            })
        }
      }
    },
    filtered_cards: {
      handler(cards) {
        if ((cards.length <= 10) && (this.$store.state.rate_filters.content_ids.length != 0)) {
          var self = this;
          axios
            .post(self.$store.state.api_host + 'get_filtered_content', {
                session_id: self.$store.state.session_id,
                content_ids: self.$store.state.rate_filters.content_ids.slice(0,25)
            })
            .then(function(response) {
                if ([200].includes(response.status)) {
                    self.$store.state.rate_filters.visible_cards.push(...response.data.contents);
                    self.$store.state.rate_filters.content_ids.splice(0,25);
                } else {
                // console.log(response.status);
                }
            })
            .catch(function(error) {
                if ([401, 419].includes(error.response.status)) {
                    window.location = self.$store.state.login_host+'logout?session_id='+self.$store.state.session_id;
                    self.$store.state.session_id = null;
                    self.$emit('logging-out');
                } else {
                    // console.log(error.response.status);
                    }
            })
        }
      }
    }
  },

  methods: {
    removeCardFromDeck(index) {
      if (this.content_type_tab_string != '[filter]') {
        this.$store.state.rate.visible_cards.splice(index, 1);
      } else {
        this.$store.state.rate_filters.visible_cards.splice(index, 1);
      }
    },
    showLastCard() {
      var self = this;
      if (this.$store.state.last_card) {
        var last_content_id = this.$store.state.last_card.content_id;
        axios
          .post(this.$store.state.api_host + 'submit_rating', {
              session_id: this.$store.state.session_id,
              content_ids: [last_content_id],
              rating: 0
          })
          .then(function(response) {
                var index = self.$store.state.suggestions.rate_counter.indexOf(last_content_id);
                if (index == -1) {
                  self.$store.state.suggestions.rate_counter.push(last_content_id);
                  if (self.$store.state.suggestions.rate_counter.length == self.$store.state.suggestions.calc_after) {
                    self.$store.state.suggestions.rate_counter = [];
                    axios
                      .post(self.$store.state.ai_host + 'calculate_contents_to_recommend', {
                          session_id: self.$store.state.session_id
                      })
                      .then(function(response) {
                          self.$store.state.suggestions.refresh_recommendation = true;
                          self.$store.state.suggestions.notify = true;
                      })
                  }
                }
              })
          .catch(function(error) {
            if ([401, 419].includes(error.response.status)) {
              window.location = self.$store.state.login_host+'logout?session_id='+self.$store.state.session_id;
              self.$store.state.session_id = null;
              self.$emit('logging-out');
            } else {
              // console.log(error.response.status);
            }
          })
        if (this.content_type_tab_string != '[filter]') {
          this.$store.state.rate.visible_cards.unshift(this.$store.state.last_card);
        } else {
          this.$store.state.rate_filters.visible_cards.unshift(this.$store.state.last_card);
        }
      }
      this.$store.state.last_card = null;
    },
    openFilter() {
        this.$store.state.rate.content_type_tab = ['filter'];
        this.to_filter=!this.to_filter;
        this.$store.state.last_card = null;
    },
    switchRateContentTab(tabs) {
      if (this.content_type_tab_string == '[filter]') {
            this.to_filter = false
      };
      this.$store.state.rate.content_type_tab = tabs;
      this.$store.state.last_card = null;
    },
    goToSuggestions() {
      this.$store.state.suggestions.rate_counter_all = 26;
      this.$store.state.suggestions.discover_type_tab = ['flibo'];
      this.$store.state.suggestions.suggestions_ready_message_seen = true;
      var self = this;
      axios
        .post(self.$store.state.api_host + 'update_profile', {
            session_id: self.$store.state.session_id,
            suggestions_ready_message_seen: true
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
                window.location = self.$store.state.login_host+'logout?session_id='+self.$store.state.session_id;
                self.$store.state.session_id = null;
                self.$emit('logging-out');
            } else {
                // console.log(error.response.status);
                }
        });
      this.$router.push("/discover");
    },
    swipeApiCounter(activity) {
      this.$emit('update-api-counter', activity);
    }
  }
};
</script>

<style lang="scss">
@import "./../styles/mixins.scss";

#app {
  text-align: center;
}
.info {
    position: fixed;
    top: 15px;
    right: 5%;
    height: 5vw;
    width: 5vw;
    background-image: url('./../images/question-mark.svg');
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
  width: 50%;
  left: 8.5%;
}

/* Make the image responsive */
.container ContentCardsStack {
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
    bottom: var(--bottom);
    left: var(--left);
    height: 50px;
    width: 50px;
    background-image: url('./../images/last_card.svg');
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
    bottom: var(--bottom);
    left: var(--left);
    height: 50px;
    width: 50px;
    background-image: url('./../images/last_card_false.png');
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
    background-image: url('./../images/filter.svg');
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
    background-image: url('./../images/red_dot.png');
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
  background-color: rgba(0, 0, 0, .2);
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
  animation: fadeOut 0.6s;
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
.rate-content-type-tabs a{
    position: relative;
    cursor: pointer;
    -webkit-tap-highlight-color: rgba(0,0,0,0);
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
    -webkit-tap-highlight-color: rgba(0,0,0,0);
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
  content: '';
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
  0%, 10% {
    -webkit-transform: perspective(140px) rotateX(-180deg);
            transform: perspective(140px) rotateX(-180deg);
    opacity: 0;
  } 25%, 75% {
    -webkit-transform: perspective(140px) rotateX(0deg);
            transform: perspective(140px) rotateX(0deg);
    opacity: 1;
  } 90%, 100% {
    -webkit-transform: perspective(140px) rotateY(180deg);
            transform: perspective(140px) rotateY(180deg);
    opacity: 0;
  }
}

@keyframes sk-foldCubeAngle {
  0%, 10% {
    -webkit-transform: perspective(140px) rotateX(-180deg);
            transform: perspective(140px) rotateX(-180deg);
    opacity: 0;
  } 25%, 75% {
    -webkit-transform: perspective(140px) rotateX(0deg);
            transform: perspective(140px) rotateX(0deg);
    opacity: 1;
  } 90%, 100% {
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
    font-family: 'Poiret One', cursive;
}
.browser-swipe-alert {
    position: fixed;
    top: 40vh;
    width: 950px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Open Sans', sans-serif;
    line-height: 2;
}
</style>
