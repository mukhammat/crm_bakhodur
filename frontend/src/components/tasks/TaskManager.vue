<template>
    <TaskForm :getTasks="getTasks"></TaskForm>
    <TaskList :getTasks="getTasks" :tasks="tasks" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TaskForm from './TaskForm.vue'
import TaskList from './TaskList.vue'
import { taskApi } from '../../api/task.api.js'

const tasks = ref([])

async function getTasks() {
  try {
    const response = await taskApi.getAll();
    const data = await response.json()
    tasks.value = data.data.tasks
    console.log(data.data.tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
  }
}

onMounted(getTasks)
</script>
