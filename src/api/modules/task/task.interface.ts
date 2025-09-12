import type { tasks } from "../../../database/index.js";

export interface ITaskService {
  create(description: string, createdBy: string): Promise<string>;
  getById(id: string): Promise<typeof tasks.$inferSelect | null>;
  getAll(createdBy?: string): Promise<typeof tasks.$inferSelect[]>;
  update(
    id: string,
    data: Partial<Pick<typeof tasks.$inferInsert, "description" | "status" | "dueDate">>
  ): Promise<string>;
  delete(id: string): Promise<string>;
  assignTaskToWorker(taskId: string, workerId: string): Promise<string>
  unassignTaskFromWorker(taskAssignmentId: string): Promise<string>
}