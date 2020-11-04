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

  <div
    v-else-if="!badRequest"
    class="action-details-container"
    id="action-details-container"
  >
    <FeedCard
      v-if="data != null"
      :content="data"
      :parent="actionType + '_details'"
      :replyInfo="replyInfo"
      @update-vote="updateVote"
      @add-new-comment="addNewComment"
      @delete-item="deleteItem"
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
            :containerWidth="is_mobile ? 105 : 125"
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
        v-for="(comment, index) in data.comments"
        :key="index"
        :id="'comment-container-' + index"
        :currentComment="comment"
        :isChild="false"
        :parent="actionType + '_details'"
        @add-fetched-comments="addFetchedComments"
        @reply="(info) => (replyInfo = info)"
        @update-vote="updateVote"
        @delete-comment="deleteComment"
        v-on="$listeners"
      />
    </div>

    <div class="fetching-comments" v-if="fetchingComments">
      <div class="sk-folding-cube">
        <div class="sk-cube1 sk-cube"></div>
        <div class="sk-cube2 sk-cube"></div>
        <div class="sk-cube4 sk-cube"></div>
        <div class="sk-cube3 sk-cube"></div>
      </div>
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

  <div v-else class="na-message">No such page exists.</div>
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
      badRequest: false,
      fetchingComments: false,
      commentObserver: null,
      keepFetchingComments: true,
      replyInfo: null,
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
              self.$nextTick(() => {
                if (self.data.comments.length == 15) {
                  self.initIntersectionObserver();
                }
                self.scrollToComments();
              });
            })
            .catch(function (error) {
              if (error.response.status == 400) {
                self.badRequest = true;
              }
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
          self.$nextTick(() => {
            if (self.data.comments.length == 15) {
              self.initIntersectionObserver();
            }
            self.scrollToComments();
          });
        })
        .catch(function (error) {
          if (error.response.status == 400) {
            self.badRequest = true;
          }
          self.fetching = false;
          // console.log(error);
        });
    }
  },
  methods: {
    addNewComment(newComment) {
      this.replyInfo = null;

      if (newComment.parent_reaction_id) {
        this.data.comments.forEach((parentComment) => {
          if (newComment.parent_reaction_id === parentComment.reaction_id) {
            parentComment.comments.push(newComment);
            if (parentComment.total_comments != null) {
              parentComment.total_comments++;
            } else {
              parentComment.total_comments = 1;
            }
          }
        });
      } else {
        this.data.comments.unshift(newComment);
      }
      if (this.data.total_comments != null) {
        this.data.total_comments++;
      } else {
        this.data.total_comments = 1;
      }

      this.$nextTick(() => {
        var element = document.getElementById(
          "comment-" + newComment.reaction_id
        );
        if (element) {
          var topbarHeight = 50;
          var elementPosition = element.getBoundingClientRect().top;
          var offsetPosition =
            window.scrollY + elementPosition - topbarHeight - 10;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      });
    },
    updateVote(vote) {
      if (vote.parentReactionId) {
        for (let comment of this.data.comments) {
          if (comment.reaction_id == vote.parentReactionId) {
            if (vote.type == "user") {
              comment.user_vote = vote.vote;
            } else if (vote.type == "total") {
              comment.upvotes = vote.vote;
            }
            return;
          }

          for (let subComment of comment.comments || []) {
            if (subComment.reaction_id == vote.parentReactionId) {
              if (vote.type == "user") {
                subComment.user_vote = vote.vote;
              } else if (vote.type == "total") {
                subComment.upvotes = vote.vote;
              }
              return;
            }
          }
        }
      } else {
        if (vote.type == "user") {
          this.data.user_vote = vote.vote;
        } else if (vote.type == "total") {
          this.data.upvotes = vote.vote;
        }
      }
    },
    showPreview(id, title) {
      this.previewDetails.id = id;
      this.previewDetails.title = title;
      this.previewDetails.show = true;
    },
    fetchComments() {
      if (this.keepFetchingComments) {
        this.fetchingComments = true;
        axios
          .post(this.$store.state.api_host + "fetch_comments", {
            session_id: this.$store.state.session_id,
            guest_id: this.$store.state.guest_id,
            action_id: this.data.action_id,
            parent_reaction_id: null,
            fetched_comment_ids: this.data.comments.map(
              (item) => item.reaction_id
            ),
          })
          .then((response) => {
            if (response.status == 200) {
              this.data.comments.push(...response.data.comments);
              this.$nextTick(() => {
                this.initIntersectionObserver();
              });
              this.fetchingComments = false;
            } else if (response.status == 204) {
              this.keepFetchingComments = false;
              this.resetIntersectionObserver();
              this.fetchingComments = false;
            }
          })
          .catch((error) => {
            // console.log(error);
            if ([401, 419].includes(error.response.status)) {
              window.location =
                this.$store.state.login_host +
                "logout?session_id=" +
                this.$store.state.session_id;
              this.$store.state.session_id = null;
              this.$emit("logging-out");
              this.fetchingComments = false;
            } else {
              // console.log(error.response.status);
            }
          });
      }
    },
    addFetchedComments(fetchedComments) {
      let subCommentReactionId = fetchedComments[0].parent_reaction_id;
      if (subCommentReactionId) {
        this.data.comments.forEach((parentComment) => {
          if (subCommentReactionId === parentComment.reaction_id) {
            parentComment.comments.unshift(...fetchedComments);
          }
        });
      }
    },
    initIntersectionObserver() {
      this.resetIntersectionObserver();

      const commentCallback = (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.fetchComments();
          }
        });
      };

      setTimeout(() => {
        var elem = document.querySelector(
          `#comment-container-${this.data.comments.length - 4}`
        );
        if (elem) {
          this.commentObserver = new IntersectionObserver(commentCallback, {
            rootMargin: "0px",
            threshold: 0.0,
          });
          this.commentObserver.observe(elem);
        }
      }, 0);
    },
    resetIntersectionObserver() {
      if (this.commentObserver) {
        this.commentObserver.disconnect();
        this.commentObserver = null;
      }
    },
    scrollToComments() {
      var element = null;
      if (this.reactionId) {
        element = document.getElementById("comment-" + this.reactionId);
      } else if (this.$route.query.focusComments) {
        element = document.getElementById("comments-container");
      }

      if (element) {
        var topbarHeight = 50;
        var elementPosition = element.getBoundingClientRect().top;
        var offsetPosition =
          window.scrollY + elementPosition - topbarHeight - 10;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    },
    deleteItem() {
      if (window.history.length <= 2) {
        this.$router.push("/discover");
      } else {
        window.history.back();
      }
    },
    deleteComment(comment) {
      if (comment.parentReactionId) {
        for (let [index, item] of this.data.comments.entries()) {
          if (item.reaction_id == comment.parentReactionId) {
            for (let [childIndex, childItem] of this.data.comments[
              index
            ].comments.entries()) {
              if (childItem.reaction_id == comment.reactionId) {
                this.data.comments[index].comments.splice(childIndex, 1);

                this.data.comments[index].total_comments--;
                this.data.total_comments--;

                return;
              }
            }
          }
        }
      } else {
        for (let [index, item] of this.data.comments.entries()) {
          if (item.reaction_id == comment.reactionId) {
            this.data.total_comments -= (item.total_comments || 0) + 1;
            this.data.comments.splice(index, 1);

            return;
          }
        }
      }
    },
  },
};
</script>

<style scoped>
.action-details-container {
  margin-top: 66px;
  padding-bottom: 56px;
  overflow-x: hidden;
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
.na-message {
  position: fixed;
  width: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  padding: 16px;
  white-space: normal;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.6;
  letter-spacing: normal;
  color: #222222;
  font-family: "Roboto", sans-serif;
  text-align: center;
  cursor: none;
}
.comments-container-more {
  cursor: pointer;
  font-size: 12px;
  color: #8e8e8e;
}
.fetching-comments {
  position: relative;
  top: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 95%;
}
</style>