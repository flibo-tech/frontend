<script>
import { Line } from "vue-chartjs";

export default {
  extends: Line,
  props: {
    years: {
      type: Array,
      required: true,
    },
    liked: {
      type: Array,
      required: true,
    },
    disliked: {
      type: Array,
      required: true,
    },
    loved: {
      type: Array,
      required: true,
    },
    total: {
      type: Array,
      required: true,
    },
  },
  mounted() {
    this.renderLineChart();
  },
  methods: {
    renderLineChart: function () {
      this.renderChart(
        {
          labels: this.years,
          datasets: [
            {
              label: "Loved",
              backgroundColor: "rgba(248, 121, 121, 0.5)",
              data: this.loved,
            },
            {
              label: "Liked",
              backgroundColor: "rgba(64, 94, 237, 0.5)",
              data: this.liked,
            },
            {
              label: "Disliked",
              backgroundColor: "rgba(227, 225, 225, 0.5)",
              data: this.disliked,
            },
            {
              label: "Total Watched",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              data: this.total,
            },
          ],
        },
        {
          responsive: true,
          maintainAspectRatio: true,
          elements: {
            point: {
              radius: 0,
            },
          },
          scales: {
            xAxes: [
              {
                gridLines: {
                  display: false,
                },
                ticks: {
                  autoSkip: true,
                  maxRotation: 30,
                  minRotation: 30,
                },
              },
            ],
            yAxes: [
              {
                gridLines: {
                  display: false,
                },
              },
            ],
          },
        }
      );
    },
  },
};
</script>
