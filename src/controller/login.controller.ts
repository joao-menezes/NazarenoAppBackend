import {UserService} from "../services/user.service";
import {generateToken} from "../shared/utils/generateToken";

export class LoginController {
    static async login(req: any, res: any) {
        try {
            const { userId } = req.params;
            console.log('Corpo da Requisição (req.body):', req.body);
            if (!userId) {
                return res.status(400).json({ message: 'O ID do usuário é obrigatório.' });
            }

            const userFromDb = await UserService.findByPk(userId);
            if (!userFromDb) {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }

            const payloadForToken = {
                userId: userFromDb.userId,
                username: userFromDb.username,
                age: userFromDb.birthDate,
                role: userFromDb.role,
            };

            const token = generateToken(payloadForToken);

            res.status(200).json({
                message: `Token gerado com sucesso para o usuário ${userFromDb.username}!`,
                token: token,
            });
            console.info("Token gerado com sucesso");

        } catch (error) {
            console.error("Erro ao gerar token:", error);
            res.status(500).json({ message: 'Erro interno ao gerar o token.' });
        }
    }
}