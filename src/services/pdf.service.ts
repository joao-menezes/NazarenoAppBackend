import PDFDocument from 'pdfkit';
import axios from 'axios';
import { Response } from 'express';
import UserModel from '../db/models/user.model';
import PresenceModel from '../db/models/presence.model';
import RoomModel from '../db/models/room.model';
import { RoleEnum } from '../shared/utils/enums/role.enum';
import logger from '../shared/utils/logger';

export class PDFService {
    /**
     * Gera o relatório de presenças dos usuários em PDF
     * @param res Response - objeto de resposta do Express
     */
    async generateAttendanceReport(res: Response) {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Relatório Geral', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Data de geração: 
        ${new Date().toLocaleDateString()} as  ${new Date().toLocaleTimeString('pt-BR')} `,{ align: 'right' });
        doc.moveDown(2);

        const tableTop = doc.y;
        const columnPositions = {
            photo: 50,
            name: 80,
            role: 220,
            room: 320,
            userPresence: 470,
        };

        doc.font('Helvetica-Bold').fontSize(12)
            .text('', columnPositions.photo, tableTop)
            .text('Nome do Usuário', columnPositions.name, tableTop)
            .text('Cargo', columnPositions.role, tableTop)
            .text('Sala Associada', columnPositions.room, tableTop)
            .text('Presenças', columnPositions.userPresence, tableTop);

        const headerBottom = tableTop + 20;
        doc.moveTo(50, headerBottom).lineTo(550, headerBottom).stroke();

        let rowY = headerBottom + 10;
        doc.font('Helvetica').fontSize(10);

        try {
            logger.info('Iniciando busca de dados para o relatório em PDF.');

            const allUsers = await UserModel.findAll({
                attributes: ['userId', 'username', 'role', 'roomId', 'userPicUrl'],
                order: [['username', 'ASC']],
            });

            logger.info(`Total de usuários encontrados: ${allUsers.length}.`);

            for (const user of allUsers) {
                let roomName = 'N/A';
                let userPresenceCount = 0;

                try {
                    if (user.roomId && user.roomId !== 'none') {
                        const room = await RoomModel.findByPk(user.roomId, {
                            attributes: ['roomName'],
                        });
                        roomName = room ? room.roomName : 'N/A';

                        const presence = await PresenceModel.findOne({
                            where: { userId: user.userId, roomId: user.roomId },
                            attributes: ['presenceCount'],
                        });
                        userPresenceCount = presence ? presence.presenceCount : 0;
                    }
                } catch (innerError: any) {
                    logger.warn(
                        `Erro ao buscar dados para usuário ${user.username}: ${innerError.message}`
                    );
                }

                if (rowY > 700) {
                    doc.addPage();

                    doc.font('Helvetica-Bold').fontSize(12)
                        .text('Foto', columnPositions.photo, 50)
                        .text('Nome do Usuário', columnPositions.name, 50)
                        .text('Cargo', columnPositions.role, 50)
                        .text('Sala Associada', columnPositions.room, 50)
                        .text('Presenças', columnPositions.userPresence, 50);

                    const newHeaderBottom = 50 + 20;
                    doc.moveTo(50, newHeaderBottom).lineTo(550, newHeaderBottom).stroke();

                    rowY = newHeaderBottom + 10;
                    doc.font('Helvetica').fontSize(10);
                }

                if (user.userPicUrl) {
                    try {
                        const imgBuffer = await this.fetchImageBuffer(user.userPicUrl);
                        doc.image(imgBuffer, columnPositions.photo, rowY - 2, {
                            width: 20,
                            height: 20,
                            align: 'center',
                            valign: 'center',
                        });
                    } catch (imgError) {
                        logger.warn(`Erro ao carregar imagem de ${user.username}: ${imgError}`);
                    }
                }

                // Insert user data
                doc.text(user.username, columnPositions.name, rowY, { width: 130, ellipsis: true })
                    .text(this.translateRole(user.role), columnPositions.role, rowY, { width: 90 })
                    .text(roomName, columnPositions.room, rowY, { width: 140, ellipsis: true })
                    .text(userPresenceCount.toString(), columnPositions.userPresence, rowY, { width: 70 });

                const rowBottom = rowY + 20;
                doc.moveTo(50, rowBottom).lineTo(550, rowBottom).lineWidth(0.5).opacity(0.5).stroke().opacity(1).lineWidth(1);

                rowY += 25;
            }

            logger.info('Finalização da renderização das linhas da tabela.');

            const footerY = doc.y + 20 > 750 ? 750 : doc.y + 20;
            doc.fontSize(10).text('Relatório gerado automaticamente.', 50, footerY, { align: 'center', width: 500 });

        } catch (error: any) {
            logger.error(`Erro ao gerar dados do relatório PDF: ${error.message}`, { stack: error.stack });

            if (doc.bufferedPageRange().count === 0) doc.addPage();

            const errorY = doc.y > 50 ? doc.y : 50;
            doc.fillColor('red').text(`Erro ao gerar relatório: ${error.message}`, 50, errorY);
        }

        logger.info('Finalizando o documento PDF.');
        doc.end();
    }

    /**
     * Faz o download da imagem a partir de uma URL pública
     * @param url string
     * @returns Buffer da imagem
     */
    private async fetchImageBuffer(url: string): Promise<Buffer> {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
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
