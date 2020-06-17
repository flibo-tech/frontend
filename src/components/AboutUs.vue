<template>
  <div class="about-us-container">
      <br>
      <span class="about-us-flibo-logo"
            :style="(is_mobile) ? '' : 'width: 35%;margin-left: 32.5%;height: 100px;'"></span>
      <br>

      <div class="about-us-text">
          <p>
          We are a small group of movie buffs who could not find an app to easily
          discover a good movie or TV series. So
          we decided to build one. We call it FLIBO, a film library.
          </p>
          <br>
          <p style="font-size:0.9rem;">
            Hangout with us at facebook to help us serve you better -
            <a href="https://www.facebook.com/groups/flibo.community/"
               target="_blank"
               style="font-weight: bold;">
                Join FLIBO Community
            </a>
          </p>
      </div>

      <textarea placeholder="You can drop a message as well, just type in & hit that submit button..."
                class="input-message-box"
                id="user_message">
      </textarea>
      <button class="submit-message"
              @click="(!submitting & !submitted) ? submitMessage() : ''"
              :style="(submitting | submitted) ? 'border: 2px solid rgb(51, 51, 51);background-color: rgb(255, 255, 255);color: rgb(51, 51, 51);padding: 5px;' : ''">
          {{(!submitting & !submitted) ? 'Submit' : (submitting ? 'Submitting...' : 'We got it, Thanks!')}}
      </button>

      <!-- <div class="tmdb-container">
        <div class="tmdb-logo">
        </div>
        <span class="tmdb-disclaimer">
            This product uses the TMDb API but is not endorsed or certified by TMDb.
        </span>
      </div> -->
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "App",
  data() {
    return {
        is_mobile: window.screen.height>window.screen.width,
        submitting: false,
        submitted: false,
        store: this.$store.state
    };
  },
  created() {
      this.$store.state.current_path = '/about-us';
  },
  methods: {
    submitMessage() {
        var self = this;
        self.submitting = true;
        var message = document.getElementById('user_message').value;
        if (message) {
            axios
                .post(self.$store.state.api_host + 'submit_message', {
                    session_id: self.$store.state.session_id,
                    message: message
                })
                .then(function(response) {
                    if ([200].includes(response.status)) {
                        self.submitted = true;
                        self.submitting = false;
                    } else {
                    // console.log(response.status);
                    }
                })
                .catch(function(error) {
                    // console.log(error);
                    if ([401, 419].includes(error.response.status)) {
                        window.location = self.$store.state.login_host+'logout?session_id='+self.$store.state.session_id;
                        self.$store.state.session_id = null;
                        self.$emit('logging-out');
                    } else {
                        // console.log(error.response.status);
                        }
                });
        }
    }
  }
};
</script>

<style lang="scss" scoped>
.about-us-container {
    position: relative;
    width: 95%;
    height: 95vh;
    top: 60px;
    left: 2.5%;
}
.about-us-flibo-logo {
    position: relative;
    display: block;
    width: 50%;
    margin-left: 25%;
    height: 80px;
    background-image: url('./../images/flibo-logo-dark.svg');
    background-size: 100%;
    background-position: center;
    background-repeat: no-repeat;
}
.about-us-text {
    width: 95%;
    margin-left: 2.5%;
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
    width: 95%;
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
    -webkit-tap-highlight-color: rgba(0,0,0,0);
	  -webkit-tap-highlight-color: transparent;
}
.tmdb-container {
    width: 95%;
    position: absolute;
    top: 70vh;
    text-align: left;
    bottom: 9%;
}
.tmdb-logo {
    position: relative;
    left: 4.875%;
    width: 25vw;
    height: 10vw;
    background-image: url("https://www.themoviedb.org/assets/2/v4/logos/powered-by-rectangle-blue-61ce76f69ce1e4f68a6031d975df16cc184d5f04fa7f9f58ae6412646f2481c1.svg");
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
}
.tmdb-disclaimer {
    position: absolute;
    margin-left: calc(4.875% + 25vw + 5px);
    margin-top: calc(-10vw + 5px);
    font-size: 3vw;
    width: 65vw;
}
</style>
