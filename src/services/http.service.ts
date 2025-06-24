import sequelize from "../db/config/sequelize.database.config";
import express, { Express } from 'express';
import logger from "../shared/utils/logger";
import cors from "cors";
import dotenv from "dotenv";
import {setupAssociations} from "../db/models/associations";

dotenv.config();
const _fileName = module.filename.split("/").pop();

export class HttpService {
    app: Express = express();
    private port: number = +String(process.env.PORT) || 3000;
    private retryCount: number = 0;
    private maxRetries: number = 5;
    private retryDelay: number = 5000 //5 seconds;

    constructor() {
        this.app.use(cors())
        this.app.use(express.json());

        this._registerRoutes();
    }

    async _initializeDatabase() {
        try {
            await sequelize.authenticate();
            logger.info(`Database connected successfully. - ${__filename}`);
        } catch (error) {
            logger.error(`Database connection failed: ${error} - ${__filename}`);
            throw error;
        }
    }

    private _registerRoutes(): void {
        import('../routes/router.config').then(({ routesConfig }) => {
            routesConfig.forEach(({ path, router, middlewares = [] }) => {
                this.app.use(path, ...middlewares, router);
            });
            logger.info("Routes registered successfully.");
        }).catch((error) => {
            logger.error(`Failed to register routes: ${error} - ${__filename}`);
        });
    }

    private _startHttpServer(): void {
        setupAssociations();
        const server = this.app.listen(this.port, () => {
            logger.info(`Server is running on http://localhost:${this.port} - ${__filename}`);
        });

        server.on("error", (error: any) => {
            if (error.code !== "EADDRINUSE") {
                logger.error(`Server error: ${error} - ${__filename}`);
                process.exit(1);
            }
            logger.warn(`Port ${this.port} is in use. Trying port ${this.port + 1}...`);
            this.port++;
            this._startHttpServer();
        });
    }

    async _startServer(): Promise<void> {
        try {
            await this._initializeDatabase();
            this._startHttpServer();
        } catch (error) {
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                logger.warn(
                    `Retrying to connect to the database (${this.retryCount}/${this.maxRetries}) in ${
                        this.retryDelay / 1000
                    } seconds...`
                );
                setTimeout(() => this._startServer(), this.retryDelay);
                return;
            }
            logger.error(`Max retries reached. Could not connect to the database. - ${__filename}`);
            process.exit(1);
        }
    }

    async start(): Promise<void> {
        if (process.env.NODE_ENV !== "production") {
            await this._startServer();
        } else {
            this._startHttpServer();
        }
    }
}
