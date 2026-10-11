// All traffic goes through the API gateway - never directly to a microservice port.
export const environment = { apiUrl: 'http://localhost:8080' };
