import type { InferResultType } from "../../../database/index.js";

export type GetUserDto = Omit<InferResultType<'users'>, 'hash'>