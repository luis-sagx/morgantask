/**
 * LOAD TEST - MorgantTask API
 * Factor McCall: Efficiency (p95 < 200ms) + Reliability (error < 1%)
 * Cómo ejecutar: ~/.local/bin/k6 run k6/load_test.js
 */

import http from 'k6/http'
import { check, group, sleep } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000'

const authLatency    = new Trend('mcall_efficiency_auth',    true)
const projectLatency = new Trend('mcall_efficiency_project', true)
const taskLatency    = new Trend('mcall_efficiency_task',    true)
const noteLatency    = new Trend('mcall_efficiency_note',    true)
const errorRate      = new Rate('mcall_reliability_errors')
const requestCount   = new Counter('total_requests')

export const options = {
  stages: [
    { duration: '1m',  target: 5  },
    { duration: '3m',  target: 20 },
    { duration: '1m',  target: 20 },
    { duration: '1m',  target: 0  },
  ],
  thresholds: {
    'http_req_duration':        ['p(95)<200', 'p(99)<500'],
    'mcall_efficiency_auth':    ['p(95)<200'],
    'mcall_efficiency_project': ['p(95)<200'],
    'mcall_efficiency_task':    ['p(95)<200'],
    'mcall_efficiency_note':    ['p(95)<200'],
    'http_req_failed':          ['rate<0.01'],
    'mcall_reliability_errors': ['rate<0.01'],
    'checks':                   ['rate>0.95'],
  },
}

const TEST_USER = {
  email:    __ENV.TEST_EMAIL    || 'testk6@morgantask.com',
  password: __ENV.TEST_PASSWORD || 'testpassword123',
}

