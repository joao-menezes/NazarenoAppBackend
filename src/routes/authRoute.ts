import { Router } from 'express';
import {LoginController} from "../controller/login.controller";

const authRouter = Router();
const secret = String(process.env.JWT_SECRET);

authRouter.get('/login/:userId', LoginController.login);

export default authRouter;
