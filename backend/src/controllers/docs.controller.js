import { getApiCatalogPayload, getOpenApiSpecPayload } from '../services/docs.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { sendSuccess } from '../utils/api-response.js';

export const getOpenApiSpec = asyncHandler(async (request, response) => {
  void request;

  const spec = await getOpenApiSpecPayload();

  return sendSuccess(response, {
    message: 'OpenAPI specification fetched successfully',
    data: spec,
  });
});

export const getApiCatalog = asyncHandler(async (request, response) => {
  void request;

  const catalog = await getApiCatalogPayload();

  return sendSuccess(response, {
    message: 'API catalog fetched successfully',
    data: catalog,
  });
});