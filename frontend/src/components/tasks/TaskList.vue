<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10">
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
                  <v-btn v-bind="props" color="green" size="small">
                    {{ (item.assignments.length === 0) ? 'Не назначен' : item.assignments[0]?.user?.name + '...' }}
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item
                    v-for="(assignment, i) in item.assignments"
                    :key="i"
                  >
                    <v-list-item-title class="text-body-2">
                      {{ assignment.user?.name || 'Без имени' }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item v-if="!item.assignments || item.assignments.length === 0">
                    <v-list-item-title class="text-grey">Никто не назначен</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>

            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.status="{ item }">
              <v-chip
                :color="getStatusColor(item?.status)"
                variant="flat"
              >
                {{ getStatusText(item?.status) }}
              </v-chip>
            </template>

            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.actions="{ item }">
              <div class="d-flex ga-2">
                <v-btn 
                  color="primary" 
                  size="small" 
                  @click="openEditDialog(item)"
                >
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
              </div>
            </template>

          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог редактирования задачи -->
    <v-dialog v-model="showEditDialog" max-width="600px">
      <v-card v-if="editingTask">
        <v-card-title>Редактировать задачу</v-card-title>
        <v-card-text>
          <v-text-field 
            v-model="editingTask.title" 
            label="Название" 
            required 
            class="mb-3"
          />
          
          <v-textarea 
            v-model="editingTask.description" 
            label="Описание" 
            required 
            rows="3"
            class="mb-4"
          />

          <v-select
            v-model="editingTask.status"
            :items="statusOptions"
            item-title="label"
            item-value="value"
            label="Статус задачи"
            class="mb-4"
          />


          <!-- Выбор пользователей -->
          <v-select
            v-model="editingTask.workerIds"
            :items="users"
            item-title="name"
            item-value="id"
            label="Назначить пользователей"
            multiple
            chips
            closable-chips
            :loading="loadingUsers"
            class="mb-3"
          >
            <template #selection="{ item, index }">
              <v-chip
                v-if="index < 3"
                size="small"
                closable
                color="primary"
                variant="tonal"
                @click:close="removeUser(item.raw.id)"
              >
                <v-icon start>mdi-account</v-icon>
                {{ item.title }}
              </v-chip>
              <span
                v-if="index === 3"
                class="text-grey text-caption align-self-center ml-2"
              >
                (+{{ editingTask.workerIds.length - 3 }} других)
              </span>
            </template>

            <template #item="{ props, item }">
              <v-list-item v-bind="props" :title="item.title">
                <template #prepend>
                  <v-avatar size="32" :color="getRoleColor(item.raw.role)">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                </template>
                <template #append>
                  <v-chip size="x-small" :color="getRoleColor(item.raw.role)">
                    {{ item.raw.role }}
                  </v-chip>
                  <v-icon 
                    v-if="editingTask.workerIds.includes(item.value)" 
                    color="success"
                    class="ml-2"
                  >
                    mdi-check
                  </v-icon>
                </template>
              </v-list-item>
            </template>

            <template #no-data>
              <v-list-item>
                <v-list-item-title>Пользователи не найдены</v-list-item-title>
              </v-list-item>
            </template>
          </v-select>

          <!-- Информация о текущих назначениях -->
          <v-alert 
            v-if="editingTask.workerIds.length === 0" 
            type="warning" 
            variant="tonal"
            class="mb-3"
          >
            Задача не назначена ни одному пользователю
          </v-alert>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeEditDialog">
            Отмена
          </v-btn>
          <v-btn 
            color="success" 
            @click="saveEditTask" 
            :loading="isAddingTask"
            :disabled="!editingTask.title || !editingTask.description"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, defineProps, toRef, onMounted } from 'vue'
import { taskApi } from '../../api/task.api.js'
import { userApi } from '../../api/user.api.js'

const statusOptions = [
  { label: 'Ожидает', value: 'pending' },
  { label: 'В процессе', value: 'in_progress' },
  { label: 'Завершено', value: 'completed' }
]

  // получаем проп
const props = defineProps({
  tasks: Array,
  getTasks: Function
})

const tasks = toRef(props, 'tasks')
const getTasks = props.getTasks

const users = ref([])
const deletingTasks = ref([])
const showEditDialog = ref(false)
const isAddingTask = ref(false)
const editingTask = ref(null)
const loadingUsers = ref(false)

