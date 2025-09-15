import type { Context } from "hono";
import type { IWorkerService } from "./worker.service.js";

export class WorkerController {
    constructor(private workerService: IWorkerService) {}

    public async getAll(c: Context) {
        const workers = await this
        .workerService
        .getAll();

        return c.json({
            data: {
                workers
            }
        })
    }
}