<template>
  <div v-if="renderComponent">
    <div
      v-if="fetching_profile & !own_profile"
      class="fetching-profile-message"
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
      style="position: relative; width: 95%; margin-left: 2.5%"
      v-if="!fetching_profile | own_profile"
    >
      <div :class="is_mobile ? 'profile-cover' : 'desktop-profile-cover'">
        <img
          v-for="(item, index) in posters"
          :key="'poster-' + (index + 1)"
          v-bind:class="'poster-' + (index + 1)"
          @click="
            openContent(
              item.content_id,
              item.title,
              'profile_' + (own_profile ? 'self_' : 'other_') + 'cover'
            )
          "
          v-bind:src="item.poster"
        />

        <img
          v-for="(item, index) in covers"
          :key="'cover-' + (index + 1)"
          v-bind:class="'cover-' + (index + 1)"
          @click="
            openContent(
              item.content_id,
              item.title,
              'profile_' + (own_profile ? 'self_' : 'other_') + 'cover'
            )
          "
          v-bind:src="item.cover"
        />
      </div>

      <div
        :class="is_mobile ? 'profile-pp-cropper' : 'desktop-profile-pp-cropper'"
      >
        <img
          v-bind:src="profile_picture"
          onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
          class="profile-pp"
        />
      </div>

      <div
        :class="is_mobile ? 'user-name' : 'desktop-user-name'"
        :style="own_profile ? '' : 'width: 90%;margin-left: 5%;'"
      >
        <h4
          :style="
            own_profile
              ? 'display: inline; text-align: center; vertical-align: middle;'
              : 'display: flex; flex-direction: column; justify-content: center; align-items: center;'
          "
        >
          <span
            :style="own_profile ? 'margin-right: 8px; line-height: 1.75;' : ''"
          >
            {{ user_name }}
          </span>

          <div
            :style="
              own_profile
                ? 'display: inline-block; vertical-align: text-top;'
                : 'display: flex; margin-top: 8px'
            "
          >
            <span
              class="friendship-status"
              v-if="['other', 'request_sent', 'friend'].includes(user_type)"
              @click="
                user_type == 'friend'
                  ? (prompt = true)
                  : ['request_sent'].includes(user_type)
                  ? unfriend('request_sent')
                  : ['other'].includes(user_type)
                  ? sendRequest()
                  : ''
              "
              :style="
                ['other'].includes(user_type)
                  ? `color: #ffffff;
                                                                                      background-color: #3366BB;
                                                                                      padding: 5px;
                                                                                      border: none;`
                  : ''
              "
            >
              {{
                user_type == "friend"
                  ? "Connection"
                  : ["request_sent"].includes(user_type)
                  ? "Requested"
                  : ["other"].includes(user_type)
                  ? "Connect"
                  : ""
              }}
            </span>

            <span
              v-if="user_type == 'unapproved'"
              class="approve-request"
              @click="approveRequest"
            >
              Accept
            </span>

            <span
              v-if="user_type == 'unapproved'"
              class="reject-request"
              @click="unfriend('unapproved')"
            >
              Reject
            </span>

            <Button
              v-if="own_profile"
              buttonType="primary"
              text="Share with friends"
              :capitalize="false"
              @clicked="share_profile_banner = true"
            />

            <Button
              v-else
              style="
                transform: rotate(22deg);
                margin-left: 16px;
                margin-top: -4px;
              "
              icon="send_outline"
              buttonType="iconOnly"
              :size="25"
              @clicked="share_profile_banner = true"
            />
          </div>
        </h4>
      </div>

      <div
        v-if="own_profile"
        :class="is_mobile ? 'profile-details' : 'desktop-profile-details'"
      >
        <div
          class="profile-status"
          v-if="own_profile"
          @click="update_profile_status = !update_profile_status"
        >
          <div :style="profile_status_icon" />
          <div class="profile-status-title">Status</div>
        </div>

        <div
          class="profile-connections"
          @click="goToFriends"
          v-if="own_profile"
        >
          Connections
          <span style="font-size: 22px; position: relative">
            {{ store.friends_page.friends.length }}
          </span>
        </div>

        <div
          class="profile-views"
          @click="profile_vies_desc = !profile_vies_desc"
          v-if="own_profile"
        >
          <div v-if="!profile_vies_desc" class="profile-views-icon" />
          <div style="margin-top: 7px; font-size: 15px" v-else>Views</div>
          <div
            class="profile-views-count"
            :style="profile_vies_desc ? 'margin-top: 0px;' : ''"
          >
            {{ profile_views }}
          </div>
        </div>

        <div
          class="profile-more"
          v-if="own_profile"
          @click="openProfileMore = !openProfileMore"
        />
      </div>

      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <div>
          <div
            v-if="openProfileMore"
            class="black-background"
            @click="openProfileMore = false"
          />
          <div class="profile-more-options" v-if="openProfileMore">
            <div class="profile-more-option" @click="$router.push('/settings')">
              <div :style="profile_more_settings" />
              <span class="profile-more-option-text">
                Country & Platforms
              </span>
            </div>

            <div
              class="profile-more-option"
              style="margin-top: 16px"
              @click="goToAboutUs"
            >
              <div class="profile-more-about-us" />
              <span class="profile-more-option-text"> About Us </span>
            </div>

            <div
              class="profile-more-option"
              style="margin-top: 8px"
              @click="logOut"
            >
              <div class="profile-more-logout" />
              <span class="profile-more-option-text" style="color: #f54029">
                Logout
              </span>
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
            v-if="prompt"
            class="black-background"
            @click="prompt = !prompt"
          />

          <div
            class="prompted-box"
            :style="is_mobile ? 'min-width: 250px;' : 'min-width: 250px;'"
            v-if="prompt"
          >
            <div
              class="prompted-user-cropper"
              :style="is_mobile ? '' : 'width: 100px;height: 100px;'"
            >
              <img
                v-bind:src="profile_picture"
                onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
                class="prompted-user-pic"
              />
            </div>

            <div
              class="prompted-user-name"
              :style="is_mobile ? '' : 'font-size: 15px;'"
            >
              {{ user_name }}
            </div>

            <p :style="is_mobile ? '' : 'font-size: 15px;'">
              Remove connection?
            </p>

            <div class="profile-prompted-buttons">
              <div class="prompted-cancel-button" @click="prompt = !prompt">
                Cancel
              </div>
              <div class="prompted-confirm-button" @click="unfriend('friend')">
                Remove
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
            v-if="update_profile_status"
            class="black-background"
            @click="update_profile_status = !update_profile_status"
          />

          <div
            :class="
              is_mobile
                ? 'update-profile-status'
                : 'desktop-update-profile-status'
            "
            v-if="update_profile_status"
          >
            <div
              :style="
                is_mobile
                  ? 'text-align:left; padding:8px;font-size: 16px;'
                  : 'text-align:left; padding-bottom:10px;font-size: 16px;'
              "
            >
              Your profile items should be visible to...
            </div>

            <div
              :class="
                is_mobile
                  ? 'profile-status-checkbox'
                  : 'desktop-profile-status-checkbox'
              "
              @click="updateProfileStatus('public')"
            >
              <input
                type="radio"
                value="public"
                v-model="profile_status"
                class="checkbox-input"
              />
              <span
                :class="
                  is_mobile
                    ? 'profile-status-checkmark-abled'
                    : 'desktop-profile-status-checkmark-abled'
                "
              />
              <span
                class="profile-status-public-option-icon"
                :style="
                  is_mobile
                    ? ''
                    : 'margin-left: 50px;margin-top: 0px;height: 35px;width: 35px;'
                "
              />
              <span class="profile-status-checkmark-text">Public</span>
            </div>

            <div
              :class="
                is_mobile
                  ? 'profile-status-checkbox'
                  : 'desktop-profile-status-checkbox'
              "
              @click="updateProfileStatus('friends')"
            >
              <input
                type="radio"
                value="friends"
                v-model="profile_status"
                class="checkbox-input"
              />
              <span
                :class="
                  is_mobile
                    ? 'profile-status-checkmark-abled'
                    : 'desktop-profile-status-checkmark-abled'
                "
              />
              <span
                class="profile-status-friends-option-icon"
                :style="
                  is_mobile
                    ? ''
                    : 'margin-left: 50px;margin-top: 0px;height: 35px;width: 35px;'
                "
              />
              <span class="profile-status-checkmark-text">Connections</span>
            </div>

            <div
              :class="
                is_mobile
                  ? 'profile-status-checkbox'
                  : 'desktop-profile-status-checkbox'
              "
              @click="updateProfileStatus('private')"
            >
              <input
                type="radio"
                value="private"
                v-model="profile_status"
                class="checkbox-input"
              />
              <span
                :class="
                  is_mobile
                    ? 'profile-status-checkmark-abled'
                    : 'desktop-profile-status-checkmark-abled'
                "
              />
              <span
                class="profile-status-private-option-icon"
                :style="
                  is_mobile
                    ? ''
                    : 'margin-left: 50px;margin-top: 0px;height: 35px;width: 35px;'
                "
              />
              <span class="profile-status-checkmark-text">Only Me</span>
            </div>

            <div
              style="
                font-size: 12px;
                margin-top: 16px;
                text-align: left;
                padding: 8px;
              "
            >
              This does not change privacy of your posts.
            </div>
          </div>
        </div>
      </transition>

      <div v-if="profile_access == 'closed'" style="margin-top: 32px">
        {{ user_name.split(" ")[0] }}'s profile is private.
      </div>

      <div class="total-watched-container" v-if="profile_access == 'open'">
        <div class="profile-watched-box">
          <div class="profile-content-watched" @click="goToRatings">
            <div style="font-size: 26px; font-weight: bold">
              {{ total_watched.movies ? total_watched.movies : 0 }}
            </div>

            <div>Movies</div>
          </div>

          <div class="profile-content-watched" @click="goToRatings">
            <div style="font-size: 26px; font-weight: bold">
              {{ total_watched.shows ? total_watched.shows : 0 }}
            </div>

            <div>Shows</div>
          </div>
        </div>

        <div
          v-if="total_watched.movies || total_watched.shows"
          style="margin-top: 16px; font-size: 12px"
        >
          That's {{ total_watched.time }} of non-stop watch time.
        </div>
      </div>

      <div class="profile-ratings" v-if="contents_rated.length">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 31px;
            margin-bottom: 4px;
          "
        >
          <span style="font-weight: bold; font-size: 15px">
            {{ own_profile ? "Your" : user_name.split(" ")[0] + "'s" }}
            ratings...
          </span>

          <transition
            appear
            enter-active-class="animated fastFadeIn"
            leave-active-class="animated fastFadeOut"
          >
            <!-- height of following button also affects min-height of parent -->
            <Button
              v-if="rating_items > 10 && showAllRatingsMainButton"
              buttonType="secondary"
              text="Show All"
              @clicked="goToRatings"
            />
          </transition>
        </div>

        <div style="display: flex">
          <div
            :class="
              is_mobile ? 'ratings-container' : 'desktop-ratings-container'
            "
            id="ratings-container"
          >
            <div
              v-for="(item, index) in contents_rated"
              :key="index"
              class="ratings-item-container"
            >
              <Button
                class="profile-user-rating-icon"
                style="background-color: #fff"
                :icon="
                  item.rating == 3
                    ? 'love'
                    : item.rating == 2
                    ? 'thumbs_up'
                    : 'thumbs_down'
                "
                buttonType="iconOnly"
                :size="16"
                :state="true"
                :disabled="true"
              />

              <Poster
                :class="
                  is_mobile
                    ? 'ratings-item-poster'
                    : 'desktop-ratings-item-poster'
                "
                :containerWidth="is_mobile ? 106 : 150"
                :contentId="item.content_id"
                :title="item.title"
                :image="item.poster"
                :showTrailer="false"
                :whereToWatch="item.where_to_watch"
                :userPlatforms="
                  store.user.id ? store.user.profile.platforms || [''] : ['']
                "
                :showName="false"
                :parent="'profile_' + (own_profile ? 'self' : 'other')"
                posterLocation="ratings"
                :scalePlatformsSize="1.2"
                v-on="$listeners"
              />
            </div>

            <Button
              v-if="rating_items > 10"
              class="show-all-button"
              :style="is_mobile ? '' : 'margin-top: 85px'"
              id="rating-show-all"
              buttonType="secondary"
              text="Show All"
              @clicked="goToRatings"
            />
          </div>
        </div>
      </div>

      <div class="profile-ratings" v-if="own_profile ? true : watchlist.length">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 31px;
            margin-bottom: 4px;
          "
        >
          <span style="font-weight: bold; font-size: 15px">
            {{ own_profile ? "Your" : user_name.split(" ")[0] + "'s" }}
            watchlist...
          </span>

          <transition
            appear
            enter-active-class="animated fastFadeIn"
            leave-active-class="animated fastFadeOut"
          >
            <!-- height of following button also affects min-height of parent -->
            <Button
              v-if="watchlist_items > 10 && showAllWatchlistMainButton"
              buttonType="secondary"
              text="Show All"
              @clicked="goToWatchlist"
            />
          </transition>
        </div>

        <div style="display: flex" v-if="watchlist.length">
          <div
            :class="
              is_mobile ? 'ratings-container' : 'desktop-ratings-container'
            "
            id="watchlist-container"
          >
            <div
              v-for="(item, index) in watchlist"
              :key="index"
              class="ratings-item-container"
            >
              <Poster
                :class="
                  is_mobile
                    ? 'ratings-item-poster'
                    : 'desktop-ratings-item-poster'
                "
                :containerWidth="is_mobile ? 106 : 150"
                :contentId="item.content_id"
                :title="item.title"
                :image="item.poster"
                :showTrailer="false"
                :whereToWatch="item.where_to_watch"
                :userPlatforms="
                  store.user.id ? store.user.profile.platforms || [''] : ['']
                "
                :showName="false"
                :parent="'profile_' + (own_profile ? 'self' : 'other')"
                posterLocation="ratings"
                :scalePlatformsSize="1.2"
                v-on="$listeners"
              />
            </div>

            <Button
              v-if="watchlist_items > 10"
              class="show-all-button"
              :style="is_mobile ? '' : 'margin-top: 112.5px'"
              id="watchlist-show-all"
              buttonType="secondary"
              text="Show All"
              @clicked="goToWatchlist"
            />
          </div>
        </div>

        <div
          v-else
          style="
            text-align: center;
            padding: 48px;
            font-size: 18px;
            color: #888;
          "
        >
          Your watchlist is empty.
        </div>
      </div>

      <div class="profile-ratings" v-if="posts.length">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 31px;
            margin-bottom: 4px;
          "
        >
          <span style="font-weight: bold; font-size: 15px">
            {{ own_profile ? "Your" : user_name.split(" ")[0] + "'s" }}
            posts...
          </span>

          <transition
            appear
            enter-active-class="animated fastFadeIn"
            leave-active-class="animated fastFadeOut"
          >
            <!-- height of following button also affects min-height of parent -->
            <Button
              v-if="totalPosts > 10 && showAllPostsMainButton"
              buttonType="secondary"
              text="Show All"
              @clicked="goToPosts"
            />
          </transition>
        </div>

        <div style="display: flex">
          <div
            :class="
              is_mobile ? 'ratings-container' : 'desktop-ratings-container'
            "
            id="posts-container"
          >
            <PostPreview
              v-for="(post, index) in posts"
              :key="index"
              style="margin-right: 16px; margin-bottom: 8px"
              :post="post"
            />

            <Button
              v-if="totalPosts > 10"
              class="show-all-button"
              :style="is_mobile ? '' : 'margin-top: 112.5px'"
              id="posts-show-all"
              buttonType="secondary"
              text="Show All"
              @clicked="goToPosts"
            />
          </div>
        </div>
      </div>

      <div
        :style="
          is_mobile
            ? 'position: relative;font-weight: bold;font-size: 15px;white-space: nowrap;text-align: left;margin-left: 7px;margin-top: 16px;'
            : 'position: relative;font-weight: bold;font-size: 15px;white-space: nowrap;text-align: left;margin-left: 7px;margin-top: 16px;'
        "
        v-if="friends.length"
      >
        {{ own_profile ? "Your" : user_name.split(" ")[0] + "'s" }}
        connections...
      </div>

      <div
        class="profile-friends-box"
        :style="is_mobile ? '' : 'margin-bottom: 0px;'"
        v-if="friends.length"
      >
        <div
          v-for="(item, index) in friends"
          :key="index"
          class="profile-friend-container"
          @click="clickUser(item.id, item.name)"
        >
          <ImageCard
            :image="
              item.picture ||
              'https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png'
            "
            :name="item.name"
            :width="is_mobile ? 55 : 75"
            :height="is_mobile ? 70 : 95"
            :scale="true"
          />
        </div>
      </div>

      <div
        :class="
          is_mobile ? 'fav-artists-container' : 'desktop-fav-artists-container'
        "
        v-if="
          favoriteArtists.directed_by.length ||
          favoriteArtists.cast.length ||
          favoriteArtists.writing_credits.length
        "
      >
        <span
          style="
            width: 100%;
            font-weight: bold;
            font-size: 15px;
            margin-left: -7px;
          "
        >
          {{ own_profile ? "Your" : user_name.split(" ")[0] + "'s" }} favorite
          artists...
        </span>
        <div
          :class="
            is_mobile ? 'fav-artist-category' : 'desktop-fav-artist-category'
          "
          v-if="favoriteArtists.directed_by.length"
        >
          Director
        </div>
        <div class="fav-artists" v-if="favoriteArtists.directed_by.length">
          <Artist
            v-for="(artist, index) in favoriteArtists.directed_by"
            :key="index"
            class="fav-catg-artists-container"
            :artistId="artist.person_id"
            :name="artist.name"
            :image="artist.picture"
            credit_category="directed_by"
            :width="is_mobile ? 55 : 75"
            :height="is_mobile ? 70 : 95"
            :parent="(own_profile ? 'self' : 'other') + '_profile'"
            v-on="$listeners"
          />
        </div>

        <div
          :class="
            is_mobile ? 'fav-artist-category' : 'desktop-fav-artist-category'
          "
          v-if="favoriteArtists.cast.length"
        >
          Actor
        </div>
        <div class="fav-artists" v-if="favoriteArtists.cast.length">
          <Artist
            v-for="(artist, index) in favoriteArtists.cast"
            :key="index"
            class="fav-catg-artists-container"
            :artistId="artist.person_id"
            :name="artist.name"
            :image="artist.picture"
            credit_category="cast"
            :width="is_mobile ? 55 : 75"
            :height="is_mobile ? 70 : 95"
            :parent="(own_profile ? 'self' : 'other') + '_profile'"
            v-on="$listeners"
          />
        </div>

        <div
          :class="
            is_mobile ? 'fav-artist-category' : 'desktop-fav-artist-category'
          "
          v-if="favoriteArtists.writing_credits.length"
        >
          Writer
        </div>
        <div class="fav-artists" v-if="favoriteArtists.writing_credits.length">
          <Artist
            v-for="(artist, index) in favoriteArtists.writing_credits"
            :key="index"
            class="fav-catg-artists-container"
            :artistId="artist.person_id"
            :name="artist.name"
            :image="artist.picture"
            credit_category="writing_credits"
            :width="is_mobile ? 55 : 75"
            :height="is_mobile ? 70 : 95"
            :parent="(own_profile ? 'self' : 'other') + '_profile'"
            v-on="$listeners"
          />
        </div>
      </div>

      <div v-if="genres.genre.length" class="genres-container">
        {{ own_profile ? "Your" : user_name.split(" ")[0] + "'s" }} favorite
        genres...
        <GenresPie
          :class="is_mobile ? 'genres-pie' : 'desktop-genres-pie'"
          :genres="genres.genre"
          :contribution="genres.contribution"
        />
      </div>

      <div
        v-if="watched_timeline.total.length"
        class="watched-timeline-container"
      >
        <div>
          A timeline of
          {{ own_profile ? "your" : user_name.split(" ")[0] + "'s" }} taste...
        </div>
        <WatchedTimeline
          :class="is_mobile ? 'watched-timeline' : 'desktop-watched-timeline'"
          :years="watched_timeline.years"
          :liked="watched_timeline.liked"
          :disliked="watched_timeline.disliked"
          :loved="watched_timeline.loved"
          :total="watched_timeline.total"
        />
      </div>
    </div>

    <SharePrompt
      v-if="share_profile_banner"
      parent="profile"
      :url="'https://' + store.hostName + $route.fullPath"
      :profileId="parseInt(user_id)"
      @close-share-prompt="share_profile_banner = false"
      @update-profile="updateProfileStatus('public')"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import axios from "axios";
