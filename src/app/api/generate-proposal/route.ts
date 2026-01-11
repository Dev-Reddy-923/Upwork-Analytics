import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { jobDetails } = await request.json()

    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Build the prompt for OpenAI
    const prompt = `You are an expert freelancer writing a compelling proposal for an Upwork job. Based on the following job details, write a professional, personalized proposal that:

1. Addresses the client's specific needs
2. Highlights relevant skills and experience
3. Shows understanding of the project
4. Is concise but comprehensive (2-3 paragraphs)
5. Includes a clear call to action

Job Details:
Title: ${jobDetails.title || 'N/A'}
Description: ${jobDetails.description || 'N/A'}
Budget: ${jobDetails.budget_amount || 'N/A'} ${jobDetails.budget_type || ''}
Experience Level Required: ${jobDetails.experience_level || 'N/A'}
Skills Required: ${Array.isArray(jobDetails.skills) ? jobDetails.skills.join(', ') : jobDetails.skills || 'N/A'}
Location: ${jobDetails.location || 'N/A'}
Client Location: ${jobDetails.client_location || 'N/A'}

Write a compelling proposal that stands out:`

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert freelancer who writes compelling, personalized Upwork proposals that win projects.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to generate proposal', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const proposal = data.choices[0]?.message?.content || 'Failed to generate proposal'

    return NextResponse.json({ proposal })
  } catch (error: any) {
    console.error('Error generating proposal:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
