<template>
  <div class="comment-comp-container">
    <div class="comment-comp-view">
      <div class="comment-comp-current">
        <img
          @click="showPreview = true"
          class="comment-comp-profile"
          :src="currentComment.creator_picture"
        />
        <div class="comment-comp-content">
          <p>
            <strong @click="showPreview = true">{{
              currentComment.creator_name
            }}</strong>
            <TextView
              class="custom"
              v-if="currentComment.comment"
              :text="currentComment.comment"
              :parent="parent + '__comment' + (isChild ? '__child' : '')"
              v-on="$listeners"
            />
          </p>

          <div class="comment-comp-reaction">
            <TimeSince :timestamp="currentComment.created_at" :short="true" />
            <Vote
              class="comment-comp-vote"
              :actionId="currentComment.action_id"
              :parentReactionId="currentComment.reaction_id"
              :totalVote="currentComment.upvotes"
              :creatorId="currentComment.creator_id"
              :userVote="currentComment.user_vote"
              :fontSize="12"
              v-on:updateUserVote="voteHandler"
              v-on:updateTotalVote="totalVoteHandler"
            />
            <p class="comment-comp-reply" @click="reply">Reply</p>
          </div>
          <div
            @click="[(showMore = true), fetchComments()]"
            class="comment-comp-more"
            v-if="
              currentComment.total_comments > fetchedCommentsIds.length &&
              currentComment.total_comments &&
              statusCode != 204
            "
          >
            <div
              v-if="!fetchingData"
              class="comment-comp-horizontal-divider"
            ></div>
            <p
              v-if="
                (fetchedCommentsIds.length == 0 || !showMore) && !fetchingData
              "
            >
              {{ currentComment.total_comments }}
              replies
            </p>
            <p v-if="fetchedCommentsIds.length > 0 && !fetchingData">
              previous
              {{ currentComment.total_comments - fetchedCommentsIds.length }}
              replies
            </p>
            <p class="comment-comp-loading" v-if="fetchingData">Loading...</p>
          </div>
        </div>
      </div>
    </div>
    <transition name="comment">
      <div v-if="showMore && subComments" class="comment-comp-sub-comment">
        <div @click="resetValues" class="comment-comp-divider-container">
          <div class="comment-comp-vertical-divider"></div>
        </div>
        <div>
          <transition-group name="solo-comments">
            <Comment
              @reply="forward"
              :currentComment="comment"
              :isChild="true"
              :parent="parent"
              v-for="comment in subComments.slice().reverse()"
              :key="comment.reaction_id"
            />
          </transition-group>
        </div>
      </div>
    </transition>
    <UserPreview
      v-if="showPreview"
      :id="currentComment.creator_id"
      :name="currentComment.creator_name"
      :parent="parent + '__comment' + (isChild ? '__child' : '')"
      @close-preview="showPreview = false"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import axios from "axios";
import UserPreview from "./UserPreview";
import TextView from "./TextView";
import Vote from "./../atomic/Vote";
import TimeSince from "./../atomic/TimeSince";
export default {
  name: "Comment",
  components: { TextView, Vote, UserPreview, TimeSince },
  props: {
    currentComment: {
      type: Object,
      required: true,
    },
    isChild: {
      type: Boolean,
      required: false,
      default: true,
    },
    parent: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showMore: false,
      showPreview: false,
      subComments: [],
      fetchedCommentsIds: [],
      fetchingData: false,
      statusCode: null,
    };
  },
  mounted() {
    if (Object.keys(this.currentComment.comments).length) {
      this.subComments = this.currentComment.comments;
      this.subComments.forEach((comment) => {
        this.fetchedCommentsIds.push(comment.reaction_id);
      });
      this.showMore = true;
    }
  },
  methods: {
    fetchComments() {
      this.fetchingData = true;
      axios
        .post(this.$store.state.api_host + "fetch_comments", {
          session_id: this.$store.state.session_id,
          guest_id: null,
          action_id: this.currentComment.action_id,
          parent_reaction_id: this.currentComment.reaction_id,
          fetched_comment_ids: this.fetchedCommentsIds,
        })
        .then((response) => {
          if (response.status == 200) {
            response.data.comments.forEach((comment) => {
              this.fetchedCommentsIds.push(comment.reaction_id);
              this.subComments.push(comment);
            });
            this.fetchingData = false;
          } else if (response.status == 204) {
            this.statusCode = response.status;
            this.fetchingData = false;
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
            this.fetchingData = false;
          } else {
            // console.log(error.response.status);
          }
        });
    },
    reply() {
      if (!this.isChild) {
        this.$emit("reply", {
          creator_id: this.currentComment.creator_id,
          creator_name: this.currentComment.creator_name,
          reaction_id: this.currentComment.reaction_id,
        });
      } else {
        this.$emit("reply", {
          creator_id: this.currentComment.creator_id,
          creator_name: this.currentComment.creator_name,
          reaction_id: this.currentComment.parent_reaction_id,
        });
      }
    },
    forward(subCommentReply) {
      this.$emit("reply", subCommentReply);
    },
    voteHandler(currentUserVote) {
      this.currentComment.user_vote = currentUserVote;
    },
    totalVoteHandler(currentTotalVote) {
      this.currentComment.upvotes = currentTotalVote;
    },
    resetValues() {
      this.showMore = false;
      this.subComments = [];
      this.fetchedCommentsIds = [];
      this.statusCode = null;
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}

.comment-comp-profile {
  cursor: pointer;
  margin-right: 0.7em;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}

.comment-comp-content {
  margin: 0;
  display: flex;
  flex-flow: column nowrap;
}

.comment-comp-content p {
  margin: 0;
}

.comment-comp-vote {
  margin: 0.5em;
  min-width: 85px;
}

.comment-comp-current {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  margin-bottom: 1em;
}

.comment-comp-reaction {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.comment-comp-reaction * {
  margin-right: 1em;
}

.comment-comp-reaction p {
  cursor: pointer;
  font-size: 12px;
}

.custom {
  display: inline;
}

.comment-comp-more {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.comment-comp-more p {
  font-size: 12px;
  color: #8e8e8e;
  margin-left: 1em;
}

.comment-comp-horizontal-divider {
  height: 1px;
  background-color: #d1d1d1;
  width: 40px;
}

.comment-enter-active,
.comment-leave-active {
  transition: all 0.3s ease;
}
.comment-enter,
.comment-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

.comment-comp-vertical-divider {
  width: 1px;
  height: calc(100% - 2em);
  background-color: #d1d1d1;
  opacity: 0.25;
}

.comment-comp-sub-comment {
  display: flex;
  justify-content: stretch;
}

.comment-comp-content > p > strong {
  font-size: 14px;
  cursor: pointer;
  margin-right: 0.6em;
}
.comment-comp-divider-container {
  cursor: pointer;
  display: flex;
  justify-content: center;
  flex: 0 0 40px;
  margin-right: 0.6em;
}

.comment-comp-reply {
  font-size: 12px;
  color: #8e8e8e;
}

.comment-comp-loading {
  color: #8e8e8e;
  font-size: 12px;
  margin-left: 51px;
}

.solo-comments-enter-active,
.solo-comments-leave-active {
  transition: all 0.3s ease;
}
.solo-comments-enter,
.solo-comments-leave-to {
  transform: translateX(30px);
  opacity: 0;
}
.comment-comp-container {
  text-align: left;
}
</style>