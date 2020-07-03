<template>
  <div :class="checkRating(rating, active)">
    <!-- Text will be shown instead of SVG icon for Haven't Seen button -->
    <p v-if="rating === 'haventSeen'">HAVEN'T WATCHED</p>
  </div>
</template>

<script>
export default {
  name: "RatingLabel",
  props: {
    rating: {
      type: String
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    // To check which css class will be binded with div
    //rating and active are props given by SwipeTest.vue
    checkRating(rating, active) {
      let ratingClass = "";
      if (rating === "liked") {
        if (active === true) {
          ratingClass = "liked-swiped";
        } else {
          ratingClass = "liked";
        }
      } else if (rating === "disliked") {
        if (active === true) {
          ratingClass = "disliked-swiped";
        } else {
          ratingClass = "disliked";
        }
      }
      if (rating === "loved") {
        if (active === true) {
          ratingClass = "loved-swiped";
        } else {
          ratingClass = "loved";
        }
      }
      if (rating === "haventSeen") {
        if (active === true) {
          ratingClass = "haventSeen-swiped";
        } else {
          ratingClass = "haventSeen";
        }
      }
      return ratingClass;
    }
  }
};
</script>

<style scoped>
/* Style for Haven't seen if v-if for div is true */
div p {
  color: white;
  text-align: center;
  font-family: "Roboto", sans-serif;
  font-weight: medium;
  font-size: 13px;
}
div {
  transition-property: background-color, border-radius;
  transition-timing-function: linear;
  transition-duration: 0s;
}
/* Liked + Liked-active */
.liked {
  border-radius: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  background-image: url("../../assets/icons/like-icon-white.svg");
  background-repeat: no-repeat;
  background-position: 50% 50%;
  width: 56px;
  height: 56px;
  background-size: 30px;
}
.liked-swiped {
  border-radius: 100%;
  background-color: rgba(255, 255, 255, 0.5);
  background-image: url("../../images/thumbs_up_true.svg");
  background-repeat: no-repeat;
  background-position: 50% 50%;
  width: 56px;
  height: 56px;
  background-size: 33px;
}
/* Disliked + Disliked active */
.disliked {
  border-radius: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  background-image: url("../../assets/icons/dislike-icon-white.svg");
  background-repeat: no-repeat;
  background-position: 50% 50%;
  width: 56px;
  height: 56px;
  background-size: 30px;
}
.disliked-swiped {
  border-radius: 100%;
  background-color: rgba(255, 255, 255, 0.5);
  background-image: url("../../images/thumbs_down_true.svg");
  background-repeat: no-repeat;
  background-position: 50% 50%;
  width: 56px;
  height: 56px;
  background-size: 33px;
}
/* Loved + Loved active*/
.loved {
  border-radius: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  background-image: url("../../assets/icons/love-icon-white.svg");
  background-repeat: no-repeat;
  background-position: 50% 50%;
  width: 56px;
  height: 56px;
  background-size: 30px;
}
.loved-swiped {
  border-radius: 100%;
  background-color: rgba(255, 255, 255, 0.5);
  background-image: url("../../images/love_true.svg");
  background-repeat: no-repeat;
  background-position: 50% 50%;
  width: 56px;
  height: 56px;
  background-size: 33px;
}
/* Haven't Seen + Haven't Seen active */
.haventSeen {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 28px;
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  width: 160px;
  height: 56px;
  background-size: 30px;
}
.haventSeen p {
  text-align: center;
}
.haventSeen-swiped {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 28px;
  background-color: rgba(88, 90, 101, 1);
  width: 160px;
  height: 56px;
  background-size: 30px 30px;
}
</style>