import SearchBar from "./SearchBar";
import GenresPie from "./GenresPie";
import WatchedTimeline from "./WatchedTimeline";
import Artist from "./molecular/Artist";
import Poster from "./molecular/Poster";
import UserRating from "./molecular/UserRating";
import PostPreview from "./molecular/PostPreview";
import ImageCard from "./atomic/ImageCard";
import Button from "./atomic/Button";
import SharePrompt from "./atomic/SharePrompt";
import { mixin as onClickOutside } from "vue-on-click-outside";

export default {
  name: "App",
  mixins: [onClickOutside],
  components: {
    SearchBar,
    GenresPie,
    WatchedTimeline,
    Artist,
    Poster,
    ImageCard,
    UserRating,
    Button,
    SharePrompt,
    PostPreview,
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      renderComponent: true,
      fetching_profile: false,
      profile_access: "open",
      user_type: null,
      user_id: null,
      user_name: null,
      profile_picture: null,
      own_profile: null,
      tab_name: "Ratings",
      content_type: "movie",
      rating_tab: [3],
      posters: [],
      covers: [],
      profile_status: "",
      update_profile_status: false,
      profile_views: 0,
      profile_vies_desc: false,
      add_content: false,
      movies_these_days: [],
      tv_series_these_days: [],
      total_watched: {
        movies: 0,
        shows: 0,
        time: "some good time :)",
      },
      seeking_recommendations: false,
      store: this.$store.state,
      favorite_artists: {
        movie: {},
        tv: {},
      },
      artist: null,
      contents_rated: [],
      watchlist: [],
      friends: [],
      genres: {
        movie: {
          genre: [],
          contribution: [],
        },
        tv: {
          genre: [],
          contribution: [],
        },
      },
      watched_timeline: {
        movie: {
          years: [],
          liked: [],
          disliked: [],
          loved: [],
          total: [],
        },
        tv: {
          years: [],
          liked: [],
          disliked: [],
          loved: [],
          total: [],
        },
      },
      remove_friend_banner: false,
      cancel_request_banner: false,
      reset_ratings_banner: false,
      share_profile_banner: false,
      prompt: false,
      fetching_content_by_artist: false,
      openProfileMore: false,
      collage: null,
      rating_items: null,
      watchlist_items: null,
      ratingsObserver: null,
      watchlistObserver: null,
      postsObserver: null,
      showAllRatingsMainButton: true,
      showAllWatchlistMainButton: true,
      showAllPostsMainButton: true,
      posts: [],
      totalPosts: 0,
    };
  },
  created() {
    window.scrollTo(0, 0);
    this.$store.state.current_path = this.$route.path;
    var userid = this.$route.params.user_id;
    var username = this.$route.params.user_name;

    var self = this;
    self.fetching_profile = true;
    if (self.store.user.id == userid) {
      if (this.$route.query.share) {
        let query = Object.assign({}, this.$route.query);
        delete query.share;
        this.$router.replace({ query });
        this.share_profile_banner = true;
      }

      self.own_profile = true;
      self.user_type = "self";
      self.user_id = self.store.user.id;
      self.user_name = self.store.user.name;
      self.profile_picture = self.store.user.picture;
      self.posters = self.store.user.profile.posters;
      self.covers = self.store.user.profile.covers;
      self.total_watched = self.store.user.profile.total_watched;
      self.contents_rated = self.store.user.profile.contents_rated;
      self.watchlist = self.store.user.profile.watchlist;
      self.genres = self.store.user.profile.genres;
      self.watched_timeline = self.store.user.profile.watched_timeline;
      self.profile_status = self.store.user.profile.profile_status;
      self.profile_views = self.store.user.profile.profile_views;
      self.rating_items = self.store.user.profile.contents_rated.length;
      self.watchlist_items = self.store.user.profile.watchlist.length;
      self.$nextTick(() => {
        self.initIntersectionObserver();
      });
    } else {
      self.own_profile = false;
    }

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
            .post(self.$store.state.api_host + "profile", {
              session_id: self.$store.state.session_id,
              user_id: parseInt(userid),
              user_name: username,
              country: self.store.guest_country,
              guest_id: self.$store.state.guest_id,
            })
            .then(function (response) {
              if ([200].includes(response.status)) {
                self.profile_access = response.data.profile_access;
                self.user_type = response.data.user_type;
                self.user_id = response.data.user_id;
                self.user_name = response.data.user_name;
                self.profile_picture = response.data.profile_picture;
                self.posters = response.data.profile_cover.posters;
                self.covers = response.data.profile_cover.covers;
                self.total_watched = response.data.total_watched;
                self.contents_rated = response.data.contents_rated;
                self.watchlist = response.data.watchlist;
                self.friends = response.data.friends;
                self.genres = response.data.genres;
                self.watched_timeline = response.data.rating_timeline;
                self.profile_status = response.data.profile_status;
                self.profile_views = response.data.profile_views;
                self.rating_items = response.data.rating_items;
                self.watchlist_items = response.data.watchlist_items;
                self.$nextTick(() => {
                  self.initIntersectionObserver();
                });
                if (self.store.user.id == self.user_id) {
                  self.own_profile = true;
                  if (self.$route.query.share && !self.share_profile_banner) {
                    let query = Object.assign({}, self.$route.query);
                    delete query.share;
                    self.$router.replace({ query });
                    self.share_profile_banner = true;
                  }
                } else {
                  self.own_profile = false;
                }
                if (self.own_profile) {
                  self.store.user.profile.posters =
                    response.data.profile_cover.posters;
                  self.store.user.profile.covers =
                    response.data.profile_cover.covers;
                  self.store.user.profile.total_watched =
                    response.data.total_watched;
                  self.store.user.profile.contents_rated =
                    response.data.contents_rated;
                  self.store.user.profile.watchlist = response.data.watchlist;
                  self.store.user.profile.genres = response.data.genres;
                  self.store.user.profile.watched_timeline =
                    response.data.rating_timeline;
                  self.store.user.profile.profile_status =
                    response.data.profile_status;
                  self.store.user.profile.profile_views =
                    response.data.profile_views;
                }
              } else {
                // console.log(response.status);
              }
              self.fetching_profile = false;
            })
            .catch(function (error) {
              self.fetching_profile = false;
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

          self.fetchUserPosts();
        });
    } else {
      axios
        .post(self.$store.state.api_host + "profile", {
          session_id: self.$store.state.session_id,
          user_id: parseInt(userid),
          user_name: username,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
          guest_id: self.$store.state.guest_id,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            self.profile_access = response.data.profile_access;
            self.user_type = response.data.user_type;
            self.user_id = response.data.user_id;
            self.user_name = response.data.user_name;
            self.profile_picture = response.data.profile_picture;
            self.posters = response.data.profile_cover.posters;
            self.covers = response.data.profile_cover.covers;
            self.total_watched = response.data.total_watched;
            self.contents_rated = response.data.contents_rated;
            self.watchlist = response.data.watchlist;
            self.friends = response.data.friends;
            self.genres = response.data.genres;
            self.watched_timeline = response.data.rating_timeline;
            self.profile_status = response.data.profile_status;
            self.profile_views = response.data.profile_views;
            self.rating_items = response.data.rating_items;
            self.watchlist_items = response.data.watchlist_items;
            self.$nextTick(() => {
              self.initIntersectionObserver();
            });
            if (self.store.user.id == self.user_id) {
              self.own_profile = true;
              if (self.$route.query.share && !self.share_profile_banner) {
                let query = Object.assign({}, self.$route.query);
                delete query.share;
                self.$router.replace({ query });
                self.share_profile_banner = true;
              }
            } else {
              self.own_profile = false;
            }
            if (self.own_profile) {
              self.store.user.profile.posters =
                response.data.profile_cover.posters;
              self.store.user.profile.covers =
                response.data.profile_cover.covers;
              self.store.user.profile.total_watched =
                response.data.total_watched;
              self.store.user.profile.contents_rated =
                response.data.contents_rated;
              self.store.user.profile.watchlist = response.data.watchlist;
              self.store.user.profile.genres = response.data.genres;
              self.store.user.profile.watched_timeline =
                response.data.rating_timeline;
              self.store.user.profile.profile_status =
                response.data.profile_status;
              self.store.user.profile.profile_views =
                response.data.profile_views;
            }
          } else {
            // console.log(response.status);
          }
          self.fetching_profile = false;
        })
        .catch(function (error) {
          self.fetching_profile = false;
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

      self.fetchUserPosts();
    }

    axios
      .post(self.$store.state.api_host + "favorite_artists", {
        session_id: self.$store.state.session_id,
        user_id: parseInt(userid),
        user_name: username,
      })
      .then(function (response) {
        if ([200].includes(response.status)) {
          self.favorite_artists = response.data.favorite_artists;
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
  },
  methods: {
    goToProfilePlatform(link, content_id, traffic_origin) {
      var activity = {
        api: "outbound_traffic",
        content_id: content_id,
        url: link,
        traffic_origin:
          (this.own_profile ? "self_" : "other_") +
          "profile__" +
          traffic_origin,
      };
      this.$emit("outbound-traffic", activity);
    },
    reRender() {
      window.scrollTo(0, 0);
      this.$store.state.current_path = this.$route.path;
      var userid = this.$route.params.user_id;
      var username = this.$route.params.user_name;
      var self = this;
      self.profile_access = "open";
      self.fetching_profile = true;
      if (self.store.user.id == userid) {
        self.own_profile = true;
        self.user_type = "self";
        self.user_id = self.store.user.id;
        self.user_name = self.store.user.name;
        self.profile_picture = self.store.user.picture;
        self.posters = self.store.user.profile.posters;
        self.covers = self.store.user.profile.covers;
        self.total_watched = self.store.user.profile.total_watched;
        self.contents_rated = self.store.user.profile.contents_rated;
        self.watchlist = self.store.user.profile.watchlist;
        self.genres = self.store.user.profile.genres;
        self.watched_timeline = self.store.user.profile.watched_timeline;
        self.profile_status = self.store.user.profile.profile_status;
        self.profile_views = self.store.user.profile.profile_views;
      } else {
        self.own_profile = false;
      }
      axios
        .post(self.$store.state.api_host + "profile", {
          session_id: self.$store.state.session_id,
          user_id: parseInt(userid),
          user_name: username,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
          guest_id: self.$store.state.guest_id,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            self.profile_access = response.data.profile_access;
            self.user_type = response.data.user_type;
            self.user_id = response.data.user_id;
            self.user_name = response.data.user_name;
            self.profile_picture = response.data.profile_picture;
            self.posters = response.data.profile_cover.posters;
            self.covers = response.data.profile_cover.covers;
            self.total_watched = response.data.total_watched;
            self.contents_rated = response.data.contents_rated;
            self.watchlist = response.data.watchlist;
            self.friends = response.data.friends;
            self.genres = response.data.genres;
            self.watched_timeline = response.data.rating_timeline;
            self.profile_status = response.data.profile_status;
            self.profile_views = response.data.profile_views;
            self.rating_items = response.data.rating_items;
            self.watchlist_items = response.data.watchlist_items;
            self.$nextTick(() => {
              self.initIntersectionObserver();
            });
            if (self.store.user.id == self.user_id) {
              self.own_profile = true;
            } else {
              self.own_profile = false;
            }
            if (self.own_profile) {
              self.store.user.profile.posters =
                response.data.profile_cover.posters;
              self.store.user.profile.covers =
                response.data.profile_cover.covers;
              self.store.user.profile.total_watched =
                response.data.total_watched;
              self.store.user.profile.contents_rated =
                response.data.contents_rated;
              self.store.user.profile.watchlist = response.data.watchlist;
              self.store.user.profile.genres = response.data.genres;
              self.store.user.profile.watched_timeline =
                response.data.rating_timeline;
              self.store.user.profile.profile_status =
                response.data.profile_status;
              self.store.user.profile.profile_views =
                response.data.profile_views;
            }
          } else {
            // console.log(response.status);
          }
          self.fetching_profile = false;
        })
        .catch(function (error) {
          self.fetching_profile = false;
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

      self.fetchUserPosts();

      axios
        .post(self.$store.state.api_host + "favorite_artists", {
          session_id: self.$store.state.session_id,
          user_id: parseInt(userid),
          user_name: username,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            self.favorite_artists = response.data.favorite_artists;
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
    },
    goToAboutUs() {
      this.$router.push("/about-us");
      this.$emit("update-api-counter", { api: "about_us" });
    },
    logOut() {
      window.location =
        this.$store.state.login_host +
        "logout?session_id=" +
        this.$store.state.session_id;
      this.$store.state.session_id = null;
      this.$emit("logging-out");
    },
    goToFriends() {
      this.$router.push("/connections");
      this.$emit("update-api-counter", { api: "connections" });
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
    updateProfile() {
      var self = this;
      var movies = [];
      var tv_series = [];
      var index;
      for (index in self.movies_these_days) {
        movies.push(self.movies_these_days[index].subject_id);
      }
      for (index in self.tv_series_these_days) {
        tv_series.push(self.tv_series_these_days[index].subject_id);
      }
      axios
        .post(self.$store.state.api_host + "update_profile", {
          session_id: self.$store.state.session_id,
          movies_these_days: movies,
          tv_series_these_days: tv_series,
          seeking_recommendations: self.seeking_recommendations,
          profile_status: self.profile_status,
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
    },
    updateProfileStatus(profile_status) {
      this.profile_status = profile_status;
      this.$store.state.user.profile.profile_status = profile_status;
      this.updateProfile();
      this.update_profile_status = false;
    },
    hideBanner() {
      var self = this;
      setTimeout(function () {
        self.remove_friend_banner = false;
        self.cancel_request_banner = false;
        self.reset_ratings_banner = false;
      }, 100);
    },
    unfriend(current_status) {
      var self = this;
      self.user_type = "other";
      self.prompt = false;
      axios
        .post(self.$store.state.api_host + "unfriend", {
          session_id: self.$store.state.session_id,
          friend_id: self.user_id,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            self.remove_friend_banner = false;
            self.cancel_request_banner = false;
            if (current_status == "friend") {
              location.reload();
            }
          } else {
            // console.log(response.status);
          }
        })
        .catch(function (error) {
          self.user_type = current_status;
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
    },
    sendRequest() {
      if (this.$store.state.session_id != null) {
        var self = this;
        self.user_type = "request_sent";
        axios
          .post(self.$store.state.api_host + "send_request", {
            session_id: self.$store.state.session_id,
            friend_id: self.user_id,
          })
          .then(function (response) {
            if ([200].includes(response.status)) {
              self.remove_friend_banner = false;
            } else {
              // console.log(response.status);
            }
          })
          .catch(function (error) {
            self.user_type = "other";
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
      } else {
        this.$store.state.prompt_signup = true;
      }
    },
    approveRequest() {
      var self = this;
      axios
        .post(self.$store.state.api_host + "approve_request", {
          session_id: self.$store.state.session_id,
          friend_id: self.user_id,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            self.remove_friend_banner = false;
            self.user_type = "friend";
            location.reload();
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
    },
    clickUser(id, name) {
      this.$router.push(
        "/profile/" + id + "/" + name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
    },
    goToRatings() {
      this.$router.push(
        "/ratings/" +
          this.user_id +
          "/" +
          this.user_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
    },
    goToWatchlist() {
      this.$router.push(
        "/watchlist/" +
          this.user_id +
          "/" +
          this.user_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
    },
    goToPosts() {
      this.$router.push(
        "/posts/user/" +
          this.user_id +
          "/" +
          this.user_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
    },
    initIntersectionObserver() {
      this.resetIntersectionObserver();

      const ratingsCallback = (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.showAllRatingsMainButton = false;
          } else {
            this.showAllRatingsMainButton = true;
          }
        });
      };

      const watchlistCallback = (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.showAllWatchlistMainButton = false;
          } else {
            this.showAllWatchlistMainButton = true;
          }
        });
      };

      const postsCallback = (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.showAllPostsMainButton = false;
          } else {
            this.showAllPostsMainButton = true;
          }
        });
      };

      setTimeout(() => {
        var rateElem = document.querySelector("#rating-show-all");
        if (rateElem) {
          this.ratingsObserver = new IntersectionObserver(ratingsCallback, {
            root: document.querySelector("#ratings-container"),
            rootMargin: "0px",
            threshold: 0.0,
          });
          this.ratingsObserver.observe(rateElem);
        }

        var watchlistElem = document.querySelector("#watchlist-show-all");
        if (watchlistElem) {
          this.watchlistObserver = new IntersectionObserver(watchlistCallback, {
            root: document.querySelector("#watchlist-container"),
            rootMargin: "0px",
            threshold: 0.0,
          });
          this.watchlistObserver.observe(watchlistElem);
        }

        var postElem = document.querySelector("#posts-show-all");
        if (postElem) {
          this.postsObserver = new IntersectionObserver(postsCallback, {
            root: document.querySelector("#posts-container"),
            rootMargin: "0px",
            threshold: 0.0,
          });
          this.postsObserver.observe(postElem);
        }
      }, 0);
    },
    resetIntersectionObserver() {
      if (this.ratingsObserver) {
        this.ratingsObserver.disconnect();
        this.ratingsObserver = null;
      }
      if (this.watchlistObserver) {
        this.watchlistObserver.disconnect();
        this.watchlistObserver = null;
      }
      if (this.postsObserver) {
        this.postsObserver.disconnect();
        this.postsObserver = null;
      }
    },
    fetchUserPosts() {
      var self = this;
      self.posts = [];
      self.totalPosts = 0;

      var userid = this.$route.params.user_id;
      var username = this.$route.params.user_name;
      axios
        .post(self.$store.state.api_host + "user_posts", {
          session_id: self.$store.state.session_id,
          user_id: parseInt(userid),
          user_name: username,
          fetched_posts: [],
          limit: 10,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
          guest_id: self.$store.state.guest_id,
        })
        .then(function (response) {
          if ([200].includes(response.status)) {
            if (response.data.profile_status == "open") {
              self.posts = response.data.posts;
              self.totalPosts = response.data.total_posts;
              self.$nextTick(() => {
                self.initIntersectionObserver();
              });
            }
          }
        })
        .catch(function (error) {
          // console.log(error);
        });
    },
  },
  computed: {
    router_path: function () {
      return this.$route.path;
    },
    rating_tab_string() {
      return JSON.stringify(this.rating_tab);
    },
    country_flag() {
      var country;
      for (country in this.$store.state.countries) {
        if (
          this.$store.state.countries[country].country_name ==
          this.$store.state.user.profile.country
        ) {
          return this.$store.state.countries[country].country_flag;
        }
      }
    },
    profile_status_icon() {
      return (
        `
                display: inline-block;
                width: 35px;
                height: 35px;
                position: relative;
                background-image: url('` +
        require(`./../images/` + this.profile_status + `.png`) +
        `');
                background-size: 100% 100%;
                border: none;
                outline: 0;
                `
      );
    },
    profile_more_settings() {
      return (
        `
                position: relative;
                width: 45px;
                height: 45px;
                background-image: url('` +
        this.country_flag +
        `');
                background-repeat: no-repeat;
                background-position: center;
                background-size: contain;
                `
      );
    },
    favoriteArtists() {
      let output = {
        directed_by: [],
        cast: [],
        writing_credits: [],
      };

      (this.favorite_artists.movie.directed_by || []).forEach((artist) => {
        if (
          !output.directed_by
            .map((person) => person.person_id)
            .includes(artist.person_id)
        ) {
          output.directed_by.push(artist);
        }
      });

      (this.favorite_artists.movie.cast || []).forEach((artist) => {
        if (
          !output.cast
            .map((person) => person.person_id)
            .includes(artist.person_id)
        ) {
          output.cast.push(artist);
        }
      });

      (this.favorite_artists.movie.writing_credits || []).forEach((artist) => {
        if (
          !output.writing_credits
            .map((person) => person.person_id)
            .includes(artist.person_id)
        ) {
          output.writing_credits.push(artist);
        }
      });

      (this.favorite_artists.tv.directed_by || []).forEach((artist) => {
        if (
          !output.directed_by
            .map((person) => person.person_id)
            .includes(artist.person_id)
        ) {
          output.directed_by.push(artist);
        }
      });

      (this.favorite_artists.tv.cast || []).forEach((artist) => {
        if (
          !output.cast
            .map((person) => person.person_id)
            .includes(artist.person_id)
        ) {
          output.cast.push(artist);
        }
      });

      (this.favorite_artists.tv.writing_credits || []).forEach((artist) => {
        if (
          !output.writing_credits
            .map((person) => person.person_id)
            .includes(artist.person_id)
        ) {
          output.writing_credits.push(artist);
        }
      });

      return output;
    },
  },
  watch: {
    router_path: {
      handler: function (path) {
        if (
          this.$store.state.current_path.startsWith("/profile/") &&
          path.startsWith("/profile/")
        ) {
          this.renderComponent = false;
          this.$nextTick(() => {
            this.renderComponent = true;
            this.reRender();
          });
        }
      },
    },
  },
  beforeDestroy() {
    this.resetIntersectionObserver();
  },
};
</script>

<style lang="scss">
.profile-cover {
  position: relative;
  display: inline-grid;
  width: 100%;
  height: 50vw;
  margin-top: calc(50px + 2.5%);
  overflow: hidden;
  background-color: #f5f4f4;
  border-radius: 7px;
}
.desktop-profile-cover {
  position: relative;
  display: inline-grid;
  width: 100%;
  height: 400px;
  margin-top: 70px;
  overflow: hidden;
  background-color: #f5f4f4;
  border-radius: 7px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.poster-1 {
  position: absolute;
  width: 15%;
  margin-left: -2%;
  margin-top: -2%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-2 {
  position: absolute;
  width: 20%;
  margin-left: 13%;
  margin-top: 15%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-3 {
  position: absolute;
  width: 13%;
  margin-left: 33%;
  margin-top: 15%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-4 {
  position: absolute;
  width: 18%;
  margin-left: 43%;
  margin-top: -12%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-5 {
  position: absolute;
  width: 20%;
  margin-left: 68%;
  margin-top: 34%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-6 {
  position: absolute;
  width: 12.7%;
  margin-left: 80%;
  margin-top: 15%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-7 {
  position: absolute;
  width: 20%;
  margin-left: -7%;
  margin-top: 36%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-8 {
  position: absolute;
  width: 23.4%;
  margin-left: 92.7%;
  margin-top: -1%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-9 {
  position: absolute;
  width: 20%;
  margin-left: 13%;
  margin-top: 45%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-10 {
  position: absolute;
  width: 13%;
  margin-left: 87.7%;
  margin-top: 34%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.cover-1 {
  position: absolute;
  width: 30%;
  margin-left: 13%;
  margin-top: -1.8%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.cover-2 {
  position: absolute;
  width: 35%;
  margin-left: 33%;
  margin-top: 34%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.cover-3 {
  position: absolute;
  width: 31.7%;
  margin-left: 61%;
  margin-top: -2.7%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.cover-4 {
  position: absolute;
  width: 30%;
  margin-left: -17%;
  margin-top: 20%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.cover-5 {
  position: absolute;
  width: 34%;
  margin-left: 46%;
  margin-top: 15%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.profile-pp-cropper {
  width: 20vw;
  height: 20vw;
  margin-top: -13vw;
  margin-left: 37.5vw;
  position: absolute;
  overflow: hidden;
  border-radius: 50%;
  border: 2px solid #ffffff;
  z-index: 2;
  background-color: #ffffff;
}
.desktop-profile-pp-cropper {
  width: 175px;
  height: 175px;
  margin-top: -100px;
  margin-left: 387.5px;
  position: absolute;
  overflow: hidden;
  border-radius: 50%;
  border: 2px solid #ffffff;
  z-index: 2;
  background-color: #ffffff;
}
.profile-pp {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.user-name {
  padding-bottom: 5px;
  margin-top: 9vw;
}
.desktop-user-name {
  padding-bottom: 5px;
  margin-top: 90px;
}
h4 {
  font-size: 23px;
  color: #333333;
  text-transform: capitalize;
}
.update-profile-status {
  position: fixed;
  width: 72%;
  left: 14%;
  top: 40vh;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 1%;
  z-index: 100000;
}
.desktop-update-profile-status {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  top: 40vh;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 20px;
  z-index: 100000;
}
.profile-status-checkbox {
  display: block;
  position: relative;
  width: 50%;
  margin-left: 10%;
  margin-bottom: 0%;
  font-size: 4vw;
  text-align: left;
  padding: 2%;
  border-bottom: 1px solid #dad8d8;
}
.desktop-profile-status-checkbox {
  display: block;
  position: relative;
  font-size: 17px;
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid #dad8d8;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-status-checkmark-abled {
  position: absolute;
  top: 25%;
  left: 5.5%;
  height: 4.5vw;
  width: 4.5vw;
  background-color: #f1f1f1;
}
.desktop-profile-status-checkmark-abled {
  position: absolute;
  left: 10px;
  height: 35px;
  width: 35px;
  background-color: #f1f1f1;
}
.profile-status-checkbox input:checked ~ .profile-status-checkmark-abled {
  background-color: #ffffff;
  background-image: url("./../images/checked.svg");
}
.desktop-profile-status-checkbox
  input:checked
  ~ .desktop-profile-status-checkmark-abled {
  background-color: #ffffff;
  background-image: url("./../images/checked.svg");
}
.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-status-checkmark-text {
  position: absolute;
  margin-left: 5%;
  margin-top: 4%;
}
.profile-status-public-option-icon {
  position: relative;
  display: inline-block;
  margin-left: 24%;
  margin-top: 3%;
  height: 4.7vw;
  width: 4.7vw;
  background-image: url("./../images/public.png");
  background-size: 100% 100%;
  border: none;
  outline: 0px;
}
.profile-status-friends-option-icon {
  position: relative;
  display: inline-block;
  margin-left: 24%;
  margin-top: 3%;
  height: 4.7vw;
  width: 4.7vw;
  background-image: url("./../images/friends.png");
  background-size: 100% 100%;
  border: none;
  outline: 0px;
}
.profile-status-private-option-icon {
  position: relative;
  display: inline-block;
  margin-left: 24%;
  margin-top: 3%;
  height: 4.7vw;
  width: 4.7vw;
  background-image: url("./../images/private.png");
  background-size: 100% 100%;
  border: none;
  outline: 0px;
}
.fadeIn {
  animation: fadeIn 0.3s;
}
.fadeOut {
  animation: fadeOut 0.6s;
}
.fastFadeIn {
  animation: fadeIn 0.12s;
}
.fastFadeOut {
  animation: fadeOut 0.12s;
}
.black-background {
  position: fixed;
  width: 100%;
  height: 150%;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  top: 0%;
  left: 0%;
  z-index: 100000;
}
.total-watched-container {
  position: relative;
  color: #333333;
  font-size: 15px;
  text-align: center;
  width: 100%;
  border-radius: 7px;
  padding: 16px;
  background-color: #fafafa;
  margin-top: 16px;
}
.total-watched {
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  font-size: calc(14px + 0.7vw);
}
.desktop-total-watched {
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  font-size: 23px;
}
.total-watched-time {
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  font-size: calc(14px + 0.7vw);
}
.desktop-total-watched-time {
  color: #333333;
  text-align: left;
  font-size: 23px;
}
.fav-artists-container {
  position: relative;
  margin-left: 2.5%;
  margin-top: 15px;
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  width: 100%;
  border-radius: 7px;
  padding: 7px;
}
.desktop-fav-artists-container {
  position: relative;
  margin-top: 15px;
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  width: 100%;
  border-radius: 7px;
  padding: 14px;
}
.fav-artist-category {
  position: absolute;
  float: left;
  transform: rotate(270deg);
  transform-origin: left center 0;
  border-radius: 5px 3px;
  text-align: center;
  font-weight: normal;
  font-size: 3.5vw;
  margin-left: 1%;
  margin-top: calc(21% + 5px);
  width: 20%;
  color: #0e0d0d;
  text-transform: uppercase;
  letter-spacing: 0px;
}
.desktop-fav-artist-category {
  position: absolute;
  float: left;
  transform: rotate(270deg);
  transform-origin: left center 0;
  border-radius: 5px 3px;
  text-align: center;
  font-weight: normal;
  font-size: 15px;
  margin-left: 1%;
  margin-top: 151px;
  width: 20%;
  color: #0e0d0d;
  text-transform: uppercase;
  letter-spacing: 0px;
}
.fav-artists {
  display: inline-flex;
  overflow-x: scroll;
  width: 94%;
  white-space: nowrap;
  padding: 10px;
  margin-left: calc(20px + 1%);
  margin-top: 10px;
}
.fav-artists::-webkit-scrollbar {
  display: none;
}
::-webkit-scrollbar {
  display: none;
}
.fav-catg-artists-container {
  display: inline-block;
  margin-right: 20px;
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
.ratings-container {
  overflow-x: scroll;
  width: 100%;
  display: flex;
  padding-top: 8px;
}
.desktop-ratings-container {
  overflow-x: scroll;
  width: 100%;
  display: flex;
  margin-top: 5px;
}
.desktop-ratings-container::-webkit-scrollbar {
  display: none;
}
.ratings-item-container {
  position: relative;
  margin-right: 8px;
  margin-left: 8px;
  display: inline-block;
  border-radius: 7px;
}
.ratings-item-poster {
  display: inline;
  width: 106px;
  height: 159px;
  border-top-left-radius: 7px;
  border-top-right-radius: 7px;
}
.desktop-ratings-item-poster {
  display: inline;
  width: 150px;
  height: 225px;
  border-top-left-radius: 7px;
  border-top-right-radius: 7px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.genres-container {
  margin-top: 15px;
  color: #333333;
  text-align: left;
  width: 100%;
  border-radius: 7px;
  padding: 7px;
  font-weight: bold;
  font-size: 15px;
}
.genres-pie {
  display: inline-flex;
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  width: 100%;
  border-radius: 7px;
  padding: 7px;
}
.desktop-genres-pie {
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  width: 50%;
  border-radius: 7px;
  padding: 7px;
}
.watched-timeline-container {
  margin-top: 15px;
  color: #333333;
  text-align: left;
  width: 100%;
  border-radius: 7px;
  padding: 7px;
  padding-bottom: 45px;
  font-weight: bold;
  font-size: 15px;
}
.watched-timeline {
  display: inline-flex;
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  width: 100%;
  border-radius: 7px;
  padding: 7px;
}
.desktop-watched-timeline {
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  width: 50%;
  border-radius: 7px;
  padding: 7px;
}
.banner {
  position: absolute;
  margin-left: 2%;
  margin-top: 1%;
  font-size: 10px;
  background-color: #fdb5b5;
  padding: 1%;
  border-radius: 5px;
}
.friendship-status {
  text-align: center;
  font-size: 14px;
  color: #333333;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #777777;
  padding: 4px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}
.share-icon {
  position: absolute;
  margin-left: 3%;
  width: 28px;
  height: 28px;
  background-image: url("./../images/share-icon.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.approve-request {
  text-align: center;
  font-size: calc(10px + 10%);
  color: #ffffff;
  border-radius: 5px;
  background-color: #3366bb;
  padding: 5px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.reject-request {
  margin-left: 16px;
  text-align: center;
  font-size: calc(10px + 10%);
  color: #333333;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #777777;
  padding: 4px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-friend-container {
  vertical-align: top;
  text-align: center;
  border-radius: 7px;
  margin-right: 15px;
  position: relative;
  display: inline-block;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-friends-box {
  width: 100%;
  margin-bottom: 2%;
  margin-top: 1%;
  margin-left: 7px;
  padding: 7px;
  text-align: left;
  overflow-x: scroll;
  display: flex;
}
.reset-ratings {
  position: absolute;
  width: 100px;
  right: 7px;
  margin-top: -5px;
  text-align: center;
  font-size: 14px;
  color: #333333;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #777777;
  padding: 4px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.reset-ratings-banner {
  position: absolute;
  margin-left: 28%;
  margin-top: -9%;
  font-size: 2.7vw;
  background-color: #fdb5b5;
  padding: 1%;
  border-radius: 5px;
}
.prompted-box {
  position: fixed;
  background-color: #ffffff;
  top: 35vh;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 7px;
  padding: 10px;
  z-index: 100001;
}
.prompted-user-cropper {
  display: inline-block;
  width: 80px;
  height: 80px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  z-index: 100001;
}
.prompted-user-pic {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
  z-index: 100001;
}
.prompted-user-name {
  margin-top: 3px;
  max-height: 34px;
  position: relative;
  white-space: normal;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.25;
  letter-spacing: normal;
  color: #333333;
  text-transform: capitalize;
  overflow: hidden;
  z-index: 100001;
}
.prompted-box p {
  position: relative;
  margin-top: 20px;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: center;
  color: #333333;
  white-space: normal;
}
.prompted-box span {
  position: relative;
  margin-top: 20px;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: center;
  color: #333333;
  white-space: normal;
}
.profile-prompted-buttons {
  // min-width: 45vw;
  margin-top: 20px;
}
.prompted-cancel-button {
  float: left;
  width: 50%;
  padding: 3px;
  cursor: pointer;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.prompted-confirm-button {
  float: right;
  width: 50%;
  border-left: solid 1px #919090;
  padding: 3px;
  cursor: pointer;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.prompted-android-share-button {
  float: right;
  width: 50%;
  cursor: pointer;
  border: 0;
  border-left: solid 1px #919090;
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
.profile-details {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 16px;
  margin-top: 16px;
  white-space: nowrap;
  text-align: left;
  width: 100%;
  overflow: hidden;
}
.desktop-profile-details {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 16px;
  white-space: nowrap;
  text-align: left;
  overflow: hidden;
  margin-top: 15px;
}
.profile-status {
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
.profile-status-title {
  margin: 0 auto;
  position: relative;
  font-size: 12px;
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
}
.profile-connections {
  position: relative;
  text-align: center;
  font-size: 15px;
  width: 85px;
  white-space: initial;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.6;
  letter-spacing: normal;
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
.profile-more {
  position: relative;
  width: 24px;
  height: 40px;
  background-image: url("./../images/more-icon.svg");
  background-color: #ffffff;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 40%;
  padding: 8px;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-more-options {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  top: 40vh;
  max-height: 50vh;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 16px;
  z-index: 100001;
  white-space: nowrap;
}
.profile-more-option {
  position: relative;
  display: flex;
  align-items: center;
  text-align: left;
  cursor: pointer;
}
.profile-more-about-us {
  position: relative;
  width: 45px;
  height: 45px;
  background-image: url("./../images/flibo-logo-color-no-padding.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}
.profile-more-logout {
  position: relative;
  width: 50px;
  height: 50px;
  background-image: url("./../images/logout.svg");
  background-repeat: no-repeat;
  background-size: 81%;
  background-position: center;
}
.profile-more-option-text {
  position: relative;
  margin-left: 10px;
  font-size: 17px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
}
.profile-ratings {
  position: relative;
  margin-top: 15px;
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  width: 100%;
  border-radius: 7px;
  padding: 0px 7px;
}
.fetching-profile-message {
  position: fixed;
  top: calc(50% - 36px);
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 95%;
}
.profile-views {
  position: relative;
  width: 42px;
  height: 61px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  text-align: center;
  z-index: 1;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-views-icon {
  display: inline-block;
  width: 35px;
  height: 35px;
  position: relative;
  background-image: url("./../images/eye.svg");
  background-size: 100% 100%;
  border: none;
  outline: 0;
}
.profile-views-count {
  position: relative;
  margin-top: -9px;
  font-size: 22px;
  white-space: initial;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.6;
  letter-spacing: normal;
  color: #333333;
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
.collage-download-button {
  position: absolute;
  width: 25px;
  height: 25px;
  right: 30px;
  transform: translateX(10px);
  background-image: url("./../images/download.svg");
  background-size: 100% 100%;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-quick-filters-content-type {
  display: flex;
  height: max-content;
  justify-content: center;
  margin-bottom: 10px;
  margin-top: 16px;
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
.show-all-button {
  transform: translateY(-50%);
  margin-left: 8px;
  margin-top: 79px;
}
.profile-user-rating-icon {
  position: absolute;
  right: -2px;
  top: -2px;
  z-index: 1;
  padding: 5px;
  border-radius: 50%;
}
.profile-watched-box {
  display: flex;
  justify-content: space-evenly;
}
.profile-content-watched {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
