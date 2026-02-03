import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase.rpc('get_budget_analysis')

    if (error) {
      console.error('Error fetching budget analysis:', error)
      return NextResponse.json(
        { error: 'Failed to fetch budget analysis metrics' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Error in budget-analysis API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
