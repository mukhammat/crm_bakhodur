import { POSTGET } from "./helper/postget";
import { useAuthStore } from "../stores/auth";
import env from '../../env.js'

class UserApi{
    SERVER = env.SERVER;

    constructor() {}

    // динамический getter заголовков
    get headers() {
        this.auth = useAuthStore()
        return {
            Authorization: this.auth.token ? `Bearer ${this.auth.token}` : ''
        }
    }

    async me() {
        return POSTGET.request(`${this.SERVER}/api/user/me`, {
            method: 'GET',
            headers: this.headers,
        })
    }

    async getAll() {
        return POSTGET.request(`${this.SERVER}/api/users`, {
            method: 'GET',
            headers: this.headers,
        })
    }

    async delete(userId) {
        return POSTGET.request(`${this.SERVER}/api/users/${userId}`, {
            method: 'DELETE',
            headers: this.headers,
        })
    }

    async generateKey(role) {
        return POSTGET.request(`${this.SERVER}/api/users/register-key/${role}`, {
            method: 'GET',
            headers: this.headers,
        })
    }
}

export const userApi = new UserApi();