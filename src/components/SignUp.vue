<template>
  <div style="font-family: 'Open Sans', sans-serif;">
    <div :class="is_mobile ? 'signup-page-cover' : 'desktop-signup-page-cover'">
      <img
        src="https://flibo-images.s3-us-west-2.amazonaws.com/covers/login-cover.jpg"
        :style="is_mobile ? 'height: 50vh;' : ''"
      />

      <div
        :class="is_mobile ? 'signup-page-logo' : 'desktop-signup-page-logo'"
      />

      <p>
        <span style="text-transform: capitalize;">
          {{ invitation.split("invitation=")[1].split("_")[0] }}
        </span>
        has invited you to join FLIBO so that you don’t waste time looking for a
        perfect movie or tv series.
      </p>

      <div
        :class="is_mobile ? 'signup-button' : 'desktop-signup-button'"
        @click="goToSignupPage"
      >
        GET STARTED
      </div>
    </div>

    <img
      src="https://flibo-images.s3-us-west-2.amazonaws.com/other/dude-watching-in-chair.png"
      :class="
        is_mobile
          ? 'signup-dude-watching-in-chair'
          : 'desktop-signup-dude-watching-in-chair'
      "
    />

    <div
      :class="is_mobile ? 'signup-issue-text-1' : 'desktop-signup-issue-text-1'"
    >
      Do you have Netflix and Prime subscriptions but
      <span style="font-weight: bold;">
        not sure what to watch
      </span>
      ?
    </div>

    <div :class="is_mobile ? 'try-flibo' : 'desktop-try-flibo'">
      <h1>
        TRY FLIBO
      </h1>
    </div>

    <img
      src="https://flibo-images.s3-us-west-2.amazonaws.com/other/flibo-screenshot-rate-movies.png"
      :class="
        is_mobile
          ? 'signup-flibo-screenshot'
          : 'desktop-signup-flibo-screenshot'
      "
    />

    <div
      :class="is_mobile ? 'signup-issue-text-2' : 'desktop-signup-issue-text-2'"
    >
      Discover new favorite
      <span style="font-weight: bold;">
        Movies
      </span>
      &
      <span style="font-weight: bold;">
        TV Series
      </span>
      online.
    </div>

    <div :class="is_mobile ? 'signup-footer' : 'desktop-signup-footer'">
      <div
        :class="is_mobile ? 'signup-button' : 'desktop-signup-button'"
        @click="goToSignupPage"
      >
        GET STARTED
      </div>

      <div
        :class="
          is_mobile ? 'signup-issue-text-3' : 'desktop-signup-issue-text-3'
        "
      >
        Currently, FLIBO is invite-only. You are going to experience FLIBO
        before anyone else.
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      invitation: null
    };
  },

  created() {
    this.invitation = decodeURIComponent(this.$route.params.invitation);
  },
  methods: {
    goToSignupPage() {
      window.location = this.invitation;
    }
  }
};
</script>

<style lang="scss">
@import "./../styles/mixins.scss";

