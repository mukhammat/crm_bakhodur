import { seed } from "drizzle-seed";
import * as schema from '../schema/index.js'
import { db } from '../index.js'

async function main() {
  await seed(db, { users: schema.users }).refine((f) => ({
    users: {
        columns: {
            email: f.default({ defaultValue: 'dosnet2200@gmail.com' }),
            name: f.default({ defaultValue: 'Bakhodur' }),
            password: f.default({ defaultValue: '$2b$10$bBeHCa5ybqbUzHSY7ktrmOaeH1Tj.FbbNNgJsxO57wtoZ7NhpoRDS' }),
            role: f.default({ defaultValue: 'admin' }),
        },
        count: 1
    }
  }));
}

main();