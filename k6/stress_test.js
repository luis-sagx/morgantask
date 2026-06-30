/**
 * STRESS TEST - MorgantTask API
 * Factor McCall: Reliability bajo carga extrema
 * Cómo ejecutar: ~/.local/bin/k6 run k6/stress_test.js
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend, Counter } from 'k6/metrics'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000'

const errorRate      = new Rate('stress_error_rate')
const responseTime   = new Trend('stress_response_time', true)
const failedRequests = new Counter('stress_failed_requests')

export const options = {
  stages: [
    { duration: '20s', target: 10  },
    { duration: '30s', target: 20  },
    { duration: '30s', target: 40  },
    { duration: '30s', target: 60  },
    { duration: '30s', target: 80  },
    { duration: '30s', target: 100 },
    { duration: '30s', target: 0   },
  ],
  thresholds: {
    'http_req_failed':      ['rate<0.10'],
    'stress_error_rate':    ['rate<0.10'],
    'http_req_duration':    ['p(99)<5000'],
    'stress_response_time': ['p(99)<5000'],
  },
}

const TEST_USER = {
  email:    __ENV.TEST_EMAIL    || 'testk6@morgantask.com',
  password: __ENV.TEST_PASSWORD || 'testpassword123',
}

export function setup() {
  const headers = { 'Content-Type': 'application/json' }
  http.post(`${BASE_URL}/api/auth/create-account`,
    JSON.stringify({ name: 'K6 Stress User', email: TEST_USER.email,
      password: TEST_USER.password, password_confirmation: TEST_USER.password }),
    { headers, responseCallback: http.expectedStatuses(200, 409) }
  )
  const loginRes = http.post(`${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password }), { headers })
  if (loginRes.status !== 200) { console.error(`Setup fallido: ${loginRes.status}`); return { token: null } }
  return { token: loginRes.body.trim() }
}

export default function (data) {
  if (!data.token) return
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.token}` }

  // Lectura paginada (rápida)
  // tag name fijo para evitar high-cardinality en métricas
  const listRes = http.get(`${BASE_URL}/api/projects?limit=5`, {
    headers,
    tags: { name: 'GET /api/projects' },
  })
  responseTime.add(listRes.timings.duration)
  const listOk = check(listRes, { 'stress GET /projects: 200': (r) => r.status === 200 })
  errorRate.add(!listOk ? 1 : 0)
  if (!listOk) failedRequests.add(1)

  sleep(0.1)

  // Escritura → usa _id devuelto directamente
  const createRes = http.post(`${BASE_URL}/api/projects`,
    JSON.stringify({ projectName: `Stress ${__VU}-${__ITER}`, clientName: 'K6', description: `VU=${__VU}` }),
    { headers, tags: { name: 'POST /api/projects' } }
  )
  responseTime.add(createRes.timings.duration)
  const createOk = check(createRes, {
    'stress POST /projects: 200': (r) => r.status === 200,
    'stress POST /projects: _id': (r) => { try { return Boolean(JSON.parse(r.body)._id) } catch { return false } },
  })
  errorRate.add(!createOk ? 1 : 0)
  if (!createOk) { failedRequests.add(1); sleep(0.3); return }

  let projectId = null
  try { projectId = JSON.parse(createRes.body)._id } catch {}

  if (projectId) {
    // tag name genérico — el ObjectId va en la URL pero no en las métricas
    const taskRes = http.post(
      `${BASE_URL}/api/projects/${projectId}/tasks`,
      JSON.stringify({ name: `Tarea Stress ${__VU}-${__ITER}`, description: 'Stress task' }),
      { headers, tags: { name: 'POST /api/projects/:id/tasks' } }
    )
    responseTime.add(taskRes.timings.duration)
    const taskOk = check(taskRes, { 'stress POST /tasks: 200': (r) => r.status === 200 })
    errorRate.add(!taskOk ? 1 : 0)
    if (!taskOk) failedRequests.add(1)
  }

  sleep(0.3)
}

export function handleSummary(data) {
  const m = data.metrics
  const p50    = m.stress_response_time?.values['p(50)']?.toFixed(2)  ?? 'N/A'
  const p95    = m.stress_response_time?.values['p(95)']?.toFixed(2)  ?? 'N/A'
  const p99    = m.stress_response_time?.values['p(99)']?.toFixed(2)  ?? 'N/A'
  const errR   = ((m.http_req_failed?.values?.rate ?? 0) * 100).toFixed(2)
  const failed = m.stress_failed_requests?.values?.count ?? 0
  const total  = m.http_reqs?.values?.count ?? 0
  const rps    = m.http_reqs?.values?.rate?.toFixed(2) ?? 'N/A'
  console.log(`
╔══════════════════════════════════════════════════════╗
║         STRESS TEST — REPORTE McCALL                 ║
╠══════════════════════════════════════════════════════╣
║ Factor: Reliability bajo carga extrema               ║
╠══════════════════════════════════════════════════════╣
║ Latencia bajo estrés:                                ║
║   p50  : ${p50.padStart(8)}ms                              ║
║   p95  : ${p95.padStart(8)}ms                              ║
║   p99  : ${p99.padStart(8)}ms                              ║
╠══════════════════════════════════════════════════════╣
║ Reliability:                                         ║
║   Error rate    : ${errR.padStart(7)}%  (umbral < 10%)          ║
║   Fallos totales: ${String(failed).padStart(7)}                       ║
║   Total requests: ${String(total).padStart(7)}  (${rps} RPS)              ║
╚══════════════════════════════════════════════════════╝
`)
  return {}
}