.signup-page-cover {
  position: relative;
  margin-top: 0%;
  width: 100%;
  height: 45vh;
  overflow: hidden;
  z-index: 10000;
}
.signup-page-logo {
  position: absolute;
  width: 27vw;
  height: 27vw;
  top: -15px;
  left: 36.5vw;
  background-image: url("./../images/flibo-logo-white.svg");
  background-size: 100%;
  background-position: center;
  background-repeat: no-repeat;
}
.signup-page-cover p {
  position: absolute;
  top: calc(25vw - 20px);
  left: 12.5%;
  font-size: calc(13px + 1.75vw);
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: #ffffff;
  width: 75%;
}
.signup-button {
  position: absolute;
  right: 10px;
  bottom: 7%;
  left: 12.5%;
  width: 75%;
  height: 50px;
  padding: 5px;
  background-color: #ffffff;
  border-radius: 7px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 2.5;
  letter-spacing: normal;
  text-align: center;
  color: #434343;
}
.signup-dude-watching-in-chair {
  position: relative;
  width: 37%;
  margin-left: 32.5%;
  margin-top: 3%;
}
.signup-issue-text-1 {
  position: relative;
  width: 80%;
  padding: 5%;
  left: 10%;
  font-size: calc(13px + 1.75vw);
}
.try-flibo {
  background-color: #f8f8f8;
  text-align: center;
  padding: 10% 10% 100% 10%;
  margin-top: 10%;
}
.try-flibo h1 {
  font-weight: 700;
  font-style: normal;
  font-stretch: normal;
  line-height: 0.8;
  font-size: 45px;
  letter-spacing: normal;
}
.signup-flibo-screenshot {
  position: relative;
  width: 100%;
  margin-top: -100%;
}
.signup-issue-text-2 {
  position: relative;
  width: 80%;
  left: 10%;
  font-size: calc(13px + 1.75vw);
  text-align: center;
  margin-top: -3%;
}
.signup-footer {
  background-color: #f8f8f8;
  text-align: center;
  padding: 10% 10% 13% 10%;
  margin-top: 10%;
}
.signup-footer .signup-button {
  position: relative;
  left: 3%;
  width: 94%;
  padding: 5px;
  color: #ffffff;
  background-color: #3e64ed;
  border-radius: 7px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 2.5;
  letter-spacing: normal;
  text-align: center;
}
.signup-issue-text-3 {
  position: relative;
  width: 100%;
  margin-top: 6%;
  font-size: calc(10px + 1vw);
  text-align: center;
  color: #575757;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.5;
  letter-spacing: normal;
}
.desktop-signup-page-cover {
  position: relative;
  margin-top: 0;
  width: 100%;
  height: 50vh;
  overflow: hidden;
  z-index: 10000;
}
.desktop-signup-page-logo {
  position: absolute;
  width: 200px;
  height: 200px;
  top: -15px;
  left: calc(50% - 100px);
  background-image: url("./../images/flibo-logo-white.svg");
  background-size: 100%;
  background-position: center;
  background-repeat: no-repeat;
}
.desktop-signup-page-cover p {
  position: absolute;
  left: 12.5%;
  top: 165px;
  width: 75%;
  font-size: 40px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: #ffffff;
}
.desktop-signup-button {
  position: absolute;
  left: 40%;
  top: 40vh;
  height: 50px;
  width: 20%;
  font-size: 21px;
  background-color: #ffffff;
  border-radius: 7px;
  font-weight: 700;
  line-height: 2.5;
  text-align: center;
  color: #434343;
}
.desktop-signup-dude-watching-in-chair {
  position: relative;
  width: 25%;
  max-width: 320px;
  margin-left: 50%;
  margin-top: 25px;
  transform: translateX(-50%);
}
.desktop-signup-issue-text-1 {
  position: relative;
  width: 80%;
  padding: 35px;
  left: 10%;
  font-size: 35px;
  text-align: center;
}
.desktop-try-flibo {
  background-color: #f8f8f8;
  text-align: center;
  padding: 75px 75px 700px 75px;
  margin-top: 35px;
}
.desktop-try-flibo h1 {
  font-weight: 700;
  font-style: normal;
  font-stretch: normal;
  line-height: 0.8;
  font-size: 70px;
  letter-spacing: normal;
}
.desktop-signup-flibo-screenshot {
  position: relative;
  width: 700px;
  margin-top: -685px;
  left: 50%;
  transform: translateX(-50%);
}
.desktop-signup-issue-text-2 {
  position: relative;
  width: 80%;
  left: 10%;
  font-size: 35px;
  text-align: center;
}
.desktop-signup-footer {
  background-color: #f8f8f8;
  text-align: center;
  padding: 65px 65px 100px 65px;
  margin-top: 55px;
}
.desktop-signup-footer .desktop-signup-button {
  position: relative;
  left: 40%;
  width: 20%;
  top: 5px;
  color: #ffffff;
  background-color: #3e64ed;
  border-radius: 7px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 2.5;
  letter-spacing: normal;
  text-align: center;
}
.desktop-signup-issue-text-3 {
  position: relative;
  width: 100%;
  margin-top: 6%;
  font-size: 20px;
  text-align: center;
  color: #575757;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.5;
  letter-spacing: normal;
}
</style>
