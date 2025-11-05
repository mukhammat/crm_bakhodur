import { schema, type DrizzleClient, type InferResultType } from "../../database/index.js";
import { eq } from 'drizzle-orm'

type NotificationWithUser = InferResultType<'notifications', { user: true }>

export interface INotificationService {
    create(data: { userId: string }): Promise<InferResultType<'notifications'>>
    getAll(): Promise<NotificationWithUser[]>
    getById(id: string): Promise<InferResultType<'notifications'>>
    delete(id: string): Promise<InferResultType<'notifications'>>
}

export class NotificationService implements INotificationService {
    constructor(private db: DrizzleClient) {}

    async create(data: { userId: string }) {
        const [n] = await this.db.insert(schema.notifications)
        .values(data)
        .returning();

        return n;
    }

    async getAll() {
        return this.db.query.notifications.findMany({
            with: {
                user: true
            }
        })
    }

    async getById(id: string) {
        const [n] = await this.db.select()
        .from(schema.notifications)
        .where(eq(schema.notifications.id, id))

        return n;
    }

    async delete(id: string) {
        const [n] = await this.db.delete(schema.notifications)
        .where(eq(schema.notifications.id, id))
        .returning();

        return n;
    }
}