import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Chip } from '@mui/material';
import collaborationService from '../services/collaborationService';

const CollaborationOverlay = ({ boardId, currentUser }) => {
  const [members, setMembers] = useState([]);
  const [cursors, setCursors] = useState(new Map());
  const [lockedNodes, setLockedNodes] = useState(new Map());

  useEffect(() => {
    if (!boardId || !currentUser) return;

    const initializeCollaboration = async () => {
      try {
        // Initialize Ably (you'll need to add your API key)
        await collaborationService.initialize(process.env.REACT_APP_ABLY_API_KEY);
        
        // Join the board
        await collaborationService.joinBoard(boardId, currentUser);
        
        // Subscribe to real-time updates
        collaborationService.subscribeToUpdates({
          onMembersUpdate: (otherMembers) => {
            setMembers(otherMembers);
          },
          onMemberJoin: (member) => {
            console.log('👋 Member joined:', member.name);
          },
          onMemberLeave: (member) => {
            console.log('👋 Member left:', member.name);
          },
          onCursorUpdate: (cursorUpdate) => {
            setCursors(prev => new Map(prev.set(cursorUpdate.connectionId, cursorUpdate)));
          },
          onNodeLocked: (lock) => {
            setLockedNodes(prev => new Map(prev.set(lock.request.attributes.nodeId, lock)));
          },
          onNodeUnlocked: (lock) => {
            setLockedNodes(prev => {
              const newMap = new Map(prev);
              newMap.delete(lock.request.attributes.nodeId);
              return newMap;
            });
          }
        });

        // Get initial members
        const initialMembers = await collaborationService.getCurrentMembers();
        setMembers(initialMembers);

      } catch (error) {
        console.error('❌ Failed to initialize collaboration:', error);
      }
    };

    initializeCollaboration();

    return () => {
      collaborationService.leaveBoard();
    };
  }, [boardId, currentUser]);

  // Update cursor position on mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      collaborationService.updateCursor({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Online Members Avatar Stack */}
      <Box
        sx={{
          position: 'fixed',
          top: '60px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: '#666666', mb: 1 }}>
          Online ({members.length + 1})
        </Typography>
        
        {/* Current user */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: '12px',
              bgcolor: '#2196f3',
              border: '2px solid #fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {currentUser?.name?.charAt(0) || 'U'}
          </Avatar>
          <Typography variant="caption" sx={{ color: '#333333' }}>
            {currentUser?.name || 'You'}
          </Typography>
        </Box>

        {/* Other members */}
        {members.map((member) => (
          <Box key={member.connectionId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '12px',
                bgcolor: '#4caf50',
                border: '2px solid #fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {member.name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="caption" sx={{ color: '#333333' }}>
              {member.name || 'Anonymous'}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Live Cursors */}
      {Array.from(cursors.values()).map((cursor) => {
        const member = members.find(m => m.connectionId === cursor.connectionId);
        if (!member) return null;

        return (
          <Box
            key={cursor.connectionId}
            sx={{
              position: 'fixed',
              left: cursor.position.x,
              top: cursor.position.y,
              zIndex: 999,
              pointerEvents: 'none',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Cursor dot */}
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#4caf50',
                border: '2px solid #fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
            
            {/* Member name */}
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: 12,
                left: 0,
                bgcolor: '#4caf50',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: '4px',
                fontSize: '10px',
                whiteSpace: 'nowrap',
              }}
            >
              {member.name}
            </Typography>
          </Box>
        );
      })}

      {/* Node Lock Indicators */}
      {Array.from(lockedNodes.values()).map((lock) => {
        const member = members.find(m => m.connectionId === lock.member.connectionId);
        if (!member) return null;

        return (
          <Chip
            key={lock.request.attributes.nodeId}
            label={`${member.name} is editing`}
            size="small"
            sx={{
              position: 'absolute',
              bgcolor: '#ff9800',
              color: 'white',
              fontSize: '10px',
              '& .MuiChip-label': {
                px: 1,
              },
            }}
          />
        );
      })}
    </>
  );
};

export default CollaborationOverlay; 