import mainRoutes from "./routes";
import {authLimiter} from "../middleware/auth.rate.limit.middleware";
import {AuthLoginMiddleware} from "../middleware/auth.login.middleware";
import authRouter from "./authRoute";

export const routesConfig = [
    {
        path: "/auth",
        router: authRouter,
        middlewares: [authLimiter],
    },
    {
        path: "/api",
        router: mainRoutes,
        middlewares: [AuthLoginMiddleware],
    }
]