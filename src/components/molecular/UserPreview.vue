<template>
  <div>
    <div
      class="user-preview-container"
      style="max-width: 800px"
      ref="userPreviewContainer"
    >
      <div class="sk-folding-cube" v-if="fetching">
        <div class="sk-cube1 sk-cube"></div>
        <div class="sk-cube2 sk-cube"></div>
        <div class="sk-cube4 sk-cube"></div>
        <div class="sk-cube3 sk-cube"></div>
      </div>

      <div v-else-if="profile_status != 'open'" style="font-size: 20px">
        {{ name.split(" ")[0] }}'s profile is private.
      </div>

      <div v-else style="width: 100%">
        <div class="user-preview-picture-box" @click="clickUser(id, name)">
          <div class="user-preview-picture-cropper">
            <img class="user-preview-picture" :src="picture" />
          </div>
        </div>

        <div class="user-preview-name" @click="clickUser(id, name)">
          {{ name }}
        </div>

        <div class="user-preview-watched-box">
          <div class="user-preview-content-watched">
            <div>Movies</div>
            <div style="font-size: 22px; font-weight: bold">
              {{ movies_watched ? movies_watched : 0 }}
            </div>
          </div>

          <div class="user-preview-content-watched">
            <div>Shows</div>
            <div style="font-size: 22px; font-weight: bold">
              {{ shows_watched ? shows_watched : 0 }}
            </div>
          </div>
        </div>

        <div v-if="ratings.length" style="margin-bottom: 16px">
          <div style="margin-bottom: 8px; font-weight: bold">
            Some of {{ name.split(" ")[0] }}'s ratings...
          </div>
          <div style="display: flex; overflow: scroll">
            <div
              v-for="(content, index) in ratings"
              :key="index"
              style="position: relative; margin-right: 16px"
            >
              <Button
                class="user-rating-icon"
                style="background-color: #fff"
                :icon="
                  content.rating == 3
                    ? 'love'
                    : content.rating == 2
                    ? 'thumbs_up'
                    : 'thumbs_down'
                "
                buttonType="iconOnly"
                :size="16"
                :state="true"
                :disabled="true"
              />

              <Poster
                :containerWidth="125"
                :contentId="content.content_id"
                :image="content.poster"
                :title="content.title"
                :showTrailer="false"
                :whereToWatch="content.where_to_watch"
                :userPlatforms="
                  store.user.id ? store.user.profile.platforms || [''] : ['']
                "
                :showName="true"
                :parent="parent"
                posterLocation="user_preview_ratings"
                v-on="$listeners"
              />
            </div>
          </div>
        </div>

        <div v-if="mutual_friends.length">
          <div style="margin-bottom: 8px; font-weight: bold">
            Mutual connections...
          </div>

          <ImageCard
            v-for="(user, index) in mutual_friends"
            :key="index"
            style="position: relative; margin-right: 16px"
            :name="user.user_name"
            :image="user.user_picture"
            :width="55"
            :height="70"
            :fontSize="12"
            :scale="true"
            v-on="$listeners"
            @clicked="clickUser(user.user_id, user.user_name)"
          />
        </div>
      </div>
    </div>
    <div class="modal-bg" @click="$emit('close-preview')"></div>
  </div>
</template>

<script>
import axios from "axios";
import Poster from "./Poster";
import ImageCard from "./../atomic/ImageCard";
import Button from "./../atomic/Button";

export default {
  name: "UserPreview",
  components: { Poster, Button, ImageCard },
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
      profile_status: null,
      picture: null,
      movies_watched: null,
      shows_watched: null,
      ratings: [],
      mutual_friends: [],
    };
  },
  created() {
    var self = this;

    axios
      .post(this.$store.state.api_host + "quick_view_profile", {
        session_id: this.$store.state.session_id,
        country:
          this.$store.state.user.profile.country ||
          this.$store.state.guest_country,
        guest_id: this.$store.state.guest_id,
        user_id: this.id,
        user_name: this.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase(),
      })
      .then((response) => {
        this.profile_status = response.data.profile_status;
        if (this.profile_status == "open") {
          this.picture = response.data.picture;
          this.movies_watched = response.data.movies_watched;
          this.shows_watched = response.data.shows_watched;
          this.ratings = response.data.ratings;
          this.mutual_friends = response.data.mutual_friends;
          this.$refs.userPreviewContainer.style.justifyContent = "flex-start";
          this.$refs.userPreviewContainer.style.alignItems = "flex-start";
        }
        this.fetching = false;
      })
      .catch((error) => {
        this.fetching = false;
        this.$refs.userPreviewContainer.style.justifyContent = "flex-start";
        this.$refs.userPreviewContainer.style.alignItems = "flex-start";
        console.log(error);
      });
  },
  methods: {
    clickUser(id, name) {
      this.$router.push(
        "/profile/" + id + "/" + name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
    },
  },
};
</script>

<style scoped>
.user-preview-container {
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  justify-items: center;
  min-height: 50vh;
  max-height: 60vh;
  overflow: scroll;
  padding: 16px;
  border-radius: 8px;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  background-color: white;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  color: black;
  width: 90vw;
  z-index: 100001;
  animation: 0.2s ease-out 0s 1 load;
  font-size: 14px;
  white-space: normal;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.6;
  letter-spacing: normal;
  color: #222222;
  font-family: "Roboto", sans-serif;
  text-align: left;
}
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
.user-preview-picture-box {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.user-preview-picture-cropper {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 50%;
}
.user-preview-picture {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.user-preview-name {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.user-preview-watched-box {
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 16px;
}
.user-preview-content-watched {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.user-rating-icon {
  position: absolute;
  right: -2px;
  top: -2px;
  z-index: 1;
  padding: 5px;
  border-radius: 50%;
}
</style>