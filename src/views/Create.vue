<template>
  <div>
    <div class="create-header" :style="is_mobile ? '' : 'width: 1000px;'">
      <div class="left-box">
        <div class="create-go-back-button" @click="goBack"></div>

        <div class="create-text-container">
          <div class="create-pp-cropper">
            <img
              v-bind:src="store.user.picture"
              onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
              class="create-profile-pp"
            />
          </div>

          <div class="create-text" @click="promptChangeType = true">
            <span style="text-transform: capitalize">
              {{ store.user.name.split(" ")[0] }}
            </span>

            is

            <span style="font-weight: bold">
              {{
                store.create.type == "request"
                  ? "looking for"
                  : store.create.type + "ing"
              }}
            </span>

            {{
              store.create.type == "request"
                ? "suggestions"
                : store.create.content != null
                ? (RegExp(/^1{1}.*$/).test(store.create.content.subject_id)
                    ? "movie "
                    : "show ") + store.create.content.subject
                : ""
            }}

            {{ store.create.type == "suggest" ? "to everyone" : "" }}
          </div>
        </div>
      </div>

      <div
        class="create-post-privacy"
        :style="
          'background-image: url(' + privacyOptionIcons[postPrivacy] + ')'
        "
        @click="promptChangePrivacy = true"
      ></div>
    </div>

    <div class="create-title-input" ref="titleInput">
      <textarea
        ref="titleBox"
        placeholder="An interesting title"
        maxlength="100"
        v-model="title"
        rows="1"
        @focus="showCounter = true"
        @blur="showCounter = false"
        @paste.prevent
      />
      <transition name="counter-animation">
        <CharacterCounter
          v-if="showCounter"
          :limit="100"
          :count="title ? title.length : 0"
          :radius="10"
          :width="3"
        />
      </transition>
    </div>

    <div class="create-box-below-title" ref="boxBelowTitle">
      <TextEditor class="create-text-editor" parent="post" />
      <ImageSlider
        class="create-image-slider"
        v-if="store.create.ids.length"
        :contentIds="store.create.ids"
      />
    </div>

    <Button
      class="create-post"
      icon="send"
      buttonType="iconOnly"
      :iconCircle="true"
      :size="40"
      margin="0px 0px 0px 7px"
      :loading="true"
      :disabled="title.length == 0 || store.create.processedContent.length == 0"
      @clicked="post"
    />

    <CreatePostPrompt
      v-if="promptChangeType"
      @close="promptChangeType = false"
    />

    <div
      :class="is_mobile ? 'update-post-privacy' : 'desktop-update-post-privacy'"
      v-if="promptChangePrivacy"
    >
      <div style="text-align: left; font-size: 16px; margin-bottom: 16px">
        Your post should be visible to...
      </div>

      <div
        v-for="(item, index) in privacyOptions"
        :key="index"
        class="post-privacy-checkbox"
        @click="
          !item.disabled
            ? ((postPrivacy = item.text), (promptChangePrivacy = false))
            : ''
        "
      >
        <input
          type="radio"
          :value="item.text"
          v-model="postPrivacy"
          class="create-checkbox-input"
          :disabled="item.disabled"
        />
        <span class="post-privacy-checkmark-abled" />
        <span
          class="post-privacy-icon"
          :style="
            item.disabled
              ? 'background-image: url(' +
                privacyOptionIcons[item.text] +
                '); filter: invert(0.9);'
              : 'background-image: url(' + privacyOptionIcons[item.text] + ');'
          "
        />
        <span
          class="post-privacy-checkmark-text"
          :style="item.disabled ? 'color: #dedada;' : ''"
          >{{ item.text }} {{ item.disabled ? "(0)" : "" }}</span
        >
      </div>
    </div>

    <div
      class="create-post-bg"
      v-if="promptChangePrivacy || promptChangeType"
      @click="(promptChangePrivacy = false), (promptChangeType = false)"
    ></div>
  </div>
</template>

<script>
import axios from "axios";
import CreatePostPrompt from "./../components/molecular/CreatePostPrompt";
import CharacterCounter from "./../components/atomic/CharacterCounter";
import ImageSlider from "./../components/atomic/ImageSlider";
import Button from "./../components/atomic/Button";
import TextEditor from "./../components/molecular/TextEditor";