export function setup() {
  const headers = { 'Content-Type': 'application/json' }
  http.post(`${BASE_URL}/api/auth/create-account`,
    JSON.stringify({ name: 'K6 Load User', email: TEST_USER.email,
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

  // ── Auth ──────────────────────────────────────────────────────────────────
  group('Auth', () => {
    const res = http.get(`${BASE_URL}/api/auth/user`, { headers })
    authLatency.add(res.timings.duration)
    requestCount.add(1)
    const ok = check(res, {
      'auth/user: 200':     (r) => r.status === 200,
      'auth/user: <200ms':  (r) => r.timings.duration < 200,
    })
    errorRate.add(!ok)
  })

  sleep(0.2)

  let projectId = null

  // ── Proyectos ─────────────────────────────────────────────────────────────
  group('Projects', () => {
    // Crear → usa _id devuelto directamente
    const createRes = http.post(`${BASE_URL}/api/projects`,
      JSON.stringify({ projectName: `Load ${__VU}-${__ITER}`, clientName: 'K6', description: `VU=${__VU}` }),
      { headers, tags: { name: 'POST /api/projects' } }
    )
    projectLatency.add(createRes.timings.duration)
    requestCount.add(1)
    const createOk = check(createRes, {
      'project POST: 200':    (r) => r.status === 200,
      'project POST: _id':    (r) => { try { return Boolean(JSON.parse(r.body)._id) } catch { return false } },
      'project POST: <200ms': (r) => r.timings.duration < 200,
    })
    errorRate.add(!createOk)
    try { projectId = JSON.parse(createRes.body)._id } catch {}

    sleep(0.1)

    // Listar con paginación (limit=5)
    const listRes = http.get(`${BASE_URL}/api/projects?limit=5`, { headers })
    projectLatency.add(listRes.timings.duration)
    requestCount.add(1)
    check(listRes, {
      'project GET: 200':    (r) => r.status === 200,
      'project GET: <200ms': (r) => r.timings.duration < 200,
    })
  })

  sleep(0.2)

  let taskId = null

  // ── Tareas ────────────────────────────────────────────────────────────────
  if (projectId) {
    group('Tasks', () => {
      // Crear → usa _id devuelto directamente
      const createTaskRes = http.post(
        `${BASE_URL}/api/projects/${projectId}/tasks`,
        JSON.stringify({ name: `Task ${__VU}-${__ITER}`, description: `VU=${__VU}` }),
        { headers, tags: { name: 'POST /api/projects/:id/tasks' } }
      )
      taskLatency.add(createTaskRes.timings.duration)
      requestCount.add(1)
      const taskOk = check(createTaskRes, {
        'task POST: 200':    (r) => r.status === 200,
        'task POST: _id':    (r) => { try { return Boolean(JSON.parse(r.body)._id) } catch { return false } },
        'task POST: <200ms': (r) => r.timings.duration < 200,
      })
      errorRate.add(!taskOk)
      try { taskId = JSON.parse(createTaskRes.body)._id } catch {}

      sleep(0.1)

      // Listar tareas del proyecto (solo tiene 1 tarea recién creada)
      const listTasksRes = http.get(`${BASE_URL}/api/projects/${projectId}/tasks`, { headers, tags: { name: 'GET /api/projects/:id/tasks' } })
      taskLatency.add(listTasksRes.timings.duration)
      requestCount.add(1)
      check(listTasksRes, {
        'task GET: 200':    (r) => r.status === 200,
        'task GET: <200ms': (r) => r.timings.duration < 200,
      })

      sleep(0.1)

      // Cambiar estado
      if (taskId) {
        const statuses = ['pending', 'onHold', 'inProgress', 'underReview', 'completed']
        const statusRes = http.post(
          `${BASE_URL}/api/projects/${projectId}/tasks/${taskId}/status`,
          JSON.stringify({ status: statuses[Math.floor(Math.random() * statuses.length)] }),
          { headers, tags: { name: 'POST /api/projects/:id/tasks/:id/status' } }
        )
        taskLatency.add(statusRes.timings.duration)
        requestCount.add(1)
        check(statusRes, {
          'task status: 200':    (r) => r.status === 200,
          'task status: <200ms': (r) => r.timings.duration < 200,
        })
      }
    })
  }

  sleep(0.2)

  // ── Notas ─────────────────────────────────────────────────────────────────
  if (projectId && taskId) {
    group('Notes', () => {
      const createNoteRes = http.post(
        `${BASE_URL}/api/projects/${projectId}/tasks/${taskId}/notes`,
        JSON.stringify({ content: `Nota VU=${__VU} iter=${__ITER}` }),
        { headers, tags: { name: 'POST /api/projects/:id/tasks/:id/notes' } }
      )
      noteLatency.add(createNoteRes.timings.duration)
      requestCount.add(1)
      check(createNoteRes, {
        'note POST: 200':    (r) => r.status === 200,
        'note POST: <200ms': (r) => r.timings.duration < 200,
      })
    })
  }

  sleep(0.5)
}

export function handleSummary(data) {
  const m = data.metrics
  const p95  = m.http_req_duration?.values['p(95)']?.toFixed(2)  ?? 'N/A'
  const p99  = m.http_req_duration?.values['p(99)']?.toFixed(2)  ?? 'N/A'
  const errR = ((m.http_req_failed?.values?.rate ?? 0) * 100).toFixed(2)
  const chkR = ((m.checks?.values?.rate ?? 0) * 100).toFixed(2)
  const total = m.http_reqs?.values?.count ?? 0
  const rps   = m.http_reqs?.values?.rate?.toFixed(2) ?? 'N/A'

  const efficiencyPass  = parseFloat(p95) < 200
  const reliabilityPass = parseFloat(errR) < 1
  const correctnessPass = parseFloat(chkR) > 95
  const overallPass     = efficiencyPass && reliabilityPass && correctnessPass

  console.log(`
╔══════════════════════════════════════════════════════╗
║         LOAD TEST — REPORTE MODELO McCALL            ║
╠══════════════════════════════════════════════════════╣
║ Resultado global  : ${overallPass ? '✓ PASSED' : '✗ FAILED'}                          ║
╠══════════════════════════════════════════════════════╣
║ FACTOR McCALL        VALOR     UMBRAL    RESULTADO   ║
║ Efficiency (p95)   : ${p95.padStart(7)}ms  <200ms   ${efficiencyPass  ? '✓ PASS' : '✗ FAIL'}   ║
║ Reliability (err%) : ${errR.padStart(7)}%   <1%      ${reliabilityPass ? '✓ PASS' : '✗ FAIL'}   ║
║ Correctness (chk%) : ${chkR.padStart(7)}%   >95%     ${correctnessPass ? '✓ PASS' : '✗ FAIL'}   ║
╠══════════════════════════════════════════════════════╣
║ Estadísticas:                                        ║
║   Total requests : ${String(total).padStart(7)}                        ║
║   RPS            : ${String(rps).padStart(7)}                        ║
║   p99 latencia   : ${p99.padStart(7)}ms                        ║
╚══════════════════════════════════════════════════════╝
`)
  return {}
}
