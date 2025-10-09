import { seed } from "drizzle-seed";
import * as schema from '../schema/index.js';
import { db } from '../index.js';
async function main() {
    await seed(db, { users: schema.users }).refine((f) => ({
        users: {
            columns: {
                email: f.default({ defaultValue: 'dosnet2200@gmail.com' }),
                name: f.default({ defaultValue: 'Bakhodur' }),
                hash: f.default({ defaultValue: '$2b$10$vf75cfhn7GH0afZboAcPK.uKj4HhLdR/bsii7f76vhUEwLv7UZa.C' }),
                role: f.default({ defaultValue: 'admin' }),
            },
            count: 1
        }
    }));
}
main();
