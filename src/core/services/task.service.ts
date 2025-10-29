import { and, eq, sql } from "drizzle-orm";
import { taskAssignments, tasks, taskStatuses, type DrizzleClient } from "../../database/index.js";
import { CustomError } from "../errors/custom.error.js";
import type { CreateDto, ParamsType, UpdateDto, AssignmentLength, Assignment, TaskType } from "../dto/task.dto.js";

export interface ITaskService {
  create(data: CreateDto): Promise<Pick<TaskType, 'id'>>;
  getById(id: string): Promise<TaskType | null>;
  getAll(params?: ParamsType): Promise<TaskType[]>;
  update( id: string, data: UpdateDto ): Promise<Pick<TaskType, "id">>;
  delete(id: string): Promise<Pick<TaskType, "id">>;
}

export class TaskService implements ITaskService {
  constructor(private db: DrizzleClient) {}

  public async create(data: CreateDto) {
    const [task] = await this.db
      .insert(tasks)
      .values(data)
      .returning({
        id: tasks.id
      });

    return task;
  }

  public async getById(id: string) {
    const task = await this.db.query.tasks.findFirst({
      where: eq(tasks.id, id),
      with: {
        assignments: {
          with: {
            user: {
              columns: {
                hash: false,
                name: true,
                id: true,
              }
            },
          }
        },
        createdBy: {
          columns: {
            hash: false,
          }
        }
      }
    });

    if (!task) {
      throw new CustomError("Задача не найдена");
    }

    return task;
  }

  public async getAll(params?: ParamsType) {
    const eqs = [];

    if(params?.createdBy) {
      eqs.push(eq(tasks.createdBy, params.createdBy))
    }

    if(params?.statusId) {
      eqs.push(eq(tasks.statusId, params.statusId))
    }

    if(params?.dueDate) {
      eqs.push(eq(tasks.dueDate, params.dueDate))
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
          }
        }
      },
      offset: params?.offset
    });
  }

  public async update(
    id: string,
    data: UpdateDto
  ) {
    const [updated] = await this.db
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning({ id: tasks.id });

    if (!updated) {
      throw new CustomError("Задача для обновления не найдена");
    }

    return updated;
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

    return deleted[0];
  }
}
