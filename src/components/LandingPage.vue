<template>
  <div :style="is_mobile ? 'width:100%;' : 'width: 100%;overflow-x: hidden;'">
    <div
      :class="is_mobile ? 'landing-page-cover' : 'desktop-landing-page-cover'"
    >
      <img
        src="https://flibo-images.s3-us-west-2.amazonaws.com/covers/login-cover.jpg"
        :style="is_mobile ? 'height:50vh; width:100%;' : ''"
      />
    </div>

    <div
      :class="is_mobile ? 'landing-page-logo' : 'desktop-landing-page-logo'"
    />

    <div
      :class="is_mobile ? 'google-login-button' : 'desktop-google-login-button'"
      @click="goToGoogleLogin"
    >
      <div
        class="google-button"
        :style="is_mobile ? 'height: 30px;width: 30px;margin-right: 14px;' : ''"
      />
      <p
        :style="
          is_mobile
            ? `font-family: 'Roboto', sans-serif;font-size: 13px;`
            : `font-family: 'Roboto', sans-serif;font-size: 15px;`
        "
      >
        Continue with Google
      </p>
    </div>

    <div
      :class="
        is_mobile ? 'facebook-login-button' : 'desktop-facebook-login-button'
      "
      @click="goToFacebookLogin"
    >
      <div
        class="facebook-button"
        :style="is_mobile ? '' : 'height: 25px;width: 25px;margin-right: 23px;'"
      />
      <p
        :style="
          is_mobile
            ? `font-family: 'Roboto', sans-serif;font-size: 13px;color: #ffffff;transform: translateX(3px);`
            : `font-family: 'Roboto', sans-serif;font-size: 15px;color: #ffffff;transform: translateX(3px);`
        "
      >
        Continue with Facebook
      </p>
    </div>

    <div
      :class="
        is_mobile ? 'landing-page-section-1' : 'desktop-landing-page-section-1'
      "
    >
      <img
        src="https://flibo-images.s3-us-west-2.amazonaws.com/other/flibo-screenshot-rate-movies.png"
        :class="is_mobile ? 'flibo-screenshot' : 'desktop-flibo-screenshot'"
      />
      <div :class="is_mobile ? 'tagline' : 'desktop-tagline'">
        <h1>DISCOVER</h1>
        <p>MOVIES & TV SERIES</p>
      </div>
    </div>

    <div
      :class="
        is_mobile ? 'landing-page-section-2' : 'desktop-landing-page-section-2'
      "
    >
      <img
        src="https://flibo-images.s3-us-west-2.amazonaws.com/other/dude-watching-in-chair.png"
        :class="
          is_mobile
            ? 'dude-watching-in-chair'
            : 'desktop-dude-watching-in-chair'
        "
      />
      <div :class="is_mobile ? 'issue-text-1' : 'desktop-issue-text-1'">
        You have Netflix or Prime subscription but
        <span style="font-weight: bold"> can't decide </span>
        what to watch?
      </div>
    </div>

    <div
      :class="
        is_mobile ? 'landing-page-section-3' : 'desktop-landing-page-section-3'
      "
    >
      <img
        src="https://flibo-images.s3-us-west-2.amazonaws.com/other/couple-watching-in-sofa.png"
        :class="
          is_mobile
            ? 'couple-watching-in-sofa'
            : 'desktop-couple-watching-in-sofa'
        "
      />
      <div :class="is_mobile ? 'issue-text-2' : 'desktop-issue-text-2'">
        Have you ever wondered what your friends are watching?
      </div>
    </div>

    <div
      :class="is_mobile ? 'landing-page-footer' : 'desktop-landing-page-footer'"
    >
      <div :class="is_mobile ? 'footer-text' : 'desktop-footer-text'">
        <h1>TRY FLIBO</h1>

        <p>
          Rate Movies & TV Series to experience personalized discovery across
        </p>

        <div class="landing-page-platforms-container">
          <img
            class="landing-page-platform"
            src="https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/netflix.jpg"
          />
          <img
            class="landing-page-platform"
            src="https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/amazon_prime_video.jpg"
          />
          <img
            class="landing-page-platform"
            src="https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/hotstar.jpg"
          />
          <img
            class="landing-page-platform"
            src="https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/jio_cinema.jpg"
          />
        </div>

        <p>& many more platforms</p>

        <iframe
          src="https://d2txrzi4o7g0yi.cloudfront.net/"
          frameborder="0"
          class="landing-page-swipe-animation"
        />
      </div>
    </div>

    <div class="app-store-presence">
      <div
        :class="is_mobile ? 'google-play' : 'landing-page-desktop-google-play'"
        :style="is_mobile ? 'position: relative;' : ''"
        @click="
          goToApp(
            'https://play.google.com/store/apps/details?id=com.pivot.flibo'
          )
        "
      >
        <div
          :class="
            is_mobile
              ? 'landing-page-google-play-icon'
              : 'landing-page-desktop-google-play-icon'
          "
        />
        <span> Google Play </span>
      </div>

      <div
        :class="is_mobile ? 'ios' : 'landing-page-desktop-ios'"
        :style="is_mobile ? 'position: relative;' : ''"
        @click="goToApp('/')"
      >
        <div
          :class="
            is_mobile
              ? 'landing-page-ios-icon'
              : 'landing-page-desktop-ios-icon'
          "
        />
        <span> iOS (M-Site) </span>
      </div>
    </div>

    <div style="background-color: #f2f2f2; text-align: center; padding: 10px">
      <a
        href="/privacy-policy"
        style="font-family: 'Open Sans', sans-serif; color: #333"
      >
        Privacy Policy
      </a>
    </div>

    <div class="contact">
      <p class="contact-name">LIGHT YEAR TECHNOLOGIES PRIVATE LIMITED</p>
      <p class="contact-street">A-4, T/F (Third Floor), R/P Kh No - 170/2</p>
      <p class="contact-place">New Delhi 110044</p>
      <p class="contact-place">India</p>
      <ul class="contact-details">
        <li class="telephone">099114 79064</li>
        <li class="email">bhaskar.choudhary@flibo.ai</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  props: {
    is_mobile: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    goToGoogleLogin() {
      window.location = this.$store.state.login_host + "login/google";
    },
    goToFacebookLogin() {
      window.location = this.$store.state.login_host + "login/facebook";
    },
    goToApp(app_location) {
      if (app_location == "/") {
        window.scrollTo(0, 0);
      } else {
        window.open(app_location);
      }
    },
  },
};
</script>

