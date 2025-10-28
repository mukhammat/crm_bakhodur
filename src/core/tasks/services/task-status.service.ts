import { eq } from "drizzle-orm";
import type { DrizzleClient } from "../../../database/index.js";
import { schema } from "../../../database/index.js";
import type { CreateDto, UpdateDto, TaskType } from "../dto/task-status.dto.js";

export interface ITaskStatusService {
    create(data: CreateDto): Promise<number>;
    getAll(): Promise<TaskType[]>;
    getById(id: number): Promise<TaskType | undefined>;
    delete(id: number): Promise<number>
    update(id: number, data: UpdateDto): Promise<number>
}

export class TaskStatusService implements ITaskStatusService {
    constructor(private db: DrizzleClient) {}

    async create(data: CreateDto) {
        const [res] = await this.db.insert(schema.taskStatuses)
        .values(data).returning({
            id: schema.taskStatuses.id
        });

        return res.id;
    }
    
    async getAll() {
        return this.db.query.taskStatuses.findMany()
    }
    
    async getById(id: number) {
        return this.db.query.taskStatuses.findFirst({
            where: eq(schema.taskStatuses.id, id)
        })
    }

    async delete(id: number) {
        const [res] = await this.db.delete(schema.taskStatuses)
        .where(eq(schema.taskStatuses.id, id))
        .returning({
            id: schema.taskStatuses.id
        });

        return res.id
    }

    async update(id: number, data: UpdateDto) {
        const [res] = await this.db.update(schema.taskStatuses)
        .set(data)
        .where(eq(schema.taskStatuses.id, id))
        .returning({
            id: schema.taskStatuses.id
        });

        return res.id
    }
}