import { and, eq, sql } from "drizzle-orm";
import { taskAssignments, tasks, type DrizzleClient } from "../../database/index.js";
import { CustomError } from "../errors/custom.error.js";
import type { CreateDto, ParamsType, UpdateDto, AssignmentLength, Assignment, TaskType } from "../dto/task.dto.js";

export interface ITaskService {
  create(data: CreateDto): Promise<string>;
  getById(id: string): Promise<TaskType | null>;
  getAll(params?: ParamsType): Promise<TaskType[]>;
  update( id: string, data: UpdateDto ): Promise<string>;
  delete(id: string): Promise<string>;
  assignTaskToUser(taskId: string, userId: string): Promise<string>
  unassignTaskFromUser(taskAssignmentId: string): Promise<string>
  getAssignmentByUserId(id: string): Promise<Assignment[]>
  getAssignmentLengthByUserId(userId: string): Promise<AssignmentLength[]>
}

export class TaskService implements ITaskService {
  constructor(private db: DrizzleClient) {}

  public async create(data: CreateDto) {
    const [task] = await this.db
      .insert(tasks)
      .values(data)
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

  public async getAll(params?: ParamsType) {
    const eqs = [];

    if(params?.createdBy) {
      eqs.push(eq(tasks.createdBy, params.createdBy))
    }

    if(params?.status) {
      eqs.push(eq(tasks.status, params.status))
    }

    if(params?.priority) {
      eqs.push(eq(tasks.priority, params.priority))
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
            id: true,
            name: true,
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
    await this.db
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))

    return id;
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

  public async assignTaskToUser(taskId: string, userId: string) {
    const [ asign ] = await this.db
    .insert(taskAssignments)
    .values({
      taskId,
      userId
    })
    .returning({
      id: taskAssignments.id
    })

    return asign.id
  }

  public async unassignTaskFromUser(taskAssignmentId: string) {
    const [ asign ] = await this.db
    .delete(taskAssignments)
    .where(eq(taskAssignments.id, taskAssignmentId))
    .returning({
      id: taskAssignments.id
    })

    return asign.id
  }

  public async getAssignmentByUserId(id: string) {
    return this.db.query.taskAssignments.findMany({
      where: eq(taskAssignments.userId, id),
      with: {
        task: true
      }
    })
  }

  public async getAssignmentLengthByUserId(userId: string) {
    const rows = await this.db
      .select({
        status: tasks.status,
        count: sql<number>`count(*)`,
      })
      .from(tasks)
      .innerJoin(taskAssignments, eq(taskAssignments.taskId, tasks.id))
      .where(eq(taskAssignments.userId, userId))
      .groupBy(tasks.status);

    return rows
  }
}
