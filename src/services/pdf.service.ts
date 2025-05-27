import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { User } from '../interface/user.interface';

export class PDFService {
    generateAttendanceReport(res: Response, users: User[]) {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.pdf');

        doc.pipe(res);

        doc
            .fontSize(20)
            .text('Relatório de Presença', { align: 'center' });

        doc.moveDown();
        doc
            .fontSize(12)
            .text(`Data de geração: ${new Date().toLocaleDateString()}`, { align: 'right' });

        doc.moveDown(2);

        const tableTop = doc.y;
        const columnPositions = {
            name: 50,
            room: 200,
            role: 300,
            attendance: 400
        };

        doc
            .font('Helvetica-Bold')
            .fontSize(12)
            .text('Nome', columnPositions.name, tableTop)
            .text('Sala', columnPositions.room, tableTop)
            .text('Cargo', columnPositions.role, tableTop)
            .text('Presenças', columnPositions.attendance, tableTop);

        const headerBottom = tableTop + 20;
        doc
            .moveTo(50, headerBottom)
            .lineTo(550, headerBottom)
            .stroke();

        let rowY = headerBottom + 10;
        doc.font('Helvetica').fontSize(11);

        users.forEach((user) => {
            doc
                .text(user.username, columnPositions.name, rowY, { width: 140 })
                .text(user.roomName ?? '-', columnPositions.room, rowY, { width: 80 })
                .text(this.translateRole(user.role), columnPositions.role, rowY, { width: 80 })
                .text(user.attendance.toString(), columnPositions.attendance, rowY, { width: 80 });

            rowY += 20;
        });

        doc.moveDown(2);
        doc
            .fontSize(10)
            .text('Relatório gerado automaticamente.', 50, rowY + 20, { align: 'center', width: 500 });

        doc.end();
    }

    private translateRole(role: string) {
        const rolesMap: Record<string, string> = {
            'Admin': 'Administrador',
            'Professor': 'Professor',
            'Moderator': 'Moderador',
            'Student': 'Aluno',
        };

        return rolesMap[role] || role;
    }
}
