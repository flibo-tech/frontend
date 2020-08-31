<template>
  <div class="feed-info-container">
    <div class="feed-title" @click="openContent(null, null, null)">
      {{ title }}
    </div>

    <div class="feed-genres" :style="is_mobile ? '' : 'font-size: 15px;'">
      <span class="feed-genre">
        {{ imdbScore }}
      </span>

      <span class="feed-genre" v-for="(genre, index) in genres" :key="index">
        {{ genre }}
      </span>
    </div>

    <div class="feed-user-rating-container">
      <button
        v-bind:class="[rating == 3 ? 'feed-love-true' : 'feed-love-false']"
        @click="submitRating(rating == 3 ? 0 : 3)"
      ></button>

      <button
        v-bind:class="[
          rating == 2 ? 'feed-thumbs-up-true' : 'feed-thumbs-up-false',
        ]"
        @click="submitRating(rating == 2 ? 0 : 2)"
      ></button>

      <button
        v-bind:class="[
          rating == 1 ? 'feed-thumbs-down-true' : 'feed-thumbs-down-false',
        ]"
        @click="submitRating(rating == 1 ? 0 : 1)"
      ></button>
    </div>

    <div class="feed-watchlist-continer" @click="addToWatchlist">
      {{ watchLater ? "ADDED" : "ADD TO WATCHLIST" }}
      <button
        v-bind:class="[
          watchLater ? 'feed-watchlist-true' : 'feed-watchlist-false',
        ]"
      />
    </div>

    <div class="feed-more" @click="showMoreInfo">
      {{ is_mobile ? "MORE" : "MORE INFO" }}
    </div>

    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div>
        <div
          v-if="show_more_info"
          class="black-background"
          @click="show_more_info = !show_more_info"
        />

        <div
          class="more-info-container"
          :style="
            is_mobile
              ? ''
              : 'width: 500px;left: 50%;transform: translateX(-50%);'
          "
          v-if="show_more_info"
        >
          <div class="more-info-name">
            <span
              style="
                cursor: pointer;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                -o-user-select: none;
                user-select: none;
                -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                -webkit-tap-highlight-color: transparent;
              "
              @click="openContent(null, null, null)"
            >
              {{ title }}
            </span>

            <span v-if="contentType == 'tv'" style="font-weight: normal;">
              ({{ releaseYear }}-{{ endYear ? endYear : "Present" }})
            </span>

            <span v-if="contentType == 'movie'" style="font-weight: normal;">
              ({{ releaseYear }})
            </span>
          </div>

          <p class="more-info-summary-text">
            {{ summary }}
          </p>

          <div class="more-info-ratings">
            <div class="more-info-rating-container" v-if="imdbScore">
              IMDB
              <span style="font-weight: bold;">
                {{ imdbScore }}
              </span>
            </div>

            <div class="more-info-rating-container" v-if="tomatoMeter">
              TOMATOMETER
              <span style="font-weight: bold;">
                {{ tomatoMeter }}
              </span>
            </div>
          </div>

          <h3 v-if="crew.length">
            Cast and Crew
          </h3>

          <div class="more-info-artists" v-if="crew.length">
            <div v-for="artist in crew" class="more-info-artists-container">
              <div class="more-info-artist-cropper">
                <img
                  v-bind:src="artist.profile_photo"
                  class="more-info-artist-pic"
                />
              </div>
              <div class="more-info-artist-name">
                {{ artist.person }}
              </div>
            </div>
          </div>

          <h3 v-if="similar.length">
            Similar {{ contentType == "movie" ? "Movies" : "TV Series" }}
          </h3>

          <div class="more-info-similar-content" v-if="similar.length">
            <Poster
              v-for="(content, index) in similar"
              :key="index"
              class="more-info-content-container"
              :containerWidth="125"
              :contentId="content.content_id"
              :title="content.title"
              :image="content.poster"
              :showTrailer="false"
              :whereToWatch="content.where_to_watch"
              :userPlatforms="
                store.user.id ? store.user.profile.platforms || [''] : ['']
              "
              :showName="true"
              :parent="parent"
              :feedType="feedType"
              posterLocation="similar"
              v-on="$listeners"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";
import Poster from "./Poster";

