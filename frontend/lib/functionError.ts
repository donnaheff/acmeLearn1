import { FunctionsHttpError } from '@supabase/supabase-js';

// supabase-js's default error.message for a non-2xx Edge Function response is
// just "Edge Function returned a non-2xx status code" — the actual reason
// our functions return (e.g. a Zoom auth failure, "OPENAI_API_KEY not set")
// lives in the response body, only reachable via error.context.
export async function functionErrorMessage(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      if (typeof body?.error === 'string') return body.error;
    } catch {
      // fall through to the generic message below
    }
  }
  return error instanceof Error ? error.message : 'Something went wrong.';
}
