// server.js
import Fastify from "fastify";
import formBody from "@fastify/formbody";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCors from "@fastify/cors";
import { registerOutboundRoutes } from "./outbound-routes.js";

const fastify = Fastify({ logger: true });

// Register the CORS plugin
fastify.register(fastifyCors, {
  origin: "*", // Replace with your Bubble.io app's URL
  methods: ["POST", "GET", "OPTIONS"],
  credentials: true
});

// Register the formbody plugin
fastify.register(formBody);

// API Key authentication
fastify.addHook("preHandler", async (request, reply) => {
  // Exclude public routes if any (optional)
  const publicRoutes = ['/public-route']; // Add any public routes here
  if (publicRoutes.includes(request.routerPath)) {
    return;
  }

  const apiKey = request.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) { // Ensure you set API_KEY in your environment
    reply.code(401).send({ error: "Unauthorized" });
  }
});

fastify.post('/test-form', async (request, reply) => {
  const body = request.body;
  return { received: body };
});

// Register the WebSocket plugin
fastify.register(fastifyWebsocket);

// Register your custom outbound routes
registerOutboundRoutes(fastify);

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
