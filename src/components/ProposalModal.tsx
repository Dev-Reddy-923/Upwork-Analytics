'use client'

import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material'
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
} from '@mui/icons-material'

interface ProposalModalProps {
  open: boolean
  onClose: () => void
  proposal: string | null
  loading: boolean
  error: string | null
}

export default function ProposalModal({
  open,
  onClose,
  proposal,
  loading,
  error,
}: ProposalModalProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    if (proposal) {
      try {
        await navigator.clipboard.writeText(proposal)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'background.paper',
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          AI Generated Proposal
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Generating your proposal...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {proposal && !loading && (
          <TextField
            fullWidth
            multiline
            rows={12}
            value={proposal}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.default',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                lineHeight: 1.6,
              },
            }}
            InputProps={{
              readOnly: true,
            }}
          />
        )}
      </DialogContent>

      {proposal && !loading && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <Button
              variant="outlined"
              startIcon={copied ? <CheckIcon /> : <CopyIcon />}
              onClick={handleCopy}
              sx={{ flex: 1 }}
            >
              {copied ? 'Copied!' : 'Copy Proposal'}
            </Button>
            <Button variant="contained" onClick={onClose} sx={{ flex: 1 }}>
              Close
            </Button>
          </Stack>
        </DialogActions>
      )}
    </Dialog>
  )
}
