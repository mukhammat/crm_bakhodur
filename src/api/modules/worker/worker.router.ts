import { Hono } from "hono";
import type { DrizzleClient } from "../../../database/index.js";
import { WorkerController } from "./worker.controller.js";
import { WorkerService } from './worker.service.js'
import { requireAuth } from "../../middleware/require-auth.js";

export const workerRouter = (db: DrizzleClient) => {
    const workerController = new WorkerController(new WorkerService(db))

    return new Hono()
    .use(requireAuth)
    .get('/', workerController.getAll)
}