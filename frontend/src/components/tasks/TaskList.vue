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
            :loading="loading"
          >
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.title="{ item }">
              {{ item.title }}
            </template>

            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.description="{ item }">
              <div class="text-truncate" style="max-width: 200px;">
                {{ item.description }}
              </div>
            </template>

            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.assignments.worker="{ item }">
              <v-menu v-if="item.assignments && item.assignments.length > 0">
                <template #activator="{ props }">
                  <v-btn v-bind="props" color="green" size="small" variant="tonal">
                    {{ item.assignments[0]?.user?.name || 'Без имени' }}
                    <v-badge 
                      v-if="item.assignments.length > 1" 
                      :content="item.assignments.length" 
                      color="primary"
                      inline
                    />
                  </v-btn>
                </template>

                <v-list density="compact">
                  <v-list-item
                    v-for="assignment in item.assignments"
                    :key="assignment.id"
                  >
                    <template #prepend>
                      <v-avatar size="24" :color="getRoleColor(assignment.user?.role)">
                        <v-icon size="16">mdi-account</v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-title class="text-body-2">
                      {{ assignment.user?.name || 'Без имени' }}
                    </v-list-item-title>
                    <template #append>
                      <v-chip size="x-small" :color="getRoleColor(assignment.user?.role)">
                        {{ assignment.user?.role }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </v-list>
              </v-menu>
              
              <v-chip v-else color="grey" variant="outlined" size="small">
                Не назначен
              </v-chip>
            </template>

            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.status="{ item }">
              <v-chip
                :color="getStatusColor(item?.status)"
                variant="flat"
                size="small"
              >
                {{ getStatusText(item?.status) }}
              </v-chip>
            </template>

            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.createdBy.name="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="24" :color="getRoleColor(item.createdBy?.role)" class="mr-2">
                  <v-icon size="16">mdi-account</v-icon>
                </v-avatar>
                <span>{{ item.createdBy?.name || 'Неизвестно' }}</span>
                <v-chip 
                  v-if="item.createdBy?.id === auth.user?.id" 
                  color="primary" 
                  size="x-small" 
                  class="ml-2"
                >
                  Ваша
                </v-chip>
              </div>
            </template>

            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.actions="{ item }">
              <div class="d-flex ga-2">
                <v-btn 
                  v-if="canEditTask(item)"
                  color="primary" 
                  size="small" 
                  variant="outlined"
                  @click="openEditDialog(item)"
                  :disabled="loading"
                >
                  Обновить
                </v-btn>
                <v-btn
                  v-if="canDeleteTask(item)"
                  color="error"
                  size="small"
                  variant="outlined"
                  @click="confirmDelete(item)"
                  :loading="deletingTasks.includes(item.id)"
                  :disabled="loading"
                >
                  Удалить
                </v-btn>
                <v-chip 
                  v-if="!canEditTask(item) && !canDeleteTask(item)"
                  color="grey"
                  variant="outlined"
                  size="small"
                >
                  Только просмотр
                </v-chip>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">
          Подтвердите удаление
        </v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить задачу "{{ taskToDelete?.title }}"?
          Это действие нельзя отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">
            Отмена
          </v-btn>
          <v-btn 
            color="error" 
            @click="deleteTask"
            :loading="deletingTasks.includes(taskToDelete?.id)"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог редактирования задачи -->
    <v-dialog v-model="showEditDialog" max-width="700px">
      <v-card v-if="editingTask">
        <v-card-title>
          <span class="text-h6">Редактировать задачу</span>
          <v-chip 
            v-if="editingTask?.createdBy?.id === auth.user?.id && !isAdmin" 
            color="primary" 
            size="small" 
            class="ml-3"
          >
            Ваша задача
          </v-chip>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field 
                  v-model="editingTask.title" 
                  label="Название задачи" 
                  required 
                  :rules="[v => !!v || 'Название обязательно']"
                  variant="outlined"
                />
              </v-col>
              
              <v-col cols="12">
                <v-textarea 
                  v-model="editingTask.description" 
                  label="Описание задачи" 
                  required 
                  :rules="[v => !!v || 'Описание обязательно']"
                  rows="3"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="editingTask.status"
                  :items="statusOptions"
                  item-title="label"
                  item-value="value"
                  label="Статус задачи"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-chip 
                  :color="getStatusColor(editingTask.status)"
                  class="mt-4"
                >
                  {{ getStatusText(editingTask.status) }}
                </v-chip>
              </v-col>

              <v-col cols="12">
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
                  variant="outlined"
                >
                  <template #selection="{ item, index }">
                    <v-chip
                      v-if="index < 3"
                      size="small"
                      closable
                      :color="getRoleColor(item.raw.role)"
                      variant="tonal"
                      @click:close="removeUser(item.raw.id)"
                    >
                      <v-icon start size="16">mdi-account</v-icon>
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
              </v-col>

              <v-col cols="12" v-if="editingTask.workerIds.length === 0">
                <v-alert 
                  type="warning" 
                  variant="tonal"
                  density="compact"
                >
                  Задача не назначена ни одному пользователю
                </v-alert>
              </v-col>
            </v-row>
          </v-container>
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
            Сохранить изменения
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Уведомления -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
    >
      {{ successMessage }}
    </v-snackbar>

    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
    >
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { usePermissions } from '../../composables/usePermissions.js'
import { useAuthStore } from '../../stores/auth.js'
import { ref, defineProps, toRef, onMounted, computed } from 'vue'
import { taskApi } from '../../api/task.api.js'
import { userApi } from '../../api/user.api.js'

const { isAdmin } = usePermissions()
const auth = useAuthStore()

// Computed для проверки прав на задачу
const canEditTask = computed(() => (task) => {
  return isAdmin.value || task.createdBy?.id === auth.user?.id
})

const canDeleteTask = computed(() => (task) => {
  return isAdmin.value || task.createdBy?.id === auth.user?.id
})

const statusOptions = [
  { label: 'Ожидает', value: 'pending' },
  { label: 'В процессе', value: 'in_progress' },
  { label: 'Завершено', value: 'completed' }
]

// Props
const props = defineProps({
  tasks: Array,
  getTasks: Function
})

const tasks = toRef(props, 'tasks')
const getTasks = props.getTasks

// Reactive data
const users = ref([])
const loading = ref(false)
const deletingTasks = ref([])
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const isAddingTask = ref(false)
const editingTask = ref(null)
const taskToDelete = ref(null)
const loadingUsers = ref(false)

// Notifications
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Utility functions for notifications
const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccess.value = true
}