<style lang="scss">
@import "./../styles/mixins.scss";

.landing-page-cover {
  position: relative;
  top: 0px;
  width: 100%;
  height: 40vh;
  overflow: hidden;
}
.landing-page-logo {
  position: absolute;
  width: 80px;
  height: 80px;
  top: 3px;
  left: 10px;
  background-image: url("./../images/flibo-logo-with-text-white.svg");
  background-position: center;
  background-size: 100%;
  background-repeat: no-repeat;
}
.google-login-button {
  cursor: pointer;
  right: 10px;
  top: 25px;
  background-color: #ffffff;
  position: absolute;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  border: thin solid #888;
  border-radius: 5px;
  padding: 2px 10px 2px 2px;
  z-index: 1000;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.facebook-login-button {
  cursor: pointer;
  right: 10px;
  top: 76px;
  background-color: #3a559f;
  position: absolute;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  border: thin solid #3a559f;
  border-radius: 5px;
  padding: 7px 10px 7px 0px;
  z-index: 1000;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.landing-page-section-1 {
  position: relative;
  width: 100%;
  margin-top: -150px;
  text-align: left;
}
.flibo-screenshot {
  position: relative;
  width: 40%;
  margin-left: 8%;
}
.tagline {
  position: relative;
  float: right;
  right: 0px;
  margin-top: 15%;
  width: 52%;
  font-family: "Open Sans Condensed", sans-serif;
  color: #ffffff;
}
.tagline h1 {
  font-weight: 700;
  font-style: normal;
  font-stretch: normal;
  line-height: 0.8;
  font-size: calc(25px + 3vw);
  letter-spacing: normal;
  position: relative;
}
.tagline p {
  font-weight: 300;
  font-style: normal;
  font-stretch: normal;
  line-height: 0.8;
  font-size: calc(11px + 2vw);
  margin-top: 3%;
  letter-spacing: normal;
}
.landing-page-section-2 {
  position: relative;
  width: 100%;
}
.dude-watching-in-chair {
  position: relative;
  width: 30%;
  margin-left: 10%;
}
.issue-text-1 {
  position: absolute;
  width: 55%;
  padding: 5%;
  margin-left: 43%;
  margin-top: -37%;
  font-family: "Open Sans", sans-serif;
}
.landing-page-section-3 {
  position: relative;
  width: 100%;
  margin-top: 10%;
}
.couple-watching-in-sofa {
  position: relative;
  width: 50%;
  margin-left: 50%;
}
.issue-text-2 {
  position: absolute;
  width: 50%;
  padding: 5%;
  margin-top: -31%;
  font-family: "Open Sans", sans-serif;
}
.landing-page-footer {
  background-color: #f8f8f8;
  text-align: center;
  padding: 10% 10% 0% 10%;
  margin-top: 10%;
  overflow: hidden;
}
.footer-text {
  font-family: "Open Sans", sans-serif;
  font-size: 13px;
}
.footer-text h1 {
  font-weight: 700;
  font-style: normal;
  font-stretch: normal;
  line-height: 0.8;
  font-size: 45px;
  letter-spacing: normal;
}
.footer-text p {
  margin-top: 3%;
}
.waiting-list-input {
  margin-top: 10%;
  width: 100%;
  height: 30px;
  border-radius: 5px;
  border: 1px solid #f1f1f1;
  padding: 10px;
}
.invite-me-button {
  position: absolute;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  margin-left: 55%;
  margin-top: -30px;
  text-align: center;
  font-size: 14px;
  width: 25%;
  height: 30px;
  color: #f3eded;
  background-color: #3e64ed;
  border-radius: 0px 5px 5px 0px;
  padding: 5px;
  font-family: "Open Sans", sans-serif;
}
.landing-page-footer .invite-message {
  color: #9a9a9a;
  font-size: 10px;
  margin-top: 2%;
  font-family: "Open Sans", sans-serif;
}
.desktop-landing-page-cover {
  position: relative;
  margin-top: 0%;
  width: 100%;
  height: 600px;
  overflow: hidden;
}
.desktop-landing-page-logo {
  position: absolute;
  width: 150px;
  height: 150px;
  top: -17px;
  left: 20px;
  background-image: url("./../images/flibo-logo-with-text-white.svg");
  background-position: center;
  background-size: 100%;
  background-repeat: no-repeat;
}
.desktop-google-login-button {
  cursor: pointer;
  right: 20px;
  top: 35px;
  background-color: #ffffff;
  position: absolute;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  border: thin solid #888;
  border-radius: 5px;
  padding: 2px 30px 2px 2px;
  z-index: 1000;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.google-button {
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
.desktop-facebook-login-button {
  cursor: pointer;
  right: 20px;
  top: 100px;
  background-color: #3a559f;
  position: absolute;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  border: thin solid #3a559f;
  border-radius: 5px;
  padding: 9.5px 14px 9.5px 2px;
  z-index: 1000;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.facebook-button {
  position: relative;
  height: 20px;
  width: 20px;
  margin-right: 10px;
  transform: translateX(5px) translateY(-2px);
  background-image: url("./../images/facebook.svg");
  border: thin solid #3a559f;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
}
.desktop-landing-page-section-1 {
  position: relative;
  display: flex;
  align-items: center;
  width: 50%;
  margin-left: 20%;
  margin-top: -400px;
}
.desktop-flibo-screenshot {
  position: relative;
  width: 330px;
}
.desktop-tagline {
  position: relative;
  transform: translateX(25%) translateY(-50%);
  font-family: "Open Sans Condensed", sans-serif;
  color: #ffffff;
}
.desktop-tagline h1 {
  font-weight: 700;
  font-style: normal;
  font-stretch: normal;
  line-height: 0.8;
  font-size: 100px;
  letter-spacing: normal;
}
.desktop-tagline p {
  font-weight: 300;
  font-style: normal;
  font-stretch: normal;
  line-height: 0.8;
  font-size: 51px;
  margin-top: 20px;
  letter-spacing: normal;
}
.desktop-landing-page-section-2 {
  position: relative;
  display: flex;
  width: 50%;
  margin-top: 45px;
  margin-left: 25%;
  align-items: center;
}
.desktop-dude-watching-in-chair {
  position: relative;
  width: 200px;
  max-width: 350px;
}
.desktop-issue-text-1 {
  position: relative;
  width: calc(100% - 200px);
  padding-left: 100px;
  font-size: 30px;
  font-family: "Open Sans", sans-serif;
}
.desktop-landing-page-section-3 {
  position: relative;
  width: 50%;
  margin-left: 25%;
  margin-top: 100px;
  display: flex;
  align-items: center;
}
.desktop-couple-watching-in-sofa {
  position: relative;
  margin-left: 50%;
  width: 335px;
}
.desktop-issue-text-2 {
  position: relative;
  width: calc(100% - 335px);
  padding-right: 50px;
  margin-left: -100%;
  font-size: 30px;
  font-family: "Open Sans", sans-serif;
}
.desktop-landing-page-footer {
  background-color: #f8f8f8;
  text-align: center;
  padding: 75px 75px 50px 75px;
  margin-top: 65px;
}
.desktop-footer-text {
  font-family: "Open Sans", sans-serif;
}
.desktop-footer-text h1 {
  font-weight: 700;
  font-style: normal;
  font-stretch: normal;
  line-height: 0.8;
  font-size: 75px;
  letter-spacing: normal;
}
.desktop-footer-text p {
  margin-top: 20px;
  font-size: 25px;
}
.desktop-waiting-list-input {
  position: relative;
  margin-top: 60px;
  font-size: 17px;
  width: 40%;
  height: 50px;
  border-radius: 5px;
  border: 1px solid #f1f1f1;
  padding: 10px;
}
.desktop-invite-me-button {
  position: absolute;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  margin-left: calc(53% + 15px);
  margin-top: -50px;
  text-align: center;
  font-size: calc(11px + 0.5vw);
  width: 10%;
  height: 50px;
  color: #f3eded;
  background-color: #3e64ed;
  border-radius: 0px 5px 5px 0px;
  padding: 11px;
  font-family: "Open Sans", sans-serif;
}
.desktop-landing-page-footer .desktop-invite-message {
  color: #9a9a9a;
  font-size: 14px;
  margin-top: 15px;
  font-family: "Open Sans", sans-serif;
}
.landing-page-platforms-container {
  display: inline-flex;
  margin-top: 20px;
}
.landing-page-platform {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 50px;
  border-radius: 4px;
  margin-right: 10px;
}
.landing-page-swipe-animation {
  width: 150%;
  height: 450px;
  margin-top: -25px;
  margin-left: -25%;
  transform: scale(0.85);
  pointer-events: none;
}
.google-play {
  position: fixed;
  width: 50%;
  height: 55px;
  left: 0%;
  text-align: initial;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.landing-page-desktop-google-play {
  position: relative;
  width: 25%;
  margin-left: 25%;
  height: 55px;
  text-align: initial;
  cursor: pointer;
  display: flex;
  align-items: center;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.landing-page-google-play-icon {
  position: absolute;
  width: 40px;
  height: 40px;
  margin-left: 15%;
  margin-top: 7px;
  background-image: url("./../images/google-play-icon.png");
  background-color: #f2f2f2;
  background-size: 100% 100%;
  border: none;
  outline: 0;
}
.landing-page-desktop-google-play-icon {
  position: relative;
  width: 40px;
  height: 40px;
  background-image: url("./../images/google-play-icon.png");
  background-color: #f2f2f2;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  margin-left: 37%;
}
.google-play span {
  position: absolute;
  margin-top: 9px;
  margin-left: calc(15% + 46px);
  transform: translateY(50%);
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
  font-family: "Open Sans", sans-serif;
}
.landing-page-desktop-google-play span {
  position: relative;
  margin-left: 10px;
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
  font-family: "Open Sans", sans-serif;
}
.ios {
  position: fixed;
  width: 50%;
  height: 55px;
  right: 0%;
  text-align: initial;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.landing-page-desktop-ios {
  position: relative;
  width: 25%;
  height: 55px;
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.landing-page-ios-icon {
  position: absolute;
  width: 40px;
  height: 40px;
  margin-left: 15%;
  margin-top: 5px;
  background-image: url("./../images/apple-icon.png");
  background-color: #f2f2f2;
  background-size: 100% 100%;
  border: none;
  outline: 0;
}
.landing-page-desktop-ios-icon {
  position: relative;
  width: 40px;
  height: 40px;
  margin-left: 37%;
  background-image: url("./../images/apple-icon.png");
  background-color: #f2f2f2;
  background-size: 100% 100%;
  border: none;
  outline: 0;
}
.ios span {
  position: absolute;
  margin-top: 9px;
  margin-left: calc(15% + 46px);
  transform: translateY(50%);
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
  font-family: "Open Sans", sans-serif;
}
.landing-page-desktop-ios span {
  position: relative;
  margin-top: 2px;
  margin-left: 10px;
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
  font-family: "Open Sans", sans-serif;
}
.app-store-presence {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #f2f2f2;
}
.contact {
  text-align: center;
  padding: 20px;
  vertical-align: top;
  color: #9d92b2;
  font-size: initial;
}
.contact-name {
  color: #544e5f;
  font-size: 10px;
  margin: 0;
  line-height: 1.8;
  font-weight: normal;
}
.contact-street {
  max-height: 27px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: max-height 0.4s ease;
  color: #9d92b2;
  font-size: 10px;
  margin: 0;
  line-height: 1.8;
  font-weight: normal;
}
.contact-place {
  color: #9d92b2;
  font-size: 10px;
  margin: 0;
  line-height: 1.8;
  font-weight: normal;
}
.contact-details {
  margin-top: 10px;
  list-style-type: none;
  margin: 0;
  padding: 0;
}
.telephone {
  margin-top: 10px;
  display: block;
  speak: none;
  text-transform: none;
  -webkit-font-smoothing: antialiased;
  margin-bottom: 4px;
  color: #9d92b2;
  font-size: 10px;
  line-height: 1.8;
}
.email {
  display: block;
  speak: none;
  text-transform: none;
  -webkit-font-smoothing: antialiased;
  margin-bottom: 4px;
  color: #9d92b2;
  font-size: 10px;
  line-height: 1.8;
  font-weight: normal;
}
</style>
