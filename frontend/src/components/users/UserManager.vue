<template>
    <UserList :getUsers="getUsers" :users="users" />
    <GenerateKey />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import UserList from './UserList.vue'
import GenerateKey from './GenerateKey.vue'
import { userApi } from '../../api/user.api.js'

const users = ref([])

async function getUsers() {
    try {
        const response = await userApi.getAll()
    
        const data = await response.json()
        console.log(data.data.users)
        users.value = data.data.users;
        
    } catch (error) {
        console.error('Error fetching tasks:', error)
    }
}

onMounted(getUsers)
</script>
