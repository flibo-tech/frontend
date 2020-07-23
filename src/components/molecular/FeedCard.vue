<template>
  <div class="feed-card-container">
    <div v-if="parent != 'watchlist'" class="feed-card-text">
      <FeedText
        :user_id="content.user_id"
        :user_name="content.user_name"
        :user_picture="content.user_picture"
        :item_type="content.item_type"
        :user_ids="content.user_ids"
        :other_user_rating="content.other_user_rating"
        :type="content.type"
        :feed_type="content.feed_type"
        v-on="$listeners"
      />
    </div>

    <div class="feed-card-poster">
      <FeedPoster
        :contentId="content.content_id"
        :title="content.title"
        :image="content.poster"
        :trailerId="content.youtube_trailer_id"
        :whereToWatch="content.where_to_watch"
        :parent="parent"
        :feedType="content.feed_type"
        v-on="$listeners"
      />
    </div>

    <div class="feed-card-info">
      <FeedInfo
        :contentId="content.content_id"
        :title="content.title"
        :contentType="content.type"
        :releaseYear="content.release_year"
        :endYear="content.end_year"
        :imdbScore="content.imdb_score"
        :tomatoMeter="content.tomato_meter"
        :rating="content.rating"
        :genres="content.genres"
        :watchLater="content.watch_later"
        :parent="parent"
        :feedType="content.feed_type"
        v-on="$listeners"
      />
    </div>
  </div>
</template>

<script>
import FeedText from "./../atomic/FeedText";
import FeedPoster from "./../atomic/FeedPoster";
import FeedInfo from "./../atomic/FeedInfo";

export default {
  name: "App",
  components: {
    FeedText,
    FeedPoster,
    FeedInfo
  },
  props: {
    content: {
      type: Object,
      required: true
    },
    parent: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width
    };
  }
};
</script>

<style lang="scss" scoped>
.feed-card-container {
  display: grid;
  grid-template-columns: 16px 40vw 24px 1fr 16px;
  grid-template-rows: auto auto;
  justify-items: left;
}
.feed-card-text {
  grid-row-start: 1;
  grid-column-start: 2;
  margin-bottom: 10px;
}
.feed-card-poster {
  grid-row-start: 3;
  grid-column-start: 2;
}
.feed-card-info {
  grid-row-start: 3;
  grid-column-start: 4;
  width: 100%;
}
::-webkit-scrollbar {
  display: none;
}
</style>