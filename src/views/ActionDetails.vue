<template>
  <div v-if="fetching" class="action-details-fetching">
    <div class="sk-folding-cube">
      <div class="sk-cube1 sk-cube"></div>
      <div class="sk-cube2 sk-cube"></div>
      <div class="sk-cube4 sk-cube"></div>
      <div class="sk-cube3 sk-cube"></div>
    </div>
    <br />
    <div class="quote-font">
      {{ store.quotes[Math.floor(Math.random() * 22)] }}
    </div>
  </div>

  <div v-else class="action-details-container" id="action-details-container">
    <FeedCard
      v-if="data != null"
      :content="data"
      :parent="actionType + '_details'"
      @action-user-vote="
        (vote) => {
          data.user_vote = vote;
        }
      "
      @action-total-vote="
        (vote) => {
          data.upvotes = vote;
        }
      "
      v-on="$listeners"
    />

    <div
      v-if="data.contents_discussed.length"
      class="action-details-contents-discussed-container"
    >
      <p>Conversation highlights</p>

      <div style="display: flex; overflow: scroll">
        <div
          v-for="(item, index) in data.contents_discussed"
          :key="index"
          class="action-details-contents-discussed-poster"
        >
          <Poster
            :containerWidth="is_mobile ? 100 : 125"
            :contentId="item.content_id"
            :image="item.poster"
            :title="item.title"
            :showTrailer="false"
            :whereToWatch="item.where_to_watch"
            :userPlatforms="
              store.user.id ? store.user.profile.platforms || [''] : ['']
            "
            :showName="false"
            :parent="actionType + '_details'"
            posterLocation="contents_discussed"
            :openContentOnClick="false"
            @clicked="showPreview(item.content_id, item.title)"
            v-on="$listeners"
          />
          <p style="font-weight: normal">
            {{ item.count }} {{ item.count > 1 ? "mentions" : "mention" }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="data.comments.length"
      style="margin-top: 16px; padding: 0px 16px"
      id="comments-container"
    >
      <Comment
        @reply="reply"
        v-for="(comment, index) in data.comments"
        :key="index"
        :currentComment="comment"
        :isChild="false"
        :parent="actionType + '_details'"
      />
    </div>

    <ContentPreview
      v-if="previewDetails.show"
      :id="previewDetails.id"
      :name="previewDetails.title"
      :parent="actionType + '_details__contents_discussed'"
      @close-preview="previewDetails.show = false"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import axios from "axios";
import FeedCard from "./../components/molecular/FeedCard";
import Poster from "./../components/molecular/Poster";
import Comment from "./../components/molecular/Comment";
import ContentPreview from "./../components/molecular/ContentPreview";

export default {
  name: "ActionDetails",
  components: { FeedCard, Poster, Comment, ContentPreview },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
      actionType: null,
      actionId: null,
      reactionId: null,
      urlText: null,
      data: null,
      fetching: true,
      previewDetails: {
        show: false,
        title: null,
        id: null,
      },
    };
  },
  created() {
    var self = this;
    this.$store.state.current_path = this.$route.path;
    this.actionType = this.$route.params.actionType;
    this.actionId = parseInt(this.$route.params.actionId);
    this.reactionId = this.$route.params.reactionId
      ? parseInt(this.$route.params.reactionId)
      : null;
    this.urlText = this.$route.params.urlText;

    if (
      this.store.user.profile.country == null &&
      this.store.guest_country == null
    ) {
      axios
        .get("https://ipinfo.io/?token=a354c067e1fef5")
        .then(function (response) {
          if ([200].includes(response.status)) {
            var country_code = response.data.country;
            if (
              Object.keys(self.$store.state.country_mappings).includes(
                country_code
              )
            ) {
              self.store.guest_country =
                self.$store.state.country_mappings[response.data.country];
            }
          }

          axios
            .post(self.$store.state.api_host + "fetch_action_details", {
              session_id: self.$store.state.session_id,
              country: self.store.guest_country,
              guest_id: self.$store.state.guest_id,
              action_id: self.actionId,
              reaction_id: self.reactionId,
              url_text: self.urlText,
            })
            .then((response) => {
              self.data = response.data;
              self.fetching = false;
            })
            .catch(function (error) {
              self.fetching = false;
              // console.log(error);
            });
        });
    } else {
      axios
        .post(self.$store.state.api_host + "fetch_action_details", {
          session_id: self.$store.state.session_id,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
          guest_id: self.$store.state.guest_id,
          action_id: self.actionId,
          reaction_id: self.reactionId,
          url_text: self.urlText,
        })
        .then((response) => {
          self.data = response.data;
          self.fetching = false;
        })
        .catch(function (error) {
          self.fetching = false;
          // console.log(error);
        });
    }
  },
  methods: {
    reply(info) {
      console.log(info);
    },
    showPreview(id, title) {
      this.previewDetails.id = id;
      this.previewDetails.title = title;
      this.previewDetails.show = true;
    },
  },
};
</script>

