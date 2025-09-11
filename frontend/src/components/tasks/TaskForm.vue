<template>
    <div class="task-form">
        <h2>Create New Task</h2>
        <form @submit.prevent="submitForm">
            <div>
                <label for="description">Description:</label>
                <textarea v-model="description" id="description" required></textarea>
            </div>
            <button type="submit">Add Task</button>
        </form>
    </div>
</template>

<script>
export default {
    name: 'TaskForm',
    data() {
        return {
            description: '',
            status: 'pending'
        };
    },
    methods: {
        async submitForm() {
            const response = await fetch('http://localhost:3000/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: this.title,
                    description: this.description,
                    status: this.status
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Task created:', data);
                // Reset form fields
                this.title = '';
                this.description = '';
                this.status = 'pending';
            } else {
                console.error('Error creating task:', response.statusText);
            }
        }
    }
};
</script>