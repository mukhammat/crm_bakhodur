export class TaskCallback {
    taskService;
    constructor(taskService) {
        this.taskService = taskService;
    }
    take = async (ctx) => {
        try {
            console.log('Callback data:', ctx.callbackQuery?.data);
            await ctx.answerCallbackQuery();
            const data = ctx.callbackQuery?.data;
            if (!data)
                return;
            const [_, taskId] = data.split(':');
            console.log('Extracted taskId:', taskId);
            if (!ctx.user?.id)
                return;
            let close = false;
            const assignment = await this.taskService.getAssignmentByUserId(ctx.user.id);
            if (assignment) {
                for (const element of assignment) {
                    if (element.task.status === 'in_progress') {
                        await ctx.reply('Вы не можете выполнять несколько зачаь одновременно!');
                        close = true;
                    }
                }
            }
            if (close) {
                return;
            }
            await this.taskService.update(taskId, {
                status: 'in_progress',
            });
            await ctx.reply('Вы взяли задачу на выполнения!');
        }
        catch (error) {
            console.log(error);
        }
    };
    complete = async (ctx) => {
        try {
            console.log('Callback data:', ctx.callbackQuery?.data);
            await ctx.answerCallbackQuery();
            const data = ctx.callbackQuery?.data;
            if (!data)
                return;
            const [_, taskId] = data.split(':');
            console.log('Extracted taskId:', taskId);
            await this.taskService.update(taskId, {
                status: 'completed'
            });
        }
        catch (error) {
            console.log(error);
        }
    };
}
