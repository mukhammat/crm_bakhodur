import { POSTGET } from "./helper/postget";
import { useAuthStore } from "../stores/auth";

class TaskApi {
    SERVER = 'http://localhost:3000';

    constructor() {
    }
    
    // динамический getter заголовков
    get headers() {
        this.auth = useAuthStore()
        return {
            Authorization: this.auth.token ? `Bearer ${this.auth.token}` : ''
        }
    }

    async add(body) {
        return POSTGET.request(`${this.SERVER}/api/tasks`, {
            method: 'POST',
            headers: this.headers,
            body,
        })
    }

    async removeAssignment(assignmentId) {
        return POSTGET.request(`${this.SERVER}/api/tasks/unassign-task-from-worker/${assignmentId}`, {
            method: 'DELETE',
            headers: this.headers,
        })
    }

    async edit(editingTaskId, data) {
        return POSTGET.request(`${this.SERVER}/api/tasks/${editingTaskId}`, {
            method: 'PUT',
            headers: this.headers,
            body: data,
        })
    }

    async delete(taskId) {
        return POSTGET.request(`${this.SERVER}/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: this.headers,
        })
    }

    async assignUser(body) {
        return POSTGET.request(`${this.SERVER}/api/tasks/assign-task-worker`, {
            method: 'POST',
            headers: this.headers,
            body
        })
    }

    async getAll() {
        return POSTGET.request(`${this.SERVER}/api/tasks`, {
            headers: this.headers,
        })
    }
}

export const taskApi = new TaskApi();
