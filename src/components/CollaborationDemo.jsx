import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Button, Chip } from '@mui/material';

const CollaborationDemo = () => {
  const [members, setMembers] = useState([
    { id: 1, name: 'Alice', color: '#2196f3', isOnline: true },
    { id: 2, name: 'Bob', color: '#4caf50', isOnline: true },
    { id: 3, name: 'Charlie', color: '#ff9800', isOnline: false }
  ]);

  const [cursors, setCursors] = useState([
    { id: 1, x: 200, y: 150, memberId: 1 },
    { id: 2, x: 400, y: 300, memberId: 2 }
  ]);

  const [lockedNodes, setLockedNodes] = useState([
    { nodeId: 'node-1', memberId: 1, memberName: 'Alice' }
  ]);

  // Simulate cursor movement
  useEffect(() => {
    const interval = setInterval(() => {
      setCursors(prev => prev.map(cursor => ({
        ...cursor,
        x: cursor.x + (Math.random() - 0.5) * 10,
        y: cursor.y + (Math.random() - 0.5) * 10
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        🎯 Collaboration Demo
      </Typography>

      {/* Online Members */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          👥 Online Members ({members.filter(m => m.isOnline).length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {members.filter(m => m.isOnline).map((member) => (
            <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '12px',
                  bgcolor: member.color,
                  border: '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {member.name.charAt(0)}
              </Avatar>
              <Typography variant="body2">
                {member.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Live Cursors */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          🖱️ Live Cursors
        </Typography>
        <Box sx={{ position: 'relative', height: 200, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          {cursors.map((cursor) => {
            const member = members.find(m => m.id === cursor.memberId);
            return (
              <Box
                key={cursor.id}
                sx={{
                  position: 'absolute',
                  left: cursor.x,
                  top: cursor.y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: member?.color || '#666',
                    border: '2px solid #fff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 0,
                    bgcolor: member?.color || '#666',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: '4px',
                    fontSize: '10px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {member?.name}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Node Locks */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          🔒 Node Locks
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {lockedNodes.map((lock) => {
            const member = members.find(m => m.id === lock.memberId);
            return (
              <Chip
                key={lock.nodeId}
                label={`${lock.memberName} is editing`}
                size="small"
                sx={{
                  bgcolor: member?.color || '#ff9800',
                  color: 'white',
                  fontSize: '10px',
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Permission System */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          🔐 Permission System
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, minWidth: 200 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              👑 Owner (You)
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              • Can edit seed node<br/>
              • Can edit any node<br/>
              • Can manage collaborators
            </Typography>
          </Box>
          <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, minWidth: 200 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              👥 Collaborators
            </Typography>
            <Typography variant="caption" sx={{ color: '#666' }}>
              • Can add new nodes<br/>
              • Can edit their own nodes<br/>
              • Cannot edit seed node
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Auto-save Status */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          💾 Auto-save Status
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#4caf50',
              animation: 'pulse 2s infinite',
            }}
          />
          <Typography variant="body2">
            All changes saved automatically
          </Typography>
        </Box>
      </Box>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default CollaborationDemo; 