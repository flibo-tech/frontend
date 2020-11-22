<script>
import { Doughnut } from "vue-chartjs";
import "chartjs-plugin-labels";

export default {
  extends: Doughnut,
  props: {
    genres: {
      type: Array,
      required: true,
    },
    contribution: {
      type: Array,
      required: true,
    },
  },
  mounted() {
    this.renderPieChart();
  },
  methods: {
    renderPieChart: function () {
      this.renderChart(
        {
          labels: this.genres,
          datasets: [
            {
              backgroundColor: [
                "#405EED",
                "#5A62DC",
                "#7566CC",
                "#8F6ABB",
                "#A96DAB",
                "#C3719A",
                "#DE758A",
                "#F87979",
              ],
              data: this.contribution,
            },
          ],
        },
        {
          responsive: true,
          maintainAspectRatio: true,
          legend: false,
          tooltips: false,
          plugins: {
            labels: {
              render: "label",
              fontSize: 12,
              fontColor: "#333",
              fontFamily: "'Roboto', sans-serif",
              position: "outside",
              arc: true,
              textMargin: 8,
              outsidePadding: 8,
            },
          },
        }
      );
    },
  },
};
</script>
