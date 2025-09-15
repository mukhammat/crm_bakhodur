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
                {{ item.title }}
            </template>

            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.description="{ item }">
                {{ item.description }}
            </template>

            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.assignments.worker="{ item }">
              <v-menu>
                <template #activator="{ props }">
                  <v-btn v-bind="props" color="primary" size="small">
                    Работники ({{ item.assignments.worker?.length || 0 }})
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item
                    v-for="(worker, i) in item.assignments"
                    :key="i"
                  >
                    <v-list-item-title>
                      {{ worker.worker?.name || 'Без имени' }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
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
<!-- Диалог редактирования задачи -->
    <v-dialog v-model="showEditDialog" max-width="500px">
      <v-card v-if="editingTask">
        <v-card-title>Редактировать задачу</v-card-title>
        <v-card-text>
          <v-text-field v-model="editingTask.title" label="Название" required />
          <v-text-field v-model="editingTask.description" label="Описание" required />

          <!-- выбор работников -->
          <v-select
            v-model="editingTask.workerIds"
            :items="workers"
            item-title="name"
            item-value="id"
            label="Назначить работников"
            multiple
            chips
          />
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
import { ref, defineProps, toRef, onMounted } from 'vue'

const TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjlkYTQwZmIzLWQ4MGQtNGNjNy05NzYwLWMzMzU1YTMxMTU1OCIsImVtYWlsIjoiZG9zbmV0MjIwMEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTc5NTU1MjEsImV4cCI6MTc1ODA0MTkyMX0.v9XsylKfH_Kjux08TFwHsNLykDUVZ-OEdKcveV0TAMo' // вынеси в .env


// получаем проп
const props = defineProps({
  tasks: Array,
  getTasks: Function
})

const tasks = toRef(props, 'tasks') // теперь используем пропс напрямую
console.log(tasks)
const getTasks = props.getTasks

const workers = ref([])
const deletingTasks = ref([])
const showEditDialog = ref(false)
const isAddingTask = ref(false)
const editingTask = ref(null)

async function getUsers() {
    try {
        const response = await fetch(`http://localhost:3000/api/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: TOKEN,
          },
        })
    
        const data = await response.json()
        console.log(data.data.users)
        workers.value = data.data.users;
        
    } catch (error) {
        console.error('Error fetching tasks:', error)
    }
}

onMounted(getUsers)

// Исправленные заголовки для Vuetify 3
const headers = [
  { title: 'Title', key: 'title' },
  { title: 'Описание', key: 'description' },
  { title: 'Статус', key: 'status' },
  { title: 'От', key: 'createdBy.name' },
  { title: 'Работники', key: 'assignments.worker' },
  { title: 'Действия', key: 'actions', sortable: false },
]


// Вызываем при клике "Update" на строке таблицы
// function openEditDialog(task) {
//   editingTask.value = { ...task }
//   showEditDialog.value = true
// }

function openEditDialog(task) {
  editingTask.value = {
    ...task,
    workerIds: task.assignments?.map(a => a.workerId) || []
  }
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

    for (const workerId of editingTask.value.workerIds) {
      await fetch(`http://localhost:3000/api/tasks/assign-task-worker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: TOKEN,
        },
        body: JSON.stringify({
          taskId: editingTask.value.id,
          workerId,
        }),
      })
    }


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