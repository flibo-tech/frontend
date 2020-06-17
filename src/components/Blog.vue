<template>
  <div class="blog-container">
    <div class="crumbslist">
      <li class="crumbslist-item">
        <a href="/">Home</a>
        <em>></em>
      </li>

      <li class="crumbslist-item">
        <a href="/blogs">Blogs</a>
        <em>></em>
      </li>
    </div>

    <h1 v-if="title" class="blog-title">
      Top {{ similar_contents.length }} awesome
      {{ is_movie ? "movies" : "shows" }} like {{ title }} that you will enjoy
      watching
    </h1>

    <div v-if="content_id" class="blog-intro">
      <div style="display:inline;">
        <img
          v-if="title"
          :src="poster.replace('/w500/', '/w342/')"
          :alt="title"
          class="content-poster"
        />
      </div>

      <div>
        <p class="blog-intro-text">
          You just finished watching {{ title }} and you can't get over how good
          this {{ is_movie ? "movie" : "show" }} was. Now you want to watch more
          of such masterpieces. We have curated a list of similar
          {{ is_movie ? "movies" : "shows" }} which are created by the likes of
          <span v-if="main_artists.length == 3"
            >{{ main_artists[0] }}, {{ main_artists[1] }} and
            {{ main_artists[2] }}</span
          >
          <span v-if="main_artists.length == 2"
            >{{ main_artists[0] }} and {{ main_artists[1] }}</span
          >
          <span v-if="main_artists.length == 1">{{ main_artists[0] }}</span>
          . Here goes the list -
        </p>

        <div class="blog-similar-content-list">
          <div v-for="(item, index) in similar_contents">
            <a :href="'#' + index"> {{ index + 1 }}. {{ item.title }} </a>
          </div>
        </div>
      </div>
    </div>

    <div v-if="similar_contents.length" class="blog-similar-contents-container">
      <div
        v-for="(item, index) in similar_contents"
        class="blog-similar-contents-item"
        :id="index"
      >
        <h2>
          <a
            target="_blank"
            :href="
              '/content/' +
                item.content_id +
                '/' +
                item.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
            "
          >
            {{ index + 1 }}. {{ item.title }}
          </a>
          <span style="font-weight: normal;font-size: 17px;">
            ({{ item.release_year }})
          </span>
        </h2>

        <p v-if="item.summary_text" class="blog-similar-content-summary">
          {{ item.summary_text }}
        </p>

        <div
          class="blog-similar-content-rating-container"
          v-if="item.imdb_score"
        >
          IMDB
          <span style="font-weight: bold;">
            {{ item.imdb_score }}
          </span>
        </div>

        <div
          v-if="
            Object.keys(where_to_watch).length &&
              where_to_watch[JSON.stringify(item.content_id)].streaming_info
          "
          class="blog-similar-content-platforms"
        >
          <div
            class="blog-similar-content-platforms-container"
            v-for="(streaming_item, streaming_index) in where_to_watch[
              JSON.stringify(item.content_id)
            ].streaming_info"
          >
            <div
              @click="goToPlatform(streaming_item)"
              class="blog-similar-content-platform-cropper"
            >
              <img
                v-bind:src="
                  'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                    streaming_index +
                    '.jpg'
                "
                class="blog-similar-content-platform-icon"
              />
            </div>
          </div>
        </div>

        <div class="blog-similar-content-cover">
          <img
            :src="item.cover.replace('/w500/', '/w780/')"
            :alt="item.title"
            style="border-radius: 10px;cursor: pointer;-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-tap-highlight-color: transparent;"
            @click="item.youtube_trailer_id ? playTrailer(index) : ''"
          />

          <img
            v-if="item.youtube_trailer_id"
            src="https://flibo-images.s3-us-west-2.amazonaws.com/other/play-white-icon.svg"
            class="blog-similar-content-trailer"
            @click="item.youtube_trailer_id ? playTrailer(index) : ''"
          />
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
          class="blog-black-background"
          v-if="play_trailer"
          @click="play_trailer = !play_trailer"
        />

        <div
          class="blog-youtube-player-header"
          style="'top: 75px;left: calc(50vw - 500px);'"
          v-if="play_trailer"
        >
          Trailer
        </div>

        <div v-if="play_trailer" class="blog-youtube-player-loader" />

        <iframe
          class="blog-youtube-player"
          style="width: 1000px;left: calc(50vw - 500px);top: 100px;height: 500px;"
          v-if="play_trailer"
          type="text/html"
          :src="
            'https://www.youtube.com/embed/' +
              similar_contents[play_trailer_index].youtube_trailer_id +
              '?autoplay=1'
          "
          frameborder="0"
          allowfullscreen
        />

        <div
          class="blog-youtube-player-streaming-box"
          v-if="
            play_trailer &&
              Object.keys(where_to_watch).length &&
              where_to_watch[
                JSON.stringify(similar_contents[play_trailer_index].content_id)
              ].streaming_info
          "
        >
          <div class="blog-tap-to-watch-text">
            {{ is_mobile ? "Tap to watch on" : "Click to watch on" }}
          </div>

          <div
            class="blog-youtube-player-platforms"
            v-if="
              where_to_watch[
                JSON.stringify(similar_contents[play_trailer_index].content_id)
              ].streaming_info
            "
          >
            <div
              class="blog-youtube-player-platforms-container"
              v-for="(item, index) in where_to_watch[
                JSON.stringify(similar_contents[play_trailer_index].content_id)
              ].streaming_info"
            >
              <div
                @click="goToPlatform(item)"
                class="blog-youtube-player-platform-cropper"
              >
                <img
                  v-bind:src="
                    'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                      index +
                      '.jpg'
                  "
                  class="blog-youtube-player-platform-icon"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";
