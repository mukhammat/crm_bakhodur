import { InlineKeyboard } from "grammy";
import type { TaskService } from "../../core/services/task.service.js";
import type { UserService } from "../../core/services/user.service.js";
import type { MyContext } from "../types/grammy.type.js";

export class TaskCommand {

    constructor(
        private taskService: TaskService,
        private userService: UserService
    ) {}
    
    public myTasks = async (ctx: MyContext) => {
        if(!ctx.user?.id) return;

        const a = await this.taskService.getAssignmentByUserId(ctx.user?.id || '');
        console.log(a);

        if(!a.length) {
            await ctx.reply('Нет заданий')
            return;
        }
        
        let c = 0;
        a.map(async (v) => {
            const inline = new InlineKeyboard()
            
            c++;
            const task = v.task;
            let message = `Задание №${c}\n${task.title}\n${task.description}\n`;

            if(v.task.statusId === 2) {
                inline.text('Закончить', `complete:${v.taskId}`)
            }

            if(v.task.statusId === 1) {
                inline.text('Приступить', `take:${v.taskId}`)
            }

            if(v.task.statusId === 3) {
                message = message + '\n✅ Выполнено'
            }

            await ctx.reply(message, {reply_markup: inline})
        })
    }

    public getCompletedTasks = async (ctx: MyContext) => {
        if(!ctx.user?.id) return;

        const tasks = await this.taskService.getAll({
            statusId: 3
        })

        let c = 0;
        tasks.map(async (v) => {
            const inline = new InlineKeyboard()
            
            c++;
            const task = v;
            let message = `Задание №${c}\n${task.title}\n${task.description}\n`;

            if(v.statusId === 3) {
                message = message + '\n✅ Выполнено'
            }

            await ctx.reply(message, {reply_markup: inline})
        })
    }

    public getPendingTasks = async (ctx: MyContext) => {
        if(!ctx.user?.id) return;

        const tasks = await this.taskService.getAll({
            statusId: 1
        })

        let c = 0;
        tasks.map(async (v) => {
            const inline = new InlineKeyboard()
            
            c++;
            const task = v;
            let message = `Задание №${c}\n${task.title}\n${task.description}\n`;

            if(v.statusId === 2) {
                inline.text('Закончить', `complete:${v.id}`)
            }

            if(v.statusId === 1) {
                inline.text('Приступить', `take:${v.id}`)
            }

            if(v.statusId === 3) {
                message = message + '\n✅ Выполнено'
            }

            await ctx.reply(message, {reply_markup: inline})
        })
    }

    public getInPorgressTasks = async (ctx: MyContext) => {
        if(!ctx.user?.id) return;

        const tasks = await this.taskService.getAll({
            statusId: 2
        })

        let c = 0;
        tasks.map(async (v) => {
            const inline = new InlineKeyboard()
            
            c++;
            const task = v;
            let message = `Задание №${c}\n${task.title}\n${task.description}\n`;

            if(v.statusId === 2) {
                inline.text('Закончить', `complete:${v.id}`)
            }

            if(v.statusId === 1) {
                inline.text('Приступить', `take:${v.id}`)
            }

            if(v.statusId === 3) {
                message = message + '\n✅ Выполнено'
            }

            await ctx.reply(message, {reply_markup: inline})
        })
    }
}