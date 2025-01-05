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
  // Define public routes that do not require API key authentication
  const publicRoutes = [
    "/outbound-call-twiml",
    "/outbound-media-stream",
    "/test-form" // Add any other public routes if necessary
  ];

  // Extract the pathname from the URL
  const url = new URL(`http://${request.headers.host}${request.raw.url}`);
  const pathname = url.pathname;

  // Check if the current route is public
  if (publicRoutes.includes(pathname)) {
    return; // Skip API key authentication
  }

  // For non-public routes, validate the API key
  const apiKey = request.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
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
