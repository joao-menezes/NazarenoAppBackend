import {Response, Router} from 'express';
import {UserController} from "../controller/user.controller";
import {PresenceController} from "../controller/presence.controller";
import HttpCodes from "http-status-codes";
import {PdfController} from "../controller/pdf.controller";

const mainRoutes = Router();

mainRoutes.get('/users', UserController.getUsers);
mainRoutes.get('/users/:userId', UserController.getUserById);
mainRoutes.post('/users', UserController.createUser);
mainRoutes.put('/users', UserController.updateUser);
mainRoutes.delete('/users/:userId', UserController.deleteUsers);

mainRoutes.get('/presence', PresenceController.getPresence);
mainRoutes.post('/presence', PresenceController.createPresence);
mainRoutes.put('/presence', PresenceController.updatePresence);

mainRoutes.get('/report', PdfController.generatePDF);

mainRoutes.get('/health-check', (res: Response) => {
    res.status(HttpCodes.OK).send('Server is healthy');
});

export default mainRoutes;