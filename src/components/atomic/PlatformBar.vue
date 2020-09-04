<template>
  <div
    v-if="noOfPlatforms >= 1"
    class="platform-container"
    :style="[
      noOfPlatforms === 1
        ? {
            width: containerWidth * ((scalePlatformsSize * 25) / 100) + 'px',
            height: containerWidth * ((scalePlatformsSize * 25) / 100) + 'px',
          }
        : {
            width:
              containerWidth * ((scalePlatformsSize * 25 + 20) / 100) + 'px',
            height: containerWidth * ((scalePlatformsSize * 25) / 100) + 'px',
            transition: 'width 0.1s linear',
          },
      plusClicked
        ? noOfPlatforms === 2
          ? { width: containerWidth * ((scalePlatformsSize * 50) / 100) + 'px' }
          : { width: containerWidth * ((scalePlatformsSize * 75) / 100) + 'px' }
        : {},
    ]"
  >
    <div class="image-sub-container">
      <img
        @click="
          goToPlatform(
            finalPlatforms[Object.getOwnPropertyNames(finalPlatforms)[0]],
            posterLocation
          )
        "
        v-if="plusClicked === false"
        :src="
          'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
          Object.getOwnPropertyNames(finalPlatforms)[0] +
          '.jpg'
        "
      />
    </div>
    <div class="image-container" v-if="plusClicked">
      <div
        class="image-sub-container"
        v-for="(link, key) in finalPlatforms"
        :key="key"
      >
        <img
          @click="goToPlatform(link, posterLocation)"
          :src="
            'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
            key +
            '.jpg'
          "
        />
      </div>
    </div>
    <div
      v-if="noOfPlatforms > 1 && plusClicked === false"
      class="plus-sign"
      @click="plusClicked = !plusClicked"
    >
      <p :style="containerWidth < 150 ? 'font-size: 16px;' : ''">
        +{{ noOfPlatforms - 1 }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    contentId: {
      type: Number,
      required: true,
    },
    containerWidth: {
      type: Number,
      required: true,
    },
    userPlatforms: {
      type: Array,
      required: false,
      default: () => [""],
    },
    contentPlatforms: {
      type: Object,
      required: false,
      default: null,
    },
    parent: {
      type: String,
      required: true,
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
  },

  data() {
    return {
      plusClicked: false,
    };
  },

  computed: {
    noOfPlatforms() {
      return Object.keys(this.contentPlatforms).length;
    },
    userPlatformsModified() {
      let lowerCased = this.userPlatforms.map((el) => {
        return el.toLowerCase();
      });
      let replaceSpace = lowerCased.map((el) => {
        return el.replace(/ /g, "_");
      });
      return replaceSpace;
    },
    finalPlatforms() {
      let finalPlatform = {};
      for (let k in this.contentPlatforms) {
        if (this.userPlatformsModified.includes(k)) {
          finalPlatform[k] = this.contentPlatforms[k];
        }
      }

      for (let k in this.contentPlatforms) {
        if (!this.userPlatformsModified.includes(k)) {
          finalPlatform[k] = this.contentPlatforms[k];
        }
      }
      return finalPlatform;
    },
  },
  watch: {
    finalPlatforms: {
      handler(val) {
        this.plusClicked = false;
      },
    },
  },
  methods: {
    goToPlatform(link, traffic_origin) {
      this.$emit("leave-feed");
      var activity = {
        api: "outbound_traffic",
        content_id: this.contentId,
        url: link,
        traffic_origin:
          (this.parent == "search_results" ? "search_filter" : this.parent) +
          (traffic_origin ? "__" + traffic_origin + "_poster" : ""),
      };
      this.$emit("update-api-counter", activity);
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}
.platform-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 50px;
  background-color: white;
  max-width: 200px;
  max-height: 80px;
  box-shadow: 0 0 5px 0px rgba(0, 0, 0, 0.2);
}
.image-container {
  width: 100%;
  height: 100%;
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  overflow-x: scroll;
}
.image-container::-webkit-scrollbar {
  display: none;
}
.plus-sign {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  position: relative;
  right: 3px;
  font-family: "Roboto", Arial;
  color: #222222;
  font-size: 30px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.image-sub-container {
  height: 100%;
}
.platform-container img {
  padding: 5px;
  border-radius: 50%;
  height: 100%;
  width: auto;
}
.platform-container p {
  font-size: 20px;
}
</style>
