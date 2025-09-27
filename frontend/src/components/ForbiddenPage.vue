<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card class="pa-8 text-center" max-width="500">
      <v-card-text>
        <v-icon 
          icon="mdi-lock" 
          size="80" 
          color="error" 
          class="mb-4"
        ></v-icon>
        
        <h2 class="text-h4 mb-4">Доступ запрещен</h2>
        
        <p class="text-body-1 mb-6">
          У вас нет прав для доступа к этой странице.
          <br>
          Обратитесь к администратору для получения необходимых разрешений.
        </p>

        <div class="d-flex flex-column gap-2">
          <v-btn 
            color="primary" 
            @click="$router.go(-1)"
            prepend-icon="mdi-arrow-left"
          >
            Назад
          </v-btn>
          
          <v-btn 
            variant="text" 
            @click="$router.push('/')"
            prepend-icon="mdi-home"
          >
            На главную
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
// Компонент не требует дополнительной логики
</script>