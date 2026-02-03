import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'json' // json or csv
    const limit = searchParams.get('limit') // Optional limit

    let query = supabase
      .from('scraped_jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (limit) {
      const limitNum = parseInt(limit, 10)
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching data for export:', error)
      return NextResponse.json(
        { error: 'Failed to fetch data for export' },
        { status: 500 }
      )
    }

    if (format === 'csv') {
      // Convert to CSV
      if (!data || data.length === 0) {
        return NextResponse.json({ error: 'No data to export' }, { status: 404 })
      }

      const headers = Object.keys(data[0])
      const csvHeaders = headers.join(',')
      
      const csvRows = data.map(row => {
        return headers.map(header => {
          const value = row[header]
          // Handle null, objects, arrays
          if (value === null || value === undefined) return ''
          if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""')
          return String(value).replace(/"/g, '""')
        }).map(v => `"${v}"`).join(',')
      })

      const csv = [csvHeaders, ...csvRows].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="upwork-jobs-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else {
      // Return JSON
      return NextResponse.json(
        {
          total: data?.length || 0,
          exported_at: new Date().toISOString(),
          data: data || [],
        },
        {
          headers: {
            'Content-Disposition': `attachment; filename="upwork-jobs-export-${new Date().toISOString().split('T')[0]}.json"`,
          },
        }
      )
    }
  } catch (error: any) {
    console.error('Error in export API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
