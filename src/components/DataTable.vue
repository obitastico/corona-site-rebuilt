<template>
  <div id="datatable">
    <h1>Corona Daten</h1>
    <p class="subtitle">Stand: {{ last_updated }}</p>
    <table class="output-table">
      <thead>
      <tr>
        <th>Kategorie</th>
        <th v-for="i in displayed_city_count" :key="i-1">
          <template v-if="districts_general_data !== null">
            <select v-model="selected_citys[i-1]">
              <option v-for="(city, j) in filter_citys(i-1)" :key="j" :value="city">
                {{ city.alias || city.name }}
              </option>
            </select>
          </template>
          <select v-else><option>Loading...</option></select>
        </th>
      </tr>
      </thead>
      <tbody>
        <tr>
          <td>Inzidenz</td>
          <td v-for="(city, i) in selected_citys" :key="i">
            <template v-if="districts_general_data !== null">
              {{ districts_general_data[city.ags].weekIncidence.toFixed(1) }}
            </template>
            <template v-else>NaN</template>
          </td>
        </tr>
        <tr>
          <td>Tote</td>
          <td v-for="(city, i) in selected_citys" :key="i">
            <template v-if="districts_general_data !== null">
              {{ districts_general_data[city.ags].deaths }} (+{{ districts_general_data[city.ags].delta.deaths }})
            </template>
            <template v-else>NaN</template>
          </td>
        </tr>
        <tr>
          <td>Fälle</td>
          <td v-for="(city, i) in selected_citys" :key="i">
            <template v-if="districts_general_data !== null">
              {{ districts_general_data[city.ags].cases }} (+{{ districts_general_data[city.ags].delta.cases }})
            </template>
            <template v-else>NaN</template>
          </td>
        </tr>
        <tr>
          <td>Genesene</td>
          <td v-for="(city, i) in selected_citys" :key="i">
            <template v-if="districts_general_data !== null">
              {{ districts_general_data[city.ags].recovered }}
            </template>
            <template v-else>NaN</template>
          </td>
        </tr>
        <tr>
          <td>Verlauf</td>
          <td class="clickable-text verlauf" v-for="i in displayed_city_count" :key="i" @click="show_graph(i-1)">
            Öffnen
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
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

const displayed_city_count = 3;

export default {
  name: "DataTable",

  data() {
    return {
      displayed_city_count: displayed_city_count,
      districts_general_data: null,
      citys: citys,
      selected_citys: citys.slice(0, displayed_city_count),
      meta: null
    }
  },

  async created() {
    let url = "https://api.corona-zahlen.org/districts/";

    fetch(url)
      .then(res => res.json())
      .then(res => {
        const data = res.data;
        this.meta = res.meta;

        this.districts_general_data = data;

        for (const city of Object.keys(data).map(x => data[x])) {
          for (const used_city of this.citys) {
            if (used_city.ags != null) continue;

            if (used_city.name === city.name) used_city.ags = city.ags;
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  },

  computed: {
    last_updated(){
      if (this.meta === null) return "NaN";
      let date = new Date(this.meta.lastUpdate);

      let options = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };

      return date.toLocaleTimeString("de-DE", options);
    }
  },

  methods: {
    show_graph(index){
      let curr_city = this.selected_citys[index];
      curr_city.today_data = {date: this.meta.lastUpdate, inzidenz: this.districts_general_data[curr_city.ags].weekIncidence.toFixed(1)};

      this.$events.fire("show-graph-event", this.selected_citys[index]);
    },

    filter_citys(index) {
      return [this.selected_citys[index]].concat(this.citys.filter(x => !this.selected_citys.map(x => x.ags).includes(x.ags)));
    }
  },
}
</script>

<style scoped src="../assets/css/datatable.css"></style>