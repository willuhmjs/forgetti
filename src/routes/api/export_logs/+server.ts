import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import logsStore from '$lib/logsStore';
import fs from 'fs';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const logs = await request.json();
    const filePath = './logs.txt';
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
    return new Response(fs.createReadStream(filePath), {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="logs.txt"'
      }
    });
  } catch (error) {
    return json({ error: 'Failed to export logs' }, { status: 500 });
  }
};
