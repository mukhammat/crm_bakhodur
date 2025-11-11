import type { Context } from "hono";
import type { JwtVariables } from "hono/jwt";

import type { InferResultType } from "../../../database/index.js";

export type RoleDto = Pick<InferResultType<'users'>, 'roleId'>['roleId']

export type ContextJWT = Context<{ Variables: JwtVariables<{ id: string, roleId: number }> }>;