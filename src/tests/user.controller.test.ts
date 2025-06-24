import { Request, Response } from "express";
import { UserController } from "../controller/user.controller";
import UserModel from "../db/models/user.model";
import HttpCodes from "http-status-codes";
import { SharedErrors } from "../shared/errors/shared-errors";
import logger from "../shared/utils/logger";

jest.mock("../db/models/user.model");
jest.mock("../shared/utils/logger");

describe("UserController.getUsers", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        req = {};
        jsonMock = jest.fn();
        statusMock = jest.fn(() => ({ json: jsonMock }));
        res = {
            status: statusMock,
            json: jsonMock,
        };
    });

    it("Should return a 200 OK status with a list of users when users are found", async () => {
        const mockUsers = [{ id: 1, username: "JohnDoe" }, { id: 2, username: "JaneDoe" }];
        (UserModel.findAll as jest.Mock).mockResolvedValue(mockUsers);

        await UserController.getUsers(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(HttpCodes.OK);
        expect(jsonMock).toHaveBeenCalledWith({ Users: mockUsers });
        expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Get user with successfully"));
    });

    it("Should return a 400 BAD REQUEST status when no users are found", async () => {
        // Arrange
        (UserModel.findAll as jest.Mock).mockResolvedValueOnce([]);

        // Act
        await UserController.getUsers(req as Request, res as Response);

        // Assert
        expect(statusMock).toHaveBeenCalledWith(HttpCodes.BAD_REQUEST);
        expect(jsonMock).toHaveBeenCalledWith(SharedErrors.UserNotFound);
    });
});
