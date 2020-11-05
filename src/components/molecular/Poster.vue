<template>
  <div :style="{ width: containerWidth + 'px' }">
    <div>
      <div
        class="feed-poster-container"
        :style="'width: ' + containerWidth + 'px;'"
      >
        <img
          :src="image"
          class="poster"
          :style="'height: ' + 1.5 * containerWidth + 'px;'"
          alt="poster"
          @click="openContentOnClick ? openContent() : $emit('clicked')"
        />

        <Trailer
          v-if="showTrailer"
          class="trailer"
          style="margin-top: -35px"
          ref="trailer"
          :contentId="contentId"
          :trailerId="trailerId"
          :whereToWatch="whereToWatch"
          :parent="parent"
          :feedType="feedType"
          :size="70"
          @trailer-toggled="updateZIndex"
          v-on="$listeners"
        />

        <PlatformBar
          class="platform-bar"
          :style="
            'margin-top: -' +
            Math.min(
              40,
              0.5 * containerWidth * ((scalePlatformsSize * 25) / 100)
            ) +
            'px;'
          "
          :contentId="contentId"
          :userPlatforms="userPlatforms"
          :contentPlatforms="whereToWatchOptions"
          :containerWidth="containerWidth"
          :parent="parent"
          :posterLocation="posterLocation"
          :scalePlatformsSize="scalePlatformsSize"
          v-on="$listeners"
        />
      </div>
      <div v-if="showName" class="title" @click="openContent">
        {{ title }}
      </div>
    </div>
  </div>
</template>

<script>
import PlatformBar from "./../atomic/PlatformBar";
import Trailer from "./../atomic/Trailer";
export default {
  name: "App",
  components: {
    PlatformBar,
    Trailer,
  },
  props: {
    containerWidth: {
      type: Number,
      required: true,
    },
    contentId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    trailerId: {
      type: String,
      required: false,
      default: null,
    },
    whereToWatch: {
      type: Object,
      required: false,
      default: null,
    },
    showTrailer: {
      type: Boolean,
      required: false,
      default: true,
    },
    parent: {
      type: String,
      required: true,
    },
    feedType: {
      type: String,
      required: false,
      default: null,
    },
    userPlatforms: {
      type: Array,
      required: false,
      default: () => [""],
    },
    showName: {
      type: Boolean,
      required: false,
      default: true,
    },
    posterLocation: {
      type: String,
      required: false,
      default: null,
    },
    scalePlatformsSize: {
      type: Number,
      required: false,
      default: 1,
    },
    openContentOnClick: {
      type: Boolean,
      required: false,
      default: true,
    },
  },

  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      play_trailer: false,
    };
  },
  computed: {
    whereToWatchOptions() {
      if (Object.keys(this.whereToWatch || {}).includes("stream")) {
        return this.whereToWatch.stream;
      } else if (Object.keys(this.whereToWatch || {}).includes("rent")) {
        return this.whereToWatch.rent;
      } else if (Object.keys(this.whereToWatch || {}).includes("buy")) {
        return this.whereToWatch.buy;
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
        sub_origin: this.feedType,
        content_id: this.contentId,
        suffix: this.posterLocation,
        title: this.title,
      };
      this.$emit("open-content-page", info);
    },
    updateZIndex(trailerPlaying) {
      const element = this.$refs.trailer.$el;
      element.style.zIndex = trailerPlaying ? "100000" : "100";
    },
  },
};
</script>

<style lang="scss" scoped>
.title {
  grid-row-start: 3;
  margin-top: 10px;
  text-align: center;
  white-space: normal;
  font-size: 12px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  text-align: center;
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

.trailer {
  position: absolute;
  grid-row-start: 2;
  z-index: 100;
}

.platform-bar {
  position: relative;
  grid-row-start: 3;
}
.feed-poster-container {
  position: relative;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 1fr 1fr;
  justify-items: center;
  padding-bottom: 3px;
}
.poster {
  grid-row-start: 1;
  grid-row-end: 3;
  grid-column-start: 1;
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
</style>