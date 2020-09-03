<template>
  <div class="friends-page-container">
    <button
      class="connections-search-icon"
      :style="is_mobile ? '' : 'right: calc(50vw - 500px);'"
      @click="$router.push('/search-users')"
      type="button"
    ></button>

    <div
      class="friends-tabs"
      :style="is_mobile ? '' : 'width: 1000px;left: calc(50vw - 500px);'"
    >
      <a
        :class="[tab_name === 'Friends' ? 'is-active' : '']"
        @click="switchConnectionsTab('Friends')"
      >
        Connections

        <button
          v-if="store.notifications.friends"
          class="new-connections-notification"
          :style="is_mobile ? '' : 'right: 185px;margin-top: 2px;'"
          style="right: 20%;"
        />
      </a>
      <a
        :class="[tab_name === 'Requests' ? 'is-active' : '']"
        @click="switchConnectionsTab('Requests')"
      >
        Requests

        <button
          v-if="store.notifications.requests"
          class="new-connections-notification"
          :style="is_mobile ? '' : 'right: 185px;margin-top: 2px;'"
        />
      </a>
    </div>

    <div v-if="tab_name === 'Friends'" class="friends-box">
      <div
        v-for="(item, index) in store.friends_page.friends"
        :key="index"
        v-if="
          [
            'friend',
            'unfriend?',
            'friends_other',
            'friends_request_sent',
            'friends_cancel_request?',
          ].includes(item.friend_type)
        "
        class="friend-container"
      >
        <Person
          style="justify-content: flex-start;"
          @clicked="clickUser(item.friend_id, item.name)"
          :name="item.name"
          :image="item.picture"
          :width="55"
          :height="70"
          position="right"
          :fontSize="15"
          :scale="true"
        />

        <div
          class="friends-friendship-status"
          @click="
            item.friend_type == 'friend'
              ? promptUnfriend('friends', index, item.name, item.picture)
              : ['friends_request_sent'].includes(item.friend_type)
              ? unfriend('friends', index, 'request_sent')
              : ['friends_other'].includes(item.friend_type)
              ? sendRequest('friends', index)
              : ''
          "
          :style="
            ['friends_other'].includes(item.friend_type)
              ? `color: #ffffff;
                                                                                    background-color: #3366BB;
                                                                                    padding: 5px;
                                                                                    border: none;`
              : ''
          "
        >
          {{
            item.friend_type == "friend"
              ? "Connection"
              : ["friends_request_sent"].includes(item.friend_type)
              ? "Requested"
              : ["friends_other"].includes(item.friend_type)
              ? "Connect"
              : ""
          }}
        </div>
      </div>
    </div>

    <div v-if="tab_name === 'Requests'">
      <div class="friends-box">
        <div
          v-for="(item, index) in store.friends_page.friends"
          :key="index"
          v-if="
            [
              'unapproved',
              'requests_other',
              'requests_request_sent',
              'requests_cancel_request?',
            ].includes(item.friend_type)
          "
          class="friend-container"
        >
          <Person
            style="justify-content: flex-start;"
            @clicked="clickUser(item.friend_id, item.name)"
            :name="item.name"
            :image="item.picture"
            :width="55"
            :height="70"
            position="right"
            :fontSize="15"
            :scale="true"
          />

          <div class="approval-buttons">
            <span
              class="friends-approve-request"
              @click="approveRequest(index)"
              v-if="['unapproved'].includes(item.friend_type)"
            >
              Approve
            </span>

            <span
              class="friends-reject-request"
              v-if="['unapproved'].includes(item.friend_type)"
              @click="unfriend('requests', index)"
            >
              Reject
            </span>
          </div>

          <div
            class="friends-friendship-status"
            v-if="
              ['requests_other', 'requests_request_sent'].includes(
                item.friend_type
              )
            "
            @click="
              item.friend_type == 'friend'
                ? promptUnfriend('requests', index, item.name, item.picture)
                : ['requests_request_sent'].includes(item.friend_type)
                ? unfriend('requests', index, 'request_sent')
                : ['requests_other'].includes(item.friend_type)
                ? sendRequest('requests', index)
                : ''
            "
            :style="
              ['requests_other'].includes(item.friend_type)
                ? `color: #ffffff;
                                                                                        background-color: #3366BB;
                                                                                        padding: 5px;
                                                                                        border: none;`
                : ''
            "
          >
            {{
              item.friend_type == "friend"
                ? "Connection"
                : ["requests_request_sent"].includes(item.friend_type)
                ? "Requested"
                : ["requests_other"].includes(item.friend_type)
                ? "Connect"
                : ""
            }}
          </div>
        </div>
      </div>
    </div>

    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div>
        <div
          v-if="prompt.if_prompt"
          class="black-background"
          @click="prompt.if_prompt = !prompt.if_prompt"
        />

        <div
          class="prompted-box"
          :style="is_mobile ? 'min-width: 250px;' : 'min-width: 250px;'"
          v-if="prompt.if_prompt"
        >
          <div class="prompted-user-cropper">
            <img
              v-bind:src="prompt.user_picture"
              onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
              class="prompted-user-pic"
            />
          </div>

          <div class="prompted-user-name">
            {{ prompt.user_name }}
          </div>

          <p>
            Remove connection?
          </p>

          <div
            class="prompted-buttons"
            :style="is_mobile ? '' : 'min-width: 250px;'"
          >
            <div
              class="prompted-cancel-button"
              @click="prompt.if_prompt = !prompt.if_prompt"
            >
              Cancel
            </div>
            <div
              class="prompted-remove-button"
              @click="unfriend(prompt.tab, prompt.index, null)"
            >
              Remove
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";
import Person from "./atomic/Person";
import { mixin as onClickOutside } from "vue-on-click-outside";

