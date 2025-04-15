import { Request, Response } from "express";
import app from "../src/index";
import { VercelRequest, VercelResponse } from "@vercel/node";

// Express expects Node-style req/res, so just forward them
export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req as any, res as any);
}