<style scoped>
.action-details-container {
  margin-top: 66px;
  padding-bottom: 56px;
}
.action-details-contents-discussed-container {
  margin-top: 16px;
  background-color: #f9f9f9;
  width: 100%;
  padding: 8px 16px;
  text-align: left;
}
.action-details-contents-discussed-container p {
  font-size: 14px;
  font-weight: bold;
  line-height: 1.5;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
}
.action-details-contents-discussed-poster {
  display: flex;
  flex-direction: column;
  text-align: center;
  margin-right: 16px;
  margin-top: 8px;
}
.action-details-fetching {
  position: fixed;
  top: calc(50% - 36px);
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 95%;
}
.sk-folding-cube {
  margin: 20px auto;
  width: 40px;
  height: 40px;
  position: relative;
  -webkit-transform: rotateZ(45deg);
  transform: rotateZ(45deg);
}

.sk-folding-cube .sk-cube {
  float: left;
  width: 50%;
  height: 50%;
  position: relative;
  -webkit-transform: scale(1.1);
  -ms-transform: scale(1.1);
  transform: scale(1.1);
}
.sk-folding-cube .sk-cube:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(235, 225, 225, 0.75);
  -webkit-animation: sk-foldCubeAngle 2.4s infinite linear both;
  animation: sk-foldCubeAngle 2.4s infinite linear both;
  -webkit-transform-origin: 100% 100%;
  -ms-transform-origin: 100% 100%;
  transform-origin: 100% 100%;
}
.sk-folding-cube .sk-cube2 {
  -webkit-transform: scale(1.1) rotateZ(90deg);
  transform: scale(1.1) rotateZ(90deg);
}
.sk-folding-cube .sk-cube3 {
  -webkit-transform: scale(1.1) rotateZ(180deg);
  transform: scale(1.1) rotateZ(180deg);
}
.sk-folding-cube .sk-cube4 {
  -webkit-transform: scale(1.1) rotateZ(270deg);
  transform: scale(1.1) rotateZ(270deg);
}
.sk-folding-cube .sk-cube2:before {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
.sk-folding-cube .sk-cube3:before {
  -webkit-animation-delay: 0.6s;
  animation-delay: 0.6s;
}
.sk-folding-cube .sk-cube4:before {
  -webkit-animation-delay: 0.9s;
  animation-delay: 0.9s;
}
@-webkit-keyframes sk-foldCubeAngle {
  0%,
  10% {
    -webkit-transform: perspective(140px) rotateX(-180deg);
    transform: perspective(140px) rotateX(-180deg);
    opacity: 0;
  }
  25%,
  75% {
    -webkit-transform: perspective(140px) rotateX(0deg);
    transform: perspective(140px) rotateX(0deg);
    opacity: 1;
  }
  90%,
  100% {
    -webkit-transform: perspective(140px) rotateY(180deg);
    transform: perspective(140px) rotateY(180deg);
    opacity: 0;
  }
}

@keyframes sk-foldCubeAngle {
  0%,
  10% {
    -webkit-transform: perspective(140px) rotateX(-180deg);
    transform: perspective(140px) rotateX(-180deg);
    opacity: 0;
  }
  25%,
  75% {
    -webkit-transform: perspective(140px) rotateX(0deg);
    transform: perspective(140px) rotateX(0deg);
    opacity: 1;
  }
  90%,
  100% {
    -webkit-transform: perspective(140px) rotateY(180deg);
    transform: perspective(140px) rotateY(180deg);
    opacity: 0;
  }
}
.quote-font {
  font-size: 23px;
  font-weight: bold;
  line-height: 1.5;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  color: #adaaaa;
  font-family: "Poiret One", cursive;
}
::-webkit-scrollbar {
  display: none;
}
</style>