<template>
  <v-app-bar app color="primary" dark>
    <!-- Логотип или название -->
    <v-toolbar-title>🚀 MyApp</v-toolbar-title>

    <!-- Spacer чтобы кнопки ушли вправо -->
    <v-spacer></v-spacer>

    <!-- Кнопки меню -->
    <v-btn text>Главная</v-btn>
    <v-btn text>Задачи</v-btn>
    <v-btn text>О нас</v-btn>

    <!-- Иконка профиля -->
    <v-btn icon>
      <v-icon>mdi-account-circle</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script setup>
// Можно потом повесить router-link на кнопки через :to="{ name: 'routeName' }"
</script>

<style scoped>
.header-global {
  margin-bottom: 16px; /* чтобы контент не прилипал */
}
</style>
