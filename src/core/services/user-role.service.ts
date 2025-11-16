import { eq } from "drizzle-orm";
import type { DrizzleClient } from "../../database/index.js";
import { schema } from "../../database/index.js";
import { randomBytes } from "crypto";
import { redis } from "../../cache/redis.js";
import { CustomError } from "../errors/custom.error.js";
import type { UserRolesDto, UserRolesType } from "../dto/user-role.dto.js";

export interface IUserRoleService {
    create(data: UserRolesDto): Promise<number>;
    getAll(): Promise<UserRolesType[]>;
    getById(id: number): Promise<UserRolesType | undefined>;
    delete(id: number): Promise<number>
    update(id: number, data: UserRolesDto): Promise<number>
    generateRegisterKey(roleTitle: string): Promise<string>
}

export class UserRoleService implements IUserRoleService {
    constructor(private db: DrizzleClient) {}

    async create(data: UserRolesDto) {
        const [res] = await this.db.insert(schema.userRoles)
        .values(data).returning({
            id: schema.userRoles.id
        });

        return res.id;
    }
    
    async getAll() {
        return this.db.query.userRoles.findMany()
    }
    
    async getById(id: number) {
        return this.db.query.userRoles.findFirst({
            where: eq(schema.userRoles.id, id)
        })
    }

    async delete(id: number) {
        const [res] = await this.db.delete(schema.userRoles)
        .where(eq(schema.userRoles.id, id))
        .returning({
            id: schema.userRoles.id
        });

        return res.id
    }

    async update(id: number, data: UserRolesDto) {
        const [res] = await this.db.update(schema.userRoles)
        .set(data)
        .where(eq(schema.userRoles.id, id))
        .returning({
            id: schema.userRoles.id
        });

        return res.id
    }

    async generateRegisterKey(roleTitle: string) {
        const role = await this.db.query.userRoles.findFirst({
            where: eq(schema.userRoles.title, roleTitle),
        })

        if(!role) {
            throw new CustomError("Role not found!");
        }

        // generate random key (50 hex characters = 25 bytes)
        const key = randomBytes(25).toString("hex");

        // store in Redis with TTL 1 hour
        await redis.set(`register_key:${key}`, role.id, 'EX', 3600);

        return key;
    }
}