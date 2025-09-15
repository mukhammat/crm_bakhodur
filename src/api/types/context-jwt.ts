import type { Context } from "hono";
import type { JwtVariables } from "hono/jwt";

export type ContextJWT = Context<{ Variables: JwtVariables<{ id: string }> }>;