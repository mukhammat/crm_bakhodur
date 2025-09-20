<template>
  <v-container md="5">
    <v-select
      v-model="selectedStatus"
      :items="statusOptions"
      item-title="label"
      item-value="value"
      label="Фильтр по статусу"
      class="mb-1"
      chips
      closable-chips
    />
  </v-container>

  <TaskForm :getTasks="getTasks"></TaskForm>
  <TaskList :getTasks="getTasks" :tasks="tasks" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import TaskForm from './TaskForm.vue'
import TaskList from './TaskList.vue'
import { taskApi } from '../../api/task.api.js'

const tasks = ref([])
const selectedStatus = ref(null)

const statusOptions = [
  { label: 'Ожидает', value: 'pending' },
  { label: 'В процессе', value: 'in_progress' },
  { label: 'Завершено', value: 'completed' },
  { label: 'Все', value: null }
]

async function getTasks() {
  try {
    const param = {}

    if(selectedStatus.value) {
      param.status = selectedStatus.value
    }

    const response = await taskApi.getAll(param)

    const data = await response.json()
    tasks.value = data.data.tasks
    console.log(data.data.tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
  }
}

onMounted(getTasks)

watch(selectedStatus, () => {
  getTasks()
})
</script>

