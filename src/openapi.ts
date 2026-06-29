import { USERS_API_ROUTES } from "./modules/users/index.js";

import type { ApiRouteMetadata } from "./shared/http/index.js";

export const APP_API_ROUTES: readonly ApiRouteMetadata[] = [...USERS_API_ROUTES];