const showErrorMessage = (message) => {
  errorMessage.value = message
  showError.value = true
}

// Load users
async function getUsers() {
  try {
    loadingUsers.value = true
    const response = await userApi.getAll()
    const data = await response.json()
    users.value = data.data.users
  } catch (error) {
    console.error('Error fetching users:', error)
    showErrorMessage('Ошибка загрузки пользователей')
  } finally {
    loadingUsers.value = false
  }
}

onMounted(getUsers)

// Table headers
const headers = [
  { title: 'Название', key: 'title' },
  { title: 'Описание', key: 'description' },
  { title: 'Статус', key: 'status' },
  { title: 'Создатель', key: 'createdBy.name' },
  { title: 'Исполнители', key: 'assignments.worker' },
  { title: 'Действия', key: 'actions', sortable: false },
]

// Dialog functions
function openEditDialog(task) {
  editingTask.value = {
    ...task,
    workerIds: task.assignments?.map(assignment => assignment.userId) || []
  }
  showEditDialog.value = true
}

function closeEditDialog() {
  showEditDialog.value = false
  editingTask.value = null
}

function confirmDelete(task) {
  taskToDelete.value = task
  showDeleteDialog.value = true
}

function removeUser(userId) {
  editingTask.value.workerIds = editingTask.value.workerIds.filter(id => id !== userId)
}

// API functions
async function removeTaskAssignments(taskId, currentAssignments) {
  for (const assignment of currentAssignments) {
    const response = await taskApi.removeAssignment(assignment.id)
    if (!response.ok) {
      throw new Error(`Ошибка при удалении назначения ${assignment.id}`)
    }
  }
}

async function saveEditTask() {
  if (!editingTask.value.title || !editingTask.value.description || !editingTask.value.status) {
    showErrorMessage('Пожалуйста, заполните все обязательные поля')
    return
  }

  try {
    isAddingTask.value = true
    
    // Update task
    const taskResponse = await taskApi.edit(editingTask.value.id, {
      title: editingTask.value.title,
      description: editingTask.value.description,
      status: editingTask.value.status
    })

    if (!taskResponse.ok) {
      throw new Error('Ошибка при обновлении задачи')
    }

    // Remove old assignments
    if (editingTask.value.assignments?.length > 0) {
      await removeTaskAssignments(editingTask.value.id, editingTask.value.assignments)
    }

    // Add new assignments
    for (const userId of editingTask.value.workerIds) {
      const assignResponse = await taskApi.assignUser({
        taskId: editingTask.value.id,
        userId: userId,
      })
      
      if (!assignResponse.ok) {
        throw new Error(`Ошибка назначения пользователя`)
      }
    }

    await getTasks()
    closeEditDialog()
    showSuccessMessage('Задача успешно обновлена')
    
  } catch (error) {
    console.error('Error saving task:', error)
    showErrorMessage(error.message || 'Ошибка при сохранении задачи')
  } finally {
    isAddingTask.value = false
  }
}

async function deleteTask() {
  if (!taskToDelete.value) return

  try {
    deletingTasks.value.push(taskToDelete.value.id)
    const response = await taskApi.delete(taskToDelete.value.id)
    
    if (!response.ok) {
      throw new Error('Ошибка при удалении задачи')
    }
    
    await getTasks()
    showSuccessMessage('Задача успешно удалена')
    
  } catch (error) {
    console.error('Error deleting task:', error)
    showErrorMessage(error.message || 'Ошибка при удалении задачи')
  } finally {
    deletingTasks.value = deletingTasks.value.filter(id => id !== taskToDelete.value.id)
    showDeleteDialog.value = false
    taskToDelete.value = null
  }
}

// Utility functions
function getRoleColor(role) {
  switch (role) {
    case 'admin': return 'red'
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