export default {
  name: "App",
  components: {
    Person,
  },
  mixins: [onClickOutside],
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      tab_name: "Friends",
      remove_friend_banner: false,
      prompt: {
        if_prompt: false,
        tab: null,
        index: null,
        user_name: null,
        user_picture: null,
      },
      store: this.$store.state,
    };
  },
  created() {
    this.$emit("update-friends");
    this.$store.state.current_path = "/connections";
    var self = this;
    setTimeout(self.vanishFriendsNotification, 1500);
  },
  methods: {
    clickUser(id, name) {
      this.$router.push(
        "/profile/" + id + "/" + name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
    },
    unfriend(tab, index, current_status) {
      this.prompt.if_prompt = false;
      this.store.friends_page.friends[index].friend_type = tab + "_other";
      var self = this;
      axios
        .post(self.$store.state.api_host + "unfriend", {
          session_id: self.$store.state.session_id,
          friend_id: self.store.friends_page.friends[index].friend_id,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
          } else {
            // console.log(response.status);
          }
        })
        .catch(function (error) {
          if (current_status == "request_sent") {
            self.store.friends_page.friends[index].friend_type =
              tab + "_request_sent";
          } else {
            self.store.friends_page.friends[index].friend_type = "friend";
          }
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
    hideBanner(tab, catg, index) {
      var self = this;
      setTimeout(function () {
        if (tab == "friends") {
          if (
            catg == "unfriend" &&
            self.store.friends_page.friends[index].friend_type == "unfriend?"
          ) {
            self.store.friends_page.friends[index].friend_type = "friend";
          } else if (
            catg == "request" &&
            self.store.friends_page.friends[index].friend_type ==
              "friends_cancel_request?"
          ) {
            self.store.friends_page.friends[index].friend_type =
              tab + "_request_sent";
          }
        } else if (
          catg == "request" &&
          self.store.friends_page.friends[index].friend_type ==
            "requests_cancel_request?"
        ) {
          self.store.friends_page.friends[index].friend_type =
            tab + "_request_sent";
        }
      }, 3000);
    },
    approveRequest(index) {
      var self = this;
      axios
        .post(self.$store.state.api_host + "approve_request", {
          session_id: self.$store.state.session_id,
          friend_id: self.store.friends_page.friends[index].friend_id,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            self.store.friends_page.friends[index].friend_type = "friend";
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
    },
    sendRequest(tab, index) {
      var self = this;
      self.store.friends_page.friends[index].friend_type =
        tab + "_request_sent";
      axios
        .post(self.$store.state.api_host + "send_request", {
          session_id: self.$store.state.session_id,
          friend_id: self.store.friends_page.friends[index].friend_id,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
          } else {
            // console.log(response.status);
          }
        })
        .catch(function (error) {
          self.store.friends_page.friends[index].friend_type = tab + "_other";
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
    promptUnfriend(tab_name, index, user_name, user_picture) {
      this.prompt.tab = tab_name;
      this.prompt.index = index;
      this.prompt.user_name = user_name;
      this.prompt.user_picture = user_picture;
      this.prompt.if_prompt = true;
    },
    vanishFriendsNotification() {
      this.store.notifications.friends = false;
    },
    vanishRequestsNotification() {
      this.store.notifications.requests = false;
    },
    switchConnectionsTab(tab) {
      this.tab_name = tab;
      var self = this;
      if (tab == "Requests") {
        setTimeout(self.vanishRequestsNotification, 1500);
      }
    },
  },
};
</script>

<style lang="scss">
.friends-page-container {
  position: relative;
  width: 95%;
  margin-top: 50px;
  margin-left: 2.5%;
}
.friends-tabs {
  width: 100%;
  left: 0px;
  background-color: #f8f8f8;
  position: fixed;
  overflow: hidden;
  padding: 5px;
  text-align: center;
  display: grid;
  grid-column-gap: 10px;
  z-index: 10;
}
.friends-tabs a {
  position: relative;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  padding: 6px 0px;
  transition: background-color 0.2s;
  border-radius: 5px 3px 0 0;
  font-weight: normal;
  font-size: 15px;
  text-transform: uppercase;
  display: inline-grid;
  grid-row-start: 1;
  grid-row-end: 3;
}
.friends-tabs a.is-active {
  font-weight: bold;
}
.friends-tabs a.is-active:after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: calc(50% - 7.5px);
  width: 15px;
  height: 3px;
  background-color: #333333;
  border-radius: 3px;
}
.friends-box {
  position: relative;
  display: inline-block;
  margin-top: 42px;
  overflow: scroll;
  margin-bottom: 2%;
  width: 98%;
}
.friend-container {
  display: flex;
  overflow-x: scroll;
  justify-content: space-between;
  align-items: center;
  vertical-align: top;
  text-align: left;
  padding: 1%;
  height: 80px;
}
.friends-friendship-status {
  position: relative;
  text-align: center;
  font-size: 14px;
  color: #333333;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #777777;
  padding: 4px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.fadeIn {
  animation: fadeIn 0.3s;
}
.fadeOut {
  animation: fadeOut 0.6s;
}
.friends-approve-request {
  position: relative;
  margin-right: 16px;
  float: left;
  text-align: center;
  font-size: 14px;
  color: #ffffff;
  border-radius: 5px;
  background-color: #3366bb;
  padding: 5px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.friends-reject-request {
  position: relative;
  float: right;
  text-align: center;
  font-size: 14px;
  color: #333333;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #777777;
  padding: 4px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.black-background {
  position: fixed;
  width: 100%;
  height: 150%;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  top: 0%;
  left: 0%;
  z-index: 100000;
}
.prompted-box {
  position: fixed;
  background-color: #ffffff;
  top: 35vh;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 7px;
  padding: 10px;
  z-index: 100001;
}
.prompted-user-cropper {
  display: inline-block;
  width: 80px;
  height: 80px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  z-index: 100001;
}
.prompted-user-pic {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
  z-index: 100001;
}
.prompted-user-name {
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
  z-index: 100001;
}
.prompted-box p {
  position: relative;
  margin-top: 20px;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: center;
  color: #333333;
  white-space: normal;
}
.prompted-buttons {
  min-width: 45vw;
  margin-top: 20px;
}
.prompted-cancel-button {
  float: left;
  width: 50%;
  padding: 3px;
  cursor: pointer;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.prompted-remove-button {
  float: right;
  width: 50%;
  border-left: solid 1px #919090;
  padding: 3px;
  cursor: pointer;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.approval-buttons {
  position: relative;
  display: flex;
  margin-left: 16px;
}
.new-connections-notification {
  position: absolute;
  right: 23%;
  margin-top: 0px;
  height: 7px;
  width: 7px;
  background-image: url("./../images/red_dot.png");
  background-color: #e9f3f8;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  z-index: 10000;
}
.connections-search-icon {
  position: fixed;
  display: block;
  right: 0;
  top: 0;
  height: 50px;
  width: 50px;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  background-image: url("./../images/search-icon.svg");
  background-size: 50% 50%;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 10000;
}
::-webkit-scrollbar {
  display: none;
}
</style>
