<template>
  <div class="feed-poster-container">
    <img :src="image" class="poster" alt="poster" @click="openContent" />

    <img
      src="https://flibo-images.s3-us-west-2.amazonaws.com/other/play-white-icon.svg"
      alt="play-trailer"
      class="play-trailer"
      @click="playTrailer"
    />

    <div class="where-to-watch-container" v-if="showPlatforms">
      <div class="where-to-watch-subcontainer">
        <div
          class="poster-platforms-container"
          v-for="(link, index) in whereToWatchOptions"
          :key="index"
        >
          <div
            @click="goToPlatform(link, 'feed_poster')"
            class="poster-platform-cropper"
          >
            <img
              v-bind:src="
                'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                  index +
                  '.jpg'
              "
              class="poster-platform-icon"
            />
          </div>
        </div>
      </div>
    </div>

    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div>
        <div
          class="black-background"
          v-if="play_trailer"
          @click="play_trailer = !play_trailer"
        />

        <div
          class="youtube-player-header"
          :style="is_mobile ? '' : 'top: 75px;left: calc(50vw - 500px);'"
          v-if="play_trailer & (trailerId != null)"
        >
          Trailer
        </div>

        <div
          v-if="play_trailer & (trailerId != null)"
          :class="
            is_mobile
              ? 'youtube-player-loader'
              : 'desktop-youtube-player-loader'
          "
        />

        <iframe
          class="youtube-player"
          :style="
            is_mobile
              ? ''
              : 'width: 1000px;left: calc(50vw - 500px);top: 100px;height: 500px;'
          "
          v-if="play_trailer & (trailerId != null)"
          type="text/html"
          :src="'https://www.youtube.com/embed/' + trailerId + '?autoplay=1'"
          frameborder="0"
          allowfullscreen
        />

        <div
          class="youtube-player-streaming-box"
          :style="trailerId ? (is_mobile ? '' : 'top: 650px;') : 'top: 40vh;'"
          v-if="play_trailer && showPlatforms"
        >
          <div class="tap-to-watch-text" v-if="showPlatforms">
            {{ is_mobile ? "Tap to watch on" : "Click to watch on" }}
          </div>

          <div class="youtube-player-platforms">
            <div
              class="youtube-player-platforms-container"
              v-for="(item, index) in whereToWatchOptions"
            >
              <div
                @click="goToPlatform(item, 'trailer_popup')"
                class="youtube-player-platform-cropper"
              >
                <img
                  v-bind:src="
                    'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                      index +
                      '.jpg'
                  "
                  class="youtube-player-platform-icon"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "App",
  props: {
    contentId: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    trailerId: {
      type: String,
      required: false
    },
    whereToWatch: {
      type: Object,
      required: false
    },
    parent: {
      type: String,
      required: true
    },
    feedType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      play_trailer: false
    };
  },
  mounted() {
    setTimeout(function() {
      var poster_element = document.querySelector(
        ".feed-poster-container .poster"
      );
      if (poster_element) {
        poster_element.style.maxHeight =
          1.5 * poster_element.getBoundingClientRect().width + "px";
      }
    }, 2000);
  },
  computed: {
    showPlatforms() {
      if (
        Object.keys(this.whereToWatch || {}).includes("stream") ||
        Object.keys(this.whereToWatch || {}).includes("rent") ||
        Object.keys(this.whereToWatch || {}).includes("buy")
      ) {
        return true;
      } else {
        return false;
      }
    },
    whereToWatchOptions() {
      if (Object.keys(this.whereToWatch || {}).includes("stream")) {
        return this.whereToWatch.stream;
      } else if (Object.keys(this.whereToWatch || {}).includes("rent")) {
        return this.whereToWatch.rent;
      } else if (Object.keys(this.whereToWatch || {}).includes("buy")) {
        return this.whereToWatch.buy;
      } else {
        return [];
      }
    }
  },
  methods: {
    goToPlatform(link, traffic_origin) {
      this.$emit("update-scroll", window.scrollY);
      var activity = {
        api: "outbound_traffic",
        content_id: this.contentId,
        url: link,
        traffic_origin: this.parent + "__" + traffic_origin
      };
      this.$emit("update-api-counter", activity);
    },
    playTrailer() {
      this.$emit("update-scroll", window.scrollY);
      this.play_trailer = true;

      var activity = {
        api: "play_trailer",
        content_id: this.contentId,
        trailer_origin: this.parent + "__" + this.feedType
      };
      this.$emit("update-api-counter", activity);
    },
    openContent() {
      this.$emit("update-scroll", window.scrollY);

      var info = {
        origin: this.parent,
        sub_origin: this.feedType,
        content_id: this.contentId,
        title: this.title
      };
      this.$emit("open-content-page", info);
    }
  }
};
</script>

