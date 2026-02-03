import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase.rpc('get_jobs_over_time')

    if (error) {
      console.error('Error fetching jobs over time:', error)
      return NextResponse.json(
        { error: 'Failed to fetch jobs over time metrics' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Error in jobs-over-time API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
