import type { DrizzleClient } from "../../database/index.js";
import type { WorkerType } from '../dto/worker.dto.js'

export interface IWorkerService {
    getAll(): Promise<WorkerType[]>
}

export class WorkerService implements IWorkerService {
    constructor(private db: DrizzleClient) {}

    public async getAll() {
        return this.db
        .query
        .workers
        .findMany({
            with: {
                user: {
                    columns: {
                        hash: false
                    }
                }
            }
        })
    }
}