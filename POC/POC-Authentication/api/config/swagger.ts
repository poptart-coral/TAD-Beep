import path from 'node:path'
import url from 'node:url'

export default {
  // path: __dirname + "/../", for AdonisJS v5
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../', // for AdonisJS v6
  title: 'Foo', // use info instead
  version: '1.0.0', // use info instead
  description: '', // use info instead
  tagIndex: 1,
  info: {
    title: 'Beep OpenAPI',
    version: '0.1.0',
    description: 'Documentation of the Beep api in OpenAPI 3.0 format',
  },
  snakeCase: true,

  debug: false, // set to true, to get some useful debug output
  ignore: [
    '/swagger',
    '/docs',
    '/__transmit/events',
    '/__transmit/subscribe',
    '/__transmit/unsubscribe',
  ], // routes to ignore
  preferredPutPatch: 'PUT', // if PUT/PATCH are provided for the same route, prefer PUT
  common: {
    parameters: {}, // OpenAPI conform parameters that are commonly used
    headers: {}, // OpenAPI conform headers that are commonly used
  },
  securitySchemes: {}, // optional
  authMiddlewares: ['auth'], // optional
  defaultSecurityScheme: 'BearerAuth', // optional
  persistAuthorization: true, // persist authorization between reloads on the swagger page
  showFullPath: true, // the path displayed after endpoint summary
}
