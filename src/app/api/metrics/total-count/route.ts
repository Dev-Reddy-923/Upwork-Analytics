import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const [totalResult, completeResult] = await Promise.all([
      supabase.rpc('get_total_job_count'),
      supabase.rpc('get_total_complete_job_count')
    ])

    if (totalResult.error || completeResult.error) {
      console.error('Error fetching job counts:', totalResult.error || completeResult.error)
      return NextResponse.json(
        { error: 'Failed to fetch job counts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      total: totalResult.data || 0,
      complete: completeResult.data || 0
    })
  } catch (error: any) {
    console.error('Error in total-count API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
