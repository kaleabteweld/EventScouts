import mongoose from "mongoose";
import Cache from "./Util/cache";
import { makeServer } from './Util/Factories';
import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV?.trim()}` });
console.log(`[+] running on ${process.env.NODE_ENV?.trim()} mode`)
const app = makeServer();

Cache.connect();

const port = process.env.APP_PORT || 5000;
app.listen(port, () => {
    console.log(`[+] server started at http://localhost:${port}`);
});

mongoose.connect(process.env.DATABASE_URL ?? "").catch((error) => {
    console.log("[-] Database Connection Error", error);
}).then(() => {
    console.log("[+] Database Connected");
});
