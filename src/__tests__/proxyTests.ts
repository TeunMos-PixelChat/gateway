import supertest from "supertest"; // supertest is a framework that allows to easily test web APIs
import { app, server, frontendUrl, messageApiUrl } from "../index";
import { Request, Response, NextFunction } from "express";
import { AuthOptions } from "express-oauth2-jwt-bearer";

// mock the proxy server
jest.mock("express-http-proxy", () => {
  return (host: string) => {
    return (req: any, res: Response, next: NextFunction) => {
      res.json({ message: "proxy test", host: host, auth: req.auth});
    };
  };
});

// mock express-oauth2-jwt-bearer
jest.mock("express-oauth2-jwt-bearer", () => {
  return {
    auth: (opts?: AuthOptions | undefined) => {
      return (req: any, res: Response, next: NextFunction) => {
        req.auth = {
          payload: {
            sub: "123"
          },
          token: "token"
        };
        next();
      };
    }
  };
});


it("front-end proxy test", async () => {
  const response = await supertest(app).get("/");
  console.log(response.body);
  expect(response.body.message).toBe("proxy test");
  expect(response.body.host).toBe(frontendUrl);
});

it("message-api proxy test (with auth)", async () => {
  const response = await supertest(app).get("/api");
  console.log(response.body);
  expect(response.body.message).toBe("proxy test");
  expect(response.body.host).toBe(messageApiUrl);
  expect(response.body.auth.payload.sub).toBe("123");
  expect(response.body.auth.token).toBe("token");
});


afterAll(done => {
  server.close(done);
});