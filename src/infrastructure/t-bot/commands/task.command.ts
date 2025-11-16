import { InlineKeyboard } from "grammy";
import type { TaskService } from "../../../core/services/task.service.js";
import type { TaskAssignmentService } from "../../../core/services/task-assignment.service.js";
import type { UserService } from "../../../core/services/user.service.js";
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
                await ctx.reply('No tasks')
                return;
            }
            
            let counter = 0;
            for (const assignment of assignments) {
                const inline = new InlineKeyboard()
                
                counter++;
                const task = assignment.task;
                let message = `Task #${counter}\n${task.title}\n${task.description}\n`;

                if(task.statusId === 2) {
                    inline.text('Complete', `complete:${assignment.taskId}`)
                }

                if(task.statusId === 1) {
                    inline.text('Start', `take:${assignment.taskId}`)
                }

                if(task.statusId === 3) {
                    message = message + '\n✅ Completed'
                }

                await ctx.reply(message, {reply_markup: inline})
            }
        } catch(error) {
            console.error('Error in myTasks:', error);
            await ctx.reply('An error occurred while retrieving tasks');
        }
    }

    public getCompletedTasks = async (ctx: MyContext) => {
        try {
            if(!ctx.user?.id) return;

            const tasks = await this.taskService.getAll({
                statusId: 3
            })

            if(!tasks.length) {
                await ctx.reply('No completed tasks');
                return;
            }

            let counter = 0;
            for (const task of tasks) {
                const inline = new InlineKeyboard()
                
                counter++;
                let message = `Task #${counter}\n${task.title}\n${task.description}\n✅ Completed`;

                await ctx.reply(message, {reply_markup: inline})
            }
        } catch(error) {
            console.error('Error in getCompletedTasks:', error);
            await ctx.reply('An error occurred while retrieving completed tasks');
        }
    }

    public getPendingTasks = async (ctx: MyContext) => {
        try {
            if(!ctx.user?.id) return;

            const tasks = await this.taskService.getAll({
                statusId: 1
            })

            if(!tasks.length) {
                await ctx.reply('No pending tasks');
                return;
            }

            let counter = 0;
            for (const task of tasks) {
                const inline = new InlineKeyboard()
                
                counter++;
                let message = `Task #${counter}\n${task.title}\n${task.description}\n`;

                if(task.statusId === 1) {
                    inline.text('Start', `take:${task.id}`)
                }

                await ctx.reply(message, {reply_markup: inline})
            }
        } catch(error) {
            console.error('Error in getPendingTasks:', error);
            await ctx.reply('An error occurred while retrieving pending tasks');
        }
    }

    public getInPorgressTasks = async (ctx: MyContext) => {
        try {
            if(!ctx.user?.id) return;

            const tasks = await this.taskService.getAll({
                statusId: 2
            })

            if(!tasks.length) {
                await ctx.reply('No tasks in progress');
                return;
            }

            let counter = 0;
            for (const task of tasks) {
                const inline = new InlineKeyboard()
                
                counter++;
                let message = `Task #${counter}\n${task.title}\n${task.description}\n`;

                if(task.statusId === 2) {
                    inline.text('Complete', `complete:${task.id}`)
                }

                await ctx.reply(message, {reply_markup: inline})
            }
        } catch(error) {
            console.error('Error in getInPorgressTasks:', error);
            await ctx.reply('An error occurred while retrieving tasks in progress');
        }
    }
}