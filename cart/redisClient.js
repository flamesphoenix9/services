const redis = require("redis");

const client = redis.createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});

client.on("error", (err) => console.error("Redis Client Error", err));
client.on("connect", () => console.log("Redis Client Connected"));

// Connect immediately
client.connect().catch((err) => console.error("Redis Connection Error", err));

module.exports = client;