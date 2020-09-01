<template>
  <div>
    <Button
      icon="love"
      buttonType="iconOnly"
      :size="iconSize"
      :state="rating === 3"
      @clicked="$emit('update-rating', rating == 3 ? 0 : 3)"
    />
    <Button
      icon="thumbs_up"
      buttonType="iconOnly"
      :size="iconSize"
      :state="rating === 2"
      @clicked="$emit('update-rating', rating == 2 ? 0 : 2)"
    />
    <Button
      icon="thumbs_down"
      buttonType="iconOnly"
      :size="iconSize"
      :state="rating === 1"
      @clicked="$emit('update-rating', rating == 1 ? 0 : 1)"
    />
  </div>
</template>

<script>
import Button from "./../atomic/Button";
export default {
  name: "UserRating",
  props: {
    rating: {
      type: Number,
      default: 0,
    },
    iconSize: {
      type: Number,
      required: true,
    },
  },
  components: {
    Button,
  },
};
</script>

<style scoped>
div {
  display: flex;
  justify-content: space-between;
}
</style>