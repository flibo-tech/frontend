<script>
import { Line } from "vue-chartjs";

export default {
  extends: Line,
  props: {
    years: {
      type: Array,
      required: true
    },
    liked: {
      type: Array,
      required: true
    },
    disliked: {
      type: Array,
      required: true
    },
    loved: {
      type: Array,
      required: true
    },
    total: {
      type: Array,
      required: true
    },
    parent_content_type: {
      type: String,
      required: true
    }
  },
  mounted() {
    this.renderLineChart();
  },
  computed: {
    content_type: function() {
      return this.parent_content_type;
    }
  },
  watch: {
    content_type: {
      handler(val) {
        this.renderLineChart();
      }
    }
  },
  methods: {
    renderLineChart: function() {
      this.renderChart(
        {
          labels: this.years,
          datasets: [
            {
              label: "Loved",
              backgroundColor: "rgba(242, 107, 107, 0.5)",
              data: this.loved
            },
            {
              label: "Liked",
              backgroundColor: "rgba(61, 167, 242, 0.5)",
              data: this.liked
            },
            {
              label: "Disliked",
              backgroundColor: "rgba(227, 225, 225, 0.5)",
              data: this.disliked
            },
            {
              label: "Total Watched",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              data: this.total
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
