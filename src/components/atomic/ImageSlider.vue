<template>
  <div>
    <flickity
      v-if="!fetching && images.length"
      class="images"
      ref="flickity"
      :options="flickityOptions"
    >
      <div v-for="(image, index) in images" :key="index" class="slider-image">
        <div class="img-wrapper">
          <img
            :src="image.replace('/original/', '/w500/')"
            alt="cover-poster"
          />
        </div>
      </div>
    </flickity>

    <div
      class="exclude-image"
      v-if="!store.create.includeImage && !fetching && images.length"
      @click="store.create.includeImage = !store.create.includeImage"
    >
      <div class="slider-arrow" />
      <div class="include-image-text">Tap to add an image to your post</div>
      <div class="slider-arrow" style="transform: rotate(180deg)" />
    </div>

    <div class="fetching" v-if="fetching">
      <div class="sk-folding-cube">
        <div class="sk-cube1 sk-cube"></div>
        <div class="sk-cube2 sk-cube"></div>
        <div class="sk-cube4 sk-cube"></div>
        <div class="sk-cube3 sk-cube"></div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Flickity from "vue-flickity";

export default {
  name: "imageSlider",
  components: {
    Flickity,
  },
  props: {
    contentIds: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      store: this.$store.state,
      images: [],
      fetching: false,
      flickityAvailable: false,
      flickityOptions: {
        initialIndex: 0,
        prevNextButtons: false,
        pageDots: false,
        wrapAround: true,
        percentPosition: true,
      },
    };
  },
  created() {
    this.fetchImages();
  },
  watch: {
    contentIds: {
      handler() {
        this.fetchImages();
      },
    },
  },
  methods: {
    fetchImages() {
      var self = this;
      self.fetching = true;
      self.flickityAvailable = false;
      axios
        .post(self.$store.state.api_host + "fetch_content_images", {
          session_id: self.$store.state.session_id,
          content_ids: self.contentIds,
        })
        .then(function (response) {
          if (response.status == 200) {
            if (response.data.images.includes(self.store.create.image)) {
              self.images = [self.store.create.image];
              self.images.push(
                ...response.data.images.filter(
                  (image) => image != self.store.create.image
                )
              );
            } else if (response.data.images.length) {
              self.images = response.data.images;
              self.store.create.image = self.images[0];
            } else {
              self.images = [];
            }

            if (self.images.length) {
              self.$nextTick(function () {
                self.addClickEventListener();
              });
            }
          } else if (response.status == 204) {
            self.images = [];
          }
          self.fetching = false;
        })
        .catch(function (error) {
          self.fetching = false;
          console.log(error);
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
    addClickEventListener() {
      setTimeout(() => {
        this.flickityAvailable = true;

        this.$refs.flickity.on(
          "staticClick",
          (event, pointer, cellElement, cellIndex) => {
            setTimeout(() => {
              this.store.create.includeImage = !this.store.create.includeImage;
            }, 0);
          }
        );

        this.$refs.flickity.on("change", (index) => {
          this.store.create.image = this.images[index];
        });
      }, 0);
    },
  },
};
</script>

<style scoped>
.slider-image {
  height: 30vh;
  width: 80%;
  margin-right: 16px;
}

.img-wrapper {
  display: flex;
  width: 100%;
  max-height: 30vh;
  justify-content: space-evenly;
  margin-top: 15vh;
  transform: translateY(-50%);
}

.slider-image img {
  max-width: 100%;
  border-radius: 8px;
  max-height: inherit;
  filter: brightness(25%);
}

.slider-image.is-selected img {
  filter: brightness(100%);
}
.fetching {
  position: relative;
  z-index: 1001;
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
.exclude-image {
  position: absolute;
  width: 100vw;
  max-width: 1000px;
  margin-top: 0;
  margin-left: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  height: 30vh;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.75);
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.slider-arrow {
  height: 30px;
  width: 30px;
  background-image: url("./../../images/back-button.svg");
  background-size: 100% 100%;
  border: none;
  outline: 0px;
}
.include-image-text {
  width: 70%;
  font-size: 24px;
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #ffffff;
  font-family: "Roboto", sans-serif;
}
</style>