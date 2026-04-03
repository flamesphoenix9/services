require("dotenv").config();
const amqplib = require("amqplib");

class RabbitMQ {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isConnecting = false;
  }
  async connect() {
    if (this.isConnecting) {
      return;
    }
    this.isConnecting = true;
    try {
      const url = process.env.RABBITMQ_URL;
      this.connection = await amqplib.connect(url);
      this.channel = await this.connection.createChannel();

      this.connection.on("close", () => {
        console.error("RabbitMQ connection closed. Retrying...");
        this.isConnecting = false;
        setTimeout(() => this.connect(), 5000);
      });
      console.log("RabbitMQ connected, channel created");
      this.isConnecting = false;
    } catch (error) {
      console.error("RabbitMQ connection error:", error.message);
      this.isConnecting = false;
      setTimeout(() => this.connect(), 5000);
    }
  }
  async publish(exchange, routingKey, message) {
    if (!this.channel) {
      console.error(" Cannot publish: Channel not ready");
      return;
    }

    try {
      await this.channel.assertExchange(exchange, "topic", { durable: true });
      
      const success = this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );

      if (success) {
        console.log(`Event published → ${routingKey}`);
      }
    } catch (error) {
      console.error("Publishing error:", error);
    }
  }

  async consume(queue, exchange, routingKey, handler) {
    if (!this.channel) {
      console.error("Cannot consume: Channel not ready");
      return;
    }

    await this.channel.assertExchange(exchange, "topic", { durable: true });
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, exchange, routingKey);

    this.channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          
          this.channel.ack(msg);
        } catch (error) {
          console.error("Error in Consumer Handler:", error);
          this.channel.nack(msg, false, false);
        }
      }
    });
  }
}


module.exports = new RabbitMQ();