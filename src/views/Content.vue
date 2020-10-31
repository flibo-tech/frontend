<template>
  <div id="content" class="content-box">
    <div v-if="!loading && content.data != null">
      <div class="content-cover">
        <ContentCoverLandscape
          v-if="showCover"
          :imageUrl="content.data.cover"
        />

        <ContentCoverPortrait v-else :imageUrl="content.data.poster" />

        <Trailer
          v-if="showTrailorIcon"
          class="cover-trailer"
          :style="
            is_mobile
              ? ''
              : 'margin-left: calc(50% - 40px);margin-top: calc(-30vh - 40px - 20px);'
          "
          ref="coverTrailer"
          :size="80"
          parent="content_page"
          :contentId="content.content_id"
          :trailerId="content.data.youtube_trailer_id"
          :whereToWatch="content.data.where_to_watch"
          @trailer-toggled="updateZIndex"
          v-on="$listeners"
        />
      </div>

      <div class="content-below-cover">
        <div class="title">
          <div style="display: flex">
            <p style="position: relative; font-weight: bold; font-size: 24px">
              {{ content.data.title }}
            </p>

            <Button
              style="
                transform: rotate(22deg);
                margin-top: -4px;
                margin-left: 16px;
              "
              icon="send_outline"
              buttonType="iconOnly"
              :size="25"
              @clicked="prompt_content_share = true"
            />
          </div>

          <p
            style="color: #676767; font-size: 14px; font-weight: normal"
            v-if="content.data.type == 'tv'"
          >
            {{ content.data.release_year }}-{{
              content.data.end_year ? content.data.end_year : "Present"
            }}
          </p>

          <p
            style="color: #676767; font-size: 14px; font-weight: normal"
            v-if="content.data.type == 'movie'"
          >
            {{ content.data.release_year }}
          </p>

          <div class="user-rating-watchlist-container">
            <UserRating
              class="user-rating-container"
              :rating="content.data.rating"
              :iconSize="25"
              @update-rating="submitRating"
            />

            <div class="watchlist-continer" @click="addToWatchlist">
              {{
                content.data.watch_later
                  ? "ADDED"
                  : "ADD&nbsp;TO&nbsp;WATCHLIST"
              }}
              <button
                v-bind:class="[
                  content.data.watch_later
                    ? 'watchlist-true'
                    : 'watchlist-false',
                ]"
              />
            </div>
          </div>

          <p
            class="summary-text"
            :style="is_mobile ? '' : 'font-size: 15px;'"
            v-if="content.data.summary_text"
          >
            {{ content.data.summary_text }}
          </p>

          <div class="info-container">
            <ContentMetaBlock
              class="info-item"
              v-if="content.data.imdb_score"
              :text="'IMDb ' + content.data.imdb_score"
            />

            <ContentMetaBlock
              class="info-item"
              v-if="content.data.tomato_meter"
              :text="'Tomatometer ' + content.data.tomato_meter"
            />

            <ContentMetaBlock
              class="info-item"
              v-for="(genre, index) in content.data.genres"
              :key="index"
              :text="genre"
            />

            <ContentMetaBlock
              class="info-item"
              v-if="content.data.type == 'tv' && content.data.seasons"
              :text="
                content.data.seasons +
                ' ' +
                (content.data.seasons > 1 ? 'Seasons' : 'Season')
              "
            />

            <ContentMetaBlock
              class="info-item"
              v-if="content.data.type == 'tv' && content.data.episodes"
              :text="
                content.data.episodes +
                ' ' +
                (content.data.episodes > 1 ? 'Episodes' : 'Episode')
              "
            />

            <ContentMetaBlock
              class="info-item"
              v-if="content.data.type == 'tv' && content.data.runtime"
              :text="
                content.data.runtime +
                ' ' +
                (content.data.episodes ? 'Each' : 'Each Episode')
              "
            />

            <ContentMetaBlock
              class="info-item"
              v-if="content.data.type == 'movie'"
              :text="content.data.runtime"
            />
          </div>

          <div
            class="platforms"
            :style="is_mobile ? '' : 'margin-top: 10px;'"
            v-if="Object.keys(whereToWatchOptions).length"
          >
            <div
              class="platforms-container"
              v-for="(item, index) in whereToWatchOptions"
              :key="index"
            >
              <div
                @click="goToPlatform(item, content.content_id, 'on_page')"
                class="platform-cropper"
                :style="
                  is_mobile
                    ? ''
                    : 'width: 50px;height: 50px;border-radius: 10px;'
                "
              >
                <img
                  v-bind:src="
                    'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                    index +
                    '.jpg'
                  "
                  class="platform-icon"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          class="similar-content-box"
          v-if="
            content.similar_content != null && content.similar_content.length
          "
        >
          <div
            class="category"
            :style="
              is_mobile
                ? 'margin-top: 30%;'
                : 'margin-left: 10px;font-size: 15px;margin-top: 180px;'
            "
          >
            Similar
          </div>
          <div class="similar-content">
            <Poster
              v-for="(item, index) in content.similar_content"
              :key="index"
              class="content-container"
              :containerWidth="125"
              :contentId="item.content_id"
              :title="item.title"
              :image="item.poster"
              :showTrailer="false"
              :whereToWatch="item.where_to_watch"
              :userPlatforms="
                store.user.id ? store.user.profile.platforms || [''] : ['']
              "
              :showName="true"
              parent="content_page"
              posterLocation="similar"
              v-on="$listeners"
            />

            <div
              v-if="!content.similar_content"
              style="margin-top: 8%; margin-left: 3%; font-size: 4vw"
            >
              Oops...Could not find any similar content.
            </div>
          </div>
        </div>

        <div
          v-if="posts.length"
          class="posts-box"
          :style="is_mobile ? '' : 'width: auto;'"
        >
          <div
            class="category"
            :style="
              is_mobile
                ? 'margin-top: 27%;'
                : 'margin-left: 10px;font-size: 15px;margin-top: 170px;'
            "
          >
            Posts
          </div>

          <div class="artists" style="padding: 8px; margin-top: 0">
            <PostPreview
              v-for="(post, index) in posts"
              :key="index"
              style="margin-right: 16px"
              :post="post"
            />

            <Button
              v-if="totalPosts > 10"
              class="content-posts-show-all"
              :style="is_mobile ? '' : 'margin-top: 112.5px'"
              id="content-show-all"
              buttonType="secondary"
              text="Show All"
              @clicked="goToContentPosts"
            />
          </div>
        </div>

        <div
          class="friends-rating-box"
          :style="is_mobile ? '' : 'width: auto;'"
          v-if="friends_ratings.length"
        >
          <div
            class="category"
            :style="
              is_mobile
                ? 'margin-top: 23%;'
                : 'margin-left: 10px;font-size: 15px;margin-top: 145px;'
            "
          >
            Connections
          </div>
          <div class="artists" style="padding: 0px 10px; margin-top: 0">
            <div
              v-for="(friend, index) in friends_ratings"
              :key="index"
              class="artists-container"
              @click="clickUser(friend.user_id, friend.name)"
            >
              <!-- margins in class friend-rating-icon are dependent on following ImageCard component's size -->
              <Button
                class="friend-rating-icon"
                style="background-color: #fff"
                :icon="
                  friend.rating == 3
                    ? 'love'
                    : friend.rating == 2
                    ? 'thumbs_up'
                    : 'thumbs_down'
                "
                buttonType="iconOnly"
                :size="16"
                :state="true"
                :disabled="true"
              />

              <ImageCard
                :name="friend.name"
                :image="friend.picture"
                :width="55"
                :height="70"
                :spacing="10"
                :scale="true"
                v-on="$listeners"
              />
            </div>
          </div>
        </div>

        <div
          class="artists-box"
          v-if="
            content.crew != null &&
            (content.crew.directed_by.length ||
              content.crew.cast.length ||
              content.crew.writing_credits.length)
          "
        >
          <div
            class="category"
            :style="
              is_mobile
                ? 'margin-top: 24%'
                : 'margin-left: 10px;font-size: 15px;margin-top: 145px;'
            "
            v-if="content.crew.directed_by.length"
          >
            Direction
          </div>
          <div class="artists" v-if="content.crew.directed_by.length">
            <Artist
              v-for="(artist, index) in content.crew.directed_by"
              :key="index"
              class="artists-container"
              :artistId="artist.person_id"
              :name="artist.person"
              :image="artist.profile_photo"
              credit_category="directed_by"
              :width="55"
              :height="70"
              :skipContentId="content.content_id"
              parent="content_page"
              @close-tap-instructions="show_tap_instructions = false"
              v-on="$listeners"
            />
          </div>

          <div
            class="category"
            :style="
              is_mobile
                ? ''
                : 'margin-left: 10px;font-size: 15px;margin-top: 145px;'
            "
            v-if="content.crew.cast.length"
          >
            Cast
          </div>
          <div class="artists" v-if="content.crew.cast.length">
            <Artist
              v-for="(artist, index) in content.crew.cast"
              :key="index"
              class="artists-container"
              :artistId="artist.person_id"
              :name="artist.person"
              :image="artist.profile_photo"
              credit_category="cast"
              :width="55"
              :height="70"
              :skipContentId="content.content_id"
              parent="content_page"
              @close-tap-instructions="show_tap_instructions = false"
              v-on="$listeners"
            />
          </div>

          <div
            class="category"
            :style="
              is_mobile
                ? ''
                : 'margin-left: 10px;font-size: 15px;margin-top: 145px;'
            "
            v-if="content.crew.writing_credits.length"
          >
            Writing
          </div>
          <div class="artists" v-if="content.crew.writing_credits.length">
            <Artist
              v-for="(artist, index) in content.crew.writing_credits"
              :key="index"
              class="artists-container"
              :artistId="artist.person_id"
              :name="artist.person"
              :image="artist.profile_photo"
              credit_category="writing_credits"
              :width="55"
              :height="70"
              :skipContentId="content.content_id"
              parent="content_page"
              @close-tap-instructions="show_tap_instructions = false"
              v-on="$listeners"
            />
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
          class="black-background"
          :style="
            is_mobile
              ? 'height: calc(100vh - 370px - 3.5% - 20px);'
              : 'height: calc(100vh - 470px);'
          "
          v-if="show_tap_instructions"
        />

        <div
          :class="
            is_mobile
              ? 'close-tap-instruction'
              : 'desktop-close-tap-instruction'
          "
          v-if="show_tap_instructions"
          @click="closeTapInstruction"
        />

        <div
          class="artist-tap-instructions"
          style="
            top: calc(50vh - 193px - 3.5%);
            left: 50%;
            transform: translateX(-50%);
            font-size: 25px;
          "
          v-if="show_tap_instructions"
        >
          {{ is_mobile ? "Tap on any artist" : "Click on any artist" }}
        </div>
      </div>
    </transition>

    <div v-if="loading" class="content-page-fetching">
      <div class="sk-folding-cube">
        <div class="sk-cube1 sk-cube"></div>
        <div class="sk-cube2 sk-cube"></div>
        <div class="sk-cube4 sk-cube"></div>
        <div class="sk-cube3 sk-cube"></div>
      </div>
      <br />
      <div class="quote-font">
        {{ store.quotes[Math.floor(Math.random() * 15)] }}
      </div>
    </div>

    <SharePrompt
      v-if="prompt_content_share"
      parent="content"
      :url="'https://' + store.hostName + $route.fullPath"
      :contentId="store.content_page.content_id"
      :contentTitle="content.data.title"
      @close-share-prompt="prompt_content_share = false"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import axios from "axios";
