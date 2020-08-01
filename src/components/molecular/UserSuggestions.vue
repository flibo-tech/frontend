<template>
  <div
    class="user-suggestions-container"
    :style="
      is_mobile
        ? ''
        : 'width: 950px;margin-left: 50%;transform: translateX(-50%);'
    "
  >
    <p>
      Suggested for you
    </p>

    <div class="user-suggestions">
      <SuggestedUser
        v-for="(user, index) in store.suggestions.users_suggestions"
        :key="index"
        :userId="user.user_id"
        :userName="user.user_name"
        :image="user.user_picture"
        :basis="user.type"
        :mutual="user.mutual_friends"
        :userType="user.friend_type"
        :index="index"
        v-on="$listeners"
      />
    </div>
  </div>
</template>

<script>
import SuggestedUser from "./../atomic/SuggestedUser";

export default {
  name: "app",
  components: {
    SuggestedUser,
  },
  data() {
    return {
      store: this.$store.state,
      is_mobile: window.screen.height > window.screen.width,
    };
  },
};
</script>

<style scoped>
.user-suggestions-container {
  position: relative;
  text-align: left;
  white-space: nowrap;
  background-color: #fafafa;
  padding: 16px;
}
.user-suggestions-container p {
  position: relative;
  font-size: 14px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  white-space: normal;
}
.user-suggestions {
  margin-top: 16px;
  overflow-x: scroll;
  display: flex;
  text-align: center;
}
::-webkit-scrollbar {
  display: none;
}
</style>