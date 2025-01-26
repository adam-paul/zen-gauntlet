import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from 'https://deno.land/x/openai@v4.24.0/mod.ts';
import { corsHeaders } from '../_shared/cors.ts';

const openai = new OpenAI(Deno.env.get('OPENAI_API_KEY')!);
const MAX_RETRIES = 3;

const SYSTEM_PROMPT = `You are a tag inference system. Given a ticket description, extract 1-5 relevant tags.
Rules:
- Each tag should be 1-3 words maximum
- Tags should be lowercase and use hyphens for spaces
- Focus on key themes, technologies, or categories
- Be concise and specific
- Return only the tags as a JSON array of strings`;

interface RequestBody {
  description: string;
}

async function getTagsFromGPT(description: string): Promise<string[]> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // DO NOT CHANGE THIS
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: description }
        ],
        temperature: 0.3,
        max_tokens: 150
      });

      console.log(`Attempt ${attempt} GPT Response:`, completion.choices[0].message.content);
      
      // Clean up markdown formatting if present
      let contentToParse = completion.choices[0].message.content || '[]';
      if (contentToParse.includes('```')) {
        contentToParse = contentToParse
          .replace(/```json\n/g, '')
          .replace(/```\n/g, '')
          .replace(/```/g, '')
          .trim();
      }
      
      const suggestedTags = JSON.parse(contentToParse);
      if (!Array.isArray(suggestedTags)) {
        throw new Error('Response is not an array');
      }

      // If we got an empty array and have retries left, throw an error to trigger retry
      if (suggestedTags.length === 0 && attempt < MAX_RETRIES) {
        throw new Error('Empty tags array received');
      }

      return suggestedTags;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error;
      
      // If this was the last attempt, throw the error
      if (attempt === MAX_RETRIES) {
        throw new Error('Inference unavailable at this time. Please try again later.');
      }
      
      // Wait a short time before retrying (500ms * attempt number)
      await new Promise(resolve => setTimeout(resolve, 500 * attempt));
    }
  }

  // This should never be reached due to the throw in the loop, but TypeScript needs it
  throw lastError || new Error('Unknown error occurred');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Rate limiting check (implement via Supabase)
    const client = req.headers.get('x-client-info');
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const { description } = await req.json() as RequestBody;
    
    if (!description || description.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Description is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const suggestedTags = await getTagsFromGPT(description);

    return new Response(
      JSON.stringify({ tags: suggestedTags }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error inferring tags:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to infer tags' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
}); 