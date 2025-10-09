import { and, eq, sql } from "drizzle-orm";
import { taskAssignments, tasks } from "../../database/index.js";
import { CustomError } from "../errors/custom.error.js";
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
    async getAll(params) {
        const eqs = [];
        if (params?.createdBy) {
            eqs.push(eq(tasks.createdBy, params.createdBy));
        }
        if (params?.status) {
            eqs.push(eq(tasks.status, params.status));
        }
        if (params?.priority) {
            eqs.push(eq(tasks.priority, params.priority));
        }
        if (params?.dueDate) {
            eqs.push(eq(tasks.dueDate, params.dueDate));
        }
        return this.db.query.tasks.findMany({
            where: and(...eqs),
            with: {
                assignments: {
                    with: {
                        user: {
                            columns: {
                                hash: false,
                                name: true
                            }
                        },
                    }
                },
                createdBy: {
                    columns: {
                        hash: false,
                        id: true,
                        name: true,
                    }
                }
            },
            offset: params?.offset
        });
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
    async assignTaskToUser(taskId, userId) {
        const [asign] = await this.db
            .insert(taskAssignments)
            .values({
            taskId,
            userId
        })
            .returning({
            id: taskAssignments.id
        });
        return asign.id;
    }
    async unassignTaskFromUser(taskAssignmentId) {
        const [asign] = await this.db
            .delete(taskAssignments)
            .where(eq(taskAssignments.id, taskAssignmentId))
            .returning({
            id: taskAssignments.id
        });
        return asign.id;
    }
    async getAssignmentByUserId(id) {
        return this.db.query.taskAssignments.findMany({
            where: eq(taskAssignments.userId, id),
            with: {
                task: true
            }
        });
    }
    async getAssignmentLengthByUserId(userId) {
        const rows = await this.db
            .select({
            status: tasks.status,
            count: sql `count(*)`,
        })
            .from(tasks)
            .innerJoin(taskAssignments, eq(taskAssignments.taskId, tasks.id))
            .where(eq(taskAssignments.userId, userId))
            .groupBy(tasks.status);
        return rows;
    }
}
