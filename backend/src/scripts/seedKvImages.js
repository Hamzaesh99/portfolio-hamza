import fs from 'fs';
import path from 'path';

const accountId = 'c235fff592d8c5ea0b1723f17b120245';
const namespaceId = '91f83c42cddd4070b150c6719f2a65f4';
const token = process.env.CLOUDFLARE_API_TOKEN;

const uploadsDir = path.resolve('./uploads');
const files = fs.readdirSync(uploadsDir).filter(f => !f.endsWith('.txt'));

async function uploadToKv(filename) {
  const filePath = path.join(uploadsDir, filename);
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filename).toLowerCase();
  const contentType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';

  console.log(`Uploading ${filename} (${data.length} bytes)...`);

  // Upload file data
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${filename}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/octet-stream'
    },
    body: data
  });
  const resJson = await res.json();
  if (!resJson.success) {
    console.error(`Failed to upload ${filename}:`, resJson.errors);
  }

  // Upload metadata marker
  const metaUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/meta:${filename}?metadata=${encodeURIComponent(JSON.stringify({ contentType }))}`;
  await fetch(metaUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain'
    },
    body: '1'
  });

  console.log(`Uploaded ${filename} successfully!`);
}

async function main() {
  for (const f of files) {
    await uploadToKv(f);
  }
  console.log('All image assets uploaded to Cloudflare KV!');
}

main().catch(console.error);
