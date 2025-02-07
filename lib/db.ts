import { sql } from '@vercel/postgres';

export async function checkExistingResponse(userId: string, festivalId: string) {
  try {
    const { rows } = await sql`
      SELECT response 
      FROM ai_responses 
      WHERE user_id = ${userId} 
      AND festival = ${festivalId}
      LIMIT 1
    `;
    return rows[0]?.response || null;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

export async function saveResponse(userId: string, festivalId: string, response: string) {
  try {
    console.log("Saving response:", userId, festivalId, response);
    await sql`
      INSERT INTO ai_responses (user_id, festival, response)
      VALUES (${userId}, ${festivalId}, ${response})
    `;
  } catch (error) {
    console.error('Error saving response:', error);
  }
} 