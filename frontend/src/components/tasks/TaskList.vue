<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-data-table
            :headers="headers"
            :items="tasks"
            item-key="id"
            class="elevation-1"
          >
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.title="{ item }">
              <v-edit-dialog
                 v-model="item.title"
                @cancel="resetTasks"
              >
                {{ item.title }}
                <template #input>
                  <v-text-field v-model="item.title" label="Title" single-line />
                </template>
              </v-edit-dialog>
            </template>

            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.description="{ item }">
              <v-edit-dialog
                v-model="item.description"
                @cancel="resetTasks"
              >
                {{ item.description }}
                <template #input>
                  <v-text-field
                    v-model="item.description"
                    label="Description"
                    single-line
                  />
                </template>
              </v-edit-dialog>
            </template>

            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.status="{ item }">
              <v-chip
                :color="item?.status === 'completed' ? 'green' : 'orange'"
                variant="flat"
              >
                {{ item?.status }}
              </v-chip>
            </template>

            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.actions="{ item }">
              <v-btn color="primary" size="small" @click="openEditDialog(item)" class="mr-2">
                Обновить
              </v-btn>
              <v-btn
                color="red"
                size="small"
                @click="deleteTask(item.id)"
                :loading="deletingTasks.includes(item.id)"
              >
                Удалить
              </v-btn>
            </template>

          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог редактирования задачи -->
    <v-dialog v-model="showEditDialog" max-width="500px">
      <v-card v-if="editingTask">
        <v-card-title>Редактировать задачу</v-card-title>
        <v-card-text>
          <v-text-field v-model="editingTask.title" label="Название" required />
          <v-text-field v-model="editingTask.description" label="Описание" required />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeEditDialog">Отмена</v-btn>
          <v-btn color="success" @click="saveEditTask" :loading="isAddingTask">
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, defineProps, toRef } from 'vue'

// получаем проп
const props = defineProps({
  tasks: Array,
  getTasks: Function
})

const tasks = toRef(props, 'tasks') // теперь используем пропс напрямую
console.log(tasks)
const getTasks = props.getTasks

const deletingTasks = ref([])
const showEditDialog = ref(false)
const isAddingTask = ref(false)
const editingTask = ref(null)

// Исправленные заголовки для Vuetify 3
const headers = [
  { title: 'Title', key: 'title' },
  { title: 'Описание', key: 'description' },
  { title: 'Статус', key: 'status' },
  { title: 'Работники', key: 'assignments.worker' },
  { title: 'Действия', key: 'actions', sortable: false },
]

const TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJkNzlhNzA1LTJhODQtNDkyMC1iYWNmLWI4OWRjNGJmNzkzYyIsImVtYWlsIjoiZG9zbmV0MjIwMEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTc2ODQ3NzEsImV4cCI6MTc1Nzc3MTE3MX0.oMFLBCQpimXcTFcgbbMEGx6s-ddseOuhMS_XRlSfr-Y' // вынеси в .env

// Вызываем при клике "Update" на строке таблицы
function openEditDialog(task) {
  editingTask.value = { ...task }
  showEditDialog.value = true
}

function closeEditDialog() {
  showEditDialog.value = false
  editingTask.value = null
}

async function saveEditTask() {
  if (!editingTask.value.title || !editingTask.value.description) return

  try {
    isAddingTask.value = true
    const response = await fetch(`http://localhost:3000/api/tasks/${editingTask.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: TOKEN,
      },
      body: JSON.stringify({
        title: editingTask.value.title,
        description: editingTask.value.description,
      }),
    })

    if (response.ok) {
      await getTasks()
      closeEditDialog()
    } else {
      console.error('Ошибка при обновлении:', await response.text())
    }
  } finally {
    isAddingTask.value = false
  }
}

function resetTasks() {
  getTasks() // если отмена — вернуть оригинальные данные
}

async function deleteTask(taskId) {
  try {
    deletingTasks.value.push(taskId)
    const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: TOKEN,
      },
    })
    if (response.ok) {
      await getTasks()
      tasks.value = tasks.value.filter(t => t.id !== taskId)
    }
  } finally {
    deletingTasks.value = deletingTasks.value.filter(id => id !== taskId)
  }
}
</script>