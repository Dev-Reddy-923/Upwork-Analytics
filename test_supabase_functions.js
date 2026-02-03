// Test script to verify Supabase functions exist and are accessible
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read .env file manually
function loadEnv() {
  const envPath = path.join(__dirname, '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      line = line.trim()
      if (!line || line.startsWith('#')) return
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        let value = match[2].trim().replace(/^["']|["']$/g, '')
        const nextKeyMatch = value.match(/^(.+?)([A-Z_]+=.*)$/)
        if (nextKeyMatch) {
          value = nextKeyMatch[1]
          const remaining = nextKeyMatch[2]
          const remainingMatch = remaining.match(/^([^=]+)=(.*)$/)
          if (remainingMatch) {
            process.env[remainingMatch[1].trim()] = remainingMatch[2].trim().replace(/^["']|["']$/g, '')
          }
        }
        process.env[key] = value
      }
    })
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testFunctions() {
  console.log('🔍 Testing Supabase functions...\n')
  
  const functionsToTest = [
    'get_skills_demand',
    'get_budget_analysis',
    'get_jobs_over_time',
    'get_client_countries',
    'get_total_job_count'
  ]
  
  for (const funcName of functionsToTest) {
    try {
      console.log(`Testing ${funcName}...`)
      const { data, error } = await supabase.rpc(funcName)
      
      if (error) {
        console.error(`❌ ${funcName} ERROR:`)
        console.error(`   Code: ${error.code}`)
        console.error(`   Message: ${error.message}`)
        console.error(`   Hint: ${error.hint || 'N/A'}`)
        console.error(`   Details: ${error.details || 'N/A'}\n`)
      } else {
        const count = Array.isArray(data) ? data.length : (data ? 1 : 0)
        console.log(`✅ ${funcName} SUCCESS: ${count} result(s)`)
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   Sample:`, JSON.stringify(data[0], null, 2))
        }
        console.log()
      }
    } catch (err) {
      console.error(`❌ ${funcName} EXCEPTION:`, err.message)
      console.log()
    }
  }
  
  // Also test if functions exist in database
  console.log('\n🔍 Checking if functions exist in database...\n')
  const { data: functions, error: funcError } = await supabase
    .from('pg_proc')
    .select('proname')
    .in('proname', functionsToTest)
  
  if (funcError) {
    console.log('Note: Cannot query pg_proc directly (permission issue).')
    console.log('This is normal - functions should still be accessible via RPC.\n')
  } else {
    console.log('Functions found in database:', functions?.map(f => f.proname) || [])
  }
}

testFunctions().catch(console.error)
