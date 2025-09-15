import {} from "hono";
export const notFound = async (c) => {
    return c.json({
        message: 'Не найдено!',
    }, 404);
};
