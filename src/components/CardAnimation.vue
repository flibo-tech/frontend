<template>
  <div
    class="animation-container"
    :style="
      `--containerHeight:` +
        containerHeight +
        `px;--containerWidth:` +
        containerHeight / 1.5 +
        `px;`
    "
  >
    <div
      :style="
        `height:` +
          containerHeight +
          `px;width:100vw;position: fixed;left: 0;overflow:hidden;`
      "
    >
      <div
        class="image-container"
        :style="
          `--cardHeight:` +
            containerHeight / 1.25 +
            `px;--cardWidth:` +
            containerHeight / (1.25 * 1.5) +
            `px;--containerHeight:` +
            containerHeight +
            `px;`
        "
      ></div>
    </div>
    <div class="liked"></div>
    <div class="disliked"></div>
    <div class="loved"></div>
    <div class="haventSeen">HAVEN'T WATCHED</div>
  </div>
</template>

<script>
export default {
  props: {
    containerHeight: {
      type: Number,
      required: true
    }
  }
};
</script>

<style scoped>
.animation-container {
  position: relative;
  width: var(--containerWidth);
  height: var(--containerHeight);
}
.image-container {
  width: var(--cardWidth);
  height: var(--cardHeight);
  margin-left: calc(50% - var(--cardWidth) / 2);
  margin-top: calc(var(--containerHeight) / 2 - var(--cardHeight) / 2);
  background-image: url("../assets/images/poster.jpg");
  animation-name: tilt;
  animation-duration: 7s;
  animation-iteration-count: infinite;
  border-radius: 10px;
  background-size: cover;
}
@keyframes tilt {
  12.5% {
    transform: rotateZ(10deg) translate(100px, 0px);
  }
  25% {
    transform: translate(0px, 0px);
  }
  37.5% {
    transform: rotateZ(-10deg) translate(-100px, 0px);
  }
  50% {
    transform: translate(0px, 0px);
  }
  62.5% {
    transform: rotateZ(5deg) translate(0px, -100px);
  }
  75% {
    transform: translate(0px, 0px);
  }
  87.5% {
    transform: rotateZ(5deg) translate(0px, 100px);
  }
  100% {
    transform: translate(0px, 0px);
  }
}
@keyframes liked {
  12.5% {
    background-image: url("../images/thumbs_up_true.svg");
  }
  25% {
    background-image: url("../assets/icons/like-icon-white.svg");
  }
  100% {
    background-image: url("../assets/icons/like-icon-white.svg");
  }
}
@keyframes disliked {
  25% {
    background-image: url("../assets/icons/dislike-icon-white.svg");
  }
  37.5% {
    background-image: url("../images/thumbs_down_true.svg");
  }
  50% {
    background-image: url("../assets/icons/dislike-icon-white.svg");
  }
}
@keyframes loved {
  50% {
    background-image: url("../assets/icons/love-icon-white.svg");
  }
  62.5% {
    background-image: url("../images/love_true.svg");
  }
  75% {
    background-image: url("../assets/icons/love-icon-white.svg");
  }
}
@keyframes haventSeen {
  75% {
    background-color: rgba(0, 0, 0, 0.2);
  }
  87.5% {
    background-color: rgba(88, 90, 101, 1);
  }
  100% {
    background-color: rgba(0, 0, 0, 0.2);
  }
}
.liked {
  animation-name: liked;
  animation-duration: 7s;
  animation-iteration-count: infinite;
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translateX(-50%) translateY(-50%);
  border-radius: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  background-image: url("../assets/icons/like-icon-white.svg");
  background-repeat: no-repeat;
  background-position: 50% 50%;
  width: 48px;
  height: 48px;
  background-size: 25px;
}
.disliked {
  animation-name: disliked;
  animation-duration: 7s;
  animation-iteration-count: infinite;
  position: absolute;
  top: 50%;
  left: 0%;
  transform: translateX(-50%) translateY(-50%);
  border-radius: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  background-image: url("../assets/icons/dislike-icon-white.svg");
  background-repeat: no-repeat;
  background-position: 50% 50%;
  width: 48px;
  height: 48px;
  background-size: 25px;
}
.loved {
  animation-name: loved;
  animation-duration: 7s;
  animation-iteration-count: infinite;
  position: absolute;
  top: 0%;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  background-image: url("../assets/icons/love-icon-white.svg");
  background-repeat: no-repeat;
  background-position: 50% 50%;
  width: 48px;
  height: 48px;
  background-size: 25px;
}
.haventSeen {
  animation-name: haventSeen;
  animation-duration: 7s;
  animation-iteration-count: infinite;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-100%);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 28px;
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  width: 160px;
  height: 48px;
  background-size: 25px;
  color: white;
  text-align: center;
  font-family: "Roboto", sans-serif;
  font-weight: medium;
  font-size: 13px;
}
</style>