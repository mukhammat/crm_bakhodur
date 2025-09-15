<template>
    <UserList :getUsers="getUsers" :users="users" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import UserList from './UserList.vue'

const TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjlkYTQwZmIzLWQ4MGQtNGNjNy05NzYwLWMzMzU1YTMxMTU1OCIsImVtYWlsIjoiZG9zbmV0MjIwMEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTc5NTU1MjEsImV4cCI6MTc1ODA0MTkyMX0.v9XsylKfH_Kjux08TFwHsNLykDUVZ-OEdKcveV0TAMo' // вынеси в .env


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
