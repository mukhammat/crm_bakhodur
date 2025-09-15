import db from "../database/index.js";
const gracefulShutdown = async () => {
    console.log('Shutting down...');
    await db.$client.end();
    process.exit(0);
};
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
