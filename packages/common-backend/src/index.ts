
import dotenv from "dotenv"
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env")});

console.log("jwtSecret from common-backend: ", process.env.jwtSecret)
export const jwtSecret = process.env.jwtSecret;