import { eq } from "drizzle-orm";
import { taskAssignments, tasks } from "../../../database/index.js";
import { CustomError } from "../../errors/custom.error.js";
export class TaskService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(data) {
        const [task] = await this.db
            .insert(tasks)
            .values(data)
            .returning({
            id: tasks.id,
        });
        return task.id;
    }
    async getById(id) {
        const task = await this.db.query.tasks.findFirst({
            where: eq(tasks.id, id),
        });
        if (!task) {
            throw new CustomError("Задача не найдена");
        }
        return task;
    }
    async getAll(createdBy) {
        if (createdBy) {
            return this.db.query.tasks.findMany({
                where: eq(tasks.createdBy, createdBy),
                with: {
                    assignments: true
                }
            });
        }
        return this.db.query.tasks.findMany();
    }
    async update(id, data) {
        await this.db
            .update(tasks)
            .set(data)
            .where(eq(tasks.id, id));
        return id;
    }
    async delete(id) {
        const deleted = await this.db
            .delete(tasks)
            .where(eq(tasks.id, id))
            .returning({
            id: tasks.id,
        });
        if (deleted.length === 0) {
            throw new CustomError("Задача для удаления не найдена");
        }
        return deleted[0].id;
    }
    async assignTaskToWorker(taskId, workerId) {
        const [asign] = await this.db
            .insert(taskAssignments)
            .values({
            taskId,
            workerId
        })
            .returning({
            id: taskAssignments.id
        });
        return asign.id;
    }
    async unassignTaskFromWorker(taskAssignmentId) {
        const [asign] = await this.db
            .delete(taskAssignments)
            .where(eq(taskAssignments.id, taskAssignmentId))
            .returning({
            id: taskAssignments.id
        });
        return asign.id;
    }
}
