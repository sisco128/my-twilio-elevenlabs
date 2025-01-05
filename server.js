// server.js
import Fastify from "fastify";
import formBody from "@fastify/formbody";  // import the plugin
import fastifyWebsocket from "@fastify/websocket";
import { registerOutboundRoutes } from "./outbound-routes.js";

const fastify = Fastify({ logger: true });

// Register the formbody plugin first
fastify.register(formBody);

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
    // Use process.env.PORT so it works on Render
    await fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
