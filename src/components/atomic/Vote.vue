<template>
  <div class="main-container">
    <svg
      @click="upvoteHandler"
      class="upvote"
      :style="[
        localUserVote > 0 ? { fill: '#7352FF' } : {},
        creatorIdMatch ? { opacity: 0.2 } : {},
        { minWidth: '24px' },
      ]"
      xmlns="http://www.w3.org/2000/svg"
      height="30"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M6.1,16.5l5.9-5.9l5.9,5.9l1.8-1.8L12,6.9l-7.7,7.7L6.1,16.5z" />
    </svg>

    <p :style="{ fontSize: fontSize + 'px' }">{{ finalVote }}</p>

    <svg
      :style="[
        localUserVote < 0 ? { fill: '#7352FF' } : {},
        creatorIdMatch ? { opacity: 0.2 } : {},
        { minWidth: '24px' },
      ]"
      @click="downvoteHandler"
      class="downvote"
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 0 24 24"
      width="24"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M6.1,16.5l5.9-5.9l5.9,5.9l1.8-1.8L12,6.9l-7.7,7.7L6.1,16.5z" />
    </svg>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Vote",
  props: {
    actionId: {
      type: Number,
      required: true,
    },
    parentReactionId: {
      type: Number,
      required: false,
      default: null,
    },
    totalVote: {
      required: true,
    },
    userVote: {
      type: Number,
      required: true,
    },
    creatorId: {
      type: Number,
      required: true,
    },
    fontSize: {
      type: Number,
      required: false,
      default: 14,
    },
  },
  data() {
    return {
      localTotalVote: this.totalVote,
      localUserVote: this.userVote,
      creatorIdMatch: this.creatorId === this.$store.state.user.id,
    };
  },
  computed: {
    finalVote() {
      if (this.localTotalVote < 1000) {
        if (
          (this.localTotalVote === 0 || this.localTotalVote === null) &&
          this.localUserVote === 0 &&
          !this.creatorIdMatch
        ) {
          return "Vote";
        }
        return this.localTotalVote || 0;
      } else return this.kFormatter(this.localTotalVote);
    },
  },
  watch: {
    userVote: {
      handler(val) {
        this.localUserVote = val;
      },
    },
    totalVote: {
      handler(val) {
        this.localTotalVote = val;
      },
    },
  },
  methods: {
    kFormatter(num) {
      return Math.abs(num) > 999
        ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "k"
        : Math.sign(num) * Math.abs(num);
    },
    upvoteHandler() {
      if (this.creatorIdMatch) {
        return;
      } else if (!this.$store.state.session_id) {
        this.$store.state.prompt_signup = true;
        return;
      }

      if (this.localUserVote === 1) {
        this.localUserVote--;
        this.localTotalVote--;
      } else if (this.localUserVote < 0) {
        this.localTotalVote += 2;
        this.localUserVote += 2;
      } else {
        this.localTotalVote++;
        this.localUserVote++;
      }

      this.submitVote(this.localUserVote);
    },
    downvoteHandler() {
      if (this.creatorIdMatch) {
        return;
      } else if (!this.$store.state.session_id) {
        this.$store.state.prompt_signup = true;
        return;
      }

      if (this.localUserVote === -1) {
        this.localUserVote++;
        this.localTotalVote++;
      } else if (this.localUserVote > 0) {
        this.localTotalVote -= 2;
        this.localUserVote -= 2;
      } else {
        this.localTotalVote--;
        this.localUserVote--;
      }
      this.submitVote(this.localUserVote);
    },
    submitVote() {
      var prevUserVote = this.userVote;
      var prevTotalVote = this.totalVote;

      this.$emit("update-user-vote", this.localUserVote);
      this.$emit("update-total-vote", this.localTotalVote);
      axios
        .post(this.$store.state.api_host + "vote", {
          session_id: this.$store.state.session_id,
          action_id: this.actionId,
          parent_reaction_id: this.parentReactionId,
          vote: this.localUserVote,
        })
        .then((response) => {
          if (response.status == 200) {
            // console.log(response);
          }
          if (response.status != 200) {
            this.$emit("update-user-vote", prevUserVote);
            this.$emit("update-total-vote", prevTotalVote);
          }
        })
        .catch((error) => {
          this.$emit("update-user-vote", prevUserVote);
          this.$emit("update-total-vote", prevTotalVote);
          // console.log(error);
          if (
            [401, 419].includes(error.response.status) &&
            this.$store.state.session_id
          ) {
            window.location =
              this.$store.state.login_host +
              "logout?session_id=" +
              this.$store.state.session_id;
            this.$store.state.session_id = null;
            this.$emit("logging-out");
          } else {
            // console.log(error.response.status);
          }
        });
    },
  },
};
</script>

<style scoped>
* {
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.main-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.upvote,
.downvote {
  fill: #8e8e8e;
  border-radius: 50%;
  transition: 0.2s ease-in-out;
}

.downvote {
  transform: rotateZ(180deg);
}
svg {
  cursor: pointer;
}

p {
  margin: 0;
  padding: 0;
}
</style>