// Загрузка пользователей
async function getUsers() {
  try {
    loadingUsers.value = true
    const response = await userApi.getAll()

    const data = await response.json()
    console.log('Users loaded:', data.data.users)
    users.value = data.data.users
    
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    loadingUsers.value = false
  }
}

onMounted(getUsers)

// Заголовки таблицы
const headers = [
  { title: 'Название', key: 'title' },
  { title: 'Описание', key: 'description' },
  { title: 'Статус', key: 'status' },
  { title: 'От', key: 'createdBy.name' },
  { title: 'Пользователи', key: 'assignments.worker' },
  { title: 'Действия', key: 'actions', sortable: false },
]

// Открытие диалога редактирования
function openEditDialog(task) {
  console.log('Opening edit dialog for task:', task)
  console.log('Task assignments:', task.assignments)

  editingTask.value = {
    ...task,
    // ИСПРАВЛЕНИЕ: правильно извлекаем ID пользователей из назначений
    workerIds: task.assignments?.map(assignment => assignment.userId) || []
  }
  
  console.log('Selected worker IDs:', editingTask.value.workerIds)
  showEditDialog.value = true
}

// Закрытие диалога
function closeEditDialog() {
  showEditDialog.value = false
  editingTask.value = null
}

// Удаление пользователя из выбранных
function removeUser(userId) {
  editingTask.value.workerIds = editingTask.value.workerIds.filter(id => id !== userId)
}

// Функция для удаления назначений через правильный API
async function removeTaskAssignments(taskId, currentAssignments) {
  try {
    // Используем правильный API для удаления назначений
    for (const assignment of currentAssignments) {
      const response = await taskApi.removeAssignment(assignment.id)
      
      if (!response.ok) {
        console.error(`Ошибка при удалении назначения ${assignment.id}:`, await response.text())
      }
    }
  } catch (error) {
    console.error('Ошибка при удалении назначений:', error)
    throw error
  }
}

// Сохранение задачи
async function saveEditTask() {
  if (!editingTask.value.title || !editingTask.value.description ||  !editingTask.value.status) return

  try {
    isAddingTask.value = true
    
    // 1. Обновляем основную информацию о задаче
    const taskResponse = await taskApi.edit(editingTask.value.id, {
      title: editingTask.value.title,
      description: editingTask.value.description,
      status: editingTask.value.status
    })

    if (!taskResponse.ok) {
      throw new Error('Ошибка при обновлении задачи')
    }

    // 2. Удаляем все старые назначения через правильный API
    if (editingTask.value.assignments && editingTask.value.assignments.length > 0) {
      await removeTaskAssignments(editingTask.value.id, editingTask.value.assignments)
    }

    // 3. Добавляем новые назначения
    for (const userId of editingTask.value.workerIds) {
      const assignResponse = await taskApi.assignUser({
          taskId: editingTask.value.id,
          userId: userId,
      })
      
      if (!assignResponse.ok) {
        console.error(`Ошибка назначения пользователя ${userId}:`, await assignResponse.text())
      }
    }

    // 4. Обновляем список задач и закрываем диалог
    await getTasks()
    closeEditDialog()
    
  } catch (error) {
    console.error('Ошибка при сохранении:', error)
  } finally {
    isAddingTask.value = false
  }
}

// Удаление задачи
async function deleteTask(taskId) {
  try {
    deletingTasks.value.push(taskId)
    await taskApi.delete(taskId)
    await getTasks()
    tasks.value = tasks.value.filter(t => t.id !== taskId)
  } catch (error) {
    console.error('Ошибка при удалении:', error)
  } finally {
    deletingTasks.value = deletingTasks.value.filter(id => id !== taskId)
  }
}

// Утилиты для отображения
function getRoleColor(role) {
  switch (role) {
    case 'manager': return 'blue'
    case 'worker': return 'green'
    default: return 'grey'
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'completed': return 'green'
    case 'in_progress': return 'blue'
    case 'pending': return 'orange'
    default: return 'grey'
  }
}

function getStatusText(status) {
  switch (status) {
    case 'completed': return 'Завершено'
    case 'in_progress': return 'В процессе'
    case 'pending': return 'Ожидает'
    default: return status
  }
}
</script>