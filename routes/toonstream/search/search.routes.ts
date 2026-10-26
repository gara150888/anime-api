import express from "express";
import type { Router } from "express";
import { headers, providers } from "../../../consts";
import { request } from "undici";

export const searchRouter: Router = express.Router();

searchRouter.get("/toonstream/search", async (req, res) => {
  const query = req.query.q;
  const scrapProviders = providers.filter((p) => p.fetchType === "scrap");

  if (!query) return res.status(400).send({
    status: "error",
    data: { message: "Query is required" },
  });

  const results = await Promise.all(scrapProviders.map(async (p) => {
    const req = p.getSearchRequest(query.toString());

    const { body, statusCode } = await request(req.url, {
      method: req.method,
      headers: { ...headers, ...req.headers },
      body: req.body,
    });

    if (statusCode !== 200) return {
      status: "error",
      data: { message: "Failed to fetch data" },
    };

    const data = await body.text();
    const result = p.extractSearchResults(data);

    return { status: "success", provider: p.name, query, data: result };
  }));

  res.send(results);

});