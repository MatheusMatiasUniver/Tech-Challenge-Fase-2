import request from 'supertest'

import { app } from '../../src/app'

describe('metrics HTTP flow', () => {
  it('exposes Node and HTTP metrics in the Prometheus format', async () => {
    await request(app).get('/health')

    const response = await request(app).get('/metrics')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toContain('text/plain')
    expect(response.text).toContain(
      'tech_challenge_process_resident_memory_bytes',
    )
    expect(response.text).toContain('tech_challenge_http_requests_total')
    expect(response.text).toMatch(
      /tech_challenge_http_requests_total\{[^}]*method="GET"[^}]*route="\/health"[^}]*status_code="200"[^}]*\} [1-9]\d*/,
    )
  })
})