export default {
  name: "App",
  components: {
    Poster,
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
    contentType: {
      type: String,
      required: true,
    },
    releaseYear: {
      type: Number,
      required: true,
    },
    endYear: {
      type: Number,
      required: false,
    },
    imdbScore: {
      type: Number,
      required: true,
    },
    tomatoMeter: {
      type: Number,
      required: false,
    },
    rating: {
      type: Number,
      required: true,
    },
    genres: {
      type: Array,
      required: true,
    },
    watchLater: {
      type: Boolean,
      required: true,
    },
    parent: {
      type: String,
      required: true,
    },
    feedType: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      maxHeight: null,
      is_mobile: window.screen.height > window.screen.width,
      play_trailer: false,
      show_more_info: false,
      summary: null,
      crew: [],
      similar: [],
      store: this.$store.state,
    };
  },
  methods: {
    showPlatforms(whereToWatch) {
      if (
        Object.keys(whereToWatch || {}).includes("stream") ||
        Object.keys(whereToWatch || {}).includes("rent") ||
        Object.keys(whereToWatch || {}).includes("buy")
      ) {
        return true;
      } else {
        return false;
      }
    },
    whereToWatchOptions(whereToWatch) {
      if (Object.keys(whereToWatch || {}).includes("stream")) {
        return whereToWatch.stream;
      } else if (Object.keys(whereToWatch || {}).includes("rent")) {
        return whereToWatch.rent;
      } else if (Object.keys(whereToWatch || {}).includes("buy")) {
        return whereToWatch.buy;
      } else {
        return [];
      }
    },
    goToPlatform(link, content_id, traffic_origin) {
      this.$emit("leave-feed");
      var activity = {
        api: "outbound_traffic",
        content_id: content_id,
        url: link,
        traffic_origin:
          (this.parent == "search_results" ? "search_filter" : this.parent) +
          "__" +
          traffic_origin,
      };
      this.$emit("update-api-counter", activity);
    },
    openContent(input_content_id, input_title, suffix) {
      this.$emit("leave-feed");

      var info = {
        origin: this.parent,
        sub_origin: this.feedType,
        suffix: suffix,
        content_id: input_content_id || this.contentId,
        title: input_title || this.title,
      };
      this.$emit("open-content-page", info);
    },
    showMoreInfo() {
      var self = this;
      self.show_more_info = !self.show_more_info;

      axios
        .post(this.$store.state.api_host + "content_summary_more_info", {
          session_id: this.$store.state.session_id,
          content_id: this.contentId,
          guest_id: self.$store.state.guest_id,
        })
        .then(function (response) {
          if (response.status == 200) {
            self.summary = response.data.summary;
          } else {
            // console.log(response.status);
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

      axios
        .post(this.$store.state.api_host + "content_crew_more_info", {
          session_id: this.$store.state.session_id,
          content_id: this.contentId,
        })
        .then(function (response) {
          if (response.status == 200) {
            self.crew = response.data.crew;
          } else {
            // console.log(response.status);
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

      axios
        .post(this.$store.state.api_host + "similar_content", {
          session_id: this.$store.state.session_id,
          content_id: this.contentId,
          country: self.$store.state.user.profile.country,
        })
        .then(function (response) {
          if (response.status == 200) {
            self.similar = response.data.contents;
          } else {
            // console.log(response.status);
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
    },
    submitRating(rating) {
      if (this.$store.state.session_id != null) {
        var info = {
          origin: this.parent,
          content_id: this.contentId,
          user_rating: rating,
        };
        this.$emit("submit-rating", info);
      } else {
        this.$store.state.prompt_signup = true;
      }
    },
    addToWatchlist() {
      if (this.$store.state.session_id != null) {
        var info = {
          origin: this.parent,
          content_id: this.contentId,
          watch_later: this.watchLater,
        };
        this.$emit("add-to-watchlist", info);
      } else {
        this.$store.state.prompt_signup = true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.feed-info-container {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto 10px auto 10px auto 10px auto 10px auto;
  justify-items: left;
  width: fit-content;
  max-width: 100%;
  white-space: initial;
}
.feed-title {
  grid-row-start: 1;
  grid-column-start: 1;
  white-space: initial;
  position: relative;
  font-size: 18px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.05;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.feed-genres {
  grid-row-start: 3;
  grid-column-start: 1;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
.feed-genre + .feed-genre:before {
  content: "|";
}
.feed-user-rating-container {
  grid-row-start: 5;
  grid-column-start: 1;
  position: relative;
  left: 0%;
  text-align: left;
}
.feed-thumbs-up-true {
  position: relative;
  height: 28px;
  width: 28px;
  margin-right: 10px;
  background-image: url("./../../images/thumbs_up_true.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.feed-thumbs-up-false {
  position: relative;
  height: 28px;
  width: 28px;
  margin-right: 10px;
  background-image: url("./../../images/thumbs_up_false.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.feed-thumbs-down-true {
  position: relative;
  height: 28px;
  width: 28px;
  transform: translateY(3px);
  background-image: url("./../../images/thumbs_down_true.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.feed-thumbs-down-false {
  position: relative;
  height: 28px;
  width: 28px;
  transform: translateY(3px);
  background-image: url("./../../images/thumbs_down_false.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.feed-love-true {
  position: relative;
  height: 28px;
  width: 28px;
  transform: translateY(1px);
  margin-right: 10px;
  background-image: url("./../../images/love_true.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.feed-love-false {
  position: relative;
  height: 28px;
  width: 28px;
  transform: translateY(1px);
  margin-right: 10px;
  background-image: url("./../../images/love_false.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.feed-watchlist-continer {
  grid-row-start: 7;
  grid-column-start: 1;
  display: initial;
  padding: 5px 20px 5px 5px;
  font-size: 12px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.36;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  border-radius: 4px;
  border: solid 2px #333333;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.feed-watchlist-true {
  position: absolute;
  height: 12px;
  width: 12px;
  margin-left: 4px;
  margin-top: 1px;
  background-image: url("./../../images/checked.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.feed-watchlist-false {
  position: absolute;
  height: 12px;
  width: 12px;
  margin-left: 4px;
  margin-top: 1px;
  background-image: url("./../../images/plus.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.feed-more {
  grid-row-start: 9;
  grid-column-start: 1;
  position: relative;
  display: initial;
  padding: 5px;
  font-size: 12px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.36;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  border-radius: 4px;
  border: solid 2px #333333;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.fadeIn {
  animation: fadeIn 0.3s;
}
.fadeOut {
  animation: fadeOut 0.6s;
}
.black-background {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  top: 0%;
  left: 0%;
  z-index: 100000;
}
.more-info-container {
  position: fixed;
  width: 92%;
  left: 4%;
  top: 20vh;
  max-height: 60vh;
  overflow: scroll;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 15px;
  z-index: 100001;
  text-align: left;
}
.more-info-name {
  white-space: initial;
  position: relative;
  font-size: 18px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
.more-info-summary-text {
  position: relative;
  margin-top: 10px;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  white-space: initial;
}
.more-info-ratings {
  width: 100%;
  margin-top: 15px;
}
.more-info-rating-container {
  position: relative;
  display: inline-block;
  margin-bottom: 5px;
  font-size: 14px;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.36;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  border-radius: 4px;
  background-color: #f2f2f2;
  padding: 1px 5px;
}
.more-info-artists {
  display: inline-flex;
  overflow-x: scroll;
  white-space: nowrap;
  width: 100%;
  margin-top: 10px;
}
.more-info-artists-container {
  display: inline-block;
  margin-right: 15px;
  vertical-align: top;
  text-align: center;
}
.more-info-artist-cropper {
  display: inline-block;
  width: 55px;
  height: 70px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.more-info-artist-pic {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.more-info-artist-name {
  margin-top: 3px;
  position: relative;
  width: 55px;
  white-space: normal;
  font-size: 12px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  text-align: center;
  color: #333333;
}
.more-info-similar-content {
  display: inline-flex;
  overflow-x: scroll;
  width: 100%;
  white-space: nowrap;
  margin-top: 10px;
}
.more-info-content-container {
  position: relative;
  display: inline-block;
  margin-right: 15px;
  vertical-align: top;
  text-align: center;
}
.more-info-container h3 {
  font-size: 16px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.25;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  margin-top: 20px;
}
::-webkit-scrollbar {
  display: none;
}
</style>