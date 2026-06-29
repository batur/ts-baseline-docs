import { createContainer } from "./container.js";
import { createServer } from "./server.js";

import type { AppServer } from "./server.js";

export function bootstrapApp(): AppServer {
  return createServer(createContainer());
}
