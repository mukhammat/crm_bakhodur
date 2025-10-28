import { eq, sql } from 'drizzle-orm'
import { taskAssignments, tasks, taskStatuses, type DrizzleClient } from '../../database/index.js'
import { CustomError } from '../errors/custom.error.js'
import type { AssignmentLength, Assignment } from '../dto/task-assignment.dto.js'

export interface ITaskAssignmentService {
  create(taskId: string, userId: string): Promise<Pick<Assignment, 'id'>>
  delete(taskAssignmentId: string): Promise<Pick<Assignment, 'id'>>
  getByUserId(id: string): Promise<Assignment[]>
  getLengthByUserId(userId: string): Promise<AssignmentLength[]>
}

export class TaskAssignmentService implements ITaskAssignmentService {
  constructor(private db: DrizzleClient) {}

  public async create(taskId: string, userId: string) {
    // Проверяем существование задачи
    const task = await this.db.query.tasks.findFirst({ where: eq(tasks.id, taskId) })
    if (!task) {
      throw new CustomError('Задача не найдена')
    }

    const [assign] = await this.db
      .insert(taskAssignments)
      .values({ taskId, userId })
      .returning({ id: taskAssignments.id })

    return assign
  }

  public async delete(taskAssignmentId: string) {
    const [assign] = await this.db
      .delete(taskAssignments)
      .where(eq(taskAssignments.id, taskAssignmentId))
      .returning({ id: taskAssignments.id })

    if (!assign) {
      throw new CustomError('Назначение задачи не найдено')
    }

    return assign
  }

  public async getByUserId(id: string) {
    return this.db.query.taskAssignments.findMany({
      where: eq(taskAssignments.userId, id),
      with: {
        task: true,
      },
    })
  }

  public async getLengthByUserId(userId: string) {
    const rows = await this.db
      .select({
        status: taskStatuses.title,
        count: sql<number>`count(*)`,
      })
      .from(tasks)
      .innerJoin(taskAssignments, eq(taskAssignments.taskId, tasks.id))
      .where(eq(taskAssignments.userId, userId))
      .groupBy(taskStatuses.title)

    return rows
  }
}
