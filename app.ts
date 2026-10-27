import express from "express";
import { request } from "undici";
import providers from "./provider";

const app = express();
app.use(express.json());

app.get("/api/search", async (req, res) => {
  const q = req.query.q as string | undefined;

  if (!q) return res.status(400).json({ status: "error", data: { message: "Query required" } });

  try {

    const result = await Promise.all(
      providers.map((p) => p.searchQuery(q))
    )

    res.json({ status: "success", query: q, data: result });

  } catch (e) {
    res.status(500).json({ status: "error", data: { message: "Search failed" } });
  }

});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(3000, () => console.log("Server started on port 3000"));
