<template>
  <div>
    <p class="copyright">Alle Angaben sind ohne Gewähr. Quelle:&nbsp;<a href="https://github.com/marlon360/rki-covid-api">corona-zahlen.org</a>&nbsp; © Website by {{ author }} 2021</p>
  </div>
</template>

<script>
export default {
  name: "Copyright",
  props: {
    author: String,
  }
}
</script>

<style scoped src="../assets/css/copyright.css"></style>