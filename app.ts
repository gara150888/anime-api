// app.ts
import express from "express";
import type { Express } from "express";
import { searchRouter } from "./routes/toonstream/search/search.routes.ts";
const app: Express = express();

// 2. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Application routes
app.use("/api", searchRouter);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
