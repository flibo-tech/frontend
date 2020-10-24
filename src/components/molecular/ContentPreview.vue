<template>
  <div>
    <div
      class="content-preview-info-container"
      ref="contentPreviewInfoContainer"
    >
      <div class="sk-folding-cube" v-if="fetching">
        <div class="sk-cube1 sk-cube"></div>
        <div class="sk-cube2 sk-cube"></div>
        <div class="sk-cube4 sk-cube"></div>
        <div class="sk-cube3 sk-cube"></div>
      </div>

      <div v-else>
        <div class="content-preview-info-name">
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
            @click="openContent"
          >
            {{ name }}
          </span>

          <span v-if="contentType == 'tv'" style="font-weight: normal">
            ({{ metaInfo.release_year }}-{{
              metaInfo.end_year ? metaInfo.end_year : "Present"
            }})
          </span>

          <span v-if="contentType == 'movie'" style="font-weight: normal">
            ({{ metaInfo.release_year }})
          </span>
        </div>

        <div
          v-if="metaInfo && metaInfo.youtube_trailer_id"
          class="content-preview-trailer-container"
        >
          <div class="content-preview-trailer">
            <div class="content-preview-youtube-player-loader" />

            <div class="content-preview-iframe-container">
              <iframe
                class="content-preview-youtube-player"
                type="text/html"
                :src="
                  'https://www.youtube.com/embed/' +
                  metaInfo.youtube_trailer_id +
                  '?autoplay=1&rel=0&controls=0&modestbranding=1'
                "
                frameborder="0"
                allowfullscreen
              />
            </div>
          </div>
        </div>

        <div class="content-preview-user-rating-watchlist-container">
          <UserRating
            class="content-preview-user-rating-container"
            :rating="metaInfo.rating"
            :iconSize="25"
            @update-rating="submitRating"
          />

          <div
            class="content-preview-watchlist-continer"
            @click="addToWatchlist"
          >
            {{ metaInfo.watch_later ? "ADDED" : "ADD&nbsp;TO&nbsp;WATCHLIST" }}
            <button
              v-bind:class="[
                metaInfo.watch_later
                  ? 'content-preview-watchlist-true'
                  : 'content-preview-watchlist-false',
              ]"
            />
          </div>
        </div>

        <div class="content-preview-info-ratings">
          <ContentMetaBlock
            class="content-preview-info-rating-container"
            v-if="metaInfo.imdb_score"
            :text="'IMDb ' + metaInfo.imdb_score"
          />

          <ContentMetaBlock
            class="content-preview-info-rating-container"
            v-if="metaInfo.tomato_meter"
            :text="'Tomatometer ' + metaInfo.tomato_meter"
          />
        </div>

        <div
          class="content-preview-platforms"
          :style="is_mobile ? '' : 'margin-top: 10px;'"
          v-if="Object.keys(whereToWatchOptions).length"
        >
          <div
            class="content-preview-platforms-container"
            v-for="(item, index) in whereToWatchOptions"
            :key="index"
          >
            <div
              @click="goToPlatform(item, id, 'content_preview')"
              class="content-preview-platform-cropper"
              :style="
                is_mobile ? '' : 'width: 50px;height: 50px;border-radius: 10px;'
              "
            >
              <img
                v-bind:src="
                  'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                  index +
                  '.jpg'
                "
                class="content-preview-platform-icon"
              />
            </div>
          </div>
        </div>

        <h3 v-if="crewInfo.length">Cast and Crew</h3>

        <div class="content-preview-info-artists" v-if="crewInfo.length">
          <ImageCard
            v-for="(artist, index) in crewInfo"
            :key="index"
            class="content-preview-info-artists-container"
            style="min-width: auto"
            :name="artist.person"
            :image="artist.profile_photo"
            :width="55"
            :height="70"
            fontWeight="normal"
          />
        </div>
      </div>
    </div>

    <div class="modal-bg" @click="$emit('close-preview')"></div>
  </div>
</template>

<script>
import axios from "axios";
import UserRating from "./UserRating";
import ImageCard from "./../atomic/ImageCard";
import ContentMetaBlock from "./../atomic/ContentMetaBlock";

