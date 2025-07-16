import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Tooltip } from '@mui/material';
import { Avatar as BoringerAvatar } from '@boringer-avatars/react';
import guestManager from '../utils/guestNames';

const AvatarStack = () => {
  const [guests, setGuests] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Initialize current user
    const user = guestManager.initializeCurrentUser();
    setCurrentUser(user);

    // Simulate other guests joining (for demo purposes)
    const simulateGuests = () => {
      const newGuests = [];
      for (let i = 0; i < 3; i++) {
        const guest = guestManager.addGuest();
        newGuests.push(guest);
      }
      setGuests(newGuests);
    };

    // Add some demo guests after a delay
    setTimeout(simulateGuests, 1000);

    // Update guests list periodically - filter out current user to avoid duplicates
    const interval = setInterval(() => {
      const allOnlineGuests = guestManager.getOnlineGuests();
      const otherGuests = allOnlineGuests.filter(guest => guest.id !== user.id);
      setGuests(otherGuests);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const allUsers = currentUser ? [currentUser, ...guests] : guests;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mr: 2,
      }}
    >
      {/* Avatar Stack */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {allUsers.map((user, index) => (
          <Tooltip
            key={user.id}
            title={`${user.name}${user === currentUser ? ' (You)' : ''}`}
            placement="bottom"
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '2px solid #fff',
                ml: index > 0 ? -1 : 0,
                zIndex: allUsers.length - index,
                '&:hover': {
                  transform: 'scale(1.1)',
                  zIndex: 1000,
                },
                transition: 'transform 0.2s ease',
                overflow: 'hidden',
              }}
            >
              <BoringerAvatar
                size={28}
                name={user.name}
                colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']}
                variant="beam"
              />
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};

export default AvatarStack; 