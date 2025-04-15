import { NodeSDK } from '@opentelemetry/sdk-node'
import { Resource } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

if (process.env.OTLP_ENDPOINT) {
  // Check conf Envirronment variable

  if (!process.env.ENVIRONMENT) {
    console.warn('Env var ENVIRONMENT is not set')
    process.exit(1)
  }
  if (!process.env.APP_VERSION) {
    console.warn('Env var APP_VERSION is not set')
    process.exit(1)
  }

  // Create an OTLP trace exporter
  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTLP_ENDPOINT,
  })

  // Create an OpenTelemetry SDK
  const sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: 'beep-api',
      [ATTR_SERVICE_VERSION]: process.env.APP_VERSION,
      environment: process.env.ENVIRONMENT,
    }),
    traceExporter: traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
  })

  // Start OpenTelemetry
  try {
    sdk.start()
    console.info('OpenTelemetry initialized')
  } catch (err) {
    console.error('Error while initializing open telemetry', err)
  }

  // Stop OpenTelemetry on SIGTERM
  process.on('SIGTERM', async () => {
    try {
      await sdk.shutdown()
      console.info('OpenTelemetry stopped correctly')
    } catch (err) {
      console.error('Error when stopping OpenTelemetry', err)
    } finally {
      process.exit(0)
    }
  })
} else {
  console.warn('OpenTelemetry not started because OTLP_ENDPOINT is not set')
}
