/**
 * SMOKE TEST - MorgantTask API
 * Factor McCall: Correctness (funcionalidad básica sin errores)
 * Cómo ejecutar: ~/.local/bin/k6 run k6/smoke_test.js
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend, Rate } from 'k6/metrics'

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000'

const authDuration    = new Trend('auth_duration',    true)
const projectDuration = new Trend('project_duration', true)
const taskDuration    = new Trend('task_duration',    true)
const errorRate       = new Rate('error_rate')

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed:   ['rate<0.01'],
    error_rate:        ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
  },
}

const TEST_USER = {
  email:    __ENV.TEST_EMAIL    || 'testk6@morgantask.com',
  password: __ENV.TEST_PASSWORD || 'testpassword123',
}

export function setup() {
  const headers = { 'Content-Type': 'application/json' }
  http.post(
    `${BASE_URL}/api/auth/create-account`,
    JSON.stringify({ name: 'K6 Smoke User', email: TEST_USER.email,
      password: TEST_USER.password, password_confirmation: TEST_USER.password }),
    { headers, responseCallback: http.expectedStatuses(200, 409) }
  )
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password }),
    { headers }
  )
  if (loginRes.status !== 200) { console.error(`Login falló: ${loginRes.status}`); return { token: null } }
  return { token: loginRes.body.trim() }
}

export default function (data) {
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.token}` }

  // 1. GET /api/auth/user
  const userRes = http.get(`${BASE_URL}/api/auth/user`, { headers })
  authDuration.add(userRes.timings.duration)
  const authOk = check(userRes, {
    '[Auth] 200':        (r) => r.status === 200,
    '[Auth] tiene name': (r) => { try { return Boolean(JSON.parse(r.body).name) } catch { return false } },
  })
  errorRate.add(!authOk)
  sleep(0.2)

  // 2. POST /api/projects → devuelve proyecto con _id
  const createProjRes = http.post(`${BASE_URL}/api/projects`,
    JSON.stringify({ projectName: `Smoke ${Date.now()}`, clientName: 'K6', description: 'Smoke test' }),
    { headers, tags: { name: 'POST /api/projects' } }
  )
  projectDuration.add(createProjRes.timings.duration)
  const projOk = check(createProjRes, {
    '[Project] POST 200':  (r) => r.status === 200,
    '[Project] tiene _id': (r) => { try { return Boolean(JSON.parse(r.body)._id) } catch { return false } },
  })
  errorRate.add(!projOk)

  let projectId = null
  try { projectId = JSON.parse(createProjRes.body)._id } catch {}
  if (!projectId) { sleep(1); return }
  sleep(0.2)

  // 3. GET /api/projects (paginado, limit=5)
  const listRes = http.get(`${BASE_URL}/api/projects?limit=5`, { headers })
  projectDuration.add(listRes.timings.duration)
  check(listRes, {
    '[Project] GET 200':  (r) => r.status === 200,
    '[Project] es array': (r) => { try { return Array.isArray(JSON.parse(r.body)) } catch { return false } },
  })
  sleep(0.2)

  // 4. POST tarea → devuelve tarea con _id
  const createTaskRes = http.post(
    `${BASE_URL}/api/projects/${projectId}/tasks`,
    JSON.stringify({ name: `Tarea Smoke ${Date.now()}`, description: 'Smoke task' }),
    { headers, tags: { name: 'POST /api/projects/:id/tasks' } }
  )
  taskDuration.add(createTaskRes.timings.duration)
  const taskOk = check(createTaskRes, {
    '[Task] POST 200':  (r) => r.status === 200,
    '[Task] tiene _id': (r) => { try { return Boolean(JSON.parse(r.body)._id) } catch { return false } },
  })
  errorRate.add(!taskOk)

  let taskId = null
  try { taskId = JSON.parse(createTaskRes.body)._id } catch {}
  if (!taskId) { sleep(1); return }
  sleep(0.2)

  // 5. GET tareas
  const listTasksRes = http.get(`${BASE_URL}/api/projects/${projectId}/tasks`, { headers, tags: { name: 'GET /api/projects/:id/tasks' } })
  taskDuration.add(listTasksRes.timings.duration)
  check(listTasksRes, { '[Task] GET 200': (r) => r.status === 200 })
  sleep(0.2)

  // 6. Cambiar estado
  const statusRes = http.post(
    `${BASE_URL}/api/projects/${projectId}/tasks/${taskId}/status`,
    JSON.stringify({ status: 'inProgress' }),
    { headers, tags: { name: 'POST /api/projects/:id/tasks/:id/status' } }
  )
  check(statusRes, { '[Task] status 200': (r) => r.status === 200 })
  sleep(0.2)

  // 7. Nota
  const noteRes = http.post(
    `${BASE_URL}/api/projects/${projectId}/tasks/${taskId}/notes`,
    JSON.stringify({ content: 'Nota smoke test' }),
    { headers, tags: { name: 'POST /api/projects/:id/tasks/:id/notes' } }
  )
  check(noteRes, { '[Note] POST 200': (r) => r.status === 200 })
  sleep(1)
}

export function handleSummary(data) {
  const passed = (data.metrics.http_req_failed?.values?.rate ?? 1) < 0.01
  const p95    = data.metrics.http_req_duration?.values['p(95)']?.toFixed(2) ?? 'N/A'
  const errR   = ((data.metrics.http_req_failed?.values?.rate ?? 0) * 100).toFixed(2)
  const total  = data.metrics.http_reqs?.values?.count ?? 0
  console.log(`\n============================`)
  console.log(` SMOKE TEST - ${passed ? '✓ PASSED' : '✗ FAILED'}`)
  console.log(`============================`)
  console.log(` Requests totales : ${total}`)
  console.log(` Error rate       : ${errR}%`)
  console.log(` p95 latencia     : ${p95}ms`)
  console.log(`============================\n`)
  return {}
}
