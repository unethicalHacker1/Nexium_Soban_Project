// src/app/api/journal/route.js

import { connectToDatabase } from '../../../lib/mongodb';
import Journal from '../../../models/journal';


export async function POST(req) {
  try {
    const body = await req.json();
    const { user_id, journalText, reflectionText } = body;

    if (!user_id || !journalText) {
      return new Response(JSON.stringify({ success: false, error: 'Missing fields' }), {
        status: 400,
      });
    }

    await connectToDatabase();

    const journal = await Journal.create({
      user_id,
      journalText,
      reflectionText,
    });

    return new Response(JSON.stringify({ success: true, data: journal }), {
      status: 201,
    });
  } catch (err) {
    console.error('Error saving journal:', err);
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
    });
  }
}
