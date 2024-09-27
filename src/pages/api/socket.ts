import { Server as HTTPServer } from 'http';
import { Socket as NetSocket } from 'net';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new IOServer(res.socket.server as any);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log(`New client connected: ${socket.id}`);

      socket.on('gameStart', (data) => {
        console.log('Game started:', data);
        // Broadcast game start to all clients except the sender
        socket.broadcast.emit('gameStarted', data);
      });

      socket.on('targetHit', (data) => {
        console.log('Target hit:', data);
        // Broadcast target hit to all clients
        io.emit('targetHitUpdate', data);
      });

      socket.on('gameEnd', (data) => {
        console.log('Game ended:', data);
        // Broadcast game end to all clients
        io.emit('gameEnded', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
  res.end();
};

export default SocketHandler;
