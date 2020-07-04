<template>
  <div>
    <div
      class="search-results-filters"
      :class="{ 'search-results-filters--hidden': !showRefreshButton }"
      :style="is_mobile ? '' : 'top: 50px;width: 1000px;height: 110px;'"
    >
      <div
        class="search-results-quick-filters"
        :style="is_mobile ? '' : 'height: 50px;'"
      >
        <div class="search-results-quick-filters-content-type">
          <label
            v-for="(item, index) in ['All', 'Movie', 'TV']"
            :key="index"
            class="content-type-checkbox"
            :style="
              search_content_type_tab == item
                ? 'background-color: #e8f0fe;border-color: #d2e3fc;'
                : ''
            "
            @click="switchContentTab(item)"
          >
            <input
              type="radio"
              v-bind:value="item"
              v-model="search_content_type_tab"
              class="content-type-checkbox-input"
            />
            <span class="content-type-checkmark-text">{{ item }}</span>
          </label>
        </div>
      </div>
    </div>

    <div
      class="suggestions-box"
      v-if="!store.discover_filters.fetching_filtered"
      :style="
        is_mobile
          ? 'padding-top: 0;margin-top: 60px;'
          : 'position: relative;padding-top: 0;margin-top: 60px;'
      "
    >
      <div
        class="search-result-note"
        v-if="store.session_id != null && !is_string_query"
        :style="is_mobile ? '' : 'width: 95%;margin-left: 2.5%;'"
      >
        <p
          :style="
            is_mobile
              ? 'font-weight: normal;text-align: center;'
              : 'font-weight: normal;text-align: center;margin-top: 0px;'
          "
        >
          Watched movies & TV series have been removed from the results.
        </p>
      </div>
      <div
        v-for="(item, index) in store.discover_filters.filtered_content"
        v-if="store.discover_filters.content_type_tab.includes(item.type)"
        class="suggestion-container"
        :style="is_mobile ? '' : 'width: 100%;'"
      >
        <div class="starting-text">
          <div
            class="summary-profile-cropper"
            :style="
              item.user_id != null
                ? 'cursor: pointer;-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-tap-highlight-color: transparent;'
                : ''
            "
            v-if="item.feed_type"
            @click="goToProfile(item.user_id, item.user_name)"
          >
            <img
              class="summary-profile-pp"
              :src="item.user_picture"
              onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
            />
          </div>
          <p
            class="suggestion-summary-text"
            :style="is_mobile ? '' : 'font-size: 15px;'"
            v-if="item.feed_type"
          >
            <span
              :style="
                item.user_id != null
                  ? 'font-weight: bold;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;-o-user-select: none;user-select: none;-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-tap-highlight-color: transparent;'
                  : 'font-weight: bold;'
              "
              @click="goToProfile(item.user_id, item.user_name)"
            >
              {{ item.user_name }}
            </span>

            <span v-if="item.item_type == 'suggestions'">
              recommends you
            </span>

            <span v-if="item.item_type != 'suggestions'">
              <span v-if="item.user_ids.length > 1">
                and
              </span>
              <span
                v-if="item.user_ids.length > 1"
                style="font-weight: bold;cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;-o-user-select: none;user-select: none;-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-tap-highlight-color: transparent;"
                @click="showOther(item.user_ids)"
              >
                {{ item.user_ids.length - 1 }}
                {{
                  item.user_ids.length - 1 == 1
                    ? "other"
                    : item.feed_type == "friends"
                    ? "other"
                    : "others"
                }}
              </span>
              <span
                v-if="
                  (item.feed_type == 'friends') & (item.user_ids.length > 1)
                "
              >
                {{
                  item.user_ids.length - 1 == 1 ? "connection" : "connections"
                }}
              </span>
            </span>

            <span v-if="item.item_type == 'ratings'">
              {{ item.other_user_rating == 2 ? "liked" : "loved" }}
            </span>

            <span v-if="item.item_type == 'watchlist'">
              added
            </span>

            <span v-if="item.item_type == 'watching'">
              {{
                item.type == "movie"
                  ? "recently watched"
                  : item.user_ids.length > 1
                  ? "are watching"
                  : "is watching"
              }}
            </span>

            this {{ item.type == "movie" ? "movie" : "TV series" }}

            <span v-if="item.item_type == 'watchlist'">
              to watchlist
            </span>

            <span v-if="(item.item_type == 'watching') & (item.type == 'tv')">
              these days
            </span>

            <!-- <span v-if="item.feed_type == 'community'"
                              style="font-style: italic;font-size: 11px;">
                            (user with similar taste)
                        </span> -->
          </p>
        </div>

        <img
          v-bind:src="item.poster"
          class="suggestion-poster"
          :style="is_mobile ? '' : 'width: 200px;height: 300px;'"
          @click="
            openContent(
              item.content_id,
              item.title,
              item.feed_type ? item.feed_type : 'filter'
            )
          "
        />

        <img
          v-if="
            item.youtube_trailer_id ||
              Object.keys(item.where_to_watch || {}).includes('stream') ||
              Object.keys(item.where_to_watch || {}).includes('rent') ||
              Object.keys(item.where_to_watch || {}).includes('buy')
          "
          @click="
            playTrailer(
              item.youtube_trailer_id,
              item.where_to_watch,
              item.content_id,
              item.feed_type
            )
          "
          src="https://flibo-images.s3-us-west-2.amazonaws.com/other/play-white-icon.svg"
          class="suggestion-play-trailer"
          :style="
            is_mobile
              ? ''
              : 'width: 50px;margin-left: -125px;margin-top: 125px;padding: 0px;'
          "
        />

        <div
          class="suggestion-platforms"
          :style="is_mobile ? '' : 'width: 200px;'"
          v-if="Object.keys(item.where_to_watch || {}).includes('stream')"
        >
          <div
            class="suggestion-platforms-container"
            v-for="(link, index) in item.where_to_watch.stream"
          >
            <div
              @click="goToPlatform(link, item.content_id, 'feed_poster')"
              class="suggestion-platform-cropper"
            >
              <img
                v-bind:src="
                  'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                    index +
                    '.jpg'
                "
                class="suggestion-platform-icon"
              />
            </div>
          </div>
        </div>

        <div
          class="suggestion-platforms"
          :style="is_mobile ? '' : 'width: 200px;'"
          v-if="
            !Object.keys(item.where_to_watch || {}).includes('stream') &&
              Object.keys(item.where_to_watch || {}).includes('rent')
          "
        >
          <div
            class="suggestion-platforms-container"
            v-for="(link, index) in item.where_to_watch.rent"
          >
            <div
              @click="goToPlatform(link, item.content_id, 'feed_poster')"
              class="suggestion-platform-cropper"
            >
              <img
                v-bind:src="
                  'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                    index +
                    '.jpg'
                "
                class="suggestion-platform-icon"
              />
            </div>
          </div>
        </div>

        <div
          class="suggestion-platforms"
          :style="is_mobile ? '' : 'width: 200px;'"
          v-if="
            !Object.keys(item.where_to_watch || {}).includes('stream') &&
              !Object.keys(item.where_to_watch || {}).includes('rent') &&
              Object.keys(item.where_to_watch || {}).includes('buy')
          "
        >
          <div
            class="suggestion-platforms-container"
            v-for="(link, index) in item.where_to_watch.buy"
          >
            <div
              @click="goToPlatform(link, item.content_id, 'feed_poster')"
              class="suggestion-platform-cropper"
            >
              <img
                v-bind:src="
                  'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                    index +
                    '.jpg'
                "
                class="suggestion-platform-icon"
              />
            </div>
          </div>
        </div>

        <div
          class="suggestion-info"
          :style="
            is_mobile
              ? ''
              : 'margin-top: -300px;margin-left: 250px;width: 700px;min-height: 300px;'
          "
        >
          <div class="suggestion-name">
            <span
              @click="
                openContent(
                  item.content_id,
                  item.title,
                  item.feed_type ? item.feed_type : 'filter'
                )
              "
            >
              {{ item.title }}
            </span>
          </div>

          <div
            class="suggestion-genres"
            :style="is_mobile ? '' : 'font-size: 15px;margin-top: 13px;'"
          >
            <span class="suggestion-genre">
              {{ item.imdb_score }}
            </span>

            <span class="suggestion-genre" v-for="genre in item.genres">
              {{ genre }}
            </span>
          </div>

          <div class="suggestion-user-rating-container">
            <button
              v-bind:class="[
                item.rating == 3
                  ? 'suggestion-love-true'
                  : 'suggestion-love-false'
              ]"
              @click="
                submitRating(item.content_id, item.rating == 3 ? 0 : 3, index)
              "
            ></button>

            <button
              v-bind:class="[
                item.rating == 2
                  ? 'suggestion-thumbs-up-true'
                  : 'suggestion-thumbs-up-false'
              ]"
              @click="
                submitRating(item.content_id, item.rating == 2 ? 0 : 2, index)
              "
            ></button>

            <button
              v-bind:class="[
                item.rating == 1
                  ? 'suggestion-thumbs-down-true'
                  : 'suggestion-thumbs-down-false'
              ]"
              @click="
                submitRating(item.content_id, item.rating == 1 ? 0 : 1, index)
              "
            ></button>
          </div>

          <div style="margin-top: 15px;">
            <div
              class="suggestion-watchlist-continer"
              @click="addToWatchlist(item.content_id, item.watch_later, index)"
            >
              {{ item.watch_later ? "ADDED" : "ADD TO WATCHLIST" }}
              <button
                v-bind:class="[
                  item.watch_later
                    ? 'suggestion-watchlist-true'
                    : 'suggestion-watchlist-false'
                ]"
              />
            </div>
          </div>

          <div style="margin-top: 23px;">
            <div
              class="suggestion-more"
              @click="
                showMoreInfo(
                  item.content_id,
                  item.title,
                  item.type,
                  item.release_year,
                  item.end_year,
                  item.feed_type,
                  item.imdb_score,
                  item.tomato_meter
                )
              "
            >
              {{ is_mobile ? "MORE" : "MORE INFO" }}
            </div>
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
          v-if="show_others"
          class="black-background"
          @click="show_others = !show_others"
        />

        <div
          :class="
            is_mobile
              ? 'others-list-container'
              : 'desktop-others-list-container'
          "
          v-if="show_others"
        >
          <div
            v-for="(item, index) in other_users"
            :class="
              is_mobile
                ? 'other-user-container'
                : 'desktop-other-user-container'
            "
          >
            <div
              class="other-user-pp-cropper"
              :style="is_mobile ? '' : 'margin-left: 0px;'"
              @click="goToProfile(item.user_id, item.user_name)"
            >
              <img
                v-bind:src="item.user_picture"
                onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
                class="other-user-pp"
              />
            </div>

            <div
              class="other-user-name-box"
              :style="
                is_mobile
                  ? ''
                  : 'position: relative;margin-top: 0px;margin-left: 15px;left: 0px;'
              "
            >
              <h5 @click="goToProfile(item.user_id, item.user_name)">
                {{ item.user_name }}
              </h5>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div>
        <div
          class="black-background"
          v-if="play_trailer"
          @click="play_trailer = !play_trailer"
        />

        <div
          class="youtube-player-header"
          :style="is_mobile ? '' : 'top: 75px;left: calc(50vw - 500px);'"
          v-if="play_trailer & (youtube_trailer_link != null)"
        >
          Trailer
        </div>

        <div
          v-if="play_trailer & (youtube_trailer_link != null)"
          :class="
            is_mobile
              ? 'youtube-player-loader'
              : 'desktop-youtube-player-loader'
          "
        />

        <iframe
          class="youtube-player"
          :style="
            is_mobile
              ? ''
              : 'width: 1000px;left: calc(50vw - 500px);top: 100px;height: 500px;'
          "
          v-if="play_trailer & (youtube_trailer_link != null)"
          type="text/html"
          :src="youtube_trailer_link"
          frameborder="0"
          allowfullscreen
        />

        <div
          class="youtube-player-streaming-box"
          :style="
            youtube_trailer_link
              ? is_mobile
                ? ''
                : 'top: 650px;'
              : 'top: 40vh;'
          "
          v-if="
            play_trailer &
              (Object.keys(where_to_watch || {}).includes('stream') |
                Object.keys(where_to_watch || {}).includes('rent') |
                Object.keys(where_to_watch || {}).includes('buy'))
          "
        >
          <div
            class="tap-to-watch-text"
            v-if="
              Object.keys(where_to_watch || {}).includes('stream') |
                Object.keys(where_to_watch || {}).includes('rent') |
                Object.keys(where_to_watch || {}).includes('buy')
            "
          >
            {{ is_mobile ? "Tap to watch on" : "Click to watch on" }}
          </div>

          <div
            class="youtube-player-platforms"
            v-if="Object.keys(where_to_watch || {}).includes('stream')"
          >
            <div
              class="youtube-player-platforms-container"
              v-for="(item, index) in where_to_watch.stream"
            >
              <div
                @click="goToPlatform(item, trailer_content_id, 'trailer_popup')"
                class="youtube-player-platform-cropper"
              >
                <img
                  v-bind:src="
                    'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                      index +
                      '.jpg'
                  "
                  class="youtube-player-platform-icon"
                />
              </div>
            </div>
          </div>

          <div
            class="youtube-player-platforms"
            v-if="
              !Object.keys(where_to_watch || {}).includes('stream') &&
                Object.keys(where_to_watch || {}).includes('rent')
            "
          >
            <div
              class="youtube-player-platforms-container"
              v-for="(item, index) in where_to_watch.rent"
            >
              <div
                @click="goToPlatform(item, trailer_content_id, 'trailer_popup')"
                class="youtube-player-platform-cropper"
              >
                <img
                  v-bind:src="
                    'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                      index +
                      '.jpg'
                  "
                  class="youtube-player-platform-icon"
                />
              </div>
            </div>
          </div>

          <div
            class="youtube-player-platforms"
            v-if="
              !Object.keys(where_to_watch || {}).includes('stream') &&
                !Object.keys(where_to_watch || {}).includes('rent') &&
                Object.keys(where_to_watch || {}).includes('buy')
            "
          >
            <div
              class="youtube-player-platforms-container"
              v-for="(item, index) in where_to_watch.buy"
            >
              <div
                @click="goToPlatform(item, trailer_content_id, 'trailer_popup')"
                class="youtube-player-platform-cropper"
              >
                <img
                  v-bind:src="
                    'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                      index +
                      '.jpg'
                  "
                  class="youtube-player-platform-icon"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div>
        <div
          v-if="show_more_info"
          class="black-background"
          @click="show_more_info = !show_more_info"
        />

        <div
          class="more-info-container"
          :style="
            is_mobile
              ? ''
              : 'width: 500px;left: 50%;transform: translateX(-50%);'
          "
          v-if="show_more_info"
        >
          <div class="more-info-suggestion-name">
            <span
              style="cursor: pointer;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;-o-user-select: none;user-select: none;-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-tap-highlight-color: transparent;"
              @click="
                openContent(
                  show_more_info_content.content_id,
                  show_more_info_content.title,
                  show_more_info_content.feed_type
                    ? show_more_info_content.feed_type
                    : 'filter'
                )
              "
            >
              {{ show_more_info_content.title }}
            </span>

            <span
              v-if="show_more_info_content.type == 'tv'"
              style="font-weight: normal;"
            >
              ({{ show_more_info_content.release_year }}-{{
                show_more_info_content.end_year
                  ? show_more_info_content.end_year
                  : "Present"
              }})
            </span>

            <span
              v-if="show_more_info_content.type == 'movie'"
              style="font-weight: normal;"
            >
              ({{ show_more_info_content.release_year }})
            </span>
          </div>

          <p class="more-info-summary-text">
            {{ show_more_info_content.summary }}
          </p>

          <div class="suggestion-ratings">
            <div
              class="suggestion-rating-container"
              v-if="show_more_info_content.imdb_score"
            >
              IMDB
              <span style="font-weight: bold;">
                {{ show_more_info_content.imdb_score }}
              </span>
            </div>

            <div
              class="suggestion-rating-container"
              v-if="show_more_info_content.tomato_meter"
            >
              TOMATOMETER
              <span style="font-weight: bold;">
                {{ show_more_info_content.tomato_meter }}
              </span>
            </div>
          </div>

          <h3 v-if="show_more_info_content.crew.length">
            Cast and Crew
          </h3>

          <div
            class="more-info-artists"
            v-if="show_more_info_content.crew.length"
          >
            <div
              v-for="artist in show_more_info_content.crew"
              class="more-info-artists-container"
            >
              <div class="more-info-artist-cropper">
                <img
                  v-bind:src="artist.profile_photo"
                  class="more-info-artist-pic"
                />
              </div>
              <div class="more-info-artist-name">
                {{ artist.person }}
              </div>
            </div>
          </div>

          <h3 v-if="show_more_info_content.similar.length">
            Similar
            {{
              show_more_info_content.type == "movie" ? "Movies" : "TV Series"
            }}
          </h3>

          <div class="more-info-similar-content">
            <div
              v-for="item in show_more_info_content.similar"
              class="more-info-content-container"
              v-if="show_more_info_content.similar.length"
            >
              <img
                v-bind:src="item.poster"
                class="more-info-content-poster"
                @click="
                  openContent(
                    item.content_id,
                    item.title,
                    (show_more_info_content.feed_type
                      ? show_more_info_content.feed_type
                      : 'filter') + '__similar'
                  )
                "
              />

              <div
                class="more-info-similar-platforms"
                v-if="Object.keys(item.where_to_watch || {}).includes('stream')"
              >
                <div
                  class="more-info-similar-platforms-container"
                  v-for="(stream_item, stream_index) in item.where_to_watch
                    .stream"
                >
                  <div
                    @click="
                      goToPlatform(
                        stream_item,
                        item.content_id,
                        'similar_content_poster'
                      )
                    "
                    class="more-info-similar-platform-cropper"
                  >
                    <img
                      v-bind:src="
                        'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                          stream_index +
                          '.jpg'
                      "
                      class="more-info-similar-platform-icon"
                    />
                  </div>
                </div>
              </div>

              <div
                class="more-info-similar-platforms"
                v-if="
                  !Object.keys(item.where_to_watch || {}).includes('stream') &&
                    Object.keys(item.where_to_watch || {}).includes('rent')
                "
              >
                <div
                  class="more-info-similar-platforms-container"
                  v-for="(stream_item, stream_index) in item.where_to_watch
                    .rent"
                >
                  <div
                    @click="
                      goToPlatform(
                        stream_item,
                        item.content_id,
                        'similar_content_poster'
                      )
                    "
                    class="more-info-similar-platform-cropper"
                  >
                    <img
                      v-bind:src="
                        'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                          stream_index +
                          '.jpg'
                      "
                      class="more-info-similar-platform-icon"
                    />
                  </div>
                </div>
              </div>

              <div
                class="more-info-similar-platforms"
                v-if="
                  !Object.keys(item.where_to_watch || {}).includes('stream') &&
                    !Object.keys(item.where_to_watch || {}).includes('rent') &&
                    Object.keys(item.where_to_watch || {}).includes('buy')
                "
              >
                <div
                  class="more-info-similar-platforms-container"
                  v-for="(stream_item, stream_index) in item.where_to_watch.buy"
                >
                  <div
                    @click="
                      goToPlatform(
                        stream_item,
                        item.content_id,
                        'similar_content_poster'
                      )
                    "
                    class="more-info-similar-platform-cropper"
                  >
                    <img
                      v-bind:src="
                        'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                          stream_index +
                          '.jpg'
                      "
                      class="more-info-similar-platform-icon"
                    />
                  </div>
                </div>
              </div>

              <div
                class="more-info-content-name"
                @click="
                  openContent(
                    item.content_id,
                    item.title,
                    (show_more_info_content.feed_type
                      ? show_more_info_content.feed_type
                      : 'filter') + '__similar'
                  )
                "
              >
                {{ item.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div
      class="no-suggestion-message"
      v-if="store.discover_filters.fetching_filtered"
    >
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
      class="filtered-add-friends-message"
      v-if="store.discover_filters.fetching_filter_incremental"
    >
      <div class="sk-folding-cube">
        <div class="sk-cube1 sk-cube"></div>
        <div class="sk-cube2 sk-cube"></div>
        <div class="sk-cube4 sk-cube"></div>
        <div class="sk-cube3 sk-cube"></div>
      </div>
    </div>
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
      show_others: false,
      other_users: [],
      show_more_info: false,
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
        similar: [],
        feed_type: null
      },
      play_trailer: false,
      youtube_trailer_link: null,
      trailer_content_id: null,
      where_to_watch: null,
      is_string_query: false,
      search_content_type_tab: "All",
      showRefreshButton: true
    };
  },

  created() {
    if (this.store.discover_filters.is_string_query) {
      this.is_string_query = true;
      this.store.discover_filters.is_string_query = false;
    }
    this.$store.state.current_path = this.$route.path;

    var self = this;

    if (self.content_type_tab_string == "[movie,tv]") {
      self.search_content_type_tab = "All";
    } else if (self.content_type_tab_string == "[movie]") {
      self.search_content_type_tab = "Movie";
    } else if (self.content_type_tab_string == "[tv]") {
      self.search_content_type_tab = "TV";
    }

    self.store.discover_filters.fetching_filter_incremental = false;
    setTimeout(self.scrollToLastPosition, 500);
  },
  computed: {
    content_type_tab_string() {
      return JSON.stringify(
        this.$store.state.discover_filters.content_type_tab
      ).replace(/['"]+/g, "");
    }
  },
  mounted() {
    window.addEventListener("scroll", this.watchScroll);
  },
  methods: {
    updateScroll(scroll_position) {
      this.$store.state.scroll_positions.discover.filter = scroll_position;
    },
    switchContentTab(tab) {
      this.updateScroll(0);
      if (tab == "Movie") {
        this.$store.state.discover_filters.content_type_tab = ["movie"];
      } else if (tab == "TV") {
        this.$store.state.discover_filters.content_type_tab = ["tv"];
      } else if (tab == "All") {
        this.$store.state.discover_filters.content_type_tab = ["movie", "tv"];
      }
      this.scrollToLastPosition();
    },
    scrollToLastPosition() {
      window.scrollTo(0, this.$store.state.scroll_positions.discover.filter);
    },
    goToProfile(user_id, user_name) {
      if (user_id) {
        this.updateScroll(window.scrollY);
        this.$router.push(
          "/profile/" +
            user_id +
            "/" +
            user_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
        );
      }
    },
    showOther(user_ids) {
      var self = this;
      self.other_users = [];
      self.show_others = !self.show_others;
      axios
        .post(this.$store.state.api_host + "get_users_info", {
          session_id: this.$store.state.session_id,
          user_ids: user_ids,
          guest_id: self.$store.state.guest_id
        })
        .then(function(response) {
          if (response.status == 200) {
            self.other_users = response.data.users;
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
    },
    openContent(content_id, title, origin) {
      this.updateScroll(window.scrollY);
      this.$store.state.content_page.more_by_artist = null;
      this.$store.state.content_page.artist = null;
      var origin_full = "search_filter__" + origin;
      this.$store.state.content_page.origin = origin_full;
      this.$router.push(
        "/content/" +
          content_id +
          "/" +
          title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
    },
    playTrailer(
      youtube_trailer_id,
      where_to_watch,
      content_id,
      trailer_origin
    ) {
      this.updateScroll(window.scrollY);
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
        trailer_origin:
          "search_results__" + (trailer_origin ? trailer_origin : "filter")
      };
      this.$emit("update-api-counter", activity);
    },
    goToPlatform(link, content_id, traffic_origin) {
      this.updateScroll(window.scrollY);
      var activity = {
        api: "outbound_traffic",
        content_id: content_id,
        url: link,
        traffic_origin: "search_results__" + traffic_origin
      };
      this.$emit("update-api-counter", activity);
    },
    submitRating(content_id, user_rating, content_index) {
      if (this.$store.state.session_id != null) {
        var self = this;

        var prev_rating = null;

        prev_rating =
          self.$store.state.discover_filters.filtered_content[content_index]
            .rating;
        self.$store.state.discover_filters.filtered_content[
          content_index
        ].rating = user_rating;

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
                    self.$store.state.ai_host +
                      "calculate_contents_to_recommend",
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
            self.$store.state.discover_filters.filtered_content[
              content_index
            ].rating = prev_rating;

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
    addToWatchlist(content_id, watch_later, content_index) {
      if (this.$store.state.session_id != null) {
        var self = this;

        var prev_state = null;

        prev_state =
          self.$store.state.discover_filters.filtered_content[content_index]
            .watch_later;
        self.$store.state.discover_filters.filtered_content[
          content_index
        ].watch_later = watch_later ? false : true;

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
            self.$store.state.discover_filters.filtered_content[
              content_index
            ].watch_later = prev_state;

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
    showMoreInfo(
      content_id,
      title,
      type,
      release_year,
      end_year,
      feed_type,
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
      self.show_more_info_content.feed_type = feed_type;
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
          country:
            self.$store.state.user.profile.country || self.store.guest_country
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
    },
    watchScroll() {
      var self = this;
      var scroll_completion =
        window.scrollY /
        (document.documentElement.scrollHeight -
          document.documentElement.clientHeight);
      if (
        (this.$route.path == "/search-results") &
        (scroll_completion > 0.6) &
        !this.store.discover_filters.fetching_filter_incremental &
        (this.$store.state.discover_filters.more_filtered_content.length != 0)
      ) {
        this.store.discover_filters.fetching_filter_incremental = true;
        var self = this;
        axios
          .post(self.$store.state.api_host + "get_incremental_feed_contents", {
            session_id: self.$store.state.session_id,
            more_contents: self.$store.state.discover_filters.more_filtered_content.slice(
              0,
              15
            ),
            country:
              self.$store.state.user.profile.country || self.store.guest_country
          })
          .then(function(response) {
            if ([200].includes(response.status)) {
              if (self.$route.path == "/search-results") {
                self.$store.state.discover_filters.filtered_content.push(
                  ...response.data.contents
                );
                self.$store.state.discover_filters.more_filtered_content.splice(
                  0,
                  15
                );
              }
              self.store.discover_filters.fetching_filter_incremental = false;
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

      const currentScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop;
      if (currentScrollPosition < 0) {
        return;
      }
      // Stop executing this function if the difference between
      // current scroll position and last scroll position is less than some offset
      if (Math.abs(currentScrollPosition - self.lastScrollPosition) < 0) {
        return;
      }
      self.showRefreshButton = currentScrollPosition < self.lastScrollPosition;
      self.lastScrollPosition = currentScrollPosition;
      if ([NaN, 0, 1].includes(scroll_completion)) {
        setTimeout((self.showRefreshButton = true), 0);
      }
    }
  }
};
</script>

<style lang="scss">
@import "./../styles/mixins.scss";

.suggestion-content-type-tabs {
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
.suggestion-content-type-tabs a {
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
.suggestions-box {
  width: 100%;
  display: inline-grid;
  white-space: nowrap;
  margin-top: 165px;
  padding-bottom: 3%;
  padding-top: 30px;
  overflow-y: scroll;
  overflow-x: hidden;
}
.suggestion-container {
  width: 100vw;
  vertical-align: top;
  text-align: left;
  padding: 0 20px;
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 10px solid #f8f8f8;
}
.starting-text {
  margin-bottom: 10px;
}
.summary-profile-cropper {
  height: 35px;
  width: 35px;
  overflow: hidden;
  border-radius: 50%;
  background-color: #ffffff;
}
.summary-profile-pp {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.suggestion-summary-text {
  position: absolute;
  margin-top: -17.5px;
  margin-left: 40px;
  transform: translateY(-50%);
  overflow-y: scroll;
  white-space: initial;
  width: 80%;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
.suggestion-poster {
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
.suggestion-play-trailer {
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
.suggestion-info {
  position: relative;
  margin-top: calc(-60vw - 4px);
  margin-left: calc(40vw + 20px);
  width: calc(60vw - 60px);
  text-align: left;
  min-height: 60vw;
  background-color: #ffffff;
  white-space: normal;
}
.suggestion-name {
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
.suggestion-ratings {
  width: 100%;
  margin-top: 15px;
}
.suggestion-rating-container {
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
.suggestion-genres {
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
.suggestion-genre + .suggestion-genre:before {
  content: "|";
}
.suggestion-platforms {
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
.suggestion-platforms-container {
  display: inline-block;
  vertical-align: top;
  text-align: center;
  margin-left: 5px;
  margin-right: 5px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.suggestion-platform-cropper {
  width: 28px;
  height: 28px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.suggestion-platform-icon {
  display: inline-block;
  position: absolute;
  width: 100%;
  margin-left: -50%;
}
.suggestion-user-rating-container {
  position: relative;
  left: 0%;
  margin-top: 10px;
  text-align: left;
}
.suggestion-thumbs-up-true {
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
.suggestion-thumbs-up-false {
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
.suggestion-thumbs-down-true {
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
.suggestion-thumbs-down-false {
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
.suggestion-love-true {
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
.suggestion-love-false {
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
.suggestion-watchlist-n-more {
  position: relative;
  width: 100%;
  margin-top: 15px;
}
.suggestion-watchlist-continer {
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
.suggestion-watchlist-true {
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
.suggestion-watchlist-false {
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
.suggestion-more {
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
.fadeIn {
  animation: fadeIn 0.3s;
}
.fadeOut {
  animation: fadeOut 0.6s;
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
.more-info-suggestion-name {
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
.youtube-player {
  position: fixed;
  width: 100vw;
  height: 56.25vw;
  top: calc(50vh - 28.125vw - 20vh);
  left: 0;
  z-index: 100001;
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
.youtube-player-platforms {
  display: inline-flex;
  overflow: scroll;
  max-width: 100%;
}
.youtube-player-platforms-container {
  display: inline-block;
  vertical-align: top;
  text-align: center;
  margin: 20px 10px 0px 10px;
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
.others-list-container {
  position: fixed;
  width: 64%;
  left: 18%;
  top: 25vh;
  max-height: 50vh;
  overflow: scroll;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 1%;
  z-index: 100001;
}
.desktop-others-list-container {
  position: fixed;
  min-width: 300px;
  left: 50%;
  transform: translateX(-50%);
  top: 30vh;
  max-height: 50vh;
  overflow: scroll;
  z-index: 100001;
  background-color: #fff;
  border-radius: 7px;
  padding: 10px;
}
.other-user-container {
  position: relative;
  vertical-align: top;
  text-align: left;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 1%;
  margin-top: 1%;
}
.desktop-other-user-container {
  position: relative;
  display: flex;
  align-items: center;
  text-align: left;
  padding: 5px 10px;
  background-color: #fff;
  border-radius: 7px;
}
.other-user-pp-cropper {
  width: 35px;
  height: 35px;
  margin-left: 10px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  z-index: 2;
  background-color: #ffffff;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.other-user-pp {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.other-user-name-box {
  position: absolute;
  margin-top: -25px;
  left: 55px;
  white-space: nowrap;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.other-user-name-box h5 {
  font-size: 15px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
.no-suggestion-message {
  position: fixed;
  top: calc(50% - 36px);
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 95%;
}
.filtered-add-friends-message {
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  width: 95%;
}
.search-result-note {
  position: relative;
  text-align: left;
  width: 95vw;
  margin-left: 2.5vw;
  white-space: nowrap;
  background-color: #fafafa;
  padding: 5px;
  margin-top: 50px;
  margin-bottom: 15px;
  border-radius: 7px;
}
.search-result-note p {
  position: relative;
  margin-top: 10px;
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
.search-results-filters {
  position: fixed;
  top: 50px;
  left: 50%;
  z-index: 1000;
  height: 55px;
  width: 100%;
  background-color: #ffffff;
  transform: translate3d(-50%, 0%, 0);
  transition: transform 0.55s ease-out;
}
.search-results-filters.search-results-filters--hidden {
  transform: translate3d(-50%, -300%, 0);
}
.search-results-quick-filters {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 10px;
  overflow: scroll;
}
.search-results-quick-filters-content-type {
  display: flex;
  height: max-content;
}
.content-type-checkbox {
  display: inline-block;
  position: relative;
  width: max-content;
  border-radius: 50px;
  background-color: #ffffff;
  padding: 5px 15px;
  margin-right: 5px;
  border: 1px solid #dfe1e5;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.content-type-checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}
.content-type-checkmark-text {
  font-size: 15px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
  color: #333333;
}
</style>
