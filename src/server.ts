import express, {Express, Request, Response} from "express";
import http, {Server as HttpServer} from "http";
import {Server as WebSocketServer, Socket} from "socket.io";

class SocketServer {
    private app: Express = express();
    private httpServer: HttpServer = http.createServer(this.app);
    private socketServer: WebSocketServer
    private static PORT = 8080;

    constructor() {
        this.socketServer = new WebSocketServer(this.httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.setupHttpServer();
        this.setupSocketServer();
    }

    private setupHttpServer(): void {
        this.app.get('/', (req: Request, res: Response): void => {
            res.send({
                message: 'Initialized !'
            })
        })

        this.httpServer.listen(SocketServer.PORT, () => {
            console.log(`App listening on http://localhost:${SocketServer.PORT}`)
        });
    }

    private setupSocketServer() {
        this.socketServer.on('connection', (socket: Socket): void => {
            socket.emit('connected');

            socket.on('PING', () => {
                socket.emit('PONG');
            })

            socket.on('startCounter', () => {
                let counter = 0;
                const update = () => {
                    socket.emit('counterDetailReceived', JSON.stringify({
                        counter,
                        isFinished: counter === 100
                    }))
                }
                update();

                const interval = setInterval(() => {
                    counter+=10;
                    update();
                    void(counter === 100 && clearInterval(interval));
                }, 1000)
            })

            socket.on('disconnect', () => {
                console.log('Disconnected !');
            });
        });
    }
}

export default SocketServer;