<style lang="scss" scoped>
.feed-poster-container {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 1fr 1fr;
  justify-items: center;
}
.poster {
  grid-row-start: 1;
  grid-row-end: 3;
  grid-column-start: 1;
  width: 100%;
  border-radius: 8px;
}
.play-trailer {
  grid-row-start: 2;
  grid-column-start: 1;
  transform: translateY(-50%);
  width: 50%;
  padding: 15px;
  max-width: 70px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.where-to-watch-container {
  grid-row-end: 3;
  grid-column-start: 1;
  align-self: end;
  width: 100%;
  overflow-x: scroll;
  padding: 5px 0px;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
  border-radius: 0 0 8px 8px;
}
.where-to-watch-subcontainer {
  position: relative;
  display: flex;
  width: fit-content;
  max-width: 100%;
  margin-left: 50%;
  transform: translateX(-50%);
}
.poster-platforms-container {
  display: inline-block;
  vertical-align: top;
  text-align: center;
  margin-left: 5px;
  margin-right: 5px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.poster-platform-cropper {
  width: 28px;
  height: 28px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.poster-platform-icon {
  display: inline-block;
  position: absolute;
  width: 100%;
  margin-left: -50%;
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
.youtube-player-header {
  position: fixed;
  top: calc(50vh - 28.125vw - 20vh - 25px);
  left: 10px;
  z-index: 100001;
  white-space: initial;
  font-size: 20px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.05;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
}
.youtube-player-loader {
  border: 10px solid #f3f3f3;
  border-top: 10px solid #3498db;
  border-radius: 50%;
  width: 14vw;
  height: 14vw;
  animation: spin 2s linear infinite;
  position: fixed;
  top: calc(50vh - 20vh - 7vw);
  left: calc(50% - 7vw);
  z-index: 100000;
}
.desktop-youtube-player-loader {
  border: 10px solid #f3f3f3;
  border-top: 10px solid #3498db;
  border-radius: 50%;
  width: 75px;
  height: 75px;
  animation: spin 2s linear infinite;
  position: fixed;
  top: 312.5px;
  left: calc(50vw - 37.5px);
  z-index: 100000;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.youtube-player {
  position: fixed;
  width: 100vw;
  height: 56.25vw;
  top: calc(50vh - 28.125vw - 20vh);
  left: 0;
  z-index: 100001;
}
.youtube-player-platforms {
  display: inline-flex;
  overflow: scroll;
  max-width: 100%;
}
.youtube-player-platform-cropper {
  width: 50px;
  height: 50px;
  position: relative;
  overflow: hidden;
  border-radius: 20%;
}
.youtube-player-platform-icon {
  display: inline-block;
  position: absolute;
  width: 100%;
  margin-left: -50%;
}
.youtube-player-platforms-container {
  display: inline-block;
  vertical-align: top;
  text-align: center;
  margin: 20px 10px 0px 10px;
}
.tap-to-watch-text {
  white-space: nowrap;
  font-size: 20px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.05;
  letter-spacing: normal;
  text-align: center;
  color: #333333;
}
.youtube-player-streaming-box {
  position: fixed;
  top: calc(60vh + 28.125vw - 25vh);
  left: 50%;
  transform: translateX(-50%);
  z-index: 100001;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 10px;
  max-width: 95vw;
}
::-webkit-scrollbar {
  display: none;
}
</style>