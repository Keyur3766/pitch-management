import { createClient } from "redis";
import "dotenv/config";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error("REDIS_URL is missing in .env");
}

export const redisClient = createClient({
    url: redisUrl
});

redisClient.on("error", (err) => {
    console.log("Redis Error:", err);
});

(async () => {
    await redisClient.connect();
    console.log("Redis connected");
})();

