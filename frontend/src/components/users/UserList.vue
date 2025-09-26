<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="14" md="10">
        <v-card>
          <v-data-table
            :headers="headers"
            :items="users"
            item-key="id"
            class="elevation-1"
          >
            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.title="{ item }">
                {{ item.name }}
            </template>

            <!-- eslint-disable-next-line vue/valid-v-slot -->
            <template #item.description="{ item }">
                {{ item.description }}
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
              <v-btn
                color="red"
                size="small"
                @click="deleteTask(item.id)"
                :loading="deletingUsers.includes(item.id)"
              >
                Удалить
              </v-btn>
            </template>

          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, defineProps, toRef } from 'vue'
import { userApi } from '../../api/user.api.js'

// получаем проп
const props = defineProps({
  users: Array,
  getUsers: Function
})

const users = toRef(props, 'users') // теперь используем пропс напрямую
const getUsers = props.getUsers;

const deletingUsers = ref([])

// Исправленные заголовки для Vuetify 3
const headers = [
  { title: 'Имя', key: 'name' },
  { title: 'Почта', key: 'email' },
  { title: 'Роль', key: 'role' },
  { title: 'Активный', key: 'isActive' },
  { title: 'Действия', key: 'actions', sortable: false },
]
  
async function deleteTask(userId) {
  try {
    deletingUsers.value.push(userId)
    const response = await userApi.delete(userId);
    if (response.ok) {
      await getUsers()
      users.value = users.value.filter(t => t.id !== userId)
    }
  } finally {
    deletingUsers.value = deletingUsers.value.filter(id => id !== userId)
  }
}
</script>