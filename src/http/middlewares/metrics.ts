import { type RequestHandler } from 'express'

import {
  httpRequestDurationSeconds,
  httpRequestsInProgress,
  httpRequestsTotal,
} from '../../observability/metrics'

const uuidPathSegment =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi

function getRouteLabel(request: Parameters<RequestHandler>[0]) {
  const routePath = request.route?.path

  if (typeof routePath === 'string') {
    return `${request.baseUrl}${routePath}`.replace(uuidPathSegment, ':id')
  }

  return request.path.replace(uuidPathSegment, ':id')
}

export const metricsMiddleware: RequestHandler = (request, response, next) => {
  if (request.path === '/metrics') {
    next()
    return
  }

  const startedAt = process.hrtime.bigint()
  let recorded = false

  httpRequestsInProgress.inc({
    method: request.method,
    route: getRouteLabel(request),
  })

  const recordMetrics = () => {
    if (recorded) {
      return
    }

    recorded = true

    const route = getRouteLabel(request)
    const method = request.method

    httpRequestsInProgress.dec({ method, route })

    if (!response.writableEnded) {
      return
    }

    const statusCode = String(response.statusCode)
    const durationInSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9
    const labels = { method, route, status_code: statusCode }

    httpRequestsTotal.inc(labels)
    httpRequestDurationSeconds.observe(labels, durationInSeconds)
  }

  response.once('finish', recordMetrics)
  response.once('close', recordMetrics)

  next()
}
