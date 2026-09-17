import { createHash, createHmac } from 'node:crypto';

/**
 * A minimal S3 client: PUT, GET, LIST and DELETE, signed with AWS SigV4.
 *
 * Written rather than installed for the same reason the password hashing is:
 * @aws-sdk/client-s3 pulls tens of megabytes and a dependency tree to keep
 * patched, for four requests. SigV4 is a published algorithm and a mistake in
 * it fails loudly — the request is rejected — rather than silently weakening
 * anything. The round trip is tested against the real bucket.
 */

export type S3Config = {
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  endpoint: string;          // https://t3.storageapi.dev
};

/** The bucket's configuration, or null when it has not been wired up yet. */
export function s3Config(): S3Config | null {
  const bucket = process.env.BACKUP_BUCKET;
  const accessKeyId = process.env.BACKUP_ACCESS_KEY_ID;
  const secretAccessKey = process.env.BACKUP_SECRET_ACCESS_KEY;
  const endpoint = process.env.BACKUP_ENDPOINT;
  if (!bucket || !accessKeyId || !secretAccessKey || !endpoint) return null;
  return {
    bucket, accessKeyId, secretAccessKey, endpoint,
    region: process.env.BACKUP_REGION || 'auto',
  };
}

const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
const hmac = (key: string | Buffer, data: string) => createHmac('sha256', key).update(data).digest();

/** RFC 3986. S3 signing is stricter than encodeURIComponent: '!' and friends must be escaped. */
const uriEncode = (s: string, encodeSlash = true) =>
  s.split('').map((c) => {
    if (/[A-Za-z0-9._~-]/.test(c)) return c;
    if (c === '/') return encodeSlash ? '%2F' : '/';
    return Array.from(Buffer.from(c, 'utf8'))
      .map((b) => `%${b.toString(16).toUpperCase().padStart(2, '0')}`).join('');
  }).join('');

function signingKey(cfg: S3Config, date: string): Buffer {
  const kDate = hmac(`AWS4${cfg.secretAccessKey}`, date);
  const kRegion = hmac(kDate, cfg.region);
  const kService = hmac(kRegion, 's3');
  return hmac(kService, 'aws4_request');
}

async function signedFetch(cfg: S3Config, opts: {
  method: 'PUT' | 'GET' | 'DELETE' | 'HEAD';
  key?: string;
  query?: Record<string, string>;
  body?: Buffer;
}): Promise<Response> {
  const base = new URL(cfg.endpoint);
  // Virtual-hosted style: the bucket is a subdomain of the endpoint.
  const host = `${cfg.bucket}.${base.host}`;
  const path = `/${opts.key ? uriEncode(opts.key, false) : ''}`;

  const query = opts.query ?? {};
  const canonicalQuery = Object.keys(query).sort()
    .map((k) => `${uriEncode(k)}=${uriEncode(query[k])}`).join('&');

  const body = opts.body ?? Buffer.alloc(0);
  const payloadHash = sha256(body);

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');   // 20260917T003000Z
  const date = amzDate.slice(0, 8);

  const headers: Record<string, string> = {
    host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  };
  const signedHeaders = Object.keys(headers).sort().join(';');
  const canonicalHeaders = Object.keys(headers).sort()
    .map((h) => `${h}:${headers[h].trim()}\n`).join('');

  const canonicalRequest = [
    opts.method, path, canonicalQuery, canonicalHeaders, signedHeaders, payloadHash,
  ].join('\n');

  const scope = `${date}/${cfg.region}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest),
  ].join('\n');

  const signature = hmac(signingKey(cfg, date), stringToSign).toString('hex');

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${scope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const url = `${base.protocol}//${host}${path}${canonicalQuery ? `?${canonicalQuery}` : ''}`;
  return fetch(url, {
    method: opts.method,
    headers: { ...headers, Authorization: authorization },
    body: opts.method === 'PUT' ? new Uint8Array(body) : undefined,
  });
}

const failed = async (res: Response, what: string): Promise<never> => {
  // S3 reports failures as XML, and the message in it is the only thing that
  // says whether this was credentials, the bucket name or the signature.
  const detail = (await res.text().catch(() => '')).slice(0, 400);
  throw new Error(`${what} failed: ${res.status} ${res.statusText} ${detail}`);
};

export async function putObject(cfg: S3Config, key: string, body: Buffer): Promise<void> {
  const res = await signedFetch(cfg, { method: 'PUT', key, body });
  if (!res.ok) await failed(res, `Upload of ${key}`);
}

export async function getObject(cfg: S3Config, key: string): Promise<Buffer> {
  const res = await signedFetch(cfg, { method: 'GET', key });
  if (!res.ok) await failed(res, `Download of ${key}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function deleteObject(cfg: S3Config, key: string): Promise<void> {
  const res = await signedFetch(cfg, { method: 'DELETE', key });
  // 204 on success; 404 means it is already gone, which is the desired state.
  if (!res.ok && res.status !== 404) await failed(res, `Delete of ${key}`);
}

export type S3Object = { key: string; size: number; lastModified: string };

export async function listObjects(cfg: S3Config, prefix = ''): Promise<S3Object[]> {
  const out: S3Object[] = [];
  let token: string | undefined;

  do {
    const query: Record<string, string> = { 'list-type': '2', 'max-keys': '1000' };
    if (prefix) query.prefix = prefix;
    if (token) query['continuation-token'] = token;

    const res = await signedFetch(cfg, { method: 'GET', query });
    if (!res.ok) await failed(res, 'Listing the bucket');
    const xml = await res.text();

    for (const m of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const part = m[1];
      const key = /<Key>([\s\S]*?)<\/Key>/.exec(part)?.[1];
      if (!key) continue;
      out.push({
        key: key.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
        size: Number(/<Size>(\d+)<\/Size>/.exec(part)?.[1] ?? 0),
        lastModified: /<LastModified>([\s\S]*?)<\/LastModified>/.exec(part)?.[1] ?? '',
      });
    }

    const truncated = /<IsTruncated>true<\/IsTruncated>/.test(xml);
    token = truncated
      ? /<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/.exec(xml)?.[1]
      : undefined;
  } while (token);

  return out;
}
