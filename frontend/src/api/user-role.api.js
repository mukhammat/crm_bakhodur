import { POSTGET } from "./helper/postget";
import { useAuthStore } from "../stores/auth";
import env from '../../env.js'

class UserRoleApi {
    SERVER = env.SERVER;
    
    // динамический getter заголовков
    get headers() {
        this.auth = useAuthStore()
        return {
            Authorization: this.auth.token ? `Bearer ${this.auth.token}` : ''
        }
    }

    async generateKey(role) {
        return POSTGET.request(`${this.SERVER}/api/user-roles/generate-key/${role}`, {
            method: 'GET',
            headers: this.headers,
        })
    }
}

export const userRoleApi = new UserRoleApi();