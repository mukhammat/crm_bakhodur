<template>
  <v-app>
    <AppHeader v-if="!route.meta.hideHeader" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { useRoute } from 'vue-router'
import AppHeader from './layout/AppHeader.vue'

const route = useRoute()
</script>
