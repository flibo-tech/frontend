<template>
  <transition
    appear
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
  >
    <div>
      <div
        v-if="store.showSpeechInfo"
        class="speech-info-black-background"
        @click="store.showSpeechInfo = false"
      />

      <div
        class="speech-info-prompted-box"
        :style="is_mobile ? 'width: 85vw;' : ''"
        v-if="store.showSpeechInfo"
      >
        <p
          style="
            font-size: 18px;
            margin-bottom: 16px;
            align-self: flex-start;
            text-align: left;
          "
        >
          Find movies based on your mood. Some examples of what you can say -
        </p>

        <div class="speech-info-text">
          <p>"Best heartwarming movies on Netflix"</p>

          <p>"Visually stunning movies on my subscriptions"</p>

          <p>"Movies to watch after breakup"</p>

          <p>"Shows like G.O.T. on my apps"</p>

          <p>"Movies like Interstellar on my platforms"</p>
        </div>

        <Button
          buttonType="primary"
          :fontSize="16"
          padding="8px 24px"
          :text="
            store.is_webview && (store.releaseNo || 0) < 4
              ? 'Update App'
              : 'Try Now'
          "
          :capitalize="false"
          :loading="true"
          @clicked="handleSpeechInfoClick"
        />
      </div>
    </div>
  </transition>
</template>

<script>
import axios from "axios";
import { mixin as onClickOutside } from "vue-on-click-outside";
import Button from "./../atomic/Button";

export default {
  name: "SpeechInfo",
  mixins: [onClickOutside],
  components: {
    Button,
  },

  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
    };
  },
  methods: {
    handleSpeechInfoClick() {
      if (this.store.session_id && this.store.never_tapped_mic) {
        var self = this;
        axios
          .post(self.$store.state.api_host + "update_profile", {
            session_id: self.$store.state.session_id,
            never_tapped_mic: false,
          })
          .then(function (response) {
            if ([200].includes(response.status)) {
              self.mainActivity();
            }
          });
      } else {
        this.mainActivity();
      }
    },
    mainActivity() {
      this.store.never_tapped_mic = false;

      if (this.store.is_webview && (this.store.releaseNo || 0) < 4) {
        window.open(
          "https://play.google.com/store/apps/details?id=com.pivot.flibo"
        );
      } else {
        this.store.listen = true;
      }

      this.store.showSpeechInfo = false;
    },
  },
};
</script>

<style scoped>
.fadeIn {
  animation: fadeIn 0.05s;
}
.fadeOut {
  animation: fadeOut 0.01s;
}
.speech-info-black-background {
  position: fixed;
  width: 100%;
  height: 150%;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  top: 0%;
  left: 0%;
  z-index: 10000000;
}
.speech-info-prompted-box {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  background-color: #ffffff;
  border-radius: 7px;
  padding: 16px;
  z-index: 10000001;
}
.speech-info-text {
  text-align: left;
  margin-bottom: 16px;
  font-family: "Roboto", sans-serif;
}
.speech-info-text p {
  color: #666;
  /* line-height: 1.5; */
  margin-bottom: 8px;
  font-style: italic;
}
</style>
