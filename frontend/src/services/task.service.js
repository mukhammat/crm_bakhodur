import { POSTGET } from "./helper/postget";

class TaskService {
    SERVER = 'http://localhost:3000';
    TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImYwZGQ2OWY1LTVjMjAtNGIxZi05MmRlLTNmYTQxZTcwMjI1NyIsImVtYWlsIjoiZG9zbmV0MjIwMEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTc5OTM0NzEsImV4cCI6MTc1ODA3OTg3MX0.3keYmEGxOrtDZ0fmUEmwRQK63tpvipiK60u7QxX4k70'

    constructor() {}

    async add(body) {
        return POSTGET.request(`${this.SERVER}/api/tasks`, {
            method: 'POST',
            headers: {
                Authorization: this.TOKEN,
            },
            body,
        })
    }

    async removeAssignment(assignmentId) {
        return POSTGET.request(`${this.SERVER}/api/tasks/unassign-task-from-worker/${assignmentId}`, {
            method: 'DELETE',
            headers: {
                Authorization: this.TOKEN,
            },
        })
    }

    async edit(editingTaskId, data) {
        return POSTGET.request(`${this.SERVER}/api/tasks/${editingTaskId}`, {
            method: 'PUT',
            headers: {
                Authorization: this.TOKEN,
            },
            body: data,
        })
    }

    async delete(taskId) {
        return POSTGET.request(`${this.SERVER}/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                Authorization: this.TOKEN,
            },
        })
    }

    async assignUser(body) {
        return POSTGET.request(`${this.SERVER}/api/tasks/assign-task-worker`, {
        method: 'POST',
        headers: {
          Authorization: this.TOKEN,
        },
        body
      })
    }

    async getAll() {
        return POSTGET.request(`${this.SERVER}/api/tasks`, {
            headers: {
                Authorization: this.TOKEN,
            },
        })
    }
}

export const taskService = new TaskService();