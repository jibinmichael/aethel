import React, { useState, useEffect } from 'react'
import { Box, Typography, IconButton, TextField, Tooltip, Button, Modal, Radio, RadioGroup, FormControlLabel, Divider } from '@mui/material'
import { AutoAwesomeMosaic, ContentCopy } from '@mui/icons-material'
import { boardStore } from '../stores/boardStore'
import AvatarStack from './AvatarStack'

function NotionHeader({ activeBoard, onBoardUpdate, onGoHome }) {
  const [isEditing, setIsEditing] = useState(false)
  const [boardName, setBoardName] = useState(activeBoard?.name || '')
  // Star state temporarily removed
  const [timeAgo, setTimeAgo] = useState('')
  
  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [sharePermission, setSharePermission] = useState('view')
  const [shareUrl] = useState('https://lumina.app/board/123456')

  // Update board name when activeBoard changes
  useEffect(() => {
    setBoardName(activeBoard?.name || '')
  }, [activeBoard])

  // Real-time metadata updates
  useEffect(() => {
    const updateTimeAgo = () => {
      if (activeBoard?.lastModified) {
        const now = new Date()
        const lastModified = new Date(activeBoard.lastModified)
        const diffInSeconds = Math.floor((now - lastModified) / 1000)
        
        if (diffInSeconds < 10) {
          setTimeAgo('just now')
        } else if (diffInSeconds < 60) {
          setTimeAgo('few seconds ago')
        } else if (diffInSeconds < 3600) {
          const minutes = Math.floor(diffInSeconds / 60)
          setTimeAgo(`updated ${minutes} minute${minutes > 1 ? 's' : ''} ago`)
        } else if (diffInSeconds < 86400) {
          const hours = Math.floor(diffInSeconds / 3600)
          setTimeAgo(`updated ${hours} hour${hours > 1 ? 's' : ''} ago`)
        } else {
          const days = Math.floor(diffInSeconds / 86400)
          setTimeAgo(`updated ${days} day${days > 1 ? 's' : ''} ago`)
        }
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 1000) // Update every second

    return () => clearInterval(interval)
  }, [activeBoard])

  const handleBoardNameClick = () => {
    setIsEditing(true)
  }

  // Capitalize first letter function
  const capitalizeFirstLetter = (str) => {
    if (!str) return 'Untitled'
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const handleBoardNameSave = () => {
    if (boardName.trim() && boardName !== activeBoard?.name) {
      const capitalizedName = capitalizeFirstLetter(boardName.trim())
      const result = boardStore.renameBoard(activeBoard.id, capitalizedName)
      if (result.success) {
        setBoardName(capitalizedName)
        onBoardUpdate()
      }
    }
    setIsEditing(false)
  }

  const handleBoardNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBoardNameSave()
    } else if (e.key === 'Escape') {
      setBoardName(activeBoard?.name || '')
      setIsEditing(false)
    }
  }

  // Star functionality temporarily removed

  const handleShare = () => {
    setShareModalOpen(true)
  }

  const handleCloseShareModal = () => {
    setShareModalOpen(false)
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    // Could add a toast notification here
  }

  const handleStartSession = () => {
    // Session functionality would go here
    console.log('Starting session with permission:', sharePermission)
  }

  const handleHomeClick = () => {
    onGoHome?.()
  }

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 40,
          bgcolor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          pt: '12px',
          pb: '8px',
          zIndex: 1000,
        }}
      >
      {/* Left side - Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Home page" placement="bottom">
          <IconButton
            onClick={handleHomeClick}
            size="small"
            sx={{
              width: 16,
              height: 16,
              padding: 0,
              color: '#666666',
              '&:hover': {
                bgcolor: 'transparent',
                color: '#2196f3',
              },
            }}
          >
            <AutoAwesomeMosaic sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Typography
          variant="body2"
          sx={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#999999',
            cursor: 'default',
          }}
        >
          My boards
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#666666',
          }}
        >
          /
        </Typography>
        {isEditing ? (
          <TextField
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            onBlur={handleBoardNameSave}
            onMouseLeave={handleBoardNameSave}
            onKeyDown={handleBoardNameKeyDown}
            onFocus={(e) => e.target.select()}
            autoFocus
            variant="standard"
            size="small"
            sx={{
              '& .MuiInput-root': {
                fontSize: '13px',
                fontWeight: 500,
                color: '#333333',
                '&:before': { borderBottom: 'none' },
                '&:after': { borderBottom: 'none' },
                '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
              },
              '& .MuiInput-input': {
                padding: '2px 4px',
                fontSize: '13px',
                fontWeight: 500,
              },
            }}
          />
        ) : (
          <Tooltip title="Click to edit board name" placement="bottom">
            <Typography
              variant="body2"
              onClick={handleBoardNameClick}
              sx={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#333333',
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '4px',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                },
              }}
            >
              {activeBoard?.name || 'Untitled'}
            </Typography>
          </Tooltip>
        )}
      </Box>

      {/* Right side - Icons and metadata */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Avatar Stack */}
        <AvatarStack />
        
        <Typography
          variant="body2"
          sx={{
            fontSize: '13px',
            fontWeight: 400,
            color: '#999999',
          }}
        >
          {timeAgo}
        </Typography>

        <Tooltip title="Share board" placement="bottom">
          <Button
            onClick={handleShare}
            variant="contained"
            size="small"
            sx={{
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'none',
              bgcolor: '#2196f3',
              color: 'white',
              px: '0px',
              py: '2px',
              height: 'auto',
              width: 'auto',
              minWidth: 'auto',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#1976d2',
                boxShadow: 'none',
              },
              '&.MuiButtonBase-root': {
                paddingLeft: '8px !important',
                paddingRight: '8px !important',
              },
            }}
          >
            Share
          </Button>
        </Tooltip>
      </Box>
    </Box>

    {/* Share Modal */}
    <Modal
      open={shareModalOpen}
      onClose={handleCloseShareModal}
      aria-labelledby="share-modal-title"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'white',
          borderRadius: '8px',
          boxShadow: 24,
          p: 3,
        }}
      >
        {/* Header */}
        <Typography
          id="share-modal-title"
          variant="h6"
          sx={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#333333',
            mb: 2,
          }}
        >
          Share this board
        </Typography>

        {/* URL Section */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            value={shareUrl}
            disabled
            variant="outlined"
            size="small"
            InputProps={{
              endAdornment: (
                <Button
                  variant="text"
                  size="small"
                  onClick={handleCopyUrl}
                  sx={{
                    fontSize: '9px',
                    color: '#2196f3',
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: '#1976d2',
                    },
                  }}
                >
                  Copy URL
                </Button>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '13px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                '&:before': { borderBottom: 'none' },
                '&:after': { borderBottom: 'none' },
                '&:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          />
        </Box>

        {/* Permission Section */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#333333',
              mb: 1,
            }}
          >
            Permission
          </Typography>
          <RadioGroup
            value={sharePermission}
            onChange={(e) => setSharePermission(e.target.value)}
            row
          >
            <FormControlLabel
              value="view"
              control={<Radio size="small" sx={{ '& .MuiSvgIcon-root': { fontSize: 16 } }} />}
              label={
                <Typography sx={{ fontSize: '11px', color: '#666666' }}>
                  View only
                </Typography>
              }
              sx={{ '& .MuiFormControlLabel-label': { marginLeft: '4px' } }}
            />
            <FormControlLabel
              value="edit"
              control={<Radio size="small" sx={{ '& .MuiSvgIcon-root': { fontSize: 16 } }} />}
              label={
                <Typography sx={{ fontSize: '11px', color: '#666666' }}>
                  Anyone with link can edit
                </Typography>
              }
              sx={{ '& .MuiFormControlLabel-label': { marginLeft: '4px' } }}
            />
          </RadioGroup>
        </Box>

        {/* Separator */}
        <Divider sx={{ my: 2 }} />

        {/* Session Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#333333',
                mb: 0.5,
              }}
            >
              Open session
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '11px',
                color: '#999999',
                lineHeight: 1.3,
              }}
            >
              Anyone can edit—no account required. Sessions end automatically after 24 hours.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={handleStartSession}
            sx={{
              fontSize: '11px',
              textTransform: 'none',
              borderColor: '#cccccc',
              color: '#666666',
              px: 2,
              py: 0.5,
              '&:hover': {
                borderColor: '#999999',
                bgcolor: '#f5f5f5',
              },
            }}
          >
            Start
          </Button>
        </Box>
      </Box>
    </Modal>
    </>
  )
}

export default NotionHeader 