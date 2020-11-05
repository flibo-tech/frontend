<template>
  <div class="quick-filters-rating">
    <div v-for="(item, index) in ['All', 3, 2, 1]" :key="index">
      <input
        type="radio"
        :id="'quick-filters-rating-' + index"
        v-bind:value="item"
        v-model="rating_tab"
        class="rating-filter-checkbox-input"
      />
      <label
        class="rating-filter-checkbox"
        :for="'quick-filters-rating-' + index"
        :style="
          rating_tab == item
            ? 'background-color: #e8f0fe;border-color: #d2e3fc;'
            : ''
        "
        @click="rating_tab != item ? switchRatingTab(item) : ''"
      >
        <span v-if="item == 'All'" class="rating-checkmark-text">{{
          item
        }}</span>
        <Button
          v-else
          :icon="item == 3 ? 'love' : item == 2 ? 'thumbs_up' : 'thumbs_down'"
          buttonType="iconOnly"
          :size="18"
          :state="true"
          :disabled="true"
          @clicked="rating_tab != item ? switchRatingTab(item) : ''"
        />
      </label>
    </div>
  </div>
</template>

<script>
import Button from "./../atomic/Button";

export default {
  name: "App",
  components: {
    Button,
  },
  props: {
    parent: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      rating_tab: "All",
      store_mappings: {
        ratings: "this.$store.state.feed.ratings.rating_tab",
      },
    };
  },
  computed: {
    rating_tab_string() {
      return JSON.stringify(eval(this.store_mappings[this.parent])).replace(
        /['"]+/g,
        ""
      );
    },
  },
  created() {
    if (this.rating_tab_string == "[1,2,3]") {
      this.rating_tab = "All";
    } else {
      this.rating_tab = eval(this.store_mappings[this.parent])[0];
    }
  },
  methods: {
    switchRatingTab(tab) {
      if (tab != "All") {
        eval(this.store_mappings[this.parent] + " = [" + tab + "]");
      } else if (tab == "All") {
        eval(this.store_mappings[this.parent] + " = [1, 2, 3]");
      }
      this.rating_tab = tab;
      this.$emit("filter-parent");
    },
  },
};
</script>

<style scoped>
.quick-filters-rating {
  position: relative;
  display: flex;
  width: fit-content;
  height: fit-content;
}
.rating-filter-checkbox {
  display: flex;
  min-height: 34px;
  position: relative;
  width: max-content;
  margin-right: 5px;
  border-radius: 50px;
  background-color: #ffffff;
  padding: 5px 15px;
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
.rating-filter-checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}
.rating-checkmark-text {
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