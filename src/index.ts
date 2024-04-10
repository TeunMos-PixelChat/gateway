import express, { Express, Request, Response, NextFunction } from 'express';
import proxy from 'express-http-proxy';
import { auth, requiredScopes } from 'express-oauth2-jwt-bearer';
import dotenv from "dotenv";
import cors from 'cors';

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
console.log(`isProduction: ${isProduction}`);

const app: Express = express();
const port = process.env.PORT || 3004;

const messageApiUrl = process.env.MESSAGE_API_URL || 'http://localhost:3001';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';


// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = auth({
  audience: 'http://localhost/',
  issuerBaseURL: `https://dev-1qp5piklx43am651.us.auth0.com/`,
  tokenSigningAlg: 'RS256'
});


console.log(`messageApiUrl: ${messageApiUrl}`);
console.log(`frontendUrl: ${frontendUrl}`);


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
  res.json({ message: "hello from gateway :)" });
});

app.use('/api', checkJwt, (req: Request, res: Response, next: NextFunction) => {
  if (req.auth) {
    const userId = req.auth.payload.sub;
    req.headers['Authorization'] = `Bearer ${req.auth.token}`;
    req.headers['X-User-Id'] = userId;

    proxy(messageApiUrl)(req, res, next);
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

app.use('/', (req: Request, res: Response, next: NextFunction) => {
  // console.log(`[fr] ${req.method}: ${req.path}`);
  proxy(frontendUrl)(req, res, next);
});


const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


export { app, server, frontendUrl, messageApiUrl }