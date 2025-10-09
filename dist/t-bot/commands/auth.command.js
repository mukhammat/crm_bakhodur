export class AuthCommand {
    register = async (ctx) => {
        await ctx.conversation.enter("register");
    };
}
