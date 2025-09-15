<template>
  <v-container>
    <v-row justify="center">
        <v-card-title>
            <v-btn color="primary" @click="getTasks" class="mr-2">Обновить</v-btn>
            <v-btn color="success" @click="showAddDialog = true">Добавить задачу</v-btn>
        </v-card-title>
    </v-row>

    <!-- диалог добавления задачи -->
    <v-dialog v-model="showAddDialog" max-width="500px">
      <v-card>
        <v-card-title>Добавить задачу</v-card-title>
        <v-card-text>
          <v-text-field v-model="newTask.title" label="Название" required />
          <v-text-field v-model="newTask.description" label="Описание" required />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeAddDialog">Отмена</v-btn>
          <v-btn color="success" @click="addTask" :loading="isAddingTask">
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>

</template>

<script setup>
import { ref, defineProps } from 'vue'


const TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjlkYTQwZmIzLWQ4MGQtNGNjNy05NzYwLWMzMzU1YTMxMTU1OCIsImVtYWlsIjoiZG9zbmV0MjIwMEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTc5NTU1MjEsImV4cCI6MTc1ODA0MTkyMX0.v9XsylKfH_Kjux08TFwHsNLykDUVZ-OEdKcveV0TAMo' // вынеси в .env


const newTask = ref({
  title: '',
  description: ''
})
const props = defineProps({
  getTasks: Function
})

const getTasks = props.getTasks;

const showAddDialog = ref(false)
const isAddingTask = ref(false)

async function addTask() {
  if (!newTask.value.title || !newTask.value.description) return

  try {
    isAddingTask.value = true
    const response = await fetch('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: TOKEN,
      },
      body: JSON.stringify(newTask.value),
    })
    if (response.ok) {
      closeAddDialog()
      await getTasks();
    }
  } finally {
    isAddingTask.value = false
  }
}

function closeAddDialog() {
  showAddDialog.value = false
  newTask.value = { title: '', description: '' }
}

</script>