import { mixin as onClickOutside } from "vue-on-click-outside";

export default {
  name: "App",
  mixins: [onClickOutside],
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      store: this.$store.state,
      content_name: null,
      is_movie: false,
      is_show: false,
      content_id: null,
      title: null,
      poster: null,
      main_artists: [],
      release_year: null,
      similar_contents: [],
      where_to_watch: {},
      play_trailer_index: null,
      play_trailer: false
    };
  },
  created() {
    var self = this;
    this.content_name = this.$route.params.content_name_piece
      .replace("movies-like-", "")
      .replace("shows-like-", "");
    this.is_movie = this.$route.params.content_name_piece.startsWith(
      "movies-like-"
    );
    this.is_show = this.$route.params.content_name_piece.startsWith(
      "shows-like-"
    );
    axios
      .post(self.$store.state.api_host + "similar_contents_for_blog", {
        content_name: self.content_name,
        content_type: self.is_movie ? "movie" : "tv",
        user_id: self.$store.state.user.id,
        session_id: self.$store.state.session_id,
        guest_id: self.$store.state.guest_id
      })
      .then(function(response) {
        if (response.status == 200) {
          self.content_id = response.data.content_id;
          self.title = response.data.title;
          self.poster = response.data.poster;
          self.main_artists = response.data.main_artists;
          self.release_year = response.data.release_year;
          self.similar_contents = response.data.similar_contents;

          var content_ids = [];
          var x;
          for (x in self.similar_contents) {
            content_ids.push(self.similar_contents[x].content_id);
          }
          if (self.$store.state.guest_country != null) {
            axios
              .post(
                self.$store.state.api_host + "where_to_watch_similar_content",
                {
                  content_ids: content_ids,
                  country:
                    self.$store.state.user.profile.country ||
                    self.$store.state.guest_country
                }
              )
              .then(function(response) {
                if (response.status == 200) {
                  self.where_to_watch = response.data;
                }
              });
          } else {
            setTimeout(
              axios
                .post(
                  self.$store.state.api_host + "where_to_watch_similar_content",
                  {
                    content_ids: content_ids,
                    country:
                      self.$store.state.user.profile.country ||
                      self.$store.state.guest_country
                  }
                )
                .then(function(response) {
                  if (response.status == 200) {
                    self.where_to_watch = response.data;
                  }
                }),
              500
            );
          }
        }
      })
      .catch(function(error) {
        // console.log(error);
      });
  },
  methods: {
    playTrailer(index) {
      this.play_trailer_index = index;
      this.play_trailer = true;
    },
    goToPlatform(link) {
      window.open(link);
    }
  }
};
</script>

