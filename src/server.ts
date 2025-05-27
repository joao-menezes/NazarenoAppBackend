import { HttpService } from './services/http.service';

async function server() {
    const httpService = new HttpService();
    await httpService.start();
}

server().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});