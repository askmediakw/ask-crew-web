import { API_CONTRACT, API_GROUPS } from '@/lib/api-contract'
import { CONFIG } from '@/lib/config'

function toPostmanItem(ep: (typeof API_CONTRACT)[number]) {
  const headers: { key: string; value: string }[] = [{ key: 'Content-Type', value: 'application/json' }]
  if (ep.auth) headers.push({ key: 'Authorization', value: 'Bearer {{token}}' })

  // Strip query string before splitting the path into Postman segments.
  const [rawPath] = ep.path.split('?')
  const pathSegments = rawPath.replace(/^\//, '').split('/')

  return {
    name: `${ep.title} — ${ep.method}`,
    request: {
      method: ep.method,
      header: headers,
      ...(ep.requestExample
        ? {
            body: {
              mode: 'raw',
              raw: JSON.stringify(ep.requestExample, null, 2),
              options: { raw: { language: 'json' } },
            },
          }
        : {}),
      url: {
        raw: `{{baseUrl}}${ep.path}`,
        host: ['{{baseUrl}}'],
        path: pathSegments,
      },
      description: ep.description,
    },
    response: [],
  }
}

/**
 * Builds a Postman Collection v2.1 object from the frontend API contract,
 * so the backend developer gets a ready-to-import file with every route,
 * required headers, and example bodies pre-filled.
 */
export function buildPostmanCollection() {
  return {
    info: {
      name: 'ASK CREW Admin — Frontend API Contract',
      description:
        'مجموعة Postman مُولّدة تلقائياً من مواصفات الواجهة الأمامية. تحتوي على كل المسارات والهيدرز المطلوبة.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    variable: [
      { key: 'baseUrl', value: CONFIG.API_BASE_URL || 'https://api.askcrew.com', type: 'string' },
      { key: 'token', value: '<JWT_TOKEN_HERE>', type: 'string' },
    ],
    // One Postman folder per module, each containing its endpoints.
    item: API_GROUPS.map((group) => ({
      name: group,
      item: API_CONTRACT.filter((ep) => ep.group === group).map(toPostmanItem),
    })).filter((folder) => folder.item.length > 0),
  }
}

/** Triggers a client-side download of the generated Postman collection. */
export function downloadPostmanCollection() {
  const collection = buildPostmanCollection()
  const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'askcrew-api.postman_collection.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
