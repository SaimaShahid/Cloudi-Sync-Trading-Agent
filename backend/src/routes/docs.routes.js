import { Router } from 'express';

import { getApiCatalog, getOpenApiSpec } from '../controllers/docs.controller.js';

export const docsRouter = Router();

docsRouter.get('/openapi.json', getOpenApiSpec);
docsRouter.get('/catalog', getApiCatalog);