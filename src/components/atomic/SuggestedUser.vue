<template>
  <div class="suggested-user-box">
    <div style="height: 150px;">
      <div class="suggested-user-cropper" @click="goToProfile">
        <img
          v-bind:src="image"
          onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
          class="suggested-user-pic"
        />
      </div>

      <div class="suggested-user-name" @click="goToProfile">
        {{ userName }}
      </div>

      <div class="suggested-reason">
        {{
          basis == "taste" ? "Similar interest" : mutual + " Mutual connections"
        }}
      </div>
    </div>

    <div
      class="follow-suggested-button"
      @click="userType == 'stranger' ? sendRequest() : unfriend()"
      :style="
        userType == 'requested'
          ? `color: #333333;
                                                            background-color: #ffffff;
                                                            border: solid 1px #777777;
                                                            padding: 4px;`
          : ''
      "
    >
      {{ userType == "stranger" ? "Connect" : "Requested" }}
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "App",
  props: {
    userId: {
      type: Number,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    basis: {
      type: String,
      required: false,
    },
    mutual: {
      type: Number,
      required: false,
    },
    userType: {
      type: String,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  methods: {
    goToProfile() {
      this.$emit("leave-feed");
      var info = {
        user_id: this.userId,
        user_name: this.userName,
      };
      this.$emit("open-uesr-profile", info);
    },
    sendRequest() {
      var self = this;
      self.$store.state.suggestions.users_suggestions[this.index].friend_type =
        "requested";
      axios
        .post(self.$store.state.api_host + "send_request", {
          session_id: self.$store.state.session_id,
          friend_id: self.userId,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
          } else {
            // console.log(response.status);
          }
        })
        .catch(function (error) {
          self.$store.state.suggestions.users_suggestions[
            self.index
          ].friend_type = "stranger";
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
    unfriend() {
      var self = this;
      self.$store.state.suggestions.users_suggestions[this.index].friend_type =
        "stranger";
      axios
        .post(self.$store.state.api_host + "unfriend", {
          session_id: self.$store.state.session_id,
          friend_id: self.userId,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
          } else {
            // console.log(response.status);
          }
        })
        .catch(function (error) {
          self.$store.state.suggestions.users_suggestions[
            self.index
          ].friend_type = "requested";
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
  },
};
</script>

<style scoped>
.suggested-user-box {
  width: 130px;
  min-width: 130px;
  margin-right: 24px;
}
.suggested-user-cropper {
  display: inline-block;
  width: 80px;
  height: 80px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.suggested-user-pic {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.suggested-user-name {
  margin-top: 3px;
  max-height: 34px;
  position: relative;
  white-space: normal;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.25;
  letter-spacing: normal;
  color: #333333;
  text-transform: capitalize;
  overflow: hidden;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.suggested-reason {
  margin-top: 3px;
  position: relative;
  white-space: normal;
  text-align: center;
  font-size: 12px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.25;
  letter-spacing: normal;
  color: #333333;
}
.follow-suggested-button {
  text-align: center;
  font-size: 14px;
  color: #ffffff;
  background-color: #3366bb;
  border-radius: 5px;
  padding: 5px;
  cursor: pointer;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
</style>