export default {
  name: "ContentPreview",
  components: {
    UserRating,
    ImageCard,
    ContentMetaBlock,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    parent: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
      fetching: true,
      metaInfo: null,
      crewInfo: [],
    };
  },
  created() {
    var self = this;
    axios
      .post(this.$store.state.api_host + "content_page", {
        session_id: this.$store.state.session_id,
        content_id: this.id,
        origin: this.parent + "__content_preview",
        country:
          self.$store.state.user.profile.country || self.store.guest_country,
        guest_id: self.$store.state.guest_id,
      })
      .then((response) => {
        self.metaInfo = response.data.contents;
        self.fetching = false;
        self.$refs.contentPreviewInfoContainer.style.display = "block";
        self.$refs.contentPreviewInfoContainer.style.textAlign = "left";
      })
      .catch(function (error) {
        self.fetching = false;
        // console.log(error);
      });

    axios
      .post(this.$store.state.api_host + "content_crew_more_info", {
        session_id: this.$store.state.session_id,
        content_id: this.id,
      })
      .then(function (response) {
        if (response.status == 200) {
          self.crewInfo = response.data.crew;
        } else {
          // console.log(response.status);
        }
      })
      .catch(function (error) {
        // console.log(error.response.status);
      });
  },
  computed: {
    contentType() {
      return RegExp(/^1{1}.*$/).test(this.id) ? "movie" : "tv";
    },
    whereToWatchOptions() {
      if (Object.keys(this.metaInfo.where_to_watch || {}).includes("stream")) {
        return this.metaInfo.where_to_watch.stream;
      } else if (
        Object.keys(this.metaInfo.where_to_watch || {}).includes("rent")
      ) {
        return this.metaInfo.where_to_watch.rent;
      } else if (
        Object.keys(this.metaInfo.where_to_watch || {}).includes("buy")
      ) {
        return this.metaInfo.where_to_watch.buy;
      } else {
        return {};
      }
    },
  },
  methods: {
    openContent() {
      this.$emit("leave-feed");
      var info = {
        origin: this.parent,
        content_id: this.id,
        title: this.name,
      };
      this.$emit("open-content-page", info);
    },
    submitRating(rating) {
      if (this.$store.state.session_id != null) {
        var self = this;

        var prev_rating = this.metaInfo.rating;
        this.metaInfo.rating = rating;
        axios
          .post(this.$store.state.api_host + "submit_rating", {
            session_id: this.$store.state.session_id,
            content_ids: [this.id],
            rating: rating,
            privacy: this.$store.state.user.profile.profile_status || "public",
          })
          .then(function (response) {
            var index = self.$store.state.suggestions.rate_counter.indexOf(
              self.id
            );
            if (index == -1) {
              self.$store.state.suggestions.rate_counter.push(self.id);
              if (
                self.$store.state.suggestions.rate_counter.length !=
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
                    if (response.data.notify) {
                      self.$store.state.notifications.notifications = 1;
                    }
                  });
              }
            }
          })
          .catch(function (error) {
            self.metaInfo.rating = prev_rating;

            if ([401, 419].includes(error.response.status)) {
              window.location =
                self.$store.state.login_host +
                "logout?session_id=" +
                self.$store.state.session_id;
              self.$store.state.session_id = null;
              self.logging_out = true;
            } else {
              // console.log(error.response.status);
            }
          });
      } else {
        this.$store.state.prompt_signup = true;
      }
    },
    addToWatchlist() {
      if (this.$store.state.session_id != null) {
        var self = this;
        var prev_state = self.metaInfo.watch_later;
        self.metaInfo.watch_later = self.metaInfo.watch_later ? false : true;

        axios
          .post(this.$store.state.api_host + "update_watchlist", {
            session_id: this.$store.state.session_id,
            content_id: this.id,
            status: self.metaInfo.watch_later,
            privacy: this.$store.state.user.profile.profile_status || "public",
          })
          .then(function (response) {
            if (response.status == 200) {
              self.$store.state.feed.watchlist.fetching = true;
              axios
                .post(self.$store.state.api_host + "watchlist", {
                  session_id: self.$store.state.session_id,
                  country: self.$store.state.user.profile.country,
                })
                .then(function (response) {
                  if ([200].includes(response.status)) {
                    self.$store.state.watchlist = response.data.watchlist;
                    self.$store.state.feed.watchlist.feed_list = self.$store.state.watchlist.slice(
                      0,
                      self.$store.state.feed.defaultListSize
                    );
                    if (self.$route.path == "/watchlist") {
                      self.$nextTick(function () {
                        self.$store.state.feed.update_dom = true;
                      });
                    }
                  } else {
                    // console.log(response.status);
                  }
                  self.$store.state.feed.watchlist.fetching = false;
                })
                .catch(function (error) {
                  self.$store.state.feed.watchlist.fetching = false;
                });
            } else {
              // console.log(response.status);
            }
          })
          .catch(function (error) {
            self.metaInfo.watch_later = prev_state;
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
      } else {
        this.$store.state.prompt_signup = true;
      }
    },
    goToPlatform(link, content_id, traffic_origin) {
      this.$emit("leave-feed");
      var activity = {
        api: "outbound_traffic",
        content_id: content_id,
        url: link,
        traffic_origin: traffic_origin,
      };
      this.$emit("update-api-counter", activity);
    },
  },
};
</script>

