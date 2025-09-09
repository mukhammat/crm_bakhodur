<script setup lang="ts">
import { RouterView } from 'vue-router'

</script>

<template>
  <router-view name="header"></router-view>
  <RouterView />
  <router-view name="footer"></router-view>
</template>
