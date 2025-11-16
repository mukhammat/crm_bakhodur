import type { Context } from "hono";
import type { IPermissionService } from "../../../core/services/permission.service.js";
import type { CreateDto, UpdateDto } from "../../../core/dto/permission.dto.js";

export class PermissionController {
    constructor(private permissionService: IPermissionService) {}

    create = async (c: Context) => {
        const data: CreateDto = await c.req.json();
        const permission = await this.permissionService.create(data);
        return c.json({ permission }, 201);
    };

    getAll = async (c: Context) => {
        const permissions = await this.permissionService.getAll();
        return c.json({ permissions });
    };

    getById = async (c: Context) => {
        const id = c.req.param("id");
        const permission = await this.permissionService.getById(id);
        
        if (!permission) {
            return c.json({ error: "Permission not found" }, 404);
        }
        
        return c.json({ permission });
    };

    update = async (c: Context) => {
        const id = c.req.param("id");
        const data: UpdateDto = await c.req.json();
        const permission = await this.permissionService.update(id, data);
        return c.json({ permission });
    };

    delete = async (c: Context) => {
        const id = c.req.param("id");
        const permission = await this.permissionService.delete(id);
        return c.json({ permission });
    };
}

