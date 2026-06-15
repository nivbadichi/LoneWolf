import express from "express";
import cors from "cors";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "tasks.json");
const app = express();
app.use(cors());
app.use(express.json()); 

const PORT = process.env.PORT || 3001;



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});