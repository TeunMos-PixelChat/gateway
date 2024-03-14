import express, { Express, Request, Response } from 'express';
import proxy from 'express-http-proxy';
import dotenv from "dotenv";
import cors from 'cors';

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
console.log(`isProduction: ${isProduction}`);

const app: Express = express();
const port = process.env.PORT || 3001;

const messageApiUrl = process.env.MESSAGE_API_URL || 'http://localhost:3001';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';




console.log(`messageApiUrl: ${messageApiUrl}`);
console.log(`frontendUrl: ${frontendUrl}`);

// Frontend


app.use(cors({
  // origin: process.env.FRONTEND_URL || 'http://localhost:3000'
  origin: "*"
}));

// app.use(express.json()); // for parsing application/json

// log all requests
app.use((req, res, next) => {
  console.log(`[${req.method}]: ${req.path}`);
  next();
});

// test route
app.get('/test', (req: Request, res: Response) => {
  res.json({ message: "hello from gateway" });
});

app.use('/api', proxy(messageApiUrl)); // message api

app.use(proxy(frontendUrl)); // frontend


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});