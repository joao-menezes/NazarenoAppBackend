import UserModel from "../model/user.model";

export class UserService {

    static async findAll() {
        try {
            return await UserModel.findAll();
        } catch (error) {
            throw new Error(`Error fetching users: ${error}`);
        }
    }

    static async findById(userId: string) {
        try {
            return await UserModel.findByPk(userId);
        } catch (error) {
            throw new Error(`Error fetching users: ${error}`);
        }
    }
}