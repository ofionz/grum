<template>
  <v-app id="app">
    <Table></Table>
  </v-app>
</template>

<script>
import Table from "./components/Table";

export default {
  components: {
    Table
  },
  created: async function () {

  }
}
</script>

<style>
html {
  overflow: unset !important;
}
.e-schedule .e-vertical-view .e-left-indent {
  width: 165px !important;
}
.e-appointment {
  width: 100%!important;
}
.e-schedule .e-vertical-view .e-time-cells-wrap table td, .e-schedule .e-vertical-view .e-work-cells {
 min-height: 60px !important;
height: 65px !important;
}
</style>

<style src="../src/assets/styles.css"> </style>

