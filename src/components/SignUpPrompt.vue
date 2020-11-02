<template>
  <transition
    appear
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
  >
    <div>
      <div
        v-if="store.prompt_signup"
        class="signup-black-background"
        @click="store.prompt_signup = false"
      />

      <div
        class="signup-prompted-box"
        :style="is_mobile ? 'top: 25vh;width: 85vw;' : ''"
        v-if="store.prompt_signup"
      >
        <img
          style="width: 100px"
          :src="require('./../images/flibo-logo-with-text-color.svg')"
          alt="flibo-logo"
        />

        <p style="font-size: 18px; margin-top: 16px; text-align: left">
          Personalize your streaming world with us
        </p>

        <div class="signup-google" @click="goToGoogleLogin">
          <div class="signup-google-button" />
          <p>Continue with Google</p>
        </div>

        <div class="signup-facebook" @click="goToFacebookLogin">
          <div class="signup-facebook-button" />
          <p style="color: #ffffff">Continue with Facebook</p>
        </div>

        <br />
        OR
        <br />
        <div
          class="signup-playstore"
          @click="
            goToApp(
              'https://play.google.com/store/apps/details?id=com.pivot.flibo'
            )
          "
        >
          <div class="signup-playstore-button" />
          <p>Get it on Google Play</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mixin as onClickOutside } from "vue-on-click-outside";

export default {
  name: "App",
  mixins: [onClickOutside],

  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
    };
  },
  methods: {
    goToGoogleLogin() {
      window.location = this.$store.state.login_host + "login/google";
    },
    goToFacebookLogin() {
      window.location = this.$store.state.login_host + "login/facebook";
    },
    goToApp(app_location) {
      window.open(app_location);
    },
  },
};
</script>

<style lang="scss">
@import "./../styles/mixins.scss";
.fadeIn {
  animation: fadeIn 0.05s;
}
.fadeOut {
  animation: fadeOut 0.01s;
}
.signup-black-background {
  position: fixed;
  width: 100%;
  height: 150%;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  top: 0%;
  left: 0%;
  z-index: 10000000;
}
.signup-prompted-box {
  position: fixed;
  background-color: #ffffff;
  top: 35vh;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 7px;
  padding: 20px;
  z-index: 10000001;
}
.signup-google {
  position: relative;
  display: flex;
  align-items: center;
  border: thin solid #888;
  border-radius: 5px;
  padding: 2px;
  margin-top: 20px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.signup-google-button {
  position: relative;
  height: 40px;
  width: 40px;
  margin-right: 10px;
  background-image: url("./../images/google-button.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
}
.signup-facebook {
  position: relative;
  display: flex;
  align-items: center;
  border: thin solid #3a559f;
  border-radius: 5px;
  padding: 9.5px 7px;
  margin-top: 10px;
  background-color: #3a559f;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.signup-facebook-button {
  position: relative;
  height: 25px;
  width: 25px;
  margin-right: 22px;
  transform: translateY(-2px);
  background-image: url("./../images/facebook.svg");
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
}
.signup-playstore {
  position: relative;
  display: flex;
  align-items: center;
  border: thin solid #888;
  border-radius: 5px;
  padding: 9.5px 15px;
  margin-top: 15px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.signup-playstore-button {
  position: relative;
  height: 25px;
  width: 25px;
  margin-right: 15px;
  background-image: url("./../images/google-play-icon.png");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
}
</style>
