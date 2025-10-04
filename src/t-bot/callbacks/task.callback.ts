import type { ITaskService } from "../../core/services/task.service.js";
import type { MyContext } from "../types/grammy.type.js";

export class TaskCallback {
    constructor(
        private taskService: ITaskService,
    ) {}

    public take = async (ctx: MyContext) => {
        try{
            console.log('Callback data:', ctx.callbackQuery?.data);
            await ctx.answerCallbackQuery();
            const data = ctx.callbackQuery?.data;
            if (!data) return;
    
            const [_, taskId] = data.split(':');
            console.log('Extracted taskId:', taskId);
    
            if (!ctx.user?.id) return;
            
            await this.taskService.update(taskId, {
                status: 'in_progress',
            });

        } catch(error) {
            console.log(error)
        }
    }

    public complete = async (ctx: MyContext) => {
        try{
            console.log('Callback data:', ctx.callbackQuery?.data);
            await ctx.answerCallbackQuery();
            const data = ctx.callbackQuery?.data;
            if (!data) return;
            const [_, taskId] = data.split(':');
            console.log('Extracted taskId:', taskId);
            await this.taskService.update(taskId, {
                status: 'completed'
            });
        } catch(error) {
            console.log(error)
        }
    }
}