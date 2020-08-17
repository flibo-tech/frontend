<template>
  <div
    ref="movieImageContainer"
    :style="
      'position: fixed; max-height: ' +
      Math.min(1.5 * screenWidth, 0.8 * screenHeight) +
      'px;'
    "
    class="portrait-image-container"
  >
    <img
      class="portrait-content-image"
      style="width: 100%;"
      ref="movieImage"
      :src="imageUrl"
      :onerror="
        'this.onerror=null;this.src=url;'.replace(
          'url',
          '\'' + imageUrl.replace('/w1280/', '/original/') + '\''
        )
      "
    />

    <img
      class="portrait-background-image"
      ref="movieImageBG"
      :src="imageUrl"
      :onerror="
        'this.onerror=null;this.src=url;'.replace(
          'url',
          '\'' + imageUrl.replace('/w1280/', '/original/') + '\''
        )
      "
    />
  </div>
</template>

<script>
export default {
  name: "MovieImage",

  props: {
    imageUrl: {
      type: String,
    },
    otherDivId: {
      type: String,
      required: true,
    },
    trailerDivId: {
      type: String,
      required: true,
    },
    shareDiv: {
      type: Boolean,
      required: true,
    },
    shareDivId: {
      type: String,
      required: true,
    },
    otherDivOffset: {
      type: Number,
      required: true,
    },
    trailerIconSize: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      store: this.$store.state,
      imageInitialHeight: 0,
      previousScroll: 0,
      isScrollingUp: false,
      heightThreshold: 0,
      widthFactor: 0,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    };
  },

  mounted() {
    this.imageInitialHeight = this.$refs.movieImageContainer.getBoundingClientRect().height;
    this.heightThreshold = 0.4 * window.innerHeight;
    this.widthFactor = 100 / this.imageInitialHeight;

    document.getElementById(this.otherDivId).style.paddingTop =
      this.imageInitialHeight + 50 + "px";

    document.getElementById(this.trailerDivId).style.marginTop =
      -(
        (this.imageInitialHeight - this.otherDivOffset) / 2 +
        this.otherDivOffset +
        this.trailerIconSize / 2
      ) + "px";

    window.addEventListener("scroll", this.onScroll);
  },

  destroyed() {
    window.removeEventListener("scroll", this.onScroll);
  },

  methods: {
    onScroll() {
      let scroll_position = window.scrollY;
      let scroll = Math.abs(scroll_position - this.previousScroll);
      let imageHeight = this.$refs.movieImageContainer.getBoundingClientRect()
        .height;
      let textPaddingTop = document
        .getElementById(this.otherDivId)
        .style.paddingTop.replace("px", "");

      if (!this.isScrollingUp) {
        if (this.$refs.movieImageContainer.style.position == "fixed") {
          if (imageHeight > this.heightThreshold) {
            this.$refs.movieImageContainer.style.height =
              Math.max(imageHeight - scroll, this.heightThreshold) + "px";

            this.$refs.movieImage.style.width =
              this.widthFactor *
                this.$refs.movieImageContainer.getBoundingClientRect().height +
              "%";

            document.getElementById(this.trailerDivId).style.marginTop =
              -(
                (this.$refs.movieImageContainer.style.height.replace("px", "") -
                  this.otherDivOffset) /
                  2 +
                this.otherDivOffset +
                this.trailerIconSize / 2
              ) + "px";

            this.updateScrollDirection();
          } else {
            document.getElementById(this.otherDivId).style.paddingTop = "0px";
            this.$refs.movieImageContainer.style.position = "relative";
            if (this.shareDiv) {
              document.getElementById(this.shareDivId).style.position =
                "absolute";
            }

            this.$refs.movieImageContainer.style.height =
              this.heightThreshold + "px";

            document.getElementById(this.trailerDivId).style.marginTop =
              -(
                (this.$refs.movieImageContainer.style.height.replace("px", "") -
                  this.otherDivOffset) /
                  2 +
                this.trailerIconSize / 2
              ) + "px";

            this.updateScrollDirection();
            window.scrollTo(0, 0);
          }
        } else {
          this.updateScrollDirection();
        }
      } else if (this.isScrollingUp) {
        if (this.$refs.movieImageContainer.style.position == "relative") {
          if (scroll_position == 0) {
            document.getElementById(this.otherDivId).style.paddingTop =
              imageHeight + 100 + 50 + "px";

            document.getElementById(this.trailerDivId).style.marginTop =
              -(
                (this.$refs.movieImageContainer.style.height.replace("px", "") -
                  this.otherDivOffset) /
                  2 +
                this.otherDivOffset +
                this.trailerIconSize / 2
              ) + "px";

            this.$refs.movieImageContainer.style.position = "fixed";
            if (this.shareDiv) {
              document.getElementById(this.shareDivId).style.position = "fixed";
            }

            this.updateScrollDirection();
            window.scrollTo(0, 100);
          } else {
            this.updateScrollDirection();
          }
        } else if (this.$refs.movieImageContainer.style.position == "fixed") {
          if (imageHeight < this.imageInitialHeight) {
            this.$refs.movieImageContainer.style.height =
              imageHeight + scroll + "px";
            this.$refs.movieImage.style.width =
              this.widthFactor *
                this.$refs.movieImageContainer.getBoundingClientRect().height +
              "%";

            document.getElementById(this.trailerDivId).style.marginTop =
              -(
                (this.$refs.movieImageContainer.style.height.replace("px", "") -
                  this.otherDivOffset) /
                  2 +
                this.otherDivOffset +
                this.trailerIconSize / 2
              ) + "px";

            if (textPaddingTop - 50 < this.imageInitialHeight) {
              document.getElementById(this.otherDivId).style.paddingTop =
                imageHeight + 100 + 50 + scroll + "px";

              this.updateScrollDirection();
              window.scrollTo(0, 100);
            } else {
              this.updateScrollDirection();
            }
          } else {
            this.updateScrollDirection();
          }
        }
      }
      this.previousScroll = window.scrollY;
    },
    updateScrollDirection() {
      if (window.scrollY <= this.previousScroll) {
        this.isScrollingUp = true;
      } else {
        this.isScrollingUp = false;
      }
    },
  },
};
</script>

<style scoped>
.portrait-image-container {
  width: 100%;
  height: 100%;
  background-color: #f8f8f8;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 50px;
  overflow: hidden;
  z-index: -1;
}
.portrait-content-image {
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  display: block;
  z-index: 2;
}
.portrait-background-image {
  position: absolute;
  width: 100%;
  margin-top: -100%;
  margin-left: -50%;
  filter: blur(5px);
  z-index: 1;
}
</style>