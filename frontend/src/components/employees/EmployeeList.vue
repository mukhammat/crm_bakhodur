<template>
    <div class="employee-list">
        <h1>Employee List</h1>
        <ul>
        <li v-for="employee in employees" :key="employee.id">
            {{ employee.name }} - {{ employee.position }}
        </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'EmployeeList',
    data() {
        return {
            employees: []
        };
    },
    methods: {
        async getEmployees() {
            try {
                const response = await fetch('http://localhost:3000/employees');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                this.employees = await response.json();
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        }
    }
};
</script>