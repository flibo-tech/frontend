<template>
  <div class="starting-text">
    <div
      class="summary-profile-cropper"
      :style="
        user_id != null
          ? 'cursor: pointer;-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-tap-highlight-color: transparent;'
          : ''
      "
      v-if="feed_type"
      @click="goToProfile(user_id, user_name)"
    >
      <img
        class="summary-profile-pp"
        :src="user_picture"
        onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
      />
    </div>
    <p
      class="summary-text"
      :style="is_mobile ? '' : 'font-size: 15px;'"
      v-if="feed_type"
    >
      <span
        :style="
          user_id != null
            ? 'font-weight: bold;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;-o-user-select: none;user-select: none;-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-tap-highlight-color: transparent;'
            : 'font-weight: bold;'
        "
        @click="goToProfile(user_id, user_name)"
      >
        {{ user_name }}
      </span>

      <span v-if="item_type == 'suggestions'">
        recommends you
      </span>

      <span v-if="item_type != 'suggestions'">
        <span v-if="user_ids.length > 1">
          and
        </span>
        <span
          v-if="user_ids.length > 1"
          style="font-weight: bold;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;-o-user-select: none;user-select: none;-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-tap-highlight-color: transparent;"
          @click="showOther"
        >
          {{ user_ids.length - 1 }}
          {{
            user_ids.length - 1 == 1
              ? "other"
              : feed_type == "friends"
              ? "other"
              : "others"
          }}
        </span>
        <span v-if="(feed_type == 'friends') & (user_ids.length > 1)">
          {{ user_ids.length - 1 == 1 ? "connection" : "connections" }}
        </span>
      </span>

      <span v-if="item_type == 'ratings'">
        {{ other_user_rating == 2 ? "liked" : "loved" }}
      </span>

      <span v-if="item_type == 'watchlist'">
        added
      </span>

      <span v-if="item_type == 'watching'">
        {{
          type == "movie"
            ? "recently watched"
            : user_ids.length > 1
            ? "are watching"
            : "is watching"
        }}
      </span>

      this {{ type == "movie" ? "movie" : "TV series" }}

      <span v-if="item_type == 'watchlist'">
        to watchlist
      </span>

      <span v-if="(item_type == 'watching') & (type == 'tv')">
        these days
      </span>
    </p>

    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div>
        <div
          v-if="show_others"
          class="black-background"
          @click="show_others = !show_others"
        />

        <div
          :class="
            is_mobile
              ? 'others-list-container'
              : 'desktop-others-list-container'
          "
          v-if="show_others"
        >
          <div
            v-for="(item, index) in other_users"
            :key="index"
            :class="
              is_mobile
                ? 'other-user-container'
                : 'desktop-other-user-container'
            "
          >
            <div
              class="other-user-pp-cropper"
              :style="is_mobile ? '' : 'margin-left: 0px;'"
              @click="goToProfile(item.user_id, item.user_name)"
            >
              <img
                v-bind:src="item.user_picture"
                onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
                class="other-user-pp"
              />
            </div>

            <div
              class="other-user-name-box"
              :style="
                is_mobile
                  ? ''
                  : 'position: relative;margin-top: 0px;margin-left: 15px;left: 0px;'
              "
            >
              <h5 @click="goToProfile(item.user_id, item.user_name)">
                {{ item.user_name }}
              </h5>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "App",
  props: {
    user_id: {
      type: Number,
      required: false
    },
    user_name: {
      type: String,
      required: true
    },
    user_picture: {
      type: String,
      required: true
    },
    item_type: {
      type: String,
      required: true
    },
    user_ids: {
      type: Array,
      required: false,
      default: []
    },
    other_user_rating: {
      type: Number,
      required: false
    },
    type: {
      type: String,
      required: true
    },
    feed_type: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      show_others: false,
      other_users: []
    };
  },
  methods: {
    goToProfile(input_user_id, input_user_name) {
      if (input_user_id) {
        this.$emit("update-scroll", window.scrollY);
        var info = {
          user_id: input_user_id,
          user_name: input_user_name
        };
        this.$emit("open-uesr-profile", info);
      }
    },
    showOther() {
      var self = this;
      self.other_users = [];
      self.show_others = !self.show_others;
      axios
        .post(this.$store.state.api_host + "get_users_info", {
          session_id: this.$store.state.session_id,
          user_ids: this.user_ids,
          guest_id: self.$store.state.guest_id
        })
        .then(function(response) {
          if (response.status == 200) {
            self.other_users = response.data.users;
          } else {
            // console.log(response.status);
          }
        })
        .catch(function(error) {
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
  }
};
</script>

<style lang="scss" scoped>
.summary-profile-cropper {
  height: 35px;
  width: 35px;
  overflow: hidden;
  border-radius: 50%;
  background-color: #ffffff;
}
.summary-profile-pp {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.summary-text {
  position: absolute;
  margin-top: -17.5px;
  margin-left: 40px;
  transform: translateY(-50%);
  overflow-y: scroll;
  white-space: initial;
  width: 80%;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
.fadeIn {
  animation: fadeIn 0.3s;
}
.fadeOut {
  animation: fadeOut 0.6s;
}
.black-background {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  top: 0%;
  left: 0%;
  z-index: 100000;
}
.others-list-container {
  position: fixed;
  width: 64%;
  left: 18%;
  top: 25vh;
  max-height: 50vh;
  overflow: scroll;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 1%;
  z-index: 100001;
}
.desktop-others-list-container {
  position: fixed;
  min-width: 300px;
  left: 50%;
  transform: translateX(-50%);
  top: 30vh;
  max-height: 50vh;
  overflow: scroll;
  z-index: 100001;
  background-color: #fff;
  border-radius: 7px;
  padding: 10px;
}
.other-user-container {
  position: relative;
  vertical-align: top;
  text-align: left;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 1%;
  margin-top: 1%;
}
.desktop-other-user-container {
  position: relative;
  display: flex;
  align-items: center;
  text-align: left;
  padding: 5px 10px;
  background-color: #fff;
  border-radius: 7px;
}
.other-user-pp-cropper {
  width: 35px;
  height: 35px;
  margin-left: 10px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  z-index: 2;
  background-color: #ffffff;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.other-user-pp {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.other-user-name-box {
  position: absolute;
  margin-top: -25px;
  left: 55px;
  white-space: nowrap;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.other-user-name-box h5 {
  font-size: 15px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
::-webkit-scrollbar {
  display: none;
}
</style>