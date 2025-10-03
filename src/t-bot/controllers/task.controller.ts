import { InlineKeyboard } from "grammy";
import type { TaskService } from "../../core/services/task.service.js";
import type { UserService } from "../../core/services/user.service.js";
import type { MyContext } from "../types/grammy.type.js";

export class TaskController {
    constructor(
        private taskService: TaskService,
        private userService: UserService
    ) {}

    public myTasks = async (ctx: MyContext) => {
        const chatId = ctx?.chatId ?? 0;
       
        const b = await this.userService.getByTelegramId(chatId)

        const a = await this.taskService.getAssignmentById(b?.id || '');
        console.log(a);

        if(!a.length) {
            await ctx.reply('Нет заданий')
            return;
        }
        const inline = new InlineKeyboard()
        .text('Приступить', `take`)

        let c = 0;
        a.map(async (v) => {
            c++;
            const task = v.task;
            const message = `Задание №${c}\n${task.title}\n${task.description}\n`;
            await ctx.reply(message, {reply_markup: inline})
        })
    }
}