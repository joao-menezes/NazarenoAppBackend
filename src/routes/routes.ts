import {Response, Router} from 'express';
import {UserController} from "../controller/user.controller";
import {PresenceController} from "../controller/presence.controller";
import HttpCodes from "http-status-codes";
import {PdfController} from "../controller/pdf.controller";
import {RoomController} from "../controller/room.controller";

const mainRoutes = Router();

mainRoutes.get('/users', UserController.getUsers);
mainRoutes.get('/users/:userId', UserController.getUserById);
mainRoutes.post('/users', UserController.createUser);
mainRoutes.patch('/users/:userId', UserController.updateUser);
mainRoutes.delete('/users/:userId', UserController.deleteUsers);

mainRoutes.get('/presence', PresenceController.getPresence);
mainRoutes.get('/presence/:presenceId', PresenceController.getPresenceById);
mainRoutes.post('/presence', PresenceController.createPresence);
mainRoutes.put('/presence', PresenceController.updatePresence);

mainRoutes.get('/room', RoomController.getRooms);
mainRoutes.post('/room', RoomController.createRoom);
mainRoutes.patch('/room/:roomId', RoomController.updateRoom);
mainRoutes.delete('/room/:roomId', RoomController.deleteRoom);

mainRoutes.get('/report', PdfController.generatePDF);

mainRoutes.get('/health-check', (res: Response) => {
    res.status(HttpCodes.OK).send('Server is healthy');
});

export default mainRoutes;