<style lang="scss">
.blog-container {
  width: 1000px;
}
.crumbslist {
  margin-top: 15px;
  margin-bottom: 20px;
  text-align: left;
}
.crumbslist-item {
  display: inline;
  text-align: left;
}
.blog-intro {
  text-align: left;
  display: flex;
  margin-top: 15px;
}
.blog-title {
  text-align: left;
}
.content-poster {
  width: 250px;
  height: auto;
  border-radius: 7px;
}
.blog-intro-text {
  margin-left: 20px;
  font-size: 20px;
}
.blog-similar-content-list {
  margin-left: 20px;
  margin-top: 15px;
  font-size: 20px;
}
.blog-similar-contents-container {
  text-align: left;
  margin-top: 30px;
}
.blog-similar-contents-item {
  margin-bottom: 30px;
}
.blog-similar-content-summary {
  margin-top: 10px;
}
.blog-similar-content-cover {
  position: relative;
  margin-top: 10px;
}
.blog-similar-content-trailer {
  position: absolute;
  width: 75px;
  margin-left: -427.5px;
  margin-top: 182px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.blog-black-background {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  top: 0%;
  left: 0%;
  z-index: 100000;
}
.blog-youtube-player-header {
  position: fixed;
  top: 70px;
  left: 10px;
  z-index: 100001;
  white-space: initial;
  font-size: 25px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.05;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
}
.blog-youtube-player-loader {
  border: 10px solid #f3f3f3;
  border-top: 10px solid #3498db;
  border-radius: 50%;
  width: 75px;
  height: 75px;
  animation: spin 2s linear infinite;
  position: fixed;
  top: 312.5px;
  left: calc(50vw - 37.5px);
  z-index: 100000;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.blog-youtube-player {
  position: fixed;
  width: 100vw;
  height: 56.25vw;
  top: calc(50vh - 28.125vw - 20vh);
  left: 0;
  z-index: 100001;
}
.blog-similar-content-platforms {
  display: inline-flex;
  overflow-x: scroll;
  width: 100%;
  white-space: nowrap;
  margin-top: 5px;
}
.blog-similar-content-platform-cropper {
  width: 40px;
  height: 40px;
  margin-left: 0%;
  position: relative;
  overflow: hidden;
  border-radius: 7px;
}
.blog-similar-content-platform-icon {
  width: 100%;
}
.blog-similar-content-platforms-container {
  display: inline-block;
  vertical-align: top;
  text-align: center;
  margin-right: 10px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
::-webkit-scrollbar {
  display: none;
}
.blog-similar-content-rating-container {
  position: relative;
  display: inline-block;
  margin-top: 5px;
  font-size: 14px;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  border-radius: 4px;
  background-color: #f2f2f2;
  padding: 1px 5px;
}
.blog-youtube-player-platforms {
  display: inline-flex;
  overflow: scroll;
  max-width: 100%;
}
.blog-youtube-player-platform-cropper {
  width: 50px;
  height: 50px;
  position: relative;
  overflow: hidden;
  border-radius: 20%;
}
.blog-youtube-player-platform-icon {
  display: inline-block;
  position: absolute;
  width: 100%;
  margin-left: -50%;
}
.blog-youtube-player-platforms-container {
  display: inline-block;
  vertical-align: top;
  text-align: center;
  margin: 20px 10px 0px 10px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.blog-tap-to-watch-text {
  white-space: nowrap;
  font-size: 20px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.05;
  letter-spacing: normal;
  text-align: center;
  color: #333333;
}
.blog-youtube-player-streaming-box {
  position: fixed;
  top: 650px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100001;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 10px;
  max-width: 95vw;
}
</style>
