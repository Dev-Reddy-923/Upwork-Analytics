'use client'

import { useState, useEffect } from 'react'
import { Box, Container, useTheme, CircularProgress, Typography } from '@mui/material'
import { supabase } from '@/lib/supabase'
import type { ScrapedJob } from '@/lib/supabase'

// Import chart components (keeping existing charts for now)
import JobsOverTimeChart from '@/components/analytics/JobsOverTimeChart'
import BudgetAnalysisChart from '@/components/analytics/BudgetAnalysisChart'
import SkillsDemandChart from '@/components/analytics/SkillsDemandChart'
import ClientActivityChart from '@/components/analytics/ClientActivityChart'
import ClientCountriesChart from '@/components/analytics/ClientCountriesChart'
import ClientSpendingChart from '@/components/analytics/ClientSpendingChart'
import ClientHireRateChart from '@/components/analytics/ClientHireRateChart'
import ConnectsRequiredChart from '@/components/analytics/ConnectsRequiredChart'
import InterviewingRateChart from '@/components/analytics/InterviewingRateChart'
import ClientHourlyRateChart from '@/components/analytics/ClientHourlyRateChart'
import JobPostingHeatmap from '@/components/analytics/JobPostingHeatmap'

// Import Material UI components
import MaterialSidebar from '@/components/MaterialSidebar'
import MaterialJobsList from '@/components/MaterialJobsList'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'premium-map' | 'jobs-over-time' | 'budget-analysis' | 'client-countries' | 'client-spending' | 'client-hire-rate' | 'client-hourly-rate' | 'connects-required' | 'interview-rate' | 'skills-demand' | 'posting-heatmap'>('jobs')
  const [totalJobCount, setTotalJobCount] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  // Fetch total job count for sidebar
  useEffect(() => {
    async function fetchTotalCount() {
      try {
        const response = await fetch('/api/metrics/total-count')
        const result = await response.json()
        if (result.total !== undefined) {
          setTotalJobCount(result.total)
        }
      } catch (error) {
        console.error('Error fetching total count:', error)
      }
    }
    fetchTotalCount()
  }, [])

  const theme = useTheme()
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < theme.breakpoints.values.md)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [theme.breakpoints.values.md])

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading analytics data...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Material UI Sidebar */}
      <MaterialSidebar
        activeTab={activeTab}
        onTabChange={(tab: string) => setActiveTab(tab as any)}
        jobCount={totalJobCount}
      />

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.default',
          color: 'text.primary',
          backgroundImage: theme.palette.mode === 'dark' 
            ? 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.03) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.02) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.02) 0%, transparent 50%)'
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            py: 4,
            px: { xs: 2, sm: 3, md: 4 },
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {activeTab === 'jobs' && (
            <Box sx={{ width: '100%', maxWidth: '1400px' }}>
              <MaterialJobsList />
            </Box>
          )}
          
          {activeTab === 'jobs-over-time' && (
            <Box className="chart-container" sx={{ width: '100%', maxWidth: '1400px' }}>
              <JobsOverTimeChart />
            </Box>
          )}
          
          {activeTab === 'premium-map' && (
            <Box className="chart-container" sx={{ width: '100%', maxWidth: '1400px' }}>
              <ClientActivityChart />
            </Box>
          )}
          
          {activeTab === 'budget-analysis' && (
            <Box className="chart-container">
              <BudgetAnalysisChart />
            </Box>
          )}
          
          {activeTab === 'client-countries' && (
            <Box className="chart-container">
              <ClientCountriesChart />
            </Box>
          )}
          
          {activeTab === 'client-spending' && (
            <Box className="chart-container">
              <ClientSpendingChart />
            </Box>
          )}
          
          {activeTab === 'client-hire-rate' && (
            <Box className="chart-container">
              <ClientHireRateChart />
            </Box>
          )}
          
          {activeTab === 'client-hourly-rate' && (
            <Box className="chart-container">
              <ClientHourlyRateChart />
            </Box>
          )}
          
          {activeTab === 'connects-required' && (
            <Box className="chart-container">
              <ConnectsRequiredChart />
            </Box>
          )}
          
          {activeTab === 'interview-rate' && (
            <Box className="chart-container">
              <InterviewingRateChart />
            </Box>
          )}
          
          {activeTab === 'skills-demand' && (
            <Box className="chart-container">
              <SkillsDemandChart />
            </Box>
          )}
          
          {activeTab === 'posting-heatmap' && (
            <Box className="chart-container" sx={{ width: '100%', maxWidth: '1400px' }}>
              <JobPostingHeatmap />
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  )
}
