import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { OpenAI } from 'https://deno.land/x/openai@v4.24.0/mod.ts';
import { corsHeaders } from '../_shared/cors.ts';

const openai = new OpenAI(Deno.env.get('OPENAI_API_KEY')!);

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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // DO NOT CHANGE THIS
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: description }
      ],
      temperature: 0.3,
      max_tokens: 150
    });

    console.log('GPT Response:', completion.choices[0].message.content);
    
    let suggestedTags;
    try {
      // Clean up markdown formatting if present
      let contentToParse = completion.choices[0].message.content || '[]';
      if (contentToParse.includes('```')) {
        contentToParse = contentToParse
          .replace(/```json\n/g, '')
          .replace(/```\n/g, '')
          .replace(/```/g, '')
          .trim();
      }
      
      suggestedTags = JSON.parse(contentToParse);
      if (!Array.isArray(suggestedTags)) {
        throw new Error('Response is not an array');
      }
    } catch (parseError) {
      console.error('Failed to parse GPT response:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse tags',
          details: completion.choices[0].message.content 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

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
      JSON.stringify({ error: 'Failed to infer tags' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
}); 