import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const logs = await request.json();
    const logsString = JSON.stringify(logs, null, 2);
    return new Response(logsString, {
      headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="logs.txt"`
      }
    });
  } catch (error) {
    return json({ error: 'Failed to export logs' }, { status: 500 });
  }
};
