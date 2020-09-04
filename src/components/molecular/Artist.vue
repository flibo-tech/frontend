<template>
  <div class="main-container">
    <div @click="quickView">
      <Person :image="image" :width="width" :height="height" :name="name" />
    </div>

    <div v-if="quickViewEnabled" class="quickview">
      <div class="view-header">
        <h2 v-if="!artistData">
          Fetching more content by
          <span>{{ name.split(" ")[0] }}...</span>
        </h2>

        <h2 v-if="artistData && artistData.length > 1">
          More by
          <span>{{ name.split(" ")[0] }}...</span>
        </h2>

        <h2 v-if="artistData && artistData.length == 1">
          Oops...could not find any more content.
        </h2>

        <Button
          buttonType="iconOnly"
          icon="cross"
          v-on:clicked="quickViewEnabled = false"
          :size="24"
        />
      </div>

      <div class="poster-container" v-if="artistData && artistData.length > 1">
        <Poster
          v-for="movie in filteredMovies"
          :key="movie.index"
          class="poster"
          :containerWidth="125"
          :contentId="movie.content_id"
          :image="movie.poster"
          :title="movie.title"
          :showTrailer="false"
          :whereToWatch="movie.where_to_watch"
          :userPlatforms="
            store.user.id ? store.user.profile.platforms || [''] : ['']
          "
          :showName="true"
          :parent="parent"
          posterLocation="more_by_artist"
          v-on="$listeners"
        />
      </div>
    </div>

    <div
      class="modal-bg"
      v-if="quickViewEnabled"
      @click="quickViewEnabled = false"
    ></div>
  </div>
</template>

<script>
import axios from "axios";
import Person from "./../atomic/Person";
import Poster from "./Poster";
import Button from "./../atomic/Button";

export default {
  name: "Artist",
  props: {
    artistId: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    credit_category: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    skipContentId: {
      type: Number,
      required: false,
      default: -1,
    },
    parent: {
      type: String,
      required: true,
    },
  },
  components: { Person, Poster, Button },
  data() {
    return {
      store: this.$store.state,
      quickViewEnabled: false,
      artistData: null,
    };
  },

  methods: {
    quickView() {
      var self = this;
      this.quickViewEnabled = !this.quickViewEnabled;
      if (self.parent == "content_page") {
        this.$emit("close-tap-instructions");
      }

      axios
        .post(this.$store.state.api_host + "more_by_artist", {
          session_id: this.$store.state.session_id,
          artist_id: this.artistId,
          credit_category: this.credit_category,
          country:
            this.$store.state.user.profile.country ||
            this.$store.state.guest_country,
          guest_id: this.$store.state.guest_id,
        })
        .then(
          (response) => (
            (this.artistData = response.data.contents),
            (self.fetching_more = false)
          )
        )
        .catch(function (error) {
          console.log(error);
        });

      self.$store.state.content_page.never_tapped_any_artist = false;
      if (
        self.$store.state.session_id &&
        self.$store.state.content_page.never_tapped_any_artist &&
        self.parent == "content_page"
      ) {
        axios
          .post(self.$store.state.api_host + "update_profile", {
            session_id: self.$store.state.session_id,
            never_tapped_any_artist: false,
          })
          .then(function (response) {
            if ([200].includes(response.status)) {
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
      }
    },
  },
  computed: {
    filteredMovies() {
      return this.artistData.filter(
        (el) => el.content_id != this.skipContentId
      );
    },
  },
};
</script>

<style scoped>
* {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  color: #333;
  text-align: left;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.poster-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  overflow: scroll;
  margin-top: 10px;
}
.poster-container::-webkit-scrollbar {
  display: none;
}
.quickview {
  position: fixed;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  background-color: white;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  color: black;
  width: 90vw;
  z-index: 100001;
  animation: 0.2s ease-out 0s 1 load;
}
@keyframes load {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.quickview .poster {
  margin-right: 16px;
}
.modal-bg {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  top: 0%;
  left: 0%;
  z-index: 100000;
  animation: 0.2s ease-out 0s 1 load;
}

h2 {
  font-weight: 300;
}
span {
  font-weight: 900;
}
</style>