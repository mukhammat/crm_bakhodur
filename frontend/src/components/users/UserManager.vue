<template>
    <UserList :getUsers="getUsers" :users="users" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import UserList from './UserList.vue'

const TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhYjZhMWNkLTMxMGQtNGEwMS1hZjYyLTE1MjU4MmEzODM4NyIsImVtYWlsIjoiZG9zbmV0MjIwMEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTc5OTMwMDgsImV4cCI6MTc1ODA3OTQwOH0.Ph25TFOjIApUGbwqOvinwcuPOuAWKlbhltDsZt4YS00'


const users = ref([])

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
        users.value = data.data.users;
        
    } catch (error) {
        console.error('Error fetching tasks:', error)
    }
}

onMounted(getUsers)
</script>
