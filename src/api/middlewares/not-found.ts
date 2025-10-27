import { type NotFoundHandler } from "hono";

export const notFound: NotFoundHandler = async (c) => {
      return c.json({
            message: 'Не найдено!',
        }, 404);
}