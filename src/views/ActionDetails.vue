<template>
  <div style="padding: 100px 0">
    <TextView
      v-if="description"
      :text="description"
      :parent="actionType + '_details'"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import axios from "axios";
import TextView from "./../components/molecular/TextView";

export default {
  name: "ActionDetails",
  components: { TextView },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
      actionType: null,
      actionId: null,
      reactionId: null,
      description: null,
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
            })
            .then((response) => (self.description = response.data.text))
            .catch(function (error) {
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
        })
        .then((response) => (self.description = response.data.text))
        .catch(function (error) {
          // console.log(error);
        });
    }
  },
};
</script>

<style>
</style>