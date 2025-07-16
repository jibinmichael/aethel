// Random guest name generator - optimized for Boringer Avatars
const adjectives = [
  'Swift', 'Mystic', 'Cosmic', 'Digital', 'Quantum', 'Neon', 'Shadow', 'Crystal',
  'Thunder', 'Silent', 'Golden', 'Silver', 'Emerald', 'Ruby', 'Sapphire', 'Diamond',
  'Phoenix', 'Dragon', 'Eagle', 'Wolf', 'Tiger', 'Lion', 'Bear', 'Fox', 'Owl',
  'Brave', 'Wise', 'Clever', 'Mighty', 'Gentle', 'Wild', 'Free', 'Bright'
];

const nouns = [
  'Dragon', 'Phoenix', 'Eagle', 'Wolf', 'Tiger', 'Lion', 'Bear', 'Fox', 'Owl',
  'Star', 'Moon', 'Sun', 'Planet', 'Galaxy', 'Nebula', 'Comet', 'Meteor',
  'Crystal', 'Gem', 'Pearl', 'Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Opal'
];

// Predefined colors for guests (keeping for potential future use)
const guestColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA', '#F1948A', '#85C1E9',
  '#D7BDE2', '#A9CCE3', '#FAD7A0', '#ABEBC6', '#F9E79F', '#D5A6BD', '#A3E4D7'
];

// Generate random guest name - shorter for Boringer Avatars
export const generateGuestName = () => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
};

// Generate random color for guest
export const generateGuestColor = () => {
  return guestColors[Math.floor(Math.random() * guestColors.length)];
};

// Generate complete guest data
export const generateGuest = () => {
  return {
    id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: generateGuestName(),
    color: generateGuestColor(),
    isOnline: true,
    joinedAt: new Date()
  };
};

// Store for active guests
class GuestManager {
  constructor() {
    this.guests = new Map();
    this.currentUser = null;
  }

  // Initialize current user
  initializeCurrentUser() {
    if (!this.currentUser) {
      this.currentUser = generateGuest();
      this.guests.set(this.currentUser.id, this.currentUser);
    }
    return this.currentUser;
  }

  // Add a new guest
  addGuest() {
    const guest = generateGuest();
    this.guests.set(guest.id, guest);
    return guest;
  }

  // Remove a guest
  removeGuest(guestId) {
    this.guests.delete(guestId);
  }

  // Get all online guests
  getOnlineGuests() {
    return Array.from(this.guests.values()).filter(guest => guest.isOnline);
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user can edit node
  canEditNode(node, userId) {
    // Current user can edit their own nodes or if no owner specified
    if (!node.data.createdBy || node.data.createdBy === userId) {
      return true;
    }
    
    // Seed nodes can only be edited by owner
    if (node.type === 'seed') {
      return false;
    }
    
    return false;
  }

  // Check if user can delete node
  canDeleteNode(node, userId) {
    // Users can only delete their own nodes
    return node.data.createdBy === userId;
  }
}

export default new GuestManager(); 