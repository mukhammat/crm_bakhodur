import { InlineKeyboard } from "grammy";
export class TaskCommand {
    taskService;
    userService;
    constructor(taskService, userService) {
        this.taskService = taskService;
        this.userService = userService;
    }
    myTasks = async (ctx) => {
        if (!ctx.user?.id)
            return;
        const a = await this.taskService.getAssignmentByUserId(ctx.user?.id || '');
        console.log(a);
        if (!a.length) {
            await ctx.reply('Нет заданий');
            return;
        }
        let c = 0;
        a.map(async (v) => {
            const inline = new InlineKeyboard();
            c++;
            const task = v.task;
            let message = `Задание №${c}\n${task.title}\n${task.description}\n`;
            if (v.task.status === 'in_progress') {
                inline.text('Закончить', `complete:${v.taskId}`);
            }
            if (v.task.status === 'pending') {
                inline.text('Приступить', `take:${v.taskId}`);
            }
            if (v.task.status === 'completed') {
                message = message + '\n✅ Выполнено';
            }
            await ctx.reply(message, { reply_markup: inline });
        });
    };
    getCompletedTasks = async (ctx) => {
        if (!ctx.user?.id)
            return;
        const tasks = await this.taskService.getAll({
            status: 'completed'
        });
        let c = 0;
        tasks.map(async (v) => {
            const inline = new InlineKeyboard();
            c++;
            const task = v;
            let message = `Задание №${c}\n${task.title}\n${task.description}\n`;
            if (v.status === 'completed') {
                message = message + '\n✅ Выполнено';
            }
            await ctx.reply(message, { reply_markup: inline });
        });
    };
    getPendingTasks = async (ctx) => {
        if (!ctx.user?.id)
            return;
        const tasks = await this.taskService.getAll({
            status: 'pending'
        });
        let c = 0;
        tasks.map(async (v) => {
            const inline = new InlineKeyboard();
            c++;
            const task = v;
            let message = `Задание №${c}\n${task.title}\n${task.description}\n`;
            if (v.status === 'in_progress') {
                inline.text('Закончить', `complete:${v.id}`);
            }
            if (v.status === 'pending') {
                inline.text('Приступить', `take:${v.id}`);
            }
            if (v.status === 'completed') {
                message = message + '\n✅ Выполнено';
            }
            await ctx.reply(message, { reply_markup: inline });
        });
    };
    getInPorgressTasks = async (ctx) => {
        if (!ctx.user?.id)
            return;
        const tasks = await this.taskService.getAll({
            status: 'in_progress'
        });
        let c = 0;
        tasks.map(async (v) => {
            const inline = new InlineKeyboard();
            c++;
            const task = v;
            let message = `Задание №${c}\n${task.title}\n${task.description}\n`;
            if (v.status === 'in_progress') {
                inline.text('Закончить', `complete:${v.id}`);
            }
            if (v.status === 'pending') {
                inline.text('Приступить', `take:${v.id}`);
            }
            if (v.status === 'completed') {
                message = message + '\n✅ Выполнено';
            }
            await ctx.reply(message, { reply_markup: inline });
        });
    };
}
