import { Request, Response } from 'express';
import { PDFService } from '../services/pdf.service';
import { UserService } from '../services/user.service';

const pdfService = new PDFService();

export class PdfController {
    static async generatePDF(req: Request, res: Response) {
        try {
            const users = await UserService.findAll();

            if (!users || users.length === 0) {
                res.status(404).json({ message: 'Nenhum dado encontrado para gerar o relatório.' });
                return
            }

            pdfService.generateAttendanceReport(res);

        } catch (error) {
            console.error('Erro na geração do PDF:', error);
            res.status(500).json({ message: 'Erro ao gerar o PDF' });
        }
    }
}
