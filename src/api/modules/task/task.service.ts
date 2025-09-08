import { and, eq } from "drizzle-orm";
import { tasks, type DrizzleClient } from "../../../database/index.js";
import { CustomError } from "../../errors/custom.error.js";

export interface ITaskService {
  create(description: string, createdBy: string): Promise<string>;
  getById(id: string): Promise<typeof tasks.$inferSelect | null>;
  getAll(createdBy?: string): Promise<typeof tasks.$inferSelect[]>;
  update(
    id: string,
    data: Partial<Pick<typeof tasks.$inferInsert, "description" | "status">>
  ): Promise<string>;
  delete(id: string): Promise<string>;
}

export class TaskService implements ITaskService {
  constructor(private db: DrizzleClient) {}

  public async create(description: string, createdBy: string) {
    const [task] = await this.db
      .insert(tasks)
      .values({
        description,
        createdBy,
      })
      .returning({
        id: tasks.id,
      });

    return task.id;
  }

  public async getById(id: string) {
    const task = await this.db.query.tasks.findFirst({
      where: eq(tasks.id, id),
    });

    if (!task) {
      throw new CustomError("Задача не найдена");
    }

    return task;
  }

  public async getAll(createdBy?: string) {
    if (createdBy) {
      return this.db.query.tasks.findMany({
        where: eq(tasks.createdBy, createdBy),
      });
    }

    return this.db.query.tasks.findMany();
  }

  public async update(
    id: string,
    data: Partial<Pick<typeof tasks.$inferInsert, "description" | "status">>
  ) {
    const updated = await this.db
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning({
        id: tasks.id,
      });

    if (updated.length === 0) {
      throw new CustomError("Задача для обновления не найдена");
    }

    return updated[0].id;
  }

  public async delete(id: string) {
    const deleted = await this.db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning({
        id: tasks.id,
      });

    if (deleted.length === 0) {
      throw new CustomError("Задача для удаления не найдена");
    }

    return deleted[0].id
  }
}
