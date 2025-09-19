import { POSTGET } from "./helper/postget";
import { useAuthStore } from "../stores/auth";

class UserApi{
    SERVER = 'http://localhost:3000';
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


}

export const userApi = new UserApi();