<template>
  <div>
    <div class="share-container">
      <flickity
        class="images"
        style="margin-bottom: 24px"
        v-if="images.length && !fetching"
        ref="flickity"
        :options="flickityOptions"
      >
        <div
          v-for="(item, index) in images"
          :key="index"
          class="prompt-slider-image"
        >
          <div class="prompt-img-wrapper">
            <img
              :src="item.replace('/original/', '/w500/')"
              onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/other/flibo-share.jpg';"
              alt="share-image"
            />
          </div>
        </div>
      </flickity>

      <Button
        v-if="
          ['profile', 'ratings'].includes(parent) &&
          profileId == store.user.id &&
          !fetching
        "
        class="share-profile-refresh-collage"
        buttonType="secondary"
        text="Try Another"
        @clicked="fetchProfileCollage"
      />

      <div class="share-prompt-fetching" v-if="fetching">
        <div class="sk-folding-cube">
          <div class="sk-cube1 sk-cube"></div>
          <div class="sk-cube2 sk-cube"></div>
          <div class="sk-cube4 sk-cube"></div>
          <div class="sk-cube3 sk-cube"></div>
        </div>

        <div
          v-if="
            ['profile', 'ratings'].includes(parent) &&
            profileId == store.user.id
          "
          class="share-profile-message"
        >
          Preparing collage for your taste...
          <br />
          {{
            store.user.profile.profile_status != "public"
              ? "Your profile will become public."
              : ""
          }}
        </div>
      </div>

      <div
        v-if="
          store.user.profile.profile_status != 'public' &&
          ['watchlist'].includes(this.parent) &&
          this.profileId == this.store.user.id
        "
        style="text-align: left; margin-bottom: 16px"
      >
        Your profile will become public.
      </div>

      <div class="external-share-box">
        <p>
          {{ url }}
        </p>

        <div style="display: flex">
          <Button
            style="margin-left: 16px"
            icon="copy"
            buttonType="iconOnly"
            :size="25"
            @clicked="copyUrl"
          />

          <Button
            style="margin-left: 16px"
            buttonType="primary"
            :capitalize="false"
            :text="store.is_webview ? 'Share to...' : 'Share'"
            @clicked="shareExternal"
          />
        </div>
      </div>

      <div v-if="parent == 'content'" class="share-prompt-create-post-box">
        <div style="display: flex; align-items: center">
          <div class="share-prompt-profile-cropper">
            <img
              class="share-prompt-pp"
              :src="store.user.picture || ''"
              onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
            />
          </div>

          <div style="margin-left: 8px">Create post</div>
        </div>

        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <Button
            buttonType="primary"
            :capitalize="false"
            text="Suggest"
            @clicked="
              store.session_id
                ? createPost('suggest')
                : (store.prompt_signup = true)
            "
          />

          <Button
            style="margin-left: 16px"
            buttonType="primary"
            :capitalize="false"
            text="Review"
            @clicked="
              store.session_id
                ? createPost('review')
                : (store.prompt_signup = true)
            "
          />
        </div>
      </div>

      <div class="share-prompt-direct-box">
        <div style="display: flex; align-items: center">
          <div class="share-prompt-profile-cropper">
            <img
              class="share-prompt-pp"
              src=""
              onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
            />
          </div>

          <div style="margin-left: 8px">Direct message</div>
        </div>

        <Button buttonType="secondary" text="Coming Soon" :disabled="true" />
      </div>
    </div>

    <div class="modal-bg" @click="$emit('close-share-prompt')"></div>
  </div>
</template>

<script>
import axios from "axios";
import Flickity from "vue-flickity";
import Button from "./Button";

