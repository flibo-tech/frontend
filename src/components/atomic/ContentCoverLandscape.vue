<template>
  <div
    ref="movieImageContainer"
    style="position: fixed;"
    class="landscape-image-container"
  >
    <img
      ref="movieImage"
      class="landscape-content-image"
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
      required: true,
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
    };
  },

  mounted() {
    this.imageInitialHeight = this.$refs.movieImage.getBoundingClientRect().height;

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
      let imageWidth = this.$refs.movieImage.getBoundingClientRect().width;
      let imageHeight = this.$refs.movieImage.getBoundingClientRect().height;
      let textPaddingTop = document
        .getElementById(this.otherDivId)
        .style.paddingTop.replace("px", "");
      let screenWidth = 1.2 * screen.width;

      if (!this.isScrollingUp) {
        if (this.$refs.movieImageContainer.style.position == "fixed") {
          if (screenWidth < imageWidth) {
            this.$refs.movieImage.style.height =
              Math.max(
                imageHeight - scroll,
                (imageHeight / imageWidth) * screenWidth
              ) + "px";

            document.getElementById(this.trailerDivId).style.marginTop =
              -(
                (this.$refs.movieImage.style.height.replace("px", "") -
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

            this.$refs.movieImage.style.height =
              (imageHeight / imageWidth) * screenWidth + "px";

            document.getElementById(this.trailerDivId).style.marginTop =
              -(
                (this.$refs.movieImage.style.height.replace("px", "") -
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
                (this.$refs.movieImage.style.height.replace("px", "") -
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
            this.$refs.movieImage.style.height = imageHeight + scroll + "px";

            document.getElementById(this.trailerDivId).style.marginTop =
              -(
                (this.$refs.movieImage.style.height.replace("px", "") -
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
.landscape-image-container {
  left: 50%;
  transform: translateX(-50%);
  margin-top: 50px;
  overflow: hidden;
  z-index: -1;
  min-width: 100vw;
  background-color: #f8f8f8;
}
.landscape-content-image {
  position: relative;
  display: block;
  height: 80vh;
  left: 50%;
  transform: translateX(-50%);
}
</style>