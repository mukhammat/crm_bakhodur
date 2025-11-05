import { InlineKeyboard } from "grammy";
import type { TaskService } from "../../core/services/task.service.js";
import type { TaskAssignmentService } from "../../core/services/task-assignment.service.js";
import type { UserService } from "../../core/services/user.service.js";
import type { MyContext } from "../types/grammy.type.js";

export class TaskCommand {

    constructor(
        private taskAssigService: TaskAssignmentService,
        private taskService: TaskService,
        private userService: UserService
    ) {}
    
    public myTasks = async (ctx: MyContext) => {
        try {
            if(!ctx.user?.id) return;

            const assignments = await this.taskAssigService.getByUserId(ctx.user.id);

            if(!assignments.length) {
                await ctx.reply('Нет заданий')
                return;
            }
            
            let counter = 0;
            for (const assignment of assignments) {
                const inline = new InlineKeyboard()
                
                counter++;
                const task = assignment.task;
                let message = `Задание №${counter}\n${task.title}\n${task.description}\n`;

                if(task.statusId === 2) {
                    inline.text('Закончить', `complete:${assignment.taskId}`)
                }

                if(task.statusId === 1) {
                    inline.text('Приступить', `take:${assignment.taskId}`)
                }

                if(task.statusId === 3) {
                    message = message + '\n✅ Выполнено'
                }

                await ctx.reply(message, {reply_markup: inline})
            }
        } catch(error) {
            console.error('Error in myTasks:', error);
            await ctx.reply('Произошла ошибка при получении задач');
        }
    }

    public getCompletedTasks = async (ctx: MyContext) => {
        try {
            if(!ctx.user?.id) return;

            const tasks = await this.taskService.getAll({
                statusId: 3
            })

            if(!tasks.length) {
                await ctx.reply('Нет выполненных задач');
                return;
            }

            let counter = 0;
            for (const task of tasks) {
                const inline = new InlineKeyboard()
                
                counter++;
                let message = `Задание №${counter}\n${task.title}\n${task.description}\n✅ Выполнено`;

                await ctx.reply(message, {reply_markup: inline})
            }
        } catch(error) {
            console.error('Error in getCompletedTasks:', error);
            await ctx.reply('Произошла ошибка при получении выполненных задач');
        }
    }

    public getPendingTasks = async (ctx: MyContext) => {
        try {
            if(!ctx.user?.id) return;

            const tasks = await this.taskService.getAll({
                statusId: 1
            })

            if(!tasks.length) {
                await ctx.reply('Нет задач в ожидании');
                return;
            }

            let counter = 0;
            for (const task of tasks) {
                const inline = new InlineKeyboard()
                
                counter++;
                let message = `Задание №${counter}\n${task.title}\n${task.description}\n`;

                if(task.statusId === 1) {
                    inline.text('Приступить', `take:${task.id}`)
                }

                await ctx.reply(message, {reply_markup: inline})
            }
        } catch(error) {
            console.error('Error in getPendingTasks:', error);
            await ctx.reply('Произошла ошибка при получении задач в ожидании');
        }
    }

    public getInPorgressTasks = async (ctx: MyContext) => {
        try {
            if(!ctx.user?.id) return;

            const tasks = await this.taskService.getAll({
                statusId: 2
            })

            if(!tasks.length) {
                await ctx.reply('Нет задач в процессе выполнения');
                return;
            }

            let counter = 0;
            for (const task of tasks) {
                const inline = new InlineKeyboard()
                
                counter++;
                let message = `Задание №${counter}\n${task.title}\n${task.description}\n`;

                if(task.statusId === 2) {
                    inline.text('Закончить', `complete:${task.id}`)
                }

                await ctx.reply(message, {reply_markup: inline})
            }
        } catch(error) {
            console.error('Error in getInPorgressTasks:', error);
            await ctx.reply('Произошла ошибка при получении задач в процессе');
        }
    }
}