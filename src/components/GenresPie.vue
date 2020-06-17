<script>
import { Pie } from "vue-chartjs";

export default {
  extends: Pie,
  props: {
    genres: {
      type: Array,
      required: true
    },
    contribution: {
      type: Array,
      required: true
    },
    parent_content_type: {
      type: String,
      required: true
    }
  },
  mounted() {
    this.renderPieChart();
  },
  computed: {
    content_type: function() {
      return this.parent_content_type;
    }
  },
  watch: {
    content_type: {
      handler(val) {
        this.renderPieChart();
      }
    }
  },
  methods: {
    renderPieChart: function() {
      this.renderChart(
        {
          labels: this.genres,
          datasets: [
            {
              backgroundColor: [
                "#8fb3f5",
                "#bdaef3",
                "#e4a9e7",
                "#ffa7d2",
                "#ffabb9",
                "#ffb4a1",
                "#ffc28f",
                "#fad287"
              ],
              data: this.contribution
            }
          ]
        },
        {
          responsive: true,
          maintainAspectRatio: true
        }
      );
    }
  }
};
</script>
