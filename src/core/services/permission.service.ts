import { eq } from "drizzle-orm";
import type { DrizzleClient } from "../../database/index.js";
import { schema } from "../../database/index.js";
import type { CreateDto, UpdateDto, PermissionType } from "../dto/permission.dto.js";

export interface IPermissionService {
    create(data: CreateDto): Promise<Pick<PermissionType, 'id'>>;
    getAll(): Promise<PermissionType[]>;
    getById(id: string): Promise<PermissionType | undefined>;
    delete(id: string): Promise<Pick<PermissionType, 'id'>>;
    update(id: string, data: UpdateDto): Promise<Pick<PermissionType, 'id'>>;
    getByTitle(title: string): Promise<PermissionType | undefined>;
}

export class PermissionService implements IPermissionService {
    constructor(private db: DrizzleClient) {}

    async create(data: CreateDto) {
        const [res] = await this.db.insert(schema.permissions)
            .values(data)
            .returning({
                id: schema.permissions.id
            });

        return res;
    }
    
    async getAll() {
        return this.db.query.permissions.findMany();
    }
    
    async getById(id: string) {
        return this.db.query.permissions.findFirst({
            where: eq(schema.permissions.id, id)
        });
    }

    async delete(id: string) {
        const [res] = await this.db.delete(schema.permissions)
            .where(eq(schema.permissions.id, id))
            .returning({
                id: schema.permissions.id
            });

        return res;
    }

    async update(id: string, data: UpdateDto) {
        const [res] = await this.db.update(schema.permissions)
            .set(data)
            .where(eq(schema.permissions.id, id))
            .returning({
                id: schema.permissions.id
            });

        return res;
    }

    async getByTitle(title: string) {
        return this.db.query.permissions.findFirst({
            where: eq(schema.permissions.title, title)
        });
    }
}

