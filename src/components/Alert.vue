<template>
  <div style="overflow: scroll;">
    <div class="alert-flibo-logo-desktop" />
    <div class="new-app-alert">
      <p>
        We have three news for you - 2 good and 1 bad<br />
        <br />
        <span style="font-weight: bold;font-size: 16px;">Good news no. 1</span>
        - Now you can use FLIBO on your laptop. Visit flibo.ai<br />
        <span style="font-weight: bold;font-size: 16px;">Good news no. 2</span>
        - We have released a much better app where you don't need to type in
        your user id & password anymore.<br />
        With the new app, you can share your profile or any movie directly to
        social media with a collage made just for your taste.<br />
        <br />
        <span style="font-weight: bold;font-size: 16px;">Now the bad news</span>
        - Due to a technical issue, we had to release a new app. So please
        uninstall this app and get the new app by clicking the blue button. Your
        data will remain safe.<br />
        We are truly sorry for the inconvenience we are causing.<br />
      </p>
    </div>
    <div class="alert-install-button" @click="goToPlayStore">
      Open Play Store
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    goToPlayStore() {
      window.open(
        "https://play.google.com/store/apps/details?id=com.pivot.flibo"
      );
    }
  }
};
</script>

<style lang="scss">
.new-app-alert {
  position: relative;
  margin-top: 25px;
  width: 90vw;
  margin-left: 50%;
  transform: translateX(-50%);
  font-size: 15px;
  font-weight: 400;
  line-height: 1.5;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  text-align: left;
  color: #333;
  font-family: "Open Sans", sans-serif;
  line-height: 2;
}
.alert-flibo-logo-desktop {
  position: relative;
  display: block;
  width: 100px;
  height: 40px;
  margin-left: 50%;
  margin-top: 35px;
  transform: translateX(-50%);
  background-image: url("./../images/flibo-logo-dark.svg");
  background-size: 100%;
  background-position: center;
  background-repeat: no-repeat;
}
.alert-install-button {
  text-align: center;
  font-size: 18px;
  width: 80%;
  margin-left: 50%;
  transform: translateX(-50%) translateY(-50%);
  margin-top: 50px;
  color: #ffffff;
  background-color: #3366bb;
  border-radius: 5px;
  padding: 10px;
}
</style>