export default {
  name: "Create",
  components: {
    CreatePostPrompt,
    CharacterCounter,
    TextEditor,
    ImageSlider,
    Button,
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
      privacyOptionIcons: {
        public: require("./../images/public.png"),
        connections: require("./../images/friends.png"),
        private: require("./../images/private.png"),
      },
      postPrivacy: "public",
      promptChangePrivacy: false,
      promptChangeType: false,
      title: "",
      showCounter: false,
    };
  },
  created() {
    this.store.create.processedContent = "";
    this.store.create.spoiler = false;
    this.store.create.image = null;
  },
  mounted() {
    this.resizeContainer();
  },
  computed: {
    privacyOptions() {
      if (
        this.store.friends_page.friends.filter((a) => a.friend_type == "friend")
          .length
      ) {
        return [
          {
            text: "public",
            disabled: false,
          },
          {
            text: "connections",
            disabled: false,
          },
        ];
      } else {
        return [
          {
            text: "public",
            disabled: false,
          },
          {
            text: "connections",
            disabled: true,
          },
        ];
      }
    },
  },
  watch: {
    title: function (val) {
      this.autoGrow(this.$refs.titleBox);
    },
  },
  methods: {
    goBack() {
      window.history.back();
    },
    autoGrow(element) {
      element.style.height = "auto";
      element.style.height = element.scrollHeight + "px";
      this.resizeContainer();
    },
    resizeContainer() {
      const spaceUnavailable = this.$refs.titleInput.getBoundingClientRect()
        .bottom;
      this.$refs.boxBelowTitle.style.minHeight =
        "calc(100vh - " + spaceUnavailable + "px - 24px)";
    },
    post() {
      var self = this;
      axios
        .post(this.$store.state.api_host + "save_action", {
          session_id: this.$store.state.session_id,
          action_type: this.store.create.type,
          text: this.store.create.processedContent,
          title: this.title,
          contents: null,
          privacy: this.postPrivacy,
          image:
            this.store.create.includeImage && this.store.create.image
              ? this.store.create.image.replace("/original/", "/w500/")
              : null,
          content_id: this.store.create.content
            ? this.store.create.content.subject_id
            : null,
          spoiler: this.store.create.spoiler,
        })
        .then(function (response) {
          if (response.status == 200) {
            self.$router.push(response.data.path);
          }
        })
        .catch(function (error) {
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
  },
};
</script>

<style scoped>
.create-header {
  display: flex;
  width: 100vw;
  padding: 24px 16px;
  background-color: #f0f0f0;
  align-items: center;
  justify-content: space-between;
}
.create-header .left-box {
  display: flex;
  align-items: center;
  margin-right: 16px;
}
.create-go-back-button {
  height: 22px;
  width: 22px;
  min-width: 22px;
  margin-right: 12px;
  background-image: url("./../images/back-button.svg");
  background-size: 100% 100%;
  border: none;
  outline: 0px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.create-text-container {
  display: flex;
  align-items: center;
}
.create-pp-cropper {
  width: 35px;
  min-width: 35px;
  height: 35px;
  margin-right: 8px;
  overflow: hidden;
  border-radius: 50%;
  background-color: #ffffff;
}
.create-profile-pp {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.create-text {
  font-size: 14px;
  white-space: normal;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
  font-family: "Roboto", sans-serif;
  text-align: left;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.create-post-privacy {
  width: 20px;
  min-width: 20px;
  height: 20px;
  margin-right: 5px;
  position: relative;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.create-post-bg {
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
.update-post-privacy {
  position: fixed;
  width: 72%;
  left: 14%;
  top: 40vh;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  animation: 0.2s ease-out 0s 1 load;
  z-index: 100001;
}
.desktop-update-post-privacy {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  top: 40vh;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  animation: 0.2s ease-out 0s 1 load;
  z-index: 100001;
}
.post-privacy-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  text-align: left;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.post-privacy-checkmark-abled {
  position: absolute;
  height: 18px;
  width: 18px;
}
.post-privacy-checkbox input:checked ~ .post-privacy-checkmark-abled {
  background-color: #ffffff;
  background-image: url("./../images/checked.svg");
}
.create-checkbox-input {
  position: relative;
  opacity: 0;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.post-privacy-checkmark-text {
  font-size: 16px;
  text-transform: capitalize;
  margin-left: 8px;
}
.post-privacy-icon {
  margin-left: 24px;
  height: 22px;
  width: 22px;
  background-size: 100% 100%;
  border: none;
  outline: 0px;
}
.create-title-input {
  display: flex;
  align-items: flex-start;
  width: calc(100% - 48px);
  min-height: 32px;
  margin-left: 24px;
  margin-top: 32px;
  border-bottom: 1px solid #9b9b9b8f;
}
.create-title-input textarea {
  width: 100%;
  margin-right: 8px;
  font-size: 18px;
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #222222;
  font-family: "Roboto", sans-serif;
  text-align: left;
  border: none;
  outline: none;
  resize: none;
}
.create-title-input textarea::placeholder {
  color: #9b9b9b;
  font-weight: normal;
}
.counter-animation-enter-active,
.counter-animation-leave-active {
  transition: opacity 0.2s ease-out;
}
.counter-animation-enter,
.counter-animation-leave-to {
  opacity: 0;
}
.create-box-below-title {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: 24px;
}
.create-text-editor {
  width: calc(100% - 48px);
  margin-left: 24px;
}
.create-image-slider {
  padding: 24px 0px 48px;
  min-height: calc(30vh + 72px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.create-post {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2;
}
</style>