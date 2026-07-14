import {
  collectDefaultMetrics,
  Counter,
  Gauge,
  Histogram,
  Registry,
} from 'prom-client'

export const metricsRegistry = new Registry()

metricsRegistry.setDefaultLabels({ application: 'tech-challenge' })

collectDefaultMetrics({
  prefix: 'tech_challenge_',
  register: metricsRegistry,
})

const httpLabelNames = ['method', 'route', 'status_code'] as const

export const httpRequestsTotal = new Counter({
  help: 'Quantidade total de requisicoes HTTP finalizadas.',
  labelNames: httpLabelNames,
  name: 'tech_challenge_http_requests_total',
  registers: [metricsRegistry],
})

export const httpRequestDurationSeconds = new Histogram({
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  help: 'Duracao das requisicoes HTTP em segundos.',
  labelNames: httpLabelNames,
  name: 'tech_challenge_http_request_duration_seconds',
  registers: [metricsRegistry],
})

export const httpRequestsInProgress = new Gauge({
  help: 'Quantidade de requisicoes HTTP em andamento.',
  labelNames: ['method', 'route'] as const,
  name: 'tech_challenge_http_requests_in_progress',
  registers: [metricsRegistry],
})
