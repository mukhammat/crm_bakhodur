<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
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

const TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjlkYTQwZmIzLWQ4MGQtNGNjNy05NzYwLWMzMzU1YTMxMTU1OCIsImVtYWlsIjoiZG9zbmV0MjIwMEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTc5NTU1MjEsImV4cCI6MTc1ODA0MTkyMX0.v9XsylKfH_Kjux08TFwHsNLykDUVZ-OEdKcveV0TAMo' // вынеси в .env

async function deleteTask(userId) {
  try {
    deletingUsers.value.push(userId)
    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: TOKEN,
      },
    })
    if (response.ok) {
      await getUsers()
      users.value = users.value.filter(t => t.id !== userId)
    }
  } finally {
    deletingUsers.value = deletingUsers.value.filter(id => id !== userId)
  }
}
</script>