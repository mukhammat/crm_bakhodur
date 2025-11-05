import { db } from "./database/index.js";
import { AuthService } from "./core/services/auth.service.js";
import { NotificationService } from "./core/services/notification.service.js";
import { PermissionService } from "./core/services/permission.service.js";
import { RolePermissionService } from "./core/services/role-permission.service.js";
import { TaskAssignmentService } from "./core/services/task-assignment.service.js";
import { TaskService } from "./core/services/task.service.js";
import { TaskStatusService } from "./core/services/task-status.service.js";
import { UserRoleService } from "./core/services/user-role.service.js";
import { UserService } from "./core/services/user.service.js";
import { AuthController } from "./api/controllers/auth.controller.js";
import { TaskController } from "./api/controllers/task.controller.js";
import { TaskStatusController } from "./api/controllers/task-status.controller.js";
import { UserRoleController } from "./api/controllers/user-role.controller.js";
import { UserController } from "./api/controllers/user.controller.js";
import { PermissionController } from "./api/controllers/permission.controller.js";
import { RolePermissionController } from "./api/controllers/role-permission.controller.js";
import { TaskAssignmentController } from "./api/controllers/task-assignment.controller.js";
import { NotificationController } from "./api/controllers/notification.controller.js";
import { TaskCallback } from './t-bot/callbacks/task.callback.js'
import { TaskCommand } from "./t-bot/commands/task.command.js";
import { MainCommand } from "./t-bot/commands/main.command.js";
import { AuthCommand } from "./t-bot/commands/auth.command.js";
import { AuthConversation } from "./t-bot/conversations/auth.conversation.js";

export const createBootstrap = () => {
    const authService = new AuthService(db);
    const notificationService = new NotificationService(db);
    const permissionService = new PermissionService(db);
    const rolePermissionService = new RolePermissionService(db);
    const taskAssignmentService = new TaskAssignmentService(db);
    const taskService = new TaskService(db);
    const taskStatusService = new TaskStatusService(db);
    const userRoleService = new UserRoleService(db);
    const userService = new UserService(db);
    
    const authController = new AuthController(authService);
    const notificationController = new NotificationController(notificationService);
    const permissionController = new PermissionController(permissionService);
    const rolePermissionController = new RolePermissionController(rolePermissionService);
    const taskAssignmentController = new TaskAssignmentController(taskAssignmentService);
    const taskController = new TaskController(taskService);
    const taskStatusController = new TaskStatusController(taskStatusService);
    const userRoleController = new UserRoleController(userRoleService);
    const userController = new UserController(userService);

    const taskCallback = new TaskCallback(taskService, taskAssignmentService)
    const taskCommand = new TaskCommand(taskAssignmentService, taskService, userService);
    const mainCommand = new MainCommand()
    const authCommand = new AuthCommand()
    const authConversation = new AuthConversation()

    return {
        db: db,
        core: {
            services: {
                authService,
                notificationService,
                permissionService,
                rolePermissionService,
                taskAssignmentService,
                taskService,
                taskStatusService,
                userRoleService,
                userService,
            }
        },
        api: {
            controllers: {
                authController,
                notificationController,
                permissionController,
                rolePermissionController,
                taskAssignmentController,
                taskController,
                taskStatusController,
                userRoleController,
                userController,
            }
        },
        't-bot': {
            callback: {
                taskCallback
            },
            command:  {
                taskCommand,
                mainCommand,
                authCommand,
            },
            conversation: {
                authConversation
            }
        }
    }
}

export const bootstrap = createBootstrap();

// class Bootstrap {
//     private m = new Map<string, any>();
  
//     // C — тип конструктора, InstanceType<C> — тип создаваемого экземпляра
//     register<C extends new (...args: any[]) => any>(
//       title: string,
//       Class: C,
//       ...args: ConstructorParameters<C>
//     ): InstanceType<C> {
//       const instance = new Class(...args);
//       this.m.set(title, instance);
//       return instance as InstanceType<C>;
//     }
  
//     // Вызывающий указывает тип: const s = container.get<MyService>('srv')
//     get<T = any>(title: string): T | undefined {
//       return this.m.get(title) as T | undefined;
//     }
// }

