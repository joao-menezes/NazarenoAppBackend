import mainRoutes from "./routes";
import {authLimiter} from "../middleware/auth.rate.limit.middleware";

export const routesConfig = [
    {
        path: "/api",
        router: mainRoutes,
        middlewares: [authLimiter],
    },
]