<template>
  <div id="app">
    <GraphModal/>
    <main>
      <DataTable/>
      <Copyright author="Tobias Reicherzer"/>
    </main>
  </div>
</template>

<script>
import GraphModal from "@/components/GraphModal";
import DataTable from "@/components/DataTable";
import Copyright from "@/components/Copyright";

export default {
  name: 'App',
  components: {
    GraphModal,
    DataTable,
    Copyright
  }
}
</script>

<style>
#app {
  margin: 0;
  padding: 0;
  background-color: #333;
  width: 100%;
  height: 100%;
  display: flex;
}

main {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
}
</style>
