<template>
    <div>
        <div class="watchlist-content-type-tabs"
             :style="(is_mobile) ? '' : 'right: calc(50vw - 500px);'">
            <a @click="switchWatchlistContentTab((content_type_tab_string == '[movie,tv]') ? ['movie'] : ((content_type_tab_string == '[movie]') ? ['tv'] : ['movie','tv']))">
                {{(content_type_tab_string == '[movie,tv]') ? 'Movies + TV Series' : ((content_type_tab_string == '[movie]') ? 'Movies' : 'TV Series')}}
            </a>
        </div>

        <div class="watchlist-filters"
             :style="(is_mobile) ? '' : 'width: 1000px;'"
             :class="{ 'watchlist-filters--hidden': !showWatchlistFilters }"
             v-if="!fetching_watchlist">
            <div class="watchlist-filter-platforms-container"
                :style="(is_mobile) ? ((get_filtered_platforms.length) ? 'background-color: #e1e7fc;' : '') : ((get_filtered_platforms.length) ? 'background-color: #e1e7fc;height: 70px;margin-top: 60px;' : 'height: 70px;margin-top: 60px;')">
                <label v-for="platform in filters_meta.platforms"
                    class="watchlist-filter-platform-checkbox"
                    :style="(is_mobile) ? '' : 'margin-right: 65px;'">
                    <input type="checkbox"
                        v-bind:value="platform"
                        v-model="filters_applied.platforms"
                        class="watchlist-filter-checkbox-input"
                        @click="filterWatchlist">
                    <span class="watchlist-filter-checkmark-abled-platform"
                          :style="(is_mobile) ? '' : 'height: 50px;width: 50px;'"/>
                    <span class="watchlist-filter-platform-cropper"
                          :style="(is_mobile) ? '' : 'height: 50px;width: 50px;'">
                        <img v-bind:src="platform.platform_link" class="watchlist-filter-platform-icon"/>
                    </span>
                </label>
            </div>

            <div class="watchlist-filter-genres-container"
                :style="(is_mobile) ? ((get_filtered_genres.length) ? 'background-color: #e1e7fc;' : '') : ((get_filtered_genres.length) ? 'background-color: #e1e7fc;height: 100px;' : 'height: 100px;')">
                <label v-for="genre in filters_meta.genres"
                    class="watchlist-filter-genre-checkbox"
                    :style="(is_mobile) ? '' : 'margin-right: 95px;'">
                    <input type="checkbox"
                        v-bind:value="genre"
                        v-model="filters_applied.genres"
                        class="watchlist-filter-checkbox-input"
                        @click="filterWatchlist">
                    <span class="watchlist-filter-checkmark-abled-genre"
                          :style="(is_mobile) ? '' : 'height: 80px;width: 80px;'"/>
                    <span class="watchlist-filter-genre-cropper"
                          :style="(is_mobile) ? '' : 'height: 80px;width: 80px;'">
                        <img v-bind:src="genre.genre_link" class="watchlist-filter-genre-icon"/>
                    </span>
                    <span class="watchlist-filter-checkmark-text-genre"
                          :style="(is_mobile) ? '' : 'width: 80px;top: 32.5px;'">{{genre.genre_name}}</span>
                </label>
            </div>
        </div>

        <div class="watchlist-box"
             :style="(is_mobile) ? '' : 'position: relative;margin-top: 250px;'"
             v-if="!fetching_watchlist">
            <div v-for="item, index in (content_type_tab_string != '[filter]') ? store.watchlist : filtered_watchlist"
                 v-if="((content_type_tab_string != '[filter]') ? content_type_tab.includes(item.type) : filter_tab_content_type.includes(item.type))
                       &
                       ((get_filtered_platforms.length) ? (item.platform_count>0) : true)
                       &
                       ((get_filtered_genres.length) ? (item.genre_count==get_filtered_genres.length) : true)"
                class="watchlist-item-container"
                :style="(is_mobile) ? '' : 'width: 100%;'">
                <img v-bind:src="item.poster"
                    class="watchlist-item-poster"
                    :style="(is_mobile) ? '' : 'width: 200px;height: 300px;'"
                    @click="openContent(item.content_id, item.title, 'watchlist')">

                <img v-if="item.youtube_trailer_id
                           ||
                           (!Object.keys(item.where_to_watch || {}).includes('stream'))
                           ||
                           (!Object.keys(item.where_to_watch || {}).includes('rent'))
                           ||
                           (Object.keys(item.where_to_watch || {}).includes('buy'))"
                    @click="playTrailer(item.youtube_trailer_id, item.where_to_watch, item.content_id)"
                    src="https://flibo-images.s3-us-west-2.amazonaws.com/other/play-white-icon.svg"
                    class="watchlist-play-trailer"
                    :style="(is_mobile) ? '' : 'width: 50px;margin-left: -125px;margin-top: 125px;padding: 0px;'"/>

                <div class="watchlist-item-platforms"
                     :style="(is_mobile) ? '' : 'width: 200px;'"
                     v-if="Object.keys(item.where_to_watch || {}).includes('stream')">
                    <div class="watchlist-item-platforms-container"
                        v-for="link, index in item.where_to_watch.stream">
                        <div @click="goToPlatform(link, item.content_id, 'feed_poster')"
                            class="watchlist-item-platform-cropper">
                            <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+index+'.jpg'"
                                class="watchlist-item-platform-icon"/>
                        </div>
                    </div>
                </div>

                <div class="watchlist-item-platforms"
                     :style="(is_mobile) ? '' : 'width: 200px;'"
                     v-if="(!Object.keys(item.where_to_watch || {}).includes('stream'))
                            &&
                            (Object.keys(item.where_to_watch || {}).includes('rent'))">
                    <div class="watchlist-item-platforms-container"
                        v-for="link, index in item.where_to_watch.rent">
                        <div @click="goToPlatform(link, item.content_id, 'feed_poster')"
                            class="watchlist-item-platform-cropper">
                            <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+index+'.jpg'"
                                class="watchlist-item-platform-icon"/>
                        </div>
                    </div>
                </div>

                <div class="watchlist-item-platforms"
                     :style="(is_mobile) ? '' : 'width: 200px;'"
                     v-if="(!Object.keys(item.where_to_watch || {}).includes('stream'))
                            &&
                            (!Object.keys(item.where_to_watch || {}).includes('rent'))
                            &&
                            (Object.keys(item.where_to_watch || {}).includes('buy'))"
                            >
                    <div class="watchlist-item-platforms-container"
                        v-for="link, index in item.where_to_watch.buy">
                        <div @click="goToPlatform(link, item.content_id, 'feed_poster')"
                            class="watchlist-item-platform-cropper">
                            <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+index+'.jpg'"
                                class="watchlist-item-platform-icon"/>
                        </div>
                    </div>
                </div>

                <div class="watchlist-item-info"
                     :style="(is_mobile) ? '' : 'margin-top: -300px;margin-left: 250px;width: 700px;min-height: 300px;'">
                    <div class="watchlist-item-name">
                        <span @click="openContent(item.content_id, item.title, 'watchlist')">
                          {{item.title}}
                        </span>
                    </div>

                    <div class="watchlist-item-genres"
                         :style="(is_mobile) ? '' : 'font-size: 15px;margin-top: 13px;'">
                        <span class="watchlist-item-genre">
                            {{item.imdb_score}}
                        </span>

                        <span class="watchlist-item-genre" v-for="genre in item.genres">
                            {{genre}}
                        </span>
                    </div>

                    <div class="watchlist-user-rating-container">
                        <button v-bind:class="[ (item.rating == 3) ? 'watchlist-love-true' : 'watchlist-love-false' ]"
                                @click="submitRating(item.content_id, ((item.rating == 3) ? 0 : 3), index)">
                        </button>

                        <button v-bind:class="[ (item.rating == 2) ? 'watchlist-thumbs-up-true' : 'watchlist-thumbs-up-false' ]"
                                @click="submitRating(item.content_id, ((item.rating == 2) ? 0 : 2), index)">
                        </button>

                        <button v-bind:class="[ (item.rating == 1) ? 'watchlist-thumbs-down-true' : 'watchlist-thumbs-down-false' ]"
                                @click="submitRating(item.content_id, ((item.rating == 1) ? 0 : 1), index)">
                        </button>
                    </div>

                    <div style="margin-top: 15px;">
                        <div class="watchlist-watchlist-continer"
                             @click="addToWatchlist(item.content_id, item.watch_later, index)">
                            {{(item.watch_later) ? 'ADDED' : 'ADD TO WATCHLIST'}}
                            <button v-bind:class="[ item.watch_later ? 'watchlist-item-true' : 'watchlist-item-false' ]"/>
                        </div>
                    </div>

                    <div style="margin-top: 23px;">
                        <div class="watchlist-more"
                                @click="showMoreInfo(item.content_id, item.title, item.type, item.release_year, item.end_year, item.imdb_score, item.tomato_meter)">
                                {{is_mobile ? 'MORE' : 'MORE INFO'}}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <transition appear
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut">
            <div>
                <div class="black-background"
                     v-if="play_trailer"
                     @click="play_trailer=!play_trailer"/>

                <div class="youtube-player-header"
                     :style="(is_mobile) ? '' : 'top: 75px;left: calc(50vw - 500px);'"
                     v-if="play_trailer & (youtube_trailer_link != null)">
                    Trailer
                </div>

                <div v-if="play_trailer & (youtube_trailer_link != null)"
                     :class="(is_mobile) ? 'youtube-player-loader' : 'desktop-youtube-player-loader'"/>

                <iframe class="youtube-player"
                        :style="(is_mobile) ? '' : 'width: 1000px;left: calc(50vw - 500px);top: 100px;height: 500px;'"
                        v-if="play_trailer & (youtube_trailer_link != null)"
                        type="text/html"
                        :src="youtube_trailer_link"
                        frameborder="0"
                        allowfullscreen/>

                <div class="youtube-player-streaming-box"
                     :style="(youtube_trailer_link ? ((is_mobile) ? '' : 'top: 650px;') : 'top: 40vh;')"
                     v-if="play_trailer
                            &
                           (((Object.keys(where_to_watch || {}).includes('stream'))
                                |
                            (Object.keys(where_to_watch || {}).includes('rent'))
                                |
                            (Object.keys(where_to_watch || {}).includes('buy'))))">
                    <div class="tap-to-watch-text"
                        v-if="(((Object.keys(where_to_watch || {}).includes('stream'))
                                |
                            (Object.keys(where_to_watch || {}).includes('rent'))
                                |
                            (Object.keys(where_to_watch || {}).includes('buy'))))">
                        {{is_mobile ? 'Tap to watch on' : 'Click to watch on'}}
                    </div>

                    <div class="youtube-player-platforms"
                        v-if="(Object.keys(where_to_watch || {}).includes('stream'))">
                        <div class="youtube-player-platforms-container"
                            v-for="item, index in where_to_watch.stream">
                            <div @click="goToPlatform(item, trailer_content_id, 'trailer_popup')"
                                class="youtube-player-platform-cropper">
                                <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+index+'.jpg'"
                                    class="youtube-player-platform-icon"/>
                            </div>
                        </div>
                    </div>

                    <div class="youtube-player-platforms"
                        v-if="(!Object.keys(where_to_watch || {}).includes('stream'))
                                &&
                            (Object.keys(where_to_watch || {}).includes('rent'))">
                        <div class="youtube-player-platforms-container"
                            v-for="item, index in where_to_watch.rent">
                            <div @click="goToPlatform(item, trailer_content_id, 'trailer_popup')"
                                class="youtube-player-platform-cropper">
                                <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+index+'.jpg'"
                                    class="youtube-player-platform-icon"/>
                            </div>
                        </div>
                    </div>

                    <div class="youtube-player-platforms"
                        v-if="(!Object.keys(where_to_watch || {}).includes('stream'))
                                &&
                            (!Object.keys(where_to_watch || {}).includes('rent'))
                                &&
                            (Object.keys(where_to_watch || {}).includes('buy'))">
                        <div class="youtube-player-platforms-container"
                            v-for="item, index in where_to_watch.buy">
                            <div @click="goToPlatform(item, trailer_content_id, 'trailer_popup')"
                                class="youtube-player-platform-cropper">
                                <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+index+'.jpg'"
                                    class="youtube-player-platform-icon"/>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </transition>

        <transition appear
                    enter-active-class="animated slideInUp"
                    leave-active-class="animated slideOutDown">
            <WatchlistFilter v-if="to_filter"
                               @close-filter="to_filter=false"
                               @apply-filter="filterWatchlist"/>
        </transition>

        <div class="no-watchlist-item-message" v-if="fetching_watchlist">
            <div class="sk-folding-cube">
                <div class="sk-cube1 sk-cube"></div>
                <div class="sk-cube2 sk-cube"></div>
                <div class="sk-cube4 sk-cube"></div>
                <div class="sk-cube3 sk-cube"></div>
            </div>
            <br>
            <div class="quote-font">
                {{store.quotes[Math.floor(Math.random() * 22)]}}
            </div>
        </div>

        <transition appear
            enter-active-class="animated fadeIn"
            leave-active-class="animated fadeOut">
            <div>
                <div v-if="show_more_info"
                    class="black-background"
                    @click="show_more_info=!show_more_info"/>

                <div class="more-info-container"
                     :style="(is_mobile) ? '' : 'width: 500px;left: 50%;transform: translateX(-50%);'"
                     v-if="show_more_info">

                    <div class="more-info-watchlist-name">
                        <span style="cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;-o-user-select: none;user-select: none;-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-tap-highlight-color: transparent;"
                              @click="openContent(show_more_info_content.content_id, show_more_info_content.title, 'watchlist')">
                          {{show_more_info_content.title}}
                        </span>

                        <span v-if="show_more_info_content.type=='tv'"
                              style="font-weight: normal;">
                            ({{show_more_info_content.release_year}}-{{(show_more_info_content.end_year) ? show_more_info_content.end_year : 'Present'}})
                        </span>

                        <span v-if="show_more_info_content.type=='movie'"
                              style="font-weight: normal;">
                            ({{show_more_info_content.release_year}})
                        </span>
                    </div>

                    <p class="more-info-summary-text">
                        {{show_more_info_content.summary}}
                    </p>

                    <div class="watchlist-item-ratings">
                        <div class="watchlist-item-rating-container" v-if="show_more_info_content.imdb_score">
                            IMDB
                            <span style="font-weight: bold;">
                                {{show_more_info_content.imdb_score}}
                            </span>
                        </div>

                        <div class="watchlist-item-rating-container" v-if="show_more_info_content.tomato_meter">
                            TOMATOMETER
                            <span style="font-weight: bold;">
                                {{show_more_info_content.tomato_meter}}
                            </span>
                        </div>
                    </div>

                    <h3 v-if="show_more_info_content.crew.length">
                        Cast and Crew
                    </h3>

                    <div class="more-info-artists"
                         v-if="show_more_info_content.crew.length">
                        <div v-for="artist in show_more_info_content.crew"
                             class="more-info-artists-container">
                            <div class="more-info-artist-cropper">
                                <img v-bind:src="artist.profile_photo"
                                class="more-info-artist-pic">
                            </div>
                            <div class="more-info-artist-name">
                                {{artist.person}}
                            </div>
                        </div>
                    </div>

                    <h3 v-if="show_more_info_content.similar.length">
                        Similar {{(show_more_info_content.type == 'movie') ? 'Movies' : 'TV Series'}}
                    </h3>

                    <div class="more-info-similar-content">
                        <div v-for="item in show_more_info_content.similar"
                             class="more-info-content-container"
                             v-if="show_more_info_content.similar.length">
                            <img v-bind:src="item.poster"
                                 class="more-info-content-poster"
                                 @click="openContent(item.content_id, item.title, 'watchlist_similar')">

                            <div class="more-info-similar-platforms"
                                v-if="(Object.keys(item.where_to_watch || {}).includes('stream'))">
                                <div class="more-info-similar-platforms-container"
                                    v-for="stream_item, stream_index in item.where_to_watch.stream">
                                    <div @click="goToPlatform(stream_item, item.content_id, 'similar_content_poster')"
                                        class="more-info-similar-platform-cropper">
                                        <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                            class="more-info-similar-platform-icon"/>
                                    </div>
                                </div>
                            </div>

                            <div class="more-info-similar-platforms"
                                v-if="(!Object.keys(item.where_to_watch || {}).includes('stream'))
                                        &&
                                        (Object.keys(item.where_to_watch || {}).includes('rent'))">
                                <div class="more-info-similar-platforms-container"
                                    v-for="stream_item, stream_index in item.where_to_watch.rent">
                                    <div @click="goToPlatform(stream_item, item.content_id, 'similar_content_poster')"
                                        class="more-info-similar-platform-cropper">
                                        <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                            class="more-info-similar-platform-icon"/>
                                    </div>
                                </div>
                            </div>

                            <div class="more-info-similar-platforms"
                                v-if="(!Object.keys(item.where_to_watch || {}).includes('stream'))
                                        &&
                                        (!Object.keys(item.where_to_watch || {}).includes('rent'))
                                        &&
                                        (Object.keys(item.where_to_watch || {}).includes('buy'))"
                                        >
                                <div class="more-info-similar-platforms-container"
                                    v-for="stream_item, stream_index in item.where_to_watch.buy">
                                    <div @click="goToPlatform(stream_item, item.content_id, 'similar_content_poster')"
                                        class="more-info-similar-platform-cropper">
                                        <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                            class="more-info-similar-platform-icon"/>
                                    </div>
                                </div>
                            </div>

                            <div class="more-info-content-name"
                                 @click="openContent(item.content_id, item.title, 'watchlist_similar')">
                                {{item.title}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <div class="no-watchlist-item-message" v-if="!store.watchlist.length && !fetching_watchlist">
            <br>Please add some Movies & TV Series to your watchlist.</br>
        </div>

        <div class="no-watchlist-item-message" v-if="(content_type_tab_string == '[filter]')
                                                 &
                                                 !filtered_watchlist.length"
             :style="to_filter ? 'top: 125px;' : 'top: 45vh;'">
            <br>Filter Movies & TV Series from your watchlist.</br>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import WatchlistFilter from "./WatchlistFilter";

export default {
  name: "App",
  components: {
    WatchlistFilter
  },
  props: {
    to_filter: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      content_type_tab: ["movie", "tv"],
      filtered_watchlist: [],
      fetching_watchlist: false,
      filters_meta: this.$store.state.watchlist_filters.filters_meta,
      filters_applied: this.$store.state.watchlist_filters.filters_applied,
      show_more_info: false,
      showWatchlistFilters: true,
      show_more_info_content: {
        content_id: null,
        title: null,
        type: null,
        release_year: null,
        end_year: null,
        summary: null,
        imdb_score: null,
        tomato_meter: null,
        crew: [],
        similar: []
      },
      play_trailer: false,
      youtube_trailer_link: null,
      trailer_content_id: null,
      where_to_watch: null,
      filtered_platforms: [],
      filtered_genres: [],
      store: this.$store.state
    };
  },
  computed: {
    content_type_tab_string() {
      return JSON.stringify(this.content_type_tab).replace(/['"]+/g, "");
    },
    filter_tab_content_type() {
      if (this.$store.state.watchlist_filters.filters_applied.tab == "All") {
        return ["movie", "tv"];
      } else if (
        this.$store.state.watchlist_filters.filters_applied.tab == "Movies"
      ) {
        return ["movie"];
      } else if (
        this.$store.state.watchlist_filters.filters_applied.tab == "TV Series"
      ) {
        return ["tv"];
      }
    },
    get_filtered_platforms() {
      return this.filtered_platforms;
    },
    get_filtered_genres() {
      return this.filtered_genres;
    }
  },
  mounted() {
    window.addEventListener("scroll", this.watchScroll);
  },
  created() {
    window.scrollTo(0, 0);
    this.fetching_watchlist = false;
    this.$store.state.current_path = "/watchlist";
    var self = this;
    axios
      .post(self.$store.state.api_host + "watchlist", {
        session_id: self.$store.state.session_id,
        country: self.$store.state.user.profile.country
      })
      .then(function(response) {
        if ([200].includes(response.status)) {
          self.$store.state.watchlist = response.data.watchlist;
          self.filterWatchlist();
          setTimeout((self.showWatchlistFilters = true), 0);
        } else {
          // console.log(response.status);
        }
        self.fetching_watchlist = false;
      })
      .catch(function(error) {
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
        self.fetching_watchlist = false;
      });
  },
  methods: {
    _filterWatchlist() {
      var self = this;
      self.filtered_platforms = [];
      self.filtered_genres = [];
      self.filtered_watchlist = [];

      var watchlist = self.$store.state.watchlist;

      var platform;
      for (platform in self.filters_applied.platforms) {
        self.filtered_platforms.push(
          self.filters_applied.platforms[platform].platform_name
            .replace(/\s+/g, "_")
            .toLowerCase()
        );
      }

      var genre;
      for (genre in self.filters_applied.genres) {
        self.filtered_genres.push(
          self.filters_applied.genres[genre].genre_name
        );
      }

      var watchlist_item;
      for (watchlist_item in watchlist) {
        var genre_count = 0;
        var genre;
        for (genre in watchlist[watchlist_item].genres) {
          var index = self.filtered_genres.indexOf(
            watchlist[watchlist_item].genres[genre]
          );
          if (index > -1) {
            genre_count++;
          }
        }
        watchlist[watchlist_item].genre_count = genre_count;

        var platform_count = 0;
        for (platform in self.filtered_platforms) {
          if (
            JSON.stringify(watchlist[watchlist_item].where_to_watch).includes(
              self.filtered_platforms[platform]
            )
          ) {
            platform_count++;
          }
        }
        watchlist[watchlist_item].platform_count = platform_count;
      }

      function compare(a, b) {
        if (
          a.genre_count + ("0" + a.platform_count).slice(-2) >
          b.genre_count + ("0" + b.platform_count).slice(-2)
        ) {
          return -1;
        }
        if (
          a.genre_count + ("0" + a.platform_count).slice(-2) ==
          b.genre_count + ("0" + b.platform_count).slice(-2)
        ) {
          return 0;
        }
        return 1;
      }

      self.$store.state.watchlist = self.$store.state.watchlist.sort(compare);
      window.scrollTo(0, 0);
    },
    filterWatchlist() {
      var self = this;
      setTimeout(self._filterWatchlist, 0);
    },
    watchScroll() {
      const currentScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;
      if (currentScrollPosition < 0) {
        return;
      }
      // Stop executing this function if the difference between
      // current scroll position and last scroll position is less than some offset
      if (Math.abs(currentScrollPosition - this.lastScrollPosition) < 0) {
        return;
      }
      this.showWatchlistFilters =
        currentScrollPosition < this.lastScrollPosition;
      this.lastScrollPosition = currentScrollPosition;
    },
    get_item_platforms(where_to_watch) {
      var item_platforms = [];
      if (where_to_watch) {
        var item_platforms = [];
        var platform;

        if (Object.keys(where_to_watch || {}).includes("stream")) {
          for (platform in Object.keys(where_to_watch.stream)) {
            item_platforms.push(
              Object.keys(where_to_watch.stream)
                [platform].replace(/\s+/g, "_")
                .toLowerCase()
            );
          }
        } else if (Object.keys(where_to_watch || {}).includes("rent")) {
          for (platform in Object.keys(where_to_watch.rent)) {
            item_platforms.push(
              Object.keys(where_to_watch.rent)
                [platform].replace(/\s+/g, "_")
                .toLowerCase()
            );
          }
        } else if (Object.keys(where_to_watch || {}).includes("buy")) {
          for (platform in Object.keys(where_to_watch.buy)) {
            item_platforms.push(
              Object.keys(where_to_watch.buy)
                [platform].replace(/\s+/g, "_")
                .toLowerCase()
            );
          }
        }
      }
      return item_platforms;
    },
    openContent(content_id, title, origin) {
      this.$store.state.content_page.more_by_artist = null;
      this.$store.state.content_page.artist = null;
      this.$store.state.content_page.origin = origin;
      this.$router.push(
        "/content/" +
          content_id +
          "/" +
          title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
    },
    playTrailer(youtube_trailer_id, where_to_watch, content_id) {
      if (youtube_trailer_id) {
        this.youtube_trailer_link =
          "https://www.youtube.com/embed/" + youtube_trailer_id + "?autoplay=1";
      } else {
        this.youtube_trailer_link = null;
      }
      this.where_to_watch = where_to_watch;
      this.trailer_content_id = content_id;
      this.play_trailer = true;

      var activity = {
        api: "play_trailer",
        content_id: content_id,
        trailer_origin: "watchlist"
      };
      this.$emit("update-api-counter", activity);
    },
    goToPlatform(link, content_id, traffic_origin) {
      var activity = {
        api: "outbound_traffic",
        content_id: content_id,
        url: link,
        traffic_origin: "watchlist__" + traffic_origin
      };
      this.$emit("update-api-counter", activity);
    },
    submitRating(content_id, user_rating, content_index) {
      var self = this;

      var prev_rating = null;

      if (self.content_type_tab_string != "[filter]") {
        prev_rating = self.$store.state.watchlist[content_index].rating;
        self.$store.state.watchlist[content_index].rating = user_rating;
      } else {
        prev_rating = self.filtered_watchlist[content_index].rating;
        self.filtered_watchlist[content_index].rating = user_rating;
      }

      axios
        .post(this.$store.state.api_host + "submit_rating", {
          session_id: this.$store.state.session_id,
          content_ids: [content_id],
          rating: user_rating
        })
        .then(function(response) {
          var index = self.$store.state.suggestions.rate_counter.indexOf(
            content_id
          );
          if (index == -1) {
            self.$store.state.suggestions.rate_counter.push(content_id);
            if (
              self.$store.state.suggestions.rate_counter.length ==
              self.$store.state.suggestions.calc_after
            ) {
              self.$store.state.suggestions.rate_counter = [];
              axios
                .post(
                  self.$store.state.ai_host + "calculate_contents_to_recommend",
                  {
                    session_id: self.$store.state.session_id
                  }
                )
                .then(function(response) {
                  self.$store.state.suggestions.refresh_recommendation = true;
                  self.$store.state.suggestions.notify = true;
                });
            }
          }
        })
        .catch(function(error) {
          if (self.content_type_tab_string != "[filter]") {
            self.$store.state.watchlist[content_index].rating = prev_rating;
          } else {
            self.filtered_watchlist[content_index].rating = prev_rating;
          }
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
    addToWatchlist(content_id, watch_later, content_index) {
      var self = this;

      var prev_state = null;

      if (self.content_type_tab_string != "[filter]") {
        prev_state = self.$store.state.watchlist[content_index].watch_later;
        self.$store.state.watchlist[content_index].watch_later = watch_later
          ? false
          : true;
      } else {
        prev_state = self.filtered_watchlist[content_index].watch_later;
        self.filtered_watchlist[content_index].watch_later = watch_later
          ? false
          : true;
      }

      axios
        .post(this.$store.state.api_host + "update_watchlist", {
          session_id: this.$store.state.session_id,
          content_id: content_id,
          status: watch_later ? false : true
        })
        .then(function(response) {
          if (response.status == 200) {
          } else {
            // console.log(response.status);
          }
        })
        .catch(function(error) {
          if (self.content_type_tab_string != "[filter]") {
            self.$store.state.watchlist[content_index].watch_later = prev_state;
          } else {
            self.filtered_watchlist[content_index].watch_later = prev_state;
          }

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
    openFilter() {
      this.content_type_tab = ["filter"];
      this.to_filter = !this.to_filter;
    },
    switchWatchlistContentTab(tabs) {
      if (this.content_type_tab_string == "[filter]") {
        this.to_filter = false;
      }
      this.content_type_tab = tabs;
      window.scrollTo(0, 0);
    },
    showMoreInfo(
      content_id,
      title,
      type,
      release_year,
      end_year,
      imdb_score,
      tomato_meter
    ) {
      var self = this;
      self.show_more_info_content.content_id = content_id;
      self.show_more_info_content.title = title;
      self.show_more_info_content.type = type;
      self.show_more_info_content.release_year = release_year;
      self.show_more_info_content.end_year = end_year;
      self.show_more_info_content.summary = null;
      self.show_more_info_content.imdb_score = imdb_score;
      self.show_more_info_content.tomato_meter = tomato_meter;
      self.show_more_info_content.crew = [];
      self.show_more_info_content.similar = [];
      self.show_more_info = !self.show_more_info;

      axios
        .post(this.$store.state.api_host + "content_summary_more_info", {
          session_id: this.$store.state.session_id,
          content_id: content_id,
          guest_id: self.$store.state.guest_id
        })
        .then(function(response) {
          if (response.status == 200) {
            self.show_more_info_content.summary = response.data.summary;
          } else {
            // console.log(response.status);
          }
        })
        .catch(function(error) {
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

      axios
        .post(this.$store.state.api_host + "content_crew_more_info", {
          session_id: this.$store.state.session_id,
          content_id: content_id
        })
        .then(function(response) {
          if (response.status == 200) {
            self.show_more_info_content.crew = response.data.crew;
          } else {
            // console.log(response.status);
          }
        })
        .catch(function(error) {
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

      axios
        .post(this.$store.state.api_host + "similar_content", {
          session_id: this.$store.state.session_id,
          content_id: content_id,
          country: self.$store.state.user.profile.country
        })
        .then(function(response) {
          if (response.status == 200) {
            self.show_more_info_content.similar = response.data.contents;
          } else {
            // console.log(response.status);
          }
        })
        .catch(function(error) {
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
  }
};
</script>

<style lang="scss">
@import "./../styles/mixins.scss";
.watchlist-box {
  width: 100%;
  display: inline-grid;
  white-space: nowrap;
  margin-top: 210px;
  padding-bottom: 3%;
  overflow-y: scroll;
  overflow-x: hidden;
}
.watchlist-item-container {
  width: 100vw;
  vertical-align: top;
  text-align: left;
  padding: 0 20px;
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 10px solid #f8f8f8;
}
.watchlist-item-poster {
  position: relative;
  display: inline;
  margin: 0 auto;
  width: 40vw;
  height: 60vw;
  border-radius: 7px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.watchlist-play-trailer {
  position: absolute;
  width: 15%;
  margin-left: calc(-20vw + 7.5% - 15%);
  margin-top: calc(30vw - 7.5%);
  z-index: 3;
  padding: 2.5%;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.watchlist-item-info {
  position: relative;
  margin-top: calc(-60vw - 4px);
  margin-left: calc(40vw + 20px);
  width: calc(60vw - 60px);
  text-align: left;
  min-height: 60vw;
  background-color: #ffffff;
  white-space: normal;
}
.watchlist-item-name {
  width: 98%;
  white-space: initial;
  position: relative;
  font-size: 18px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.05;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.watchlist-item-summary-text {
  margin-top: 2%;
  color: #4e4b4b;
  font-size: 11.5px;
  overflow-y: scroll;
  max-height: 10vw;
  white-space: initial;
}
.watchlist-item-ratings {
  width: 100%;
  margin-top: 15px;
}
.watchlist-item-rating-container {
  position: relative;
  display: inline-block;
  margin-bottom: 5px;
  font-size: 14px;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.36;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  border-radius: 4px;
  background-color: #f2f2f2;
  padding: 1px 5px;
}
.watchlist-item-imdb-rating-logo {
  width: 56%;
}
.watchlist-item-imdb-rating {
  position: absolute;
  display: inline-block;
  margin-left: 10%;
  margin-top: 14%;
  font-size: 15px;
}
.watchlist-item-tomato-rating-logo {
  width: 43%;
  margin-top: 3%;
}
.watchlist-item-tomato-rating {
  position: absolute;
  display: inline-block;
  margin-left: 9%;
  margin-top: 15.5%;
  font-size: 15px;
}
.watchlist-item-genres {
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  margin-top: 10px;
}
.watchlist-item-genre + .watchlist-item-genre:before {
  content: "|";
}
.watchlist-item-platforms {
  text-align: center;
  position: absolute;
  overflow-x: scroll;
  margin-top: -42px;
  margin-left: 0px;
  width: 40%;
  padding: 5px 0px;
  border-radius: 0 0 7px 7px;
  background-color: rgba(0, 0, 0, 0.5);
}
.watchlist-item-platform-cropper {
  width: 28px;
  height: 28px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.watchlist-item-platform-icon {
  display: inline-block;
  position: absolute;
  width: 100%;
  margin-left: -50%;
}
.watchlist-item-platforms-container {
  display: inline-block;
  vertical-align: top;
  text-align: center;
  margin-left: 5px;
  margin-right: 5px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.no-watchlist-item-message {
  position: fixed;
  top: calc(50% - 36px);
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 95%;
}
.watchlist-item-filters-background {
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  top: 0%;
  z-index: 100000;
}
.slideInUp {
  animation: slideInUp 0.3s;
}
.slideOutDown {
  animation: slideOutDown 0.6s;
}
.fadeIn {
  animation: fadeIn 0.3s;
}
.fadeOut {
  animation: fadeOut 0.6s;
}
.watchlist-item-filter-active {
  position: absolute;
  right: 17%;
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
.watchlist-user-rating-container {
  position: relative;
  left: 0%;
  margin-top: 10px;
  text-align: left;
}
.watchlist-thumbs-up-true {
  position: relative;
  height: 28px;
  width: 28px;
  margin-right: 10px;
  background-image: url("./../images/thumbs_up_true.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.watchlist-thumbs-up-false {
  position: relative;
  height: 28px;
  width: 28px;
  margin-right: 10px;
  background-image: url("./../images/thumbs_up_false.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.watchlist-thumbs-down-true {
  position: relative;
  height: 28px;
  width: 28px;
  transform: translateY(3px);
  background-image: url("./../images/thumbs_down_true.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.watchlist-thumbs-down-false {
  position: relative;
  height: 28px;
  width: 28px;
  transform: translateY(3px);
  background-image: url("./../images/thumbs_down_false.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.watchlist-love-true {
  position: relative;
  height: 28px;
  width: 28px;
  transform: translateY(1px);
  margin-right: 10px;
  background-image: url("./../images/love_true.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.watchlist-love-false {
  position: relative;
  height: 28px;
  width: 28px;
  transform: translateY(1px);
  margin-right: 10px;
  background-image: url("./../images/love_false.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.watchlist-item-true {
  position: absolute;
  height: 12px;
  width: 12px;
  margin-left: 4px;
  margin-top: 4px;
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
.watchlist-item-false {
  position: absolute;
  height: 12px;
  width: 12px;
  margin-left: 4px;
  margin-top: 4px;
  background-image: url("./../images/plus.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.watchlist-content-type-tabs {
  right: 15px;
  margin-top: 5px;
  background-color: #ffffff;
  position: fixed;
  overflow: hidden;
  padding: 5px;
  z-index: 100000;
  text-align: center;
  display: grid;
  grid-column-gap: 10px;
}
.watchlist-content-type-tabs a {
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 5px 3px 0 0;
  padding: 6px 0px;
  font-size: 13px;
  text-transform: uppercase;
  display: inline-grid;
  grid-row-start: 1;
  grid-row-end: 3;
  font-weight: bold;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.watchlist-content-type-tabs a.is-active {
  font-weight: bold;
}
.watchlist-content-type-tabs a.is-active:after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: calc(50% - 7.5px);
  width: 15px;
  height: 3px;
  background-color: #333333;
  border-radius: 3px;
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
.watchlist-more {
  position: relative;
  display: initial;
  padding: 5px;
  font-size: 12px;
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
.more-info-container {
  position: fixed;
  width: 92%;
  left: 4%;
  top: 20vh;
  max-height: 60vh;
  overflow: scroll;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 15px;
  z-index: 100001;
  text-align: left;
}
.more-info-watchlist-name {
  white-space: initial;
  position: relative;
  font-size: 18px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.2;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
.more-info-summary-text {
  position: relative;
  margin-top: 10px;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
.more-info-artists {
  display: inline-flex;
  overflow-x: scroll;
  white-space: nowrap;
  width: 100%;
  margin-top: 10px;
}
.more-info-artists-container {
  display: inline-block;
  margin-right: 15px;
  vertical-align: top;
  text-align: center;
}
.more-info-artist-cropper {
  display: inline-block;
  width: 55px;
  height: 70px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.more-info-artist-pic {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.more-info-artist-name {
  margin-top: 3px;
  position: relative;
  width: 55px;
  white-space: normal;
  font-size: 12px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  text-align: center;
  color: #333333;
}
.more-info-similar-content {
  display: inline-flex;
  overflow-x: scroll;
  width: 100%;
  white-space: nowrap;
  margin-top: 10px;
}
.more-info-content-container {
  position: relative;
  display: inline-block;
  margin-right: 15px;
  vertical-align: top;
  text-align: center;
}
.more-info-content-poster {
  position: relative;
  display: inline;
  margin: 0 auto;
  width: 100px;
  height: 150px;
  border-radius: 7px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.more-info-content-name {
  margin-top: 3px;
  position: relative;
  width: 100px;
  white-space: normal;
  font-size: 12px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  text-align: center;
  color: #333333;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.more-info-container h3 {
  font-size: 16px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.25;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
  margin-top: 20px;
}
.watchlist-watchlist-n-more {
  position: relative;
  width: 100%;
  margin-top: 15px;
}
.watchlist-watchlist-continer {
  display: initial;
  padding: 5px 20px 5px 5px;
  font-size: 12px;
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
.youtube-player {
  position: fixed;
  width: 100vw;
  height: 56.25vw;
  top: calc(50vh - 28.125vw - 20vh);
  left: 0;
  z-index: 100001;
}
.youtube-player-platforms {
  display: inline-flex;
  overflow: scroll;
  max-width: 100%;
}
.youtube-player-platform-cropper {
  width: 50px;
  height: 50px;
  position: relative;
  overflow: hidden;
  border-radius: 20%;
}
.youtube-player-platform-icon {
  display: inline-block;
  position: absolute;
  width: 100%;
  margin-left: -50%;
}
.youtube-player-platforms-container {
  display: inline-block;
  vertical-align: top;
  text-align: center;
  margin: 20px 10px 0px 10px;
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
.youtube-player-streaming-box {
  position: fixed;
  top: calc(60vh + 28.125vw - 25vh);
  left: 50%;
  transform: translateX(-50%);
  z-index: 100001;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 10px;
  max-width: 95vw;
}
.youtube-player-header {
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
.youtube-player-loader {
  border: 10px solid #f3f3f3;
  border-top: 10px solid #3498db;
  border-radius: 50%;
  width: 14vw;
  height: 14vw;
  animation: spin 2s linear infinite;
  position: fixed;
  top: calc(50vh - 20vh - 7vw);
  left: calc(50% - 7vw);
  z-index: 100000;
}
.desktop-youtube-player-loader {
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
.watchlist-filter-platforms-container {
  display: inline-flex;
  width: calc(100% - 15px);
  overflow-x: scroll;
  height: 55px;
  margin-top: 55px;
  padding: 10px;
  border-radius: 5px;
}
.watchlist-filter-platform-checkbox {
  position: relative;
  display: inline-block;
  margin-right: 50px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.watchlist-filter-platform-checkbox
  input:checked
  ~ .watchlist-filter-checkmark-abled-platform {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 50%;
  background-position: 50% 50%;
  background-repeat: no-repeat;
  border-radius: 4px;
  background-image: url("./../images/checked_white.svg");
}
.watchlist-filter-checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.watchlist-filter-checkmark-abled-platform {
  position: absolute;
  height: 35px;
  width: 35px;
  z-index: 1;
}
.watchlist-filter-platform-cropper {
  position: absolute;
  overflow: hidden;
  width: 35px;
  height: 35px;
  border-radius: 4px;
}
.watchlist-filter-platform-icon {
  width: 100%;
}
.watchlist-filter-genres-container {
  display: inline-flex;
  width: calc(100% - 15px);
  overflow-x: scroll;
  height: 85px;
  padding: 10px;
  border-radius: 5px;
}
.watchlist-filter-genre-checkbox {
  position: relative;
  display: inline-block;
  margin-right: 80px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.watchlist-filter-genre-checkbox
  input:checked
  ~ .watchlist-filter-checkmark-abled-genre {
  background-color: rgba(41, 78, 210, 0.75);
  background-size: 20%;
  background-position: 50% 80%;
  background-repeat: no-repeat;
  border-radius: 4px;
  background-image: url("./../images/checked_white.svg");
}
.watchlist-filter-checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.watchlist-filter-checkmark-abled-genre {
  position: absolute;
  height: 65px;
  width: 65px;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.55);
  border-radius: 4px;
}
.watchlist-filter-genre-cropper {
  position: absolute;
  overflow: hidden;
  width: 65px;
  height: 65px;
  border-radius: 4px;
}
.watchlist-filter-genre-icon {
  width: 100%;
}
.watchlist-filter-checkmark-text-genre {
  position: absolute;
  width: 65px;
  top: 28px;
  font-size: 12px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: center;
  color: #ffffff;
  z-index: 1;
}
.watchlist-filters {
  position: fixed;
  z-index: 1000;
  padding-bottom: 5px;
  width: 100%;
  background-color: #ffffff;
  transform: translate3d(0%, 0%, 0);
  transition: transform 0.5s ease-out;
}
.watchlist-filters.watchlist-filters--hidden {
  transform: translate3d(0%, -100%, 0);
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

.more-info-similar-platforms {
  text-align: center;
  position: absolute;
  overflow-x: scroll;
  white-space: nowrap;
  margin-top: -34px;
  margin-left: 0px;
  width: 100px;
  padding: 5px;
  border-radius: 0 0 7px 7px;
  background-color: rgba(0, 0, 0, 0.5);
}
.more-info-similar-platform-cropper {
  width: 20px;
  height: 20px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.more-info-similar-platform-icon {
  display: inline-block;
  position: absolute;
  width: 100%;
  margin-left: -50%;
}
.more-info-similar-platforms-container {
  display: inline-block;
  vertical-align: top;
  text-align: center;
  margin-left: 8px;
  margin-right: 8px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
</style>
