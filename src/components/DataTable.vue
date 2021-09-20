<template>
  <div id="datatable">
    <h1>Corona Daten</h1>
    <p class="subtitle">Stand: {{ last_updated }}</p>
    <table class="output-table">
      <thead>
      <tr>
        <th>Kategorie</th>
        <th v-for="(_, i) in Array(displayed_city_count).fill(0).map(() => null)" :key="i">
          <select @change="select_change($event)" v-model="selected_citys_model[i]" :name="`City Slot ${i.toString()}`">
            <option v-for="(city, j) in filter_citys(citys, i)" :key="j">
              {{ city.alias || city.name }}
            </option>
          </select>
        </th>
      </tr>
      </thead>
      <tbody v-if="districts_general_data !== null">
      <tr>
        <td>Inzidenz</td>
        <td v-for="(city, i) in selected_citys" :key="i">
          {{ districts_general_data[city.ags].weekIncidence.toFixed(1) }}
        </td>
      </tr>
      <tr>
        <td>Tote</td>
        <td v-for="(city, i) in selected_citys" :key="i">
          {{ districts_general_data[city.ags].deaths }} (+{{ districts_general_data[city.ags].delta.deaths }})
        </td>
      </tr>
      <tr>
        <td>Fälle</td>
        <td v-for="(city, i) in selected_citys" :key="i">
          {{ districts_general_data[city.ags].cases }} (+{{ districts_general_data[city.ags].delta.cases }})
        </td>
      </tr>
      <tr>
        <td>Genesene</td>
        <td v-for="(city, i) in selected_citys" :key="i">
          {{ districts_general_data[city.ags].recovered }}
        </td>
      </tr>
      <tr>
        <td>Verlauf</td>
        <td class="clickable-text verlauf" v-for="(_, i) in Array(displayed_city_count).fill(0).map(() => null)" :key="i" v-on:click="show_graph(i)">
          Öffnen
        </td>
      </tr>
      </tbody>
      <tbody v-else>
      <tr>
        <td>Inzidenz</td>
        <td v-for="(_, i) in selected_citys" :key="i">
          NaN
        </td>
      </tr>
      <tr>
        <td>Tote</td>
        <td v-for="(_, i) in selected_citys" :key="i">
          NaN
        </td>
      </tr>
      <tr>
        <td>Fälle</td>
        <td v-for="(_, i) in selected_citys" :key="i">
          NaN
        </td>
      </tr>
      <tr>
        <td>Genesene</td>
        <td v-for="(_, i) in selected_citys" :key="i">
          NaN
        </td>
      </tr>
      <tr>
        <td>Verlauf</td>
        <td class="clickable-text verlauf" v-for="(_, i) in Array(displayed_city_count).fill(0).map(() => null)" :key="i">
          Öffnen
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";

const citys = [
  {name: "München", ags: null},
  {name: "Altötting", ags: null},
  // {name: "Freyung-Grafenau", ags: null, alias: "Grafenau"},
  {name: "Unterallgäu", ags: null, alias: "Mindelheim"},
  {name: "Landsberg am Lech", ags: null, alias: "Landsberg"},
  {name: "Wolfsburg", ags: null},
  {name: "Rosenheim", ags: "09187", alias: "Pfaffing"},
  {name: "Neustadt a.d. Waldnaab", ags: null, alias: "Neustadt"},
];

export default {
  name: "DataTable",

  data() {
    let displayed_city_count = 3;
    return {
      displayed_city_count: displayed_city_count,
      citys: citys,

      districts_general_data: null,
      selected_citys: citys.slice(0, displayed_city_count),
      selected_citys_model: citys.slice(0, displayed_city_count).map((city) => { return city.alias || city.name}),
      last_updated: "",
      meta: null
    }
  },

  created() {
    let url = "https://api.corona-zahlen.org/districts/";
    axios.get(url)
      .then((response) => {
        const data = response.data.data;
        const meta = response.data.meta;
        this.meta = meta;

        let date = new Date(meta.lastUpdate);

        let options = {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        };

        this.last_updated = date.toLocaleTimeString("de-DE", options);

        this.districts_general_data = data;
        for (let i = 0; i < this.citys.length; i++) {
          for (const city of Object.keys(data).map((key) => data[key])) {
            if (this.citys[i].ags != null) break;

            if (this.citys[i].name === city.name) this.citys[i].ags = city.ags;
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  },

  methods: {
    show_graph(index){
      let curr_city = this.selected_citys[index];
      curr_city.today_data = {date: this.meta.lastUpdate, inzidenz: this.districts_general_data[curr_city.ags].weekIncidence.toFixed(1)};

      this.$events.fire("show-graph-event", this.selected_citys[index])
    },

    select_change(event){
      this.selected_citys[event.target.name.split("City Slot ")[1]] = citys.find((city) => (city.alias || city.name) === event.target.value);
    },

    filter_citys(citys, index) {
      if (!this.selected_citys.map((city) => { return city.ags; }).every((elem) => elem !== null)){
        return ["Loading..."];
      }

      return [this.selected_citys[index]].concat(citys.filter(({ ags }) => {
        return !this.selected_citys.map((city) => {
          return city.ags;
        }).includes(ags);
      }))
    }
  },

}
</script>

<style scoped src="../assets/css/datatable.css"></style>