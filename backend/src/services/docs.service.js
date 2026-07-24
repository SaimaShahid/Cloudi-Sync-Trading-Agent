import { readFile } from 'node:fs/promises';
import path from 'node:path';

const openApiFilePath = path.resolve(process.cwd(), 'src/docs/openapi.json');

const buildCatalogFromSpec = (spec) => {
  const endpoints = [];

  for (const [pathName, pathOperations] of Object.entries(spec.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathOperations)) {
      endpoints.push({
        method: method.toUpperCase(),
        path: pathName,
        operationId: operation.operationId ?? null,
        summary: operation.summary ?? null,
        tags: operation.tags ?? [],
        requiresAuth: Boolean(operation.security?.length),
      });
    }
  }

  return {
    name: spec.info?.title ?? 'Cloudi Sync Backend API',
    version: spec.info?.version ?? '1.0.0',
    basePath: '/api/v1',
    totalEndpoints: endpoints.length,
    endpoints,
    generatedAt: new Date().toISOString(),
  };
};

export const getOpenApiSpecPayload = async () => {
  const rawContent = await readFile(openApiFilePath, 'utf-8');
  return JSON.parse(rawContent);
};

export const getApiCatalogPayload = async () => {
  const spec = await getOpenApiSpecPayload();
  return buildCatalogFromSpec(spec);
};