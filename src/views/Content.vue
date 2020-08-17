<template>
  <div id="content" class="content-box">
    <button
      class="content-search-icon"
      v-if="store.session_id == null"
      :style="is_mobile ? '' : 'right: calc(50vw - 500px);'"
      @click="$router.push('/search')"
      type="button"
    ></button>

    <div v-if="!loading && content.data != null">
      <!-- otherDivOffset & trailerIconSize props on below element depend on cover-trailer & content-below-cover elements -->
      <ContentCoverLandscape
        v-if="showCover"
        :imageUrl="content.data.cover"
        otherDivId="content-below-cover-container"
        :otherDivOffset="40"
        :trailerIconSize="80"
        trailerDivId="cover-trailer"
        :shareDiv="store.is_webview ? true : false"
        shareDivId="content-share-icon"
      />

      <ContentCoverPortrait
        v-else
        :imageUrl="content.data.poster"
        otherDivId="content-below-cover-container"
        :otherDivOffset="40"
        :trailerIconSize="80"
        trailerDivId="cover-trailer"
        :shareDiv="store.is_webview ? true : false"
        shareDivId="content-share-icon"
      />

      <div id="content-below-cover-container">
        <div
          class="content-share-icon"
          id="content-share-icon"
          v-if="store.is_webview"
          @click="prompt_content_share = true"
        />

        <!-- Size of element below should go as prop input for cover pic-->
        <Trailer
          class="cover-trailer"
          id="cover-trailer"
          style="height: 80px; margin-left: calc(50vw - 40px);"
          :size="80"
          parent="content_page"
          :contentId="content.content_id"
          :trailerId="content.data.youtube_trailer_id"
          :whereToWatch="content.data.where_to_watch"
          v-on="$listeners"
        />

        <!-- Margin top (absolute) on element below should go as prop input for cover pic-->
        <div class="content-below-cover">
          <div class="title">
            <span
              style="position: relative; font-weight: bold; margin-right: 10px;"
            >
              {{ content.data.title }}
              <span
                style="font-size: 11.5px; font-weight: normal;"
                v-if="content.data.type == 'tv'"
              >
                ({{ content.data.release_year }}-{{
                  content.data.end_year ? content.data.end_year : "Present"
                }})
              </span>

              <span
                style="font-size: 11.5px; font-weight: normal;"
                v-if="content.data.type == 'movie'"
              >
                ({{ content.data.release_year }})
              </span>
            </span>

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

            <div class="user-rating-container">
              <button
                v-bind:class="[
                  content.data.rating == 3 ? 'love-true' : 'love-false',
                ]"
                :style="
                  is_mobile
                    ? ''
                    : 'height: 50px;width: 50px;margin-left: 200px;'
                "
                @click="submitRating(content.data.rating == 3 ? 0 : 3)"
              ></button>

              <button
                v-bind:class="[
                  content.data.rating == 2
                    ? 'thumbs-up-true'
                    : 'thumbs-up-false',
                ]"
                :style="
                  is_mobile
                    ? ''
                    : 'height: 50px;width: 50px;margin-left: 200px;'
                "
                @click="submitRating(content.data.rating == 2 ? 0 : 2)"
              ></button>

              <button
                v-bind:class="[
                  content.data.rating == 1
                    ? 'thumbs-down-true'
                    : 'thumbs-down-false',
                ]"
                :style="
                  is_mobile
                    ? ''
                    : 'height: 50px;width: 50px;margin-left: 200px;'
                "
                @click="submitRating(content.data.rating == 1 ? 0 : 1)"
              ></button>
            </div>

            <p
              class="summary-text"
              :style="is_mobile ? '' : 'font-size: 15px;'"
              v-if="content.data.summary_text"
            >
              {{ content.data.summary_text }}
            </p>

            <div class="info-container">
              <div class="ratings" :style="is_mobile ? '' : 'font-size: 15px;'">
                <div class="rating-container" v-if="content.data.imdb_score">
                  IMDB
                  <span style="font-weight: bold;">
                    {{ content.data.imdb_score }}
                  </span>
                </div>

                <div class="rating-container" v-if="content.data.tomato_meter">
                  TOMATOMETER
                  <span style="font-weight: bold;">
                    {{ content.data.tomato_meter }}
                  </span>
                </div>
              </div>

              <div
                class="genres"
                :style="is_mobile ? '' : 'font-size: 15px;margin-top: 4px;'"
              >
                <span
                  class="genre"
                  v-for="(genre, index) in content.data.genres"
                  :key="index"
                >
                  {{ genre }}
                </span>
              </div>

              <div
                class="seasons"
                :style="is_mobile ? '' : 'font-size: 15px;margin-top: 6px;'"
                v-if="content.data.type == 'tv'"
              >
                <span v-if="content.data.seasons">
                  {{ content.data.seasons }}
                  {{ content.data.seasons > 1 ? "Seasons | " : "Season | " }}
                </span>
                <span v-if="content.data.episodes">
                  {{ content.data.episodes }}
                  {{ content.data.episodes > 1 ? "Episodes | " : "Episode | " }}
                </span>
                <span v-if="content.data.runtime">
                  {{ content.data.runtime }}
                  {{ content.data.episodes ? "Each" : "Each Episode" }}
                </span>
              </div>

              <div
                class="seasons"
                :style="is_mobile ? '' : 'font-size: 15px;margin-top: 6px;'"
                v-if="content.data.type == 'movie'"
              >
                {{ content.data.runtime }}
              </div>

              <div
                class="platforms"
                :style="is_mobile ? '' : 'margin-top: 10px;'"
                v-if="
                  Object.keys(content.data.where_to_watch || {}).includes(
                    'stream'
                  )
                "
              >
                <div
                  class="platforms-container"
                  v-for="(item, index) in content.data.where_to_watch.stream"
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

              <div
                class="platforms"
                :style="is_mobile ? '' : 'margin-top: 10px;'"
                v-if="
                  !Object.keys(content.data.where_to_watch || {}).includes(
                    'stream'
                  ) &&
                  Object.keys(content.data.where_to_watch || {}).includes(
                    'rent'
                  )
                "
              >
                <div
                  class="platforms-container"
                  v-for="(item, index) in content.data.where_to_watch.rent"
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

              <div
                class="platforms"
                :style="is_mobile ? '' : 'margin-top: 10px;'"
                v-if="
                  !Object.keys(content.data.where_to_watch || {}).includes(
                    'stream'
                  ) &&
                  !Object.keys(content.data.where_to_watch || {}).includes(
                    'rent'
                  ) &&
                  Object.keys(content.data.where_to_watch || {}).includes('buy')
                "
              >
                <div
                  class="platforms-container"
                  v-for="(item, index) in content.data.where_to_watch.buy"
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
              <div
                v-for="(item, index) in content.similar_content"
                :key="index"
                class="content-container"
              >
                <img
                  v-bind:src="item.poster"
                  @click="
                    openContent(
                      item.content_id,
                      item.title,
                      'content_page_similar'
                    )
                  "
                  class="content-poster"
                  style="width: 125px; height: 187.5px;"
                />

                <div
                  class="content-similar-platforms"
                  style="width: 125px;"
                  v-if="(Object.keys(item.where_to_watch || {}).includes('stream'))"
                >
                  <div
                    class="content-similar-platforms-container"
                    v-for="(stream_item, stream_index) in item.where_to_watch
                      .stream"
                    :key="stream_index"
                  >
                    <div
                      @click="
                        goToPlatform(
                          stream_item,
                          item.content_id,
                          'similar_content_poster'
                        )
                      "
                      class="content-similar-platform-cropper"
                      :style="is_mobile ? '' : 'width: 23px;height: 23px;'"
                    >
                      <img
                        v-bind:src="
                          'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                          stream_index +
                          '.jpg'
                        "
                        class="content-similar-platform-icon"
                      />
                    </div>
                  </div>
                </div>

                <div
                  class="content-similar-platforms"
                  style="width: 125px;"
                  v-if="
                    !Object.keys(item.where_to_watch || {}).includes(
                      'stream'
                    ) && Object.keys(item.where_to_watch || {}).includes('rent')
                  "
                >
                  <div
                    class="content-similar-platforms-container"
                    v-for="(stream_item, stream_index) in item.where_to_watch
                      .rent"
                    :key="stream_index"
                  >
                    <div
                      @click="
                        goToPlatform(
                          stream_item,
                          item.content_id,
                          'similar_content_poster'
                        )
                      "
                      class="content-similar-platform-cropper"
                      :style="is_mobile ? '' : 'width: 23px;height: 23px;'"
                    >
                      <img
                        v-bind:src="
                          'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                          stream_index +
                          '.jpg'
                        "
                        class="content-similar-platform-icon"
                      />
                    </div>
                  </div>
                </div>

                <div
                  class="content-similar-platforms"
                  style="width: 125px;"
                  v-if="
                    !Object.keys(item.where_to_watch || {}).includes(
                      'stream'
                    ) &&
                    !Object.keys(item.where_to_watch || {}).includes('rent') &&
                    Object.keys(item.where_to_watch || {}).includes('buy')
                  "
                >
                  <div
                    class="content-similar-platforms-container"
                    v-for="(stream_item, stream_index) in item.where_to_watch
                      .buy"
                    :key="stream_index"
                  >
                    <div
                      @click="
                        goToPlatform(
                          stream_item,
                          item.content_id,
                          'similar_content_poster'
                        )
                      "
                      class="content-similar-platform-cropper"
                      :style="is_mobile ? '' : 'width: 23px;height: 23px;'"
                    >
                      <img
                        v-bind:src="
                          'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                          stream_index +
                          '.jpg'
                        "
                        class="content-similar-platform-icon"
                      />
                    </div>
                  </div>
                </div>

                <div
                  class="content-name"
                  @click="
                    openContent(
                      item.content_id,
                      item.title,
                      'content_page_similar'
                    )
                  "
                  style="width: 125px;"
                >
                  {{ item.title }}
                </div>
              </div>
              <div
                v-if="!content.similar_content"
                style="margin-top: 8%; margin-left: 3%; font-size: 4vw;"
              >
                Oops...Could not find any similar content.
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
                  ? ''
                  : 'margin-left: 10px;font-size: 15px;margin-top: 145px;'
              "
              v-if="content.crew.directed_by.length"
            >
              Direction
            </div>
            <div class="artists" v-if="content.crew.directed_by.length">
              <div
                v-for="(artist, index) in content.crew.directed_by"
                :key="index"
                class="artists-container"
                @click="
                  moreContent(artist.person_id, artist.person, 'directed_by')
                "
              >
                <div
                  class="artist-cropper"
                  :style="is_mobile ? '' : 'width: 75px;height: 95px;'"
                >
                  <img v-bind:src="artist.profile_photo" class="artist-pic" />
                </div>
                <div
                  class="artist-name"
                  :style="is_mobile ? '' : 'width: 75px;font-size: 12px;'"
                >
                  {{ artist.person }}
                </div>
              </div>
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
              <div
                v-for="(artist, index) in content.crew.cast"
                :key="index"
                class="artists-container"
                @click="moreContent(artist.person_id, artist.person, 'cast')"
              >
                <div
                  class="artist-cropper"
                  :style="is_mobile ? '' : 'width: 75px;height: 95px;'"
                >
                  <img v-bind:src="artist.profile_photo" class="artist-pic" />
                </div>
                <div
                  class="artist-name"
                  :style="is_mobile ? '' : 'width: 75px;font-size: 12px;'"
                >
                  {{ artist.person }}
                </div>
              </div>
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
              <div
                v-for="(artist, index) in content.crew.writing_credits"
                :key="index"
                class="artists-container"
                @click="
                  moreContent(
                    artist.person_id,
                    artist.person,
                    'writing_credits'
                  )
                "
              >
                <div
                  class="artist-cropper"
                  :style="is_mobile ? '' : 'width: 75px;height: 95px;'"
                >
                  <img v-bind:src="artist.profile_photo" class="artist-pic" />
                </div>
                <div
                  class="artist-name"
                  :style="is_mobile ? '' : 'width: 75px;font-size: 12px;'"
                >
                  {{ artist.person }}
                </div>
              </div>
            </div>
          </div>

          <div
            class="more-contents-container"
            v-if="content.more_by_artist.length | fetching_more"
          >
            <div
              :style="
                is_mobile ? more_header_negative : desktop_more_header_negative
              "
              v-on-click-outside="close"
              v-if="fetching_more"
            >
              Fetching more content by {{ content.artist.split(" ")[0] }}...
            </div>

            <div
              :style="
                is_mobile ? more_header_positive : desktop_more_header_positive
              "
              v-if="(content.more_by_artist.length > 1)"
            >
              &#160;&#160;More by {{ content.artist.split(" ")[0] }}...
            </div>
            <div
              :style="
                is_mobile
                  ? close_more_header_positive
                  : desktop_close_more_header_positive
              "
              v-if="(content.more_by_artist.length > 1)"
              @click="close"
            />

            <div
              :style="
                is_mobile ? more_header_negative : desktop_more_header_negative
              "
              v-if="content.more_by_artist.length == 1"
              v-on-click-outside="close"
            >
              Oops...could not find any more content by
              {{ content.artist.split(" ")[0] }}.
            </div>
            <div
              :style="
                is_mobile
                  ? close_more_header_negative
                  : desktop_close_more_header_negative
              "
              v-if="content.more_by_artist.length == 1 || fetching_more"
              @click="close"
            />

            <div
              :style="is_mobile ? more_contents : desktop_more_contents"
              v-if="(content.more_by_artist.length > 1)"
              v-on-click-outside="close"
            >
              <div
                v-for="(item, index) in content.more_by_artist"
                :key="index"
                class="content-container"
                :style="
                  is_mobile ? '' : 'padding-right: 15px;margin-top: 15px;'
                "
                v-if="item.content_id != content.content_id"
              >
                <img
                  v-bind:src="item.poster"
                  @click="
                    openContent(
                      item.content_id,
                      item.title,
                      'content_page__more_by_artist'
                    )
                  "
                  class="content-poster"
                  style="width: 125px; height: 187.5px;"
                />

                <div
                  class="content-similar-platforms"
                  style="width: 125px;"
                  v-if="(Object.keys(item.where_to_watch || {}).includes('stream'))"
                >
                  <div
                    class="content-similar-platforms-container"
                    v-for="(stream_item, stream_index) in item.where_to_watch
                      .stream"
                    :key="stream_index"
                  >
                    <div
                      @click="
                        goToPlatform(
                          stream_item,
                          item.content_id,
                          'more_by_artist'
                        )
                      "
                      class="content-similar-platform-cropper"
                      :style="is_mobile ? '' : 'width: 23px;height: 23px;'"
                    >
                      <img
                        v-bind:src="
                          'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                          stream_index +
                          '.jpg'
                        "
                        class="content-similar-platform-icon"
                      />
                    </div>
                  </div>
                </div>

                <div
                  class="content-similar-platforms"
                  style="width: 125px;"
                  v-if="
                    !Object.keys(item.where_to_watch || {}).includes(
                      'stream'
                    ) && Object.keys(item.where_to_watch || {}).includes('rent')
                  "
                >
                  <div
                    class="content-similar-platforms-container"
                    v-for="(stream_item, stream_index) in item.where_to_watch
                      .rent"
                    :key="stream_index"
                  >
                    <div
                      @click="
                        goToPlatform(
                          stream_item,
                          item.content_id,
                          'more_by_artist'
                        )
                      "
                      class="content-similar-platform-cropper"
                      :style="is_mobile ? '' : 'width: 23px;height: 23px;'"
                    >
                      <img
                        v-bind:src="
                          'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                          stream_index +
                          '.jpg'
                        "
                        class="content-similar-platform-icon"
                      />
                    </div>
                  </div>
                </div>

                <div
                  class="content-similar-platforms"
                  style="width: 125px;"
                  v-if="
                    !Object.keys(item.where_to_watch || {}).includes(
                      'stream'
                    ) &&
                    !Object.keys(item.where_to_watch || {}).includes('rent') &&
                    Object.keys(item.where_to_watch || {}).includes('buy')
                  "
                >
                  <div
                    class="content-similar-platforms-container"
                    v-for="(stream_item, stream_index) in item.where_to_watch
                      .buy"
                    :key="stream_index"
                  >
                    <div
                      @click="
                        goToPlatform(
                          stream_item,
                          item.content_id,
                          'more_by_artist'
                        )
                      "
                      class="content-similar-platform-cropper"
                      :style="is_mobile ? '' : 'width: 23px;height: 23px;'"
                    >
                      <img
                        v-bind:src="
                          'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/' +
                          stream_index +
                          '.jpg'
                        "
                        class="content-similar-platform-icon"
                      />
                    </div>
                  </div>
                </div>

                <div
                  class="content-name"
                  @click="
                    openContent(
                      item.content_id,
                      item.title,
                      'content_page__more_by_artist'
                    )
                  "
                  style="width: 125px;"
                >
                  {{ item.title }}
                </div>
              </div>
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
          class="black-background"
          :style="
            is_mobile
              ? 'height: calc(100vh - 370px - 3.5%);'
              : 'height: calc(100vh - 490px);'
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
        {{ store.quotes[Math.floor(Math.random() * 22)] }}
      </div>
    </div>

    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div>
        <div
          v-if="prompt_content_share"
          class="black-background"
          @click="prompt_content_share = false"
        />

        <div class="prompted-content-box" v-if="prompt_content_share">
          <img
            :src="content.data[share_item]"
            style="max-width: 80vw; max-height: 45vh;"
          />

          <label
            v-for="(tab, index) in ['poster', 'cover']"
            :key="index"
            class="content-share-tab-checkbox"
          >
            <input
              type="radio"
              v-bind:value="tab"
              v-model="share_item"
              class="content-share-tab-checkbox-input"
            />
            <span class="content-share-tab-checkmark-abled" />
            <span class="content-share-tab-checkmark-text">{{ tab }}</span>
          </label>

          <div class="prompted-content-buttons">
            <input
              type="button"
              class="prompted-content-android-share-button"
              @click="promptContentAndroidShareIntent"
              value="Share"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";
import { mixin as onClickOutside } from "vue-on-click-outside";
import ContentCoverLandscape from "./../components/atomic/ContentCoverLandscape";
import ContentCoverPortrait from "./../components/atomic/ContentCoverPortrait";
import Trailer from "./../components/atomic/Trailer";

export default {
  name: "App",
  mixins: [onClickOutside],
  components: {
    ContentCoverLandscape,
    ContentCoverPortrait,
    Trailer,
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
  },
  mounted() {
    window.addEventListener("scroll", this.promptTapOnArtist);
  },
  methods: {
    reRender() {
      window.scrollBy(0, 1);
      var self = this;
      self.loading = true;
      this.$store.state.current_path = this.$route.path;
      this.$store.state.content_page.content_id = parseInt(
        this.$route.params.content_id
      );
      this.$store.state.content_page.data = null;
      this.$store.state.content_page.crew = null;
      this.$store.state.content_page.more_by_artist = [];
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
    },
    promptContentAndroidShareIntent() {
      this.$emit("update-api-counter", {
        api: "share_content_" + this.share_item,
        content_id: this.content.content_id,
      });
      Android.shareCollage(
        this.content.data[this.share_item],
        window.location.href
      );
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
                    self.$store.state.notifications.suggestions = true;
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
    moreContent(artist_id, artist_name, credit_category) {
      this.show_tap_instructions = false;
      this.$store.state.content_page.never_tapped_any_artist = false;
      this.fetching_more = true;
      this.$store.state.content_page.artist = artist_name;
      this.$store.state.click_coordinate_x = event.clientX;
      this.$store.state.click_coordinate_y = event.clientY;
      var self = this;
      axios
        .post(this.$store.state.api_host + "more_by_artist", {
          session_id: this.$store.state.session_id,
          artist_id: artist_id,
          credit_category: credit_category,
          country:
            self.$store.state.user.profile.country ||
            self.$store.state.guest_country,
          guest_id: self.$store.state.guest_id,
        })
        .then(
          (response) => (
            (self.$store.state.content_page.more_by_artist =
              response.data.contents),
            (self.fetching_more = false)
          )
        )
        .catch(function (error) {
          // console.log(error);
        });
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
  },
  computed: {
    check_rerender() {
      return this.$store.state.content_page.rerender;
    },
    more_header_positive() {
      return (
        `
              position: fixed;
              width: 90%;
              height: 50px;
              white-space: nowrap;
              margin-left: 6%;
              top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 263, 58)
        ) +
        `px;
              background-color: #ffffff;
              border-radius: 10px;
              text-align: left;
              padding: 1%;
              `
      );
    },
    close_more_header_positive() {
      return (
        `
              position: fixed;
              width: 20px;
              height: 20px;
              left: calc(50vw + 45% - 25px);
              top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 259, 62)
        ) +
        `px;
              background-image: url('` +
        require(`./../images/close.png`) +
        `');
              background-size: 100%;
              background-repeat: no-repeat;
              background-position: center;
              border: 0;
              padding: 0;
              cursor: pointer;
              -webkit-tap-highlight-color: rgba(0,0,0,0);
	            -webkit-tap-highlight-color: transparent;
              `
      );
    },
    desktop_more_header_positive() {
      return (
        `
              position: fixed;
              white-space: nowrap;
              top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 273, 58)
        ) +
        `px;
              background-color: rgb(255, 255, 255);
              border-radius: 10px;
              text-align: left;
              padding: 10px;
              width: 750px;
              height: 50px;
              left: 50%;
              transform: translateX(-375px);
              `
      );
    },
    desktop_close_more_header_positive() {
      return (
        `
              position: fixed;
              width: 25px;
              height: 25px;
              left: calc(50vw + 375px - 35px);
              top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 263, 68)
        ) +
        `px;
              background-image: url('` +
        require(`./../images/close.png`) +
        `');
              background-size: 100%;
              background-repeat: no-repeat;
              background-position: center;
              border: 0;
              padding: 0;
              cursor: pointer;
              -webkit-tap-highlight-color: rgba(0,0,0,0);
	            -webkit-tap-highlight-color: transparent;
              `
      );
    },
    more_header_negative() {
      return (
        `
              position: fixed;
              width: 90%;
              white-space: nowrap;
              margin-left: 6%;
              top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 70, 59)
        ) +
        `px;
              background-color: #ffffff;
              border-radius: 10px;
              text-align: left;
              padding: 3px;
              `
      );
    },
    close_more_header_negative() {
      return (
        `
              position: fixed;
              width: 30px;
              height: 30px;
              left: calc(50vw + 45% - 25px);
              top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 70, 59)
        ) +
        `px;
              background-image: url('` +
        require(`./../images/close.png`) +
        `');
              background-size: 66%;
              background-repeat: no-repeat;
              background-position: center;
              border: 0;
              padding: 0;
              cursor: pointer;
              -webkit-tap-highlight-color: rgba(0,0,0,0);
	            -webkit-tap-highlight-color: transparent;
              background-color: #ffffff;
              border-radius: 50%;
              `
      );
    },
    desktop_more_header_negative() {
      return (
        `
              position: fixed;
              white-space: nowrap;
              width: 750px;
              left: 50%;
              transform: translateX(-375px);
              top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 70, 59)
        ) +
        `px;
              background-color: #ffffff;
              border-radius: 10px;
              text-align: left;
              padding: 10px;
              `
      );
    },
    desktop_close_more_header_negative() {
      return (
        `
              position: fixed;
              width: 25px;
              height: 25px;
              left: calc(50vw + 375px - 35px);
              top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 60, 69)
        ) +
        `px;
              background-image: url('` +
        require(`./../images/close.png`) +
        `');
              background-size: 100%;
              background-repeat: no-repeat;
              background-position: center;
              border: 0;
              padding: 0;
              cursor: pointer;
              -webkit-tap-highlight-color: rgba(0,0,0,0);
	            -webkit-tap-highlight-color: transparent;
              background-color: #ffffff;
              border-radius: 50%;
              `
      );
    },
    more_contents() {
      return (
        `
              position: fixed;
              display: inline-flex;
              overflow-x: scroll;
              width: 90%;
              white-space: nowrap;
              margin-left: -44%;
              top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 238, 83)
        ) +
        `px;
              background-color: #ffffff;
              border-radius: 20px;
              padding-left: 3%;
              `
      );
    },
    desktop_more_contents() {
      return (
        `
              position: fixed;
              display: inline-flex;
              overflow-x: scroll;
              width: 750px;
              white-space: nowrap;
              left: 50%;
              transform: translateX(-50%);
              top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 238, 83)
        ) +
        `px;
              background-color: rgb(255, 255, 255);
              border-radius: 10px;
              padding-left: 15px;
              padding-bottom: 10px;
              `
      );
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

