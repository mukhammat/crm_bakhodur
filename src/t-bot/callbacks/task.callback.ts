import type { ITaskService } from "../../core/services/task.service.js";
import type { ITaskAssignmentService } from "../../core/services/task-assignment.service.js";
import type { MyContext } from "../types/grammy.type.js";

export class TaskCallback {
    constructor(
        private taskService: ITaskService,
        private taskAssignment: ITaskAssignmentService,
    ) {
    }

    public take = async (ctx: MyContext) => {
        try{
            await ctx.answerCallbackQuery();
            const data = ctx.callbackQuery?.data;
            if (!data) return;
    
            const [_, taskId] = data.split(':');
            if (!taskId) {
                await ctx.reply('Ошибка: не указан ID задачи');
                return;
            }
    
            if (!ctx.user?.id) {
                await ctx.reply('Ошибка: пользователь не найден');
                return;
            }

            let close = false;
            const assignment = await this.taskAssignment.getByUserId(ctx.user.id);
            if(assignment) {
                for (const element of assignment) {
                    if(element.task.statusId === 2) {
                        await ctx.reply('Вы не можете выполнять несколько задач одновременно!')
                        close = true
                    }
                }
            }

            if(close) {
                return;
            }
            
            await this.taskService.update(taskId, {
                statusId: 2,
            });

            await ctx.reply('Вы взяли задачу на выполнение!')
        } catch(error) {
            console.error('Error in take callback:', error);
            throw error; // Пробрасываем ошибку дальше для обработки middleware
        }
    }

    public complete = async (ctx: MyContext) => {
        try{
            await ctx.answerCallbackQuery();
            const data = ctx.callbackQuery?.data;
            if (!data) return;
            
            const [_, taskId] = data.split(':');
            if (!taskId) {
                await ctx.reply('Ошибка: не указан ID задачи');
                return;
            }
            
            await this.taskService.update(taskId, {
                statusId: 3
            });
            
            await ctx.reply('Задача отмечена как выполненная!');
        } catch(error) {
            console.error('Error in complete callback:', error);
            throw error; // Пробрасываем ошибку дальше для обработки middleware
        }
    }
}