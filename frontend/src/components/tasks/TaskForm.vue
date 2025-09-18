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
import { taskService } from '../../services/task.service.js'


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
    const response = await taskService.add(newTask.value);
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