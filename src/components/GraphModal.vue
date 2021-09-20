<template>
  <div v-show="modal_visible" class="modal" id="graphmodal">
    <div class="modal-container">
      <span class="close" @click="modal_visible = false">&times;</span>
      <div class="modal-content">
        <h2>Verlauf der Inzidenz von {{ selected_city }}</h2>
        <canvas id="verlauf-canvas">Sorry your browser doesn't support html5 canvas</canvas>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { linspace, map } from "@/assets/js/helper";

export default {
  name: "GraphModal",
  data() {
    return {
      selected_city: "",
      modal_visible: false
    }
  },

  created (){
    window.onclick = (e) => {
      if (e.target === document.getElementById("graphmodal")) {
        this.modal_visible = false;
      }
    };

    this.districts_general_data = null;
  },

  events: {
    "show-graph-event" (city){
      this.selected_city = city.alias || city.name;
      this.modal_visible = true;
      if (!this.districts_history_data){
        this.fetch_disctrit_history_data()
          .then(() => {
            this.draw_graph(city);
          })
      } else {
        this.draw_graph(city);
      }
    }
  },

  methods: {
    fetch_disctrit_history_data(){
      let url = "https://api.corona-zahlen.org/districts/history/frozen-incidence/7";
      return axios.get(url)
        .then(({ data }) => {
          this.districts_history_data = data.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    draw_graph({ ags , today_data}){
      let canvas = document.getElementById("verlauf-canvas");
      let ctx = canvas.getContext("2d");

      let inzidenzen_dates = this.districts_history_data[ags].history.map((day) => {
        return {"inzidenz": day.weekIncidence.toFixed(1), "date": day.date};
      });

      if (!inzidenzen_dates.map(day => day.date).includes(today_data.date)) {
        inzidenzen_dates.push(today_data);
      }

      // resize
      if (canvas.offsetWidth !== 0 && canvas.offsetHeight !== 0){
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }

      // fill background black
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // change line color to white
      ctx.strokeStyle = "#FFF";
      ctx.fillStyle = "#FFF";
      ctx.font = "23px Source Sans Pro";
      ctx.textAlign = "center";

      if (inzidenzen_dates.length < 3) {
        ctx.fillText("Keine Verlaufsdaten verhanden", canvas.width / 2, 100);
        return;
      }

      // draw main axises
      // y-axis
      let padding = {left: 55, right: 15, top: 35, bottom: 40};

      let x_axis = { start: padding.left, end: canvas.width - padding.right, y: canvas.height - padding.bottom, text: "Tag:" };
      let y_axis = { x: padding.left, start: padding.top, end: canvas.height - padding.bottom, text: "Inzidenz:" };

      // y-axis
      ctx.draw_vertical_line(y_axis.start, y_axis.end, y_axis.x);
      ctx.draw_vertical_line(y_axis.start, y_axis.end, x_axis.end);

      // x-axis
      ctx.draw_horizontal_line(x_axis.start, x_axis.end, x_axis.y);
      ctx.draw_horizontal_line(x_axis.start, x_axis.end, y_axis.start);

      // draw y label
      ctx.fillText(y_axis.text, padding.left - 9, padding.top - 10);

      // draw x label
      ctx.fillText(x_axis.text, padding.left - 20, canvas.height - 11);

      let min_inzidenz = Math.min(...inzidenzen_dates.map(({inzidenz}) => inzidenz));
      let max_inzidenz = Math.max(...inzidenzen_dates.map(({inzidenz}) => inzidenz));

      ctx.font = "19px Source Sans Pro";
      let reference_line_margin = 30;
      // reference values and text for inzidenzen
      let reference_values = linspace(min_inzidenz, max_inzidenz, 5);
      reference_values.reverse();

      reference_values.forEach((value, i) => {
        let y = y_axis.start + reference_line_margin + ((y_axis.end - y_axis.start - reference_line_margin * 2) / 4) * i;
        ctx.draw_horizontal_line(y_axis.x - 10, y_axis.x, y);
        ctx.fillText(value.toFixed(1), y_axis.x - 30, y + 6);
      });

      let last = { x: null, y: null };

      inzidenzen_dates.sort();

      inzidenzen_dates.forEach((data, i) => {
        let x = x_axis.start + reference_line_margin + ((x_axis.end - x_axis.start - reference_line_margin * 2) / (inzidenzen_dates.length - 1)) * i;
        ctx.draw_vertical_line(x_axis.y + 10, x_axis.y, x);
        ctx.fillText(new Date(data.date).getDate() + ".", x + 3, x_axis.y + 30);
        let y = y_axis.end - y_axis.start - reference_line_margin * 2 - map(data.inzidenz, min_inzidenz, max_inzidenz, 0, y_axis.end - y_axis.start - reference_line_margin * 2);

        // outside for loop so that line gets brighter
        for (let _ = 0; _ < 3; _++) {
          if (i > 0) {
            ctx.beginPath();
            ctx.moveTo(last.x, last.y + y_axis.start + reference_line_margin);
            ctx.lineTo(x, y + y_axis.start + reference_line_margin);
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(x, y + y_axis.start + reference_line_margin, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "#FFF";
          ctx.fill();
          ctx.stroke();
        }

        last = { x: x, y: y };
      });
    }
  },
}
</script>

<style scoped src="../assets/css/graphmodal.css"></style>