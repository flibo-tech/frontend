<template>
  <div class="about-us-container">
    <br />
    <span
      class="about-us-flibo-logo"
      :style="is_mobile ? '' : 'width: 35%;margin-left: 32.5%;height: 150px;'"
    ></span>
    <br />

    <div class="about-us-text">
      <p>
        We are a small group of movie buffs who could not find an app to easily
        discover a good movie or TV series. So we decided to build one. We call
        it FLIBO, a film library.
      </p>
      <br />
      <p style="font-size: 0.9rem">
        Hangout with us at facebook to help us serve you better -
        <a
          href="https://www.facebook.com/groups/flibo.community/"
          target="_blank"
          style="font-weight: bold"
        >
          Join FLIBO at Facebook
        </a>
      </p>
    </div>

    <textarea
      @focus="showTmdb = false"
      @blur="showTmdb = true"
      placeholder="You can drop a message as well, just type in & hit that submit button..."
      class="input-message-box"
      id="user_message"
    >
    </textarea>
    <button
      class="submit-message"
      :style="
        submitting || submitted
          ? 'border: 2px solid rgb(51, 51, 51);background-color: rgb(255, 255, 255);color: rgb(51, 51, 51);padding: 5px;'
          : ''
      "
      @click="!submitting & !submitted ? submitMessage() : ''"
    >
      {{
        !submitting & !submitted
          ? "Submit"
          : submitting
          ? "Submitting..."
          : "We got it, Thanks!"
      }}
    </button>

    <div class="tmdb-container" v-if="showTmdb">
      <div class="tmdb-logo"></div>
      <span class="tmdb-disclaimer">
        This product uses the TMDb API but is not endorsed or certified by TMDb.
      </span>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "App",
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      submitting: false,
      submitted: false,
      store: this.$store.state,
      showTmdb: true,
    };
  },
  created() {
    this.$store.state.current_path = "/about-us";
  },
  methods: {
    submitMessage() {
      var self = this;
      self.submitting = true;
      var message = document.getElementById("user_message").value;
      if (message) {
        axios
          .post(self.$store.state.api_host + "submit_message", {
            session_id: self.$store.state.session_id,
            message: message,
          })
          .then(function (response) {
            if ([200].includes(response.status)) {
              self.submitted = true;
              self.submitting = false;
            } else {
              // console.log(response.status);
            }
          })
          .catch(function (error) {
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
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.about-us-container {
  position: relative;
  width: 100%;
  height: 95vh;
  top: 60px;
  padding: 0 16px;
}
.about-us-flibo-logo {
  position: relative;
  display: block;
  width: 50%;
  margin-left: 25%;
  height: 80px;
  background-image: url("./../images/flibo-logo-with-text-color.svg");
  background-size: 100%;
  background-position: center;
  background-repeat: no-repeat;
}
.about-us-text {
  width: 100%;
  margin-top: 5%;
  color: #8a8888;
  line-height: 1.175;
  text-align: left;
}
p {
  line-height: 1.5;
}
.input-message-box {
  margin-top: 5%;
  width: 100%;
  height: 15vh;
  border: none;
  background-color: #f7f7f7;
  border-radius: 5px;
  padding: 10px;
}
.submit-message {
  margin-top: 2%;
  border: none;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.36;
  letter-spacing: normal;
  padding: 7px;
  padding-left: 3%;
  padding-right: 3%;
  border-radius: 5px;
  color: #ffffff;
  background-color: #294ed2;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.tmdb-container {
  position: fixed;
  bottom: 65px;
  width: calc(100% - 32px);
  display: flex;
  align-items: center;
  text-align: left;
}
.tmdb-logo {
  position: relative;
  width: 100px;
  height: 43px;
  background-image: url("https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}
.tmdb-disclaimer {
  margin-left: 16px;
  font-size: 14px;
}
</style>
