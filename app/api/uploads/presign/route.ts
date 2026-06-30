import { ok, fail, safe } from '@/lib/server/mock'

// #38 — S3 pre-signed URL stub for direct-to-cloud video uploads (bypasses the
// Next.js API body-size limit). Accepts { filename, contentType, sizeBytes }
// and returns a mock PUT URL + the eventual public object key.
//
// To go live: set AWS_REGION + AWS_S3_BUCKET (+ credentials) and replace the
// TODO block with @aws-sdk/s3-request-presigner getSignedUrl().

const MAX_BYTES = 5 * 1024 * 1024 * 1024 // 5 GB ceiling for VOD masters

export async function POST(req: Request) {
  let body: { filename?: string; contentType?: string; sizeBytes?: number }
  try {
    body = await req.json()
  } catch {
    return fail('Invalid JSON body')
  }

  const filename = body.filename?.trim()
  if (!filename) return fail('filename is required')
  if (body.sizeBytes && body.sizeBytes > MAX_BYTES) {
    return fail('File exceeds the 5GB upload limit', 413)
  }

  const contentType = body.contentType ?? 'application/octet-stream'
  // Namespaced, collision-resistant object key.
  const key = `vod/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${filename.replace(/\s+/g, '_')}`

  const { value, mock } = await safe(
    ['AWS_S3_BUCKET', 'AWS_REGION'],
    async () => {
      // TODO: BACKEND — generate a real pre-signed PUT URL via the AWS SDK.
      throw new Error('S3 not configured')
    },
    () => ({
      method: 'PUT' as const,
      key,
      contentType,
      // Mock URL shaped like a real S3 pre-signed URL.
      uploadUrl: `https://mock-bucket.s3.amazonaws.com/${key}?X-Amz-Signature=mock&X-Amz-Expires=900`,
      publicUrl: `https://mock-bucket.s3.amazonaws.com/${key}`,
      expiresInSeconds: 900,
    }),
  )

  return ok(value, mock)
}
