import PDFDocument from 'pdfkit';
import { Response } from 'express';
import UserModel from "../model/user.model";
import PresenceModel from "../model/presence.model";
import RoomModel from "../model/room.model";
import { RoleEnum } from '../shared/utils/enums/role.enum';
import logger from '../shared/utils/logger';

export class PDFService {
    async generateAttendanceReport(res: Response) {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Relatório Geral de Usuários e Salas', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Data de geração: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown(2);

        const tableTop = doc.y;
        const columnPositions = {
            name: 50,
            role: 180,
            room: 280,
            userPresence: 450
        };
        doc.font('Helvetica-Bold').fontSize(12)
            .text('Nome do Usuário', columnPositions.name, tableTop)
            .text('Cargo', columnPositions.role, tableTop)
            .text('Sala Associada', columnPositions.room, tableTop)
            .text('Presenças (Usuário)', columnPositions.userPresence, tableTop); // Changed header
        const headerBottom = tableTop + 20;
        doc.moveTo(50, headerBottom).lineTo(550, headerBottom).stroke();

        let rowY = headerBottom + 10;
        doc.font('Helvetica').fontSize(10);

        try {
            logger.info('Starting data fetch for PDF report (User-centric approach).');
            // 1. Fetch all users, including their roomId
            const allUsers = await UserModel.findAll({
                attributes: ['userId', 'username', 'role', 'roomId'], // Include roomId
                order: [['username', 'ASC']],
            });
            logger.info(`Fetched ${allUsers.length} users.`);

            for (const user of allUsers) {
                let roomName = 'N/A';
                let userPresenceCount = 0;

                if (user.roomId && user.roomId !== 'none') {
                    try {
                        const room = await RoomModel.findByPk(user.roomId, {
                            attributes: ['roomName']
                        });
                        if (room) {
                            roomName = room.roomName;
                        }

                        const presence = await PresenceModel.findOne({
                            where: { userId: user.userId, roomId: user.roomId },
                            attributes: ['presenceCount']
                        });
                        if (presence) {
                            userPresenceCount = presence.presenceCount;
                        }

                    } catch (innerError: any) {
                        logger.warn(`Could not fetch details for room ${user.roomId} or presence for user ${user.username}: ${innerError.message}`);
                        roomName = 'Erro ao buscar';
                        userPresenceCount = 0;
                    }
                } else {
                    logger.info(`User ${user.username} has no associated roomId.`);
                }

                if (rowY > 700) {
                    doc.addPage();
                    // Redraw headers
                    doc.font('Helvetica-Bold').fontSize(12)
                        .text('Nome do Usuário', columnPositions.name, 50)
                        .text('Cargo', columnPositions.role, 50)
                        .text('Sala Associada', columnPositions.room, 50)
                        .text('Presenças (Usuário)', columnPositions.userPresence, 50);
                    const newHeaderBottom = 50 + 20;
                    doc.moveTo(50, newHeaderBottom).lineTo(550, newHeaderBottom).stroke();
                    rowY = newHeaderBottom + 10;
                    doc.font('Helvetica').fontSize(10);
                }

                doc.text(user.username, columnPositions.name, rowY, { width: 120, ellipsis: true })
                    .text(this.translateRole(user.role), columnPositions.role, rowY, { width: 90 })
                    .text(roomName, columnPositions.room, rowY, { width: 160, ellipsis: true })
                    .text(userPresenceCount.toString(), columnPositions.userPresence, rowY, { width: 90 });

                const rowBottom = rowY + 15;
                doc.moveTo(50, rowBottom).lineTo(550, rowBottom).lineWidth(0.5).opacity(0.5).stroke().opacity(1).lineWidth(1);
                rowY += 20;
            }
            logger.info('Finished drawing table rows.');

            const footerY = doc.y + 20 > 750 ? 750 : doc.y + 20;
            doc.fontSize(10).text('Relatório gerado automaticamente.', 50, footerY, { align: 'center', width: 500 });

        } catch (error: any) {
            logger.error(`Error generating PDF report data: ${error.message}`, { stack: error.stack });
            if (doc.bufferedPageRange().count === 0) doc.addPage();
            const errorY = doc.y > 50 ? doc.y : 50;
            doc.fillColor('red').text(`Erro ao gerar dados do relatório: ${error.message}`, 50, errorY);
        }

        logger.info('Finalizing PDF document.');
        doc.end();
    }

    private translateRole(role: string): string {
        const rolesMap: Record<string, string> = {
            [RoleEnum.ADMIN]: 'Administrador',
            [RoleEnum.PROFESSOR]: 'Professor',
            [RoleEnum.MODERATOR]: 'Moderador',
            [RoleEnum.STUDENT]: 'Aluno',
        };
        return rolesMap[role] || role;
    }
}

