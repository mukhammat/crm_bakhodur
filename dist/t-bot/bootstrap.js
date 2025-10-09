import db from "../database/index.js";
import { TaskService } from "../core/services/task.service.js";
import { UserService } from "../core/services/user.service.js";
import { TaskCallback } from './callbacks/task.callback.js';
import { TaskCommand } from "./commands/task.command.js";
import { MainCommand } from "./commands/main.command.js";
import { AuthCommand } from "./commands/auth.command.js";
import { AuthConversation } from "./conversations/auth.conversation.js";
export default {
    callback: {
        taskCallback: new TaskCallback(new TaskService(db))
    },
    command: {
        taskCommand: new TaskCommand(new TaskService(db), new UserService(db)),
        mainCommand: new MainCommand(),
        authCommand: new AuthCommand()
    },
    conversation: {
        authConversation: new AuthConversation()
    }
};