import { mixin as onClickOutside } from "vue-on-click-outside";
import ContentCoverLandscape from "./../components/atomic/ContentCoverLandscape";
import ContentCoverPortrait from "./../components/atomic/ContentCoverPortrait";
import Trailer from "./../components/atomic/Trailer";
import ContentMetaBlock from "./../components/atomic/ContentMetaBlock";
import ImageCard from "./../components/atomic/ImageCard";
import Button from "./../components/atomic/Button";
import Poster from "./../components/molecular/Poster";
import Artist from "./../components/molecular/Artist";
import UserRating from "./../components/molecular/UserRating";
import SharePrompt from "./../components/atomic/SharePrompt";
import PostPreview from "./../components/molecular/PostPreview";

export default {
  name: "App",
  mixins: [onClickOutside],
  components: {
    ContentCoverLandscape,
    ContentCoverPortrait,
    Trailer,
    ContentMetaBlock,
    ImageCard,
    Poster,
    Artist,
    UserRating,
    Button,
    SharePrompt,
    PostPreview,
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      tab_name: "Artists",
      content: this.$store.state.content_page,
      get_content_by_artist: false,
      window_width: window.innerWidth,
      fetching_more: false,
      where_to_watch: null,
      show_tap_instructions: false,
      loading: true,
      prompt_content_share: false,
      store: this.$store.state,
      share_item: "poster",
      friends_ratings: [],
      posts: [],
      totalPosts: 0,
    };
  },

  created() {
    var self = this;
    this.$store.state.current_path = this.$route.path;
    this.$store.state.content_page.content_id = parseInt(
      this.$route.params.content_id
    );
    this.$store.state.content_page.data = null;
    this.$store.state.content_page.crew = null;
    this.$store.state.content_page.more_by_artist = [];
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
            .post(self.$store.state.api_host + "content_page", {
              session_id: self.$store.state.session_id,
              content_id: self.$store.state.content_page.content_id,
              origin: self.$store.state.content_page.origin,
              country: self.store.guest_country,
              guest_id: self.$store.state.guest_id,
            })
            .then(
              (response) =>
                (self.$store.state.content_page.data = response.data.contents)
            )
            .catch(function (error) {
              // console.log(error);
            });

          axios
            .post(self.$store.state.api_host + "similar_content", {
              session_id: self.$store.state.session_id,
              content_id: self.$store.state.content_page.content_id,
              country: self.store.guest_country,
            })
            .then(function (response) {
              if (response.status == 200) {
                self.$store.state.content_page.similar_content =
                  response.data.contents;
              } else if (response.status == 204) {
                self.$store.state.content_page.similar_content = [];
              }
            })
            .catch(function (error) {
              // console.log(error);
            });

          self.fetchPosts();
        });
    } else {
      axios
        .post(this.$store.state.api_host + "content_page", {
          session_id: this.$store.state.session_id,
          content_id: this.$store.state.content_page.content_id,
          origin: this.$store.state.content_page.origin,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
          guest_id: self.$store.state.guest_id,
        })
        .then(
          (response) =>
            (self.$store.state.content_page.data = response.data.contents)
        )
        .catch(function (error) {
          // console.log(error);
        });

      axios
        .post(this.$store.state.api_host + "similar_content", {
          session_id: this.$store.state.session_id,
          content_id: this.$store.state.content_page.content_id,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
        })
        .then(function (response) {
          if (response.status == 200) {
            self.$store.state.content_page.similar_content =
              response.data.contents;
          } else if (response.status == 204) {
            self.$store.state.content_page.similar_content = [];
          }
        })
        .catch(function (error) {
          // console.log(error);
        });

      this.fetchPosts();
    }

    axios
      .post(this.$store.state.api_host + "cast_n_crew", {
        session_id: this.$store.state.session_id,
        content_id: this.$store.state.content_page.content_id,
      })
      .then(
        (response) => (
          (self.$store.state.content_page.crew = response.data.cast_n_crew),
          (self.loading = false)
        )
      )
      .catch(function (error) {
        // console.log(error);
        self.loading = false;
      });

    axios
      .post(this.$store.state.api_host + "friends_content_ratings", {
        session_id: this.$store.state.session_id,
        content_id: this.$store.state.content_page.content_id,
      })
      .then(function (response) {
        if (response.status == 200) {
          self.friends_ratings = response.data.friends_ratings;
        } else {
          // console.log(response.status);
        }
      })
      .catch(function (error) {
        // console.log(error);
      });
  },
  mounted() {
    window.addEventListener("scroll", this.promptTapOnArtist);
  },
  methods: {
    reRender() {
      var self = this;
      self.loading = true;
      this.$store.state.current_path = this.$route.path;
      this.$store.state.content_page.content_id = parseInt(
        this.$route.params.content_id
      );
      this.$store.state.content_page.data = null;
      this.$store.state.content_page.crew = null;
      this.$store.state.content_page.more_by_artist = [];
      this.friends_ratings = [];
      this.posts = [];
      axios
        .post(this.$store.state.api_host + "content_page", {
          session_id: this.$store.state.session_id,
          content_id: this.$store.state.content_page.content_id,
          origin: this.$store.state.content_page.origin,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
          guest_id: self.$store.state.guest_id,
        })
        .then(
          (response) =>
            (self.$store.state.content_page.data = response.data.contents)
        )
        .catch(function (error) {
          // console.log(error);
        });

      axios
        .post(this.$store.state.api_host + "cast_n_crew", {
          session_id: this.$store.state.session_id,
          content_id: this.$store.state.content_page.content_id,
        })
        .then(
          (response) => (
            (self.$store.state.content_page.crew = response.data.cast_n_crew),
            (self.loading = false),
            (self.$store.state.content_page.rerender = false)
          )
        )
        .catch(function (error) {
          // console.log(error);
          self.loading = false;
        });
      axios
        .post(this.$store.state.api_host + "similar_content", {
          session_id: this.$store.state.session_id,
          content_id: this.$store.state.content_page.content_id,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
        })
        .then(function (response) {
          if (response.status == 200) {
            self.$store.state.content_page.similar_content =
              response.data.contents;
          } else if (response.status == 204) {
            self.$store.state.content_page.similar_content = [];
          }
        })
        .catch(function (error) {
          // console.log(error);
        });
      axios
        .post(this.$store.state.api_host + "friends_content_ratings", {
          session_id: this.$store.state.session_id,
          content_id: this.$store.state.content_page.content_id,
        })
        .then(function (response) {
          if (response.status == 200) {
            self.friends_ratings = response.data.friends_ratings;
          } else {
            // console.log(response.status);
          }
        })
        .catch(function (error) {
          // console.log(error);
        });
      this.fetchPosts();
    },
    promptTapOnArtist() {
      var scroll_completion =
        window.scrollY /
        (document.documentElement.scrollHeight -
          document.documentElement.clientHeight);
      if (
        document.documentElement.scrollHeight ==
        document.documentElement.clientHeight
      ) {
        scroll_completion = 1;
      }
      if (
        (this.store.is_webview == "true" || !this.is_mobile
          ? scroll_completion >= 0.89
          : scroll_completion >= 0.8) &&
        !this.loading &&
        this.$store.state.content_page.never_tapped_any_artist
      ) {
        var self = this;
        setTimeout((self.show_tap_instructions = true), 500);
      }
    },
    close() {
      this.$store.state.content_page.more_by_artist = [];
      this.$store.state.content_page.artist = null;
    },
    switchCheck() {
      this.$store.state.content_page.watchlist_message_check = this.$store.state
        .content_page.watchlist_message_check
        ? false
        : true;
    },
    addToWatchlist() {
      if (this.$store.state.session_id != null) {
        var self = this;
        var prev_state = self.$store.state.content_page.data.watch_later;
        self.$store.state.content_page.data.watch_later = self.$store.state
          .content_page.data.watch_later
          ? false
          : true;
        self.switchCheck();
        setTimeout(self.switchCheck, 1500);

        axios
          .post(this.$store.state.api_host + "update_watchlist", {
            session_id: this.$store.state.session_id,
            content_id: this.$store.state.content_page.content_id,
            status: prev_state ? false : true,
            privacy: this.$store.state.user.profile.profile_status || "public",
          })
          .then(function (response) {
            if (response.status == 200) {
              self.$store.state.feed.watchlist.fetching = true;
              axios
                .post(self.$store.state.api_host + "watchlist", {
                  session_id: self.$store.state.session_id,
                  country: self.$store.state.user.profile.country,
                })
                .then(function (response) {
                  if ([200].includes(response.status)) {
                    self.$store.state.watchlist = response.data.watchlist;
                    self.$store.state.feed.watchlist.feed_list = self.$store.state.watchlist.slice(
                      0,
                      self.$store.state.feed.defaultListSize
                    );
                    if (self.$route.path == "/watchlist") {
                      self.$nextTick(function () {
                        self.$store.state.feed.update_dom = true;
                      });
                    }
                  } else {
                    // console.log(response.status);
                  }
                  self.$store.state.feed.watchlist.fetching = false;
                })
                .catch(function (error) {
                  self.$store.state.feed.watchlist.fetching = false;
                });
            } else {
              // console.log(response.status);
            }
          })
          .catch(function (error) {
            self.$store.state.content_page.data.watch_later = prev_state;
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
      } else {
        this.$store.state.prompt_signup = true;
      }
    },
    goToPlatform(link, content_id, traffic_origin) {
      var activity = {
        api: "outbound_traffic",
        content_id: content_id,
        url: link,
        traffic_origin: "content_page__" + traffic_origin,
      };
      this.$emit("update-api-counter", activity);
    },
    submitRating(user_rating) {
      if (this.$store.state.session_id != null) {
        var self = this;
        var prev_rating = self.content.data.rating;
        self.content.data.rating = user_rating;
        axios
          .post(this.$store.state.api_host + "submit_rating", {
            session_id: this.$store.state.session_id,
            content_ids: [this.content.content_id],
            rating: user_rating,
            privacy: this.$store.state.user.profile.profile_status || "public",
          })
          .then(function (response) {
            var index = self.$store.state.suggestions.rate_counter.indexOf(
              self.content.content_id
            );
            if (index == -1) {
              self.$store.state.suggestions.rate_counter.push(
                self.content.content_id
              );
              if (
                self.$store.state.suggestions.rate_counter.length ==
                self.$store.state.suggestions.calc_after
              ) {
                self.$store.state.suggestions.rate_counter = [];
                axios
                  .post(
                    self.$store.state.ai_host +
                      "calculate_contents_to_recommend",
                    {
                      session_id: self.$store.state.session_id,
                    }
                  )
                  .then(function (response) {
                    if (response.data.notify) {
                      self.$store.state.notifications.notifications = 1;
                    }
                  });
              }
            }
          })
          .catch(function (error) {
            self.content.data.rating = prev_rating;
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
      } else {
        this.$store.state.prompt_signup = true;
      }
    },
    closeTapInstruction() {
      var self = this;
      this.show_tap_instructions = false;
      this.$store.state.content_page.never_tapped_any_artist = false;
      if (self.$store.state.session_id) {
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
    openContent(content_id, title, origin) {
      this.$store.state.content_page.more_by_artist = [];
      this.$store.state.content_page.artist = null;
      this.$store.state.content_page.origin = origin;
      this.$router.push(
        "/content/" +
          content_id +
          "/" +
          title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
      // this.reRender();
    },
    updateZIndex(trailerPlaying) {
      const element = this.$refs.coverTrailer.$el;
      element.style.zIndex = trailerPlaying ? "100000" : "1000";
    },
    clickUser(id, name) {
      this.$router.push(
        "/profile/" + id + "/" + name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
    },
    fetchPosts() {
      var self = this;

      axios
        .post(this.$store.state.api_host + "content_posts", {
          session_id: this.$store.state.session_id,
          content_id: this.$store.state.content_page.content_id,
          fetched_posts: [],
          limit: 10,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
          guest_id: self.$store.state.guest_id,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            self.posts = response.data.posts;
            self.totalPosts = response.data.total_posts;
          }
        })
        .catch(function (error) {
          // console.log(error);
        });
    },
    goToContentPosts() {
      this.$router.push(
        "/posts/content/" +
          this.$store.state.content_page.content_id +
          "/" +
          this.content.data.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
    },
  },
  computed: {
    check_rerender() {
      return this.$store.state.content_page.rerender;
    },
    showCover() {
      if (this.content.data.cover) {
        if (
          this.content.data.cover.includes("flibo-images") &&
          this.content.data.poster.includes("flibo-images")
        ) {
          return true;
        } else if (
          this.content.data.cover.includes("flibo-images") &&
          !this.content.data.poster.includes("flibo-images")
        ) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    },
    showTrailorIcon() {
      if (
        Object.keys(this.content.data.where_to_watch || {}).includes(
          "stream"
        ) ||
        Object.keys(this.content.data.where_to_watch || {}).includes("rent") ||
        Object.keys(this.content.data.where_to_watch || {}).includes("buy")
      ) {
        return true;
      } else if (this.content.data.youtube_trailer_id) {
        return true;
      } else {
        return false;
      }
    },
    whereToWatchOptions() {
      if (
        Object.keys(this.content.data.where_to_watch || {}).includes("stream")
      ) {
        return this.content.data.where_to_watch.stream;
      } else if (
        Object.keys(this.content.data.where_to_watch || {}).includes("rent")
      ) {
        return this.content.data.where_to_watch.rent;
      } else if (
        Object.keys(this.content.data.where_to_watch || {}).includes("buy")
      ) {
        return this.content.data.where_to_watch.buy;
      } else {
        return {};
      }
    },
  },
  watch: {
    check_rerender: {
      handler(rerender) {
        if (rerender) {
          this.$store.state.content_page.rerender = false;
          this.reRender();
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./../styles/mixins.scss";

#app {
  text-align: center;
}
.content-box {
  width: 100%;
  margin-left: 0%;
  font-weight: 400;
  line-height: 1.5;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  color: #333333;
}
.content-cover {
  position: relative;
  margin-top: 50px;
}
.content-below-cover {
  margin-top: -40px;
  border-radius: 24px;
  background-color: #fff;
  padding: 24px 24px 0px 24px;
}
.cover-trailer {
  position: absolute;
  height: 80px;
  margin-left: calc(50vw - 40px);
  margin-top: calc(-20vh - 40px - 40px);
  z-index: 1000;
}
.title {
  position: relative;
  font-size: 18px;
  text-align: left;
}
.watchlist-true {
  position: relative;
  height: 11px;
  width: 11px;
  margin-top: 1px;
  margin-left: 4px;
  background-image: url("./../images/checked.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.watchlist-false {
  position: relative;
  height: 11px;
  width: 11px;
  margin-top: 1px;
  margin-left: 4px;
  background-image: url("./../images/plus.svg");
  background-color: #ffffff;
  background-size: 150%;
  background-position: center;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.user-rating-container {
  position: relative;
  width: 115px;
}
.summary-text {
  position: relative;
  margin-left: 0%;
  margin-top: 20px;
  font-size: 14px;
  text-align: left;
}
.summary-text:first-letter {
  font-size: 32px;
  font-weight: bold;
  line-height: 1;
}
.info-container {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  margin-top: 24px;
}
.info-item {
  margin-right: 10px;
  margin-bottom: 10px;
}
.ratings {
  width: 100%;
  margin-top: 15px;
}
.artists {
  display: inline-flex;
  overflow-x: scroll;
  width: 94%;
  white-space: nowrap;
  padding: 10px;
  margin-left: 20px;
  margin-top: 5px;
}
.artists-container {
  position: relative;
  display: inline-block;
  margin-right: 20px;
  padding: 1px;
  vertical-align: top;
  text-align: center;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.category {
  position: absolute;
  float: left;
  transform: rotate(270deg);
  transform-origin: left center 0;
  border-radius: 5px 3px;
  text-align: center;
  font-weight: normal;
  font-size: 3.5vw;
  margin-left: 2%;
  margin-top: 21%;
  width: 20%;
  color: #0e0d0d;
  text-transform: uppercase;
  letter-spacing: 0px;
}
.platforms {
  display: inline-flex;
  overflow-x: scroll;
  width: 100%;
  white-space: nowrap;
  margin-top: 14px;
}
.platform-cropper {
  width: 45px;
  height: 45px;
  // margin: 0 auto;
  margin-left: 0%;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.platform-icon {
  display: inline-block;
  position: absolute;
  // margin: 0 auto;
  // top: 100%;
  width: 102%;
  margin-left: -50%;
  margin-top: -2%;
}
.platforms-container {
  display: inline-block;
  vertical-align: top;
  text-align: center;
  margin-right: 2.5%;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.content-container {
  margin-right: 20px;
}
.similar-content {
  display: inline-flex;
  overflow-x: scroll;
  width: 94%;
  white-space: nowrap;
  padding-left: 10px;
  margin-left: 20px;
}
.artists-box {
  position: relative;
  margin-top: 10px;
  margin-bottom: 20px;
}
.similar-content-box {
  position: relative;
  margin-top: 20px;
}
.watchlist-continer {
  position: relative;
  white-space: nowrap;
  display: flex;
  padding: 5px;
  font-size: 11px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.36;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  border-radius: 4px;
  border: solid 2px #333333;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.content-page-fetching {
  position: fixed;
  top: calc(50% - 36px);
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 95%;
}
.fadeIn {
  animation: fadeIn 0.15s;
}
.fadeOut {
  animation: fadeOut 0.15s;
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
.tap-to-watch-text {
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
.artist-tap-instructions {
  position: fixed;
  top: calc(50vh - 28.125vw - 20vh - 25px);
  left: 10px;
  z-index: 100001;
  white-space: initial;
  font-size: 20px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.05;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
}
.prompted-content-box {
  position: fixed;
  background-color: #ffffff;
  bottom: 25vh;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 7px;
  padding: 10px;
  z-index: 100001;
}
.prompted-content-buttons {
  min-width: 45vw;
  margin-top: 20px;
}
.prompted-content-android-share-button {
  float: right;
  width: 100%;
  cursor: pointer;
  border: 0;
  padding: 3px;
  background: transparent;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  font-size: 16px;
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
  font-family: "Roboto", sans-serif;
}
.share-radio-button {
  width: 100%;
  cursor: pointer;
  border: 0;
  padding: 3px;
  background: transparent;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  font-size: 16px;
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
  font-family: "Roboto", sans-serif;
}
.content-share-tab-checkbox {
  width: 50%;
  display: inline-block;
  position: relative;
  border-radius: 5px;
  margin-top: 7px;
}
.content-share-tab-checkbox-input {
  opacity: 0;
  cursor: pointer;
}
.content-share-tab-checkmark-abled {
  position: absolute;
  transform: translateX(-65%) translateY(0px);
  height: 22px;
  width: 22px;
  border-radius: 2px;
  border: solid 2px #333333;
  background-color: #ffffff;
}
.content-share-tab-checkmark-text {
  margin-left: 15px;
  font-size: 15px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  text-transform: capitalize;
}
.content-share-tab-checkbox input:checked ~ .content-share-tab-checkmark-abled {
  background-repeat: no-repeat;
  background-size: 85%;
  background-position: center;
  background-image: url("./../images/checked.svg");
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
.desktop-close-tap-instruction {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 50px;
  height: 50px;
  background-image: url("./../images/close.png");
  background-color: #ffffffee;
  background-size: 75% 75%;
  background-repeat: no-repeat;
  background-position: center;
  border: none;
  outline: 0;
  z-index: 100001;
  border-radius: 50%;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.close-tap-instruction {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 35px;
  height: 35px;
  background-image: url("./../images/close.png");
  background-color: #ffffffee;
  background-size: 75% 75%;
  background-repeat: no-repeat;
  background-position: center;
  border: none;
  outline: 0;
  z-index: 100001;
  border-radius: 50%;
}

.user-rating-watchlist-container {
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 20px;
}
.friends-rating-box {
  position: relative;
  margin-top: 20px;
  background-color: #f9f9f9;
  width: 100vw;
  margin-left: -24px;
  padding: 16px 24px;
}
.friend-rating-icon {
  position: absolute;
  top: 70px;
  left: 27.5px;
  transform: translate(-50%, -50%);
  z-index: 1;
  background-color: #fff;
  padding: 5px;
  border-radius: 50%;
}
.friends-rating-box {
  position: relative;
  margin-top: 20px;
  background-color: #f9f9f9;
  width: 100vw;
  margin-left: -24px;
  padding: 16px 24px;
}
.posts-box {
  position: relative;
  margin-top: 20px;
  width: 100vw;
  margin-left: -24px;
  padding: 16px 24px;
}
.content-posts-show-all {
  transform: translateY(-50%);
  margin-left: 8px;
  margin-top: 79px;
}
</style>
