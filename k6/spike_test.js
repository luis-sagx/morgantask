/**
 * SPIKE TEST - MorgantTask API
 * Factor McCall: Reliability ante pico repentino de tráfico
 * Cómo ejecutar: ~/.local/bin/k6 run k6/spike_test.js
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000'

const spikeErrors  = new Rate('spike_error_rate')
const spikeLatency = new Trend('spike_latency', true)

export const options = {
  stages: [
    { duration: '15s', target: 5   },
    { duration: '10s', target: 100 },
    { duration: '30s', target: 100 },
    { duration: '10s', target: 5   },
    { duration: '30s', target: 5   },
    { duration: '10s', target: 0   },
  ],
  thresholds: {
    'http_req_failed':   ['rate<0.15'],
    'spike_error_rate':  ['rate<0.15'],
    'http_req_duration': ['p(95)<3000'],
    'spike_latency':     ['p(95)<3000'],
  },
}

const TEST_USER = {
  email:    __ENV.TEST_EMAIL    || 'testk6@morgantask.com',
  password: __ENV.TEST_PASSWORD || 'testpassword123',
}

export function setup() {
  const headers = { 'Content-Type': 'application/json' }
  http.post(`${BASE_URL}/api/auth/create-account`,
    JSON.stringify({ name: 'K6 Spike User', email: TEST_USER.email,
      password: TEST_USER.password, password_confirmation: TEST_USER.password }),
    { headers, responseCallback: http.expectedStatuses(200, 409) }
  )
  const loginRes = http.post(`${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password }), { headers })
  if (loginRes.status !== 200) return { token: null }
  return { token: loginRes.body.trim() }
}

export default function (data) {
  if (!data.token) return
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.token}` }

  // Lectura paginada (operación más común en pico)
  const res = http.get(`${BASE_URL}/api/projects?limit=5`, { headers })
  spikeLatency.add(res.timings.duration)
  const ok = check(res, {
    'spike: no timeout': (r) => r.status !== 0,
    'spike: no 5xx':     (r) => r.status < 500,
    'spike: 200':        (r) => r.status === 200,
  })
  spikeErrors.add(!ok)

  // Escritura ocasional (1 de cada 5) → usa _id devuelto
  if (__ITER % 5 === 0) {
    const writeRes = http.post(`${BASE_URL}/api/projects`,
      JSON.stringify({ projectName: `Spike ${__VU}-${__ITER}`, clientName: 'K6', description: 'Spike' }),
      { headers, tags: { name: 'POST /api/projects' } }
    )
    spikeLatency.add(writeRes.timings.duration)
    check(writeRes, { 'spike write: no 5xx': (r) => r.status < 500 })
  }

  sleep(0.1)
}

export function handleSummary(data) {
  const m = data.metrics
  const p95   = m.spike_latency?.values['p(95)']?.toFixed(2) ?? 'N/A'
  const p99   = m.spike_latency?.values['p(99)']?.toFixed(2) ?? 'N/A'
  const errR  = ((m.http_req_failed?.values?.rate ?? 0) * 100).toFixed(2)
  const total = m.http_reqs?.values?.count ?? 0
  const reliabilityPass = parseFloat(errR) < 15
  console.log(`
╔══════════════════════════════════════════════════════╗
║         SPIKE TEST — REPORTE McCALL                  ║
╠══════════════════════════════════════════════════════╣
║ Factor: Reliability ante picos de tráfico            ║
║ Resultado: ${reliabilityPass ? '✓ PASS (sistema resistió el pico)' : '✗ FAIL (sistema no resistió)'}  ║
╠══════════════════════════════════════════════════════╣
║   p95 durante pico : ${p95.padStart(8)}ms  (umbral <3000ms) ║
║   p99 durante pico : ${p99.padStart(8)}ms                   ║
║   Error rate       : ${errR.padStart(8)}%  (umbral <15%)   ║
║   Total requests   : ${String(total).padStart(8)}                    ║
╚══════════════════════════════════════════════════════╝
`)
  return {}
}