<style lang="scss">
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
.content-below-cover {
  margin-top: -40px;
  border-radius: 24px;
  background-color: #fff;
  padding: 24px 24px 0px 24px;
}
.cover-trailer {
  position: absolute;
  z-index: 100000;
}
.title {
  position: relative;
  font-size: 18px;
  text-align: left;
}
.watchlist-true {
  position: absolute;
  height: 13px;
  width: 13px;
  margin-left: 4px;
  margin-top: 8px;
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
  position: absolute;
  height: 13px;
  width: 13px;
  margin-left: 4px;
  margin-top: 8px;
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
.watchlist-message {
  position: absolute;
  font-size: 12px;
  white-space: nowrap;
  margin-left: 67.5%;
  margin-top: -55%;
  color: #ffffff;
  background-color: #9b9898;
  border-radius: 7px;
  padding: 2px;
}
.user-rating-container {
  position: relative;
  margin-top: 20px;
}
.thumbs-up-true {
  position: relative;
  height: 10vw;
  width: 10vw;
  margin-left: 15vw;
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
.thumbs-up-false {
  position: relative;
  height: 10vw;
  width: 10vw;
  margin-left: 15vw;
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
.thumbs-down-true {
  position: relative;
  height: 10vw;
  width: 10vw;
  margin-left: 15vw;
  transform: translateY(8%);
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
.thumbs-down-false {
  position: relative;
  height: 10vw;
  width: 10vw;
  margin-left: 15vw;
  transform: translateY(8%);
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
.love-true {
  position: relative;
  height: 10vw;
  width: 10vw;
  margin-left: 15vw;
  transform: translateY(6%);
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
.love-false {
  position: relative;
  height: 10vw;
  width: 10vw;
  margin-left: 15vw;
  transform: translateY(6%);
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
.summary-text {
  position: relative;
  margin-left: 0%;
  margin-top: 15px;
  font-size: 14px;
  text-align: left;
  border-top: 1px solid #f3f3f3;
  padding-top: 15px;
}
.info-container {
  position: relative;
  margin-top: 15px;
  border-top: 1px solid #f3f3f3;
}
.ratings {
  width: 100%;
  margin-top: 15px;
}
.rating-container {
  position: relative;
  display: inline-block;
  margin-bottom: 5px;
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
.imdb-rating-logo {
  position: absolute;
  display: inline-block;
  width: 40%;
  margin-top: -16%;
}
.imdb-rating {
  position: absolute;
  display: inline-block;
  margin-left: 45%;
  margin-top: -6%;
  font-size: 13px;
}
.tomato-rating-logo {
  position: absolute;
  display: inline-block;
  width: 30%;
  margin-left: -20%;
  margin-top: -12.5%;
}
.tomato-rating {
  position: absolute;
  display: inline-block;
  margin-left: 12.5%;
  font-size: 13px;
  margin-top: -6%;
}
.genres {
  font-size: 14px;
  text-align: left;
}
.genre + .genre:before {
  content: "|";
}
.seasons {
  margin-top: 1px;
  font-size: 14px;
}
.tabs-container {
  position: absolute;
  margin-top: 8%;
  width: 95%;
}
.tabs {
  overflow: hidden;
  margin-bottom: -2px;
  width: 100%;
  margin-top: 10%;
}
.tabs a {
  float: left;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  padding: 6px 12px;
  transition: background-color 0.2s;
  background-color: #f1f1f1;
  border-radius: 5px 3px 0 0;
  font-weight: bold;
  font-size: 14px;
  width: 33%;
}
.tabs a.is-active {
  background-color: rgb(174, 219, 245);
  border-bottom: 2px solid rgb(68, 126, 235);
  cursor: default;
}
.tabcontent {
  padding: 1%;
}
.artists {
  display: inline-flex;
  overflow-x: scroll;
  width: 94%;
  white-space: nowrap;
  padding: 10px;
  margin-left: 3%;
}
.artist-cropper {
  display: inline-block;
  width: 55px;
  height: 70px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.artist-pic {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.artist-name {
  margin-top: 3px;
  position: relative;
  width: 55px;
  white-space: normal;
  font-size: 10px;
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
.artists-container {
  display: inline-block;
  margin-right: 20px;
  vertical-align: top;
  text-align: center;
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
  width: 94%;
  white-space: nowrap;
  margin-top: 6px;
}
.platform-cropper {
  width: 10vw;
  height: 10vw;
  // margin: 0 auto;
  margin-left: 0%;
  position: relative;
  overflow: hidden;
  border-radius: 20%;
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
.pages {
  display: block;
  position: absolute;
  margin-left: 6%;
  /* margin-top: 50%; */
  margin-bottom: 5%;
}
.website {
  position: relative;
  display: block;
  width: 40vw;
  height: 30px;
  /* margin-left: -235%; */
  margin-top: 5%;
  margin-bottom: 5%;
  background-color: #646668;
  background-size: 100% 100%;
  padding: -1% 35%;
  border: none;
  border-radius: 25px;
  outline: 0;
  color: #fff;
  font-weight: bold;
}
.facebook {
  position: relative;
  display: block;
  width: 40vw;
  height: 30px;
  // margin-left: -235%;
  margin-top: 5%;
  margin-bottom: 5%;
  background-color: #3b5998;
  background-size: 100% 100%;
  padding: -1% 35%;
  border: none;
  border-radius: 25px;
  outline: 0;
  color: #fff;
  font-weight: bold;
}
.instagram {
  position: relative;
  display: block;
  width: 40vw;
  height: 30px;
  // margin-left: -235%;
  margin-top: 5%;
  margin-bottom: 5%;
  background: #f09433;
  background: -moz-linear-gradient(
    45deg,
    #f09433 0%,
    #e6683c 25%,
    #dc2743 50%,
    #cc2366 75%,
    #bc1888 100%
  );
  background: -webkit-linear-gradient(
    45deg,
    #f09433 0%,
    #e6683c 25%,
    #dc2743 50%,
    #cc2366 75%,
    #bc1888 100%
  );
  background: linear-gradient(
    45deg,
    #f09433 0%,
    #e6683c 25%,
    #dc2743 50%,
    #cc2366 75%,
    #bc1888 100%
  );
  background-size: 100% 100%;
  padding: -1% 35%;
  border: none;
  border-radius: 25px;
  outline: 0;
  color: #fff;
  font-weight: bold;
}
.twitter {
  position: relative;
  display: block;
  width: 40vw;
  height: 30px;
  // margin-left: -235%;
  margin-top: 5%;
  margin-bottom: 5%;
  background-color: #00acee;
  background-size: 100% 100%;
  padding: -1% 35%;
  border: none;
  border-radius: 25px;
  outline: 0;
  color: #fff;
  font-weight: bold;
}
.more-contents-container {
  position: fixed;
  z-index: 100000;
  top: 0;
  left: 0;
  width: 100%;
  height: 120%;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  transition: opacity 0.3s ease;
}
.content-container {
  position: relative;
  display: inline-block;
  padding-right: 20px;
  margin-top: 5px;
  vertical-align: top;
  text-align: center;
}
.content-poster {
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
.content-name {
  margin-top: 3px;
  position: relative;
  width: 100px;
  white-space: normal;
  font-size: 12px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
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
.similar-content {
  display: inline-flex;
  overflow-x: scroll;
  width: 94%;
  white-space: nowrap;
  margin-left: 5%;
}
.artists-box {
  position: relative;
  margin-top: 13px;
  padding-top: 15px;
  border-top: 1px solid #f3f3f3;
  margin-bottom: 20px;
}
.similar-content-box {
  position: relative;
  margin-top: 13px;
  padding-top: 15px;
  border-top: 1px solid #f3f3f3;
}
.watchlist-continer {
  position: relative;
  display: initial;
  white-space: nowrap;
  padding: 5px 21px 5px 5px;
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
.content-page-fetching {
  position: fixed;
  top: calc(50% - 36px);
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 95%;
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
.content-share-icon {
  position: fixed;
  right: 20px;
  top: 70px;
  width: 8vw;
  height: 8vw;
  background-image: url("./../images/share-icon.svg");
  background-color: #ffffffb7;
  background-size: 75% 75%;
  background-repeat: no-repeat;
  background-position: 0.75vw;
  border: none;
  outline: 0;
  z-index: 1;
  border-radius: 50%;
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
.content-search-icon {
  position: fixed;
  display: block;
  right: 0;
  top: 0;
  height: 50px;
  width: 50px;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  background-image: url("./../images/search-icon.svg");
  background-size: 50% 50%;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 100000;
}
.content-similar-platforms {
  text-align: center;
  position: absolute;
  overflow-x: scroll;
  white-space: nowrap;
  margin-top: -37px;
  margin-left: 0px;
  width: 100px;
  padding: 5px 0px 1px 0px;
  border-radius: 0 0 7px 7px;
  background-color: rgba(0, 0, 0, 0.5);
}
.content-similar-platform-cropper {
  width: 20px;
  height: 20px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.content-similar-platform-icon {
  display: inline-block;
  position: absolute;
  width: 100%;
  margin-left: -50%;
}
.content-similar-platforms-container {
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