<style scoped>
.modal-bg {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  top: 0%;
  left: 0%;
  z-index: 100000;
  animation: 0.2s ease-out 0s 1 load;
}
@keyframes load {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
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
::-webkit-scrollbar {
  display: none;
}
.content-preview-info-container {
  position: fixed;
  width: 95vw;
  max-width: 800px;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  justify-items: center;
  max-height: 70vh;
  min-height: 40vh;
  overflow: scroll;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 15px;
  z-index: 1000001;
}
.content-preview-info-name {
  margin-bottom: 16px;
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
.content-preview-info-ratings {
  width: 100%;
  margin-top: 15px;
}
.content-preview-info-rating-container {
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
.content-preview-info-artists {
  display: flex;
  white-space: nowrap;
  width: 100%;
  margin-top: 10px;
  align-items: flex-start;
  overflow-x: scroll;
}
.content-preview-info-artists-container {
  display: inline-block;
  margin-right: 15px;
  vertical-align: top;
  text-align: center;
  padding: 1px;
}
.content-preview-info-container h3 {
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
.content-preview-user-rating-watchlist-container {
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 20px;
}
.content-preview-user-rating-container {
  position: relative;
  width: 115px;
}
.content-preview-watchlist-continer {
  position: relative;
  white-space: nowrap;
  display: flex;
  padding: 5px;
  font-size: 11px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.4;
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
.content-preview-platforms {
  display: inline-flex;
  overflow-x: scroll;
  width: 100%;
  white-space: nowrap;
  margin-top: 14px;
}
.content-preview-platform-cropper {
  width: 45px;
  height: 45px;
  margin-left: 0%;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.content-preview-platform-icon {
  display: inline-block;
  position: absolute;
  width: 102%;
  margin-left: -50%;
  margin-top: -2%;
}
.content-preview-platforms-container {
  display: inline-block;
  vertical-align: top;
  text-align: center;
  margin-right: 2.5%;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.content-preview-watchlist-true {
  position: relative;
  height: 11px;
  width: 11px;
  margin-top: 1px;
  margin-left: 4px;
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
.content-preview-watchlist-false {
  position: relative;
  height: 11px;
  width: 11px;
  margin-top: 1px;
  margin-left: 4px;
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
.content-preview-trailer-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 16px;
}
.content-preview-trailer {
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: center;
  width: 100%;
}
.content-preview-youtube-player-loader {
  position: absolute;
  margin-top: calc(17.5vh - 30px);
  border: 10px solid #f3f3f3;
  border-top: 10px solid #3498db;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.content-preview-youtube-player {
  width: 1000%;
  height: 35vh;
  left: calc(-500%);
  transform: translate(5%);
  position: absolute;
}
.content-preview-iframe-container {
  position: relative;
  overflow: hidden;
  z-index: 1;
  width: 95vw;
  max-width: 800px;
  height: 35vh;
}
</style>