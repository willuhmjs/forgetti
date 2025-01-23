import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import logsStore from '$lib/logsStore';
import fs from 'fs';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const logs = await request.json();
    const logsString = JSON.stringify(logs, null, 2);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `logs-${timestamp}.txt`;
    return new Response(logsString, {
      headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    return json({ error: 'Failed to export logs' }, { status: 500 });
  }
};