export default {
  name: "SharePrompt",
  components: {
    Flickity,
    Button,
  },
  props: {
    parent: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
      default: null,
    },
    contentId: {
      type: Number,
      required: false,
      default: null,
    },
    contentTitle: {
      type: String,
      required: false,
      default: null,
    },
    profileId: {
      type: Number,
      required: false,
      default: null,
    },
    actionId: {
      type: Number,
      required: false,
      default: null,
    },
    reactionId: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
      contentImages: [],
      selectedImage: null,
      fetching: false,
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
    this.$emit("update-api-counter", {
      api: "share_prompt",
      content_id: this.contentId,
      profile_id: this.profileId,
      action_id: this.actionId,
      reaction_id: this.reactionId,
      url: this.url,
    });

    if (this.parent == "content") {
      this.fetchContentImages();
    } else if (
      ["profile", "ratings"].includes(this.parent) &&
      this.profileId == this.store.user.id
    ) {
      this.selectedImage =
        "https://flibo-images.s3-us-west-2.amazonaws.com/user_collages/" +
        this.profileId +
        ".png?" +
        new Date().getTime();
    } else {
      this.selectedImage = this.image
        ? this.image.replace("/original/", "/w500/")
        : this.image;
    }
  },
  computed: {
    images() {
      if (this.image != null) {
        return [this.image];
      } else if (this.parent == "content") {
        return this.contentImages;
      } else if (
        ["profile", "ratings"].includes(this.parent) &&
        this.profileId == this.store.user.id
      ) {
        return [this.selectedImage];
      } else {
        return [];
      }
    },
  },
  methods: {
    fetchContentImages() {
      var self = this;
      self.fetching = true;

      axios
        .post(self.$store.state.api_host + "fetch_content_images", {
          session_id: self.$store.state.session_id,
          content_ids: [self.contentId],
        })
        .then(function (response) {
          if (response.status == 200) {
            self.contentImages = response.data.images;
            self.selectedImage = self.contentImages[0].replace(
              "/original/",
              "/w500/"
            );
            self.$nextTick(function () {
              self.addClickEventListener();
            });
          } else if (response.status == 204) {
            self.contentImages = [];
          }
          self.fetching = false;
        })
        .catch(function (error) {
          self.fetching = false;
          console.log(error);
        });
    },
    fetchProfileCollage() {
      var self = this;
      self.fetching = true;

      axios
        .post(self.$store.state.api_host + "collage", {
          session_id: self.$store.state.session_id,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            self.selectedImage =
              response.data.collage + "?" + new Date().getTime();
          } else {
            // console.log(response.status);
          }
          self.fetching = false;
        })
        .catch(function (error) {
          self.fetching = false;
          // console.log(error);
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
        this.$refs.flickity.on("change", (index) => {
          this.selectedImage = this.images[index].replace(
            "/original/",
            "/w500/"
          );
        });
      }, 0);
    },
    copyUrl() {
      this.$emit("update-api-counter", {
        api: "share_prompt_copy_url",
        content_id: this.contentId,
        profile_id: this.profileId,
        action_id: this.actionId,
        reaction_id: this.reactionId,
        url: this.url,
      });

      if (
        ["profile", "ratings", "watchlist"].includes(this.parent) &&
        this.profileId == this.store.user.id
      ) {
        this.$emit("update-profile");
      }

      var dummy = document.createElement("input");
      document.body.appendChild(dummy);
      dummy.value = this.url;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);

      this.$emit("close-share-prompt");
    },
    shareExternal() {
      this.$emit("leave-feed");

      this.$emit("update-api-counter", {
        api: "share_prompt_external",
        content_id: this.contentId,
        profile_id: this.profileId,
        action_id: this.actionId,
        reaction_id: this.reactionId,
        url: this.url,
      });

      if (
        ["profile", "ratings", "watchlist"].includes(this.parent) &&
        this.profileId == this.store.user.id
      ) {
        this.$emit("update-profile");
      }

      if (this.store.is_webview) {
        Android.shareCollage(
          this.selectedImage
            ? this.selectedImage
            : "https://flibo-images.s3-us-west-2.amazonaws.com/other/flibo-share.jpg",
          this.url
        );
      } else {
        var quote = null;
        if (
          ["profile", "ratings"].includes(this.parent) &&
          this.profileId == this.store.user.id
        ) {
          quote =
            "Checkout my profile, hope you find something great to watch :) " +
            this.url;
        } else if (this.parent == "content") {
          quote = "Checkout " + this.contentTitle + " at " + this.url + ".";
        } else {
          quote = this.url;
        }

        window.open(
          "http://www.facebook.com/sharer.php?u=" +
            encodeURIComponent(
              this.selectedImage
                ? this.selectedImage
                : "https://flibo-images.s3-us-west-2.amazonaws.com/other/flibo-share.jpg"
            ) +
            "&quote=" +
            encodeURIComponent(quote) +
            "",
          "sharer",
          "toolbar=0,status=0,width=626,height=436"
        );
      }
      this.$emit("close-share-prompt");
    },
    createPost(type) {
      this.$emit("update-api-counter", {
        api: "share_prompt_" + type,
        content_id: this.contentId,
        profile_id: this.profileId,
        action_id: this.actionId,
        reaction_id: this.reactionId,
        url: this.url,
      });

      this.store.create.type = type;
      this.store.create.content = {
        subject_id: this.contentId,
        subject: this.contentTitle,
      };
      this.store.create.ids = [this.contentId];

      this.$router.push("/create");
    },
  },
};
</script>

<style scoped>
.share-container {
  position: fixed;
  padding: 16px;
  border-radius: 8px;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  background-color: white;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  width: 90vw;
  max-width: 500px;
  z-index: 100001;
  animation: 0.2s ease-out 0s 1 load;
  font-size: 14px;
  white-space: normal;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
  font-family: "Roboto", sans-serif;
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
.share-prompt-images-box {
  display: flex;
  align-items: center;
}
.prompt-slider-image {
  height: 250px;
  width: 75%;
  margin-right: 16px;
}

.prompt-img-wrapper {
  display: flex;
  width: 100%;
  max-height: 250px;
  justify-content: space-evenly;
  margin-top: 125px;
  transform: translateY(-50%);
}

.prompt-slider-image img {
  max-width: 100%;
  border-radius: 8px;
  max-height: inherit;
  filter: brightness(25%);
}

.prompt-slider-image.is-selected img {
  filter: brightness(100%);
}
.share-prompt-fetching {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  min-height: 250px;
  margin-bottom: 24px;
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
.external-share-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #d1cecec2;
}
.external-share-box p {
  font-size: 13px;
  text-align: left;
  word-break: break-all;
}
.share-prompt-profile-cropper {
  height: 35px;
  width: 35px;
  overflow: hidden;
  border-radius: 50%;
}
.share-prompt-pp {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.share-prompt-create-post-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}
.share-prompt-direct-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}
.share-profile-message {
  font-size: 18px;
  font-weight: bold;
  line-height: 1.5;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  color: #adaaaa;
  font-family: "Poiret One", cursive;
}
.share-profile-refresh-collage {
  position: absolute;
  left: 50%;
  transform: translate(-50%, calc(-100% - 24px));
}
</style>