import * as Ably from 'ably';

class CollaborationService {
  constructor() {
    this.ably = null;
    this.spaces = null;
    this.currentSpace = null;
    this.currentMember = null;
  }

  async initialize(apiKey) {
    try {
      this.ably = new Ably.Realtime(apiKey);
      this.spaces = this.ably.spaces;
      console.log('✅ Ably initialized successfully');
    } catch (error) {
      console.error('❌ Ably initialization error:', error);
      throw error;
    }
  }

  async joinBoard(boardId, user) {
    try {
      // Get or create space for this board
      this.currentSpace = await this.spaces.get(`board-${boardId}`);
      
      // Enter as a member
      this.currentMember = await this.currentSpace.enter({
        name: user.name,
        avatar: user.avatar || null
      });

      console.log('✅ Joined board space:', boardId);
      return this.currentSpace;
    } catch (error) {
      console.error('❌ Error joining board:', error);
      throw error;
    }
  }

  async leaveBoard() {
    if (this.currentMember) {
      await this.currentMember.leave();
      this.currentMember = null;
      this.currentSpace = null;
    }
  }

  // Lock a node for editing
  async lockNode(nodeId, userId) {
    if (!this.currentSpace) return false;
    
    try {
      const lock = await this.currentSpace.locks.acquire(`node-${nodeId}`, {
        nodeId,
        userId,
        timestamp: Date.now()
      });
      return lock;
    } catch (error) {
      console.error('❌ Error locking node:', error);
      return false;
    }
  }

  // Unlock a node
  async unlockNode(nodeId) {
    if (!this.currentSpace) return false;
    
    try {
      await this.currentSpace.locks.release(`node-${nodeId}`);
      return true;
    } catch (error) {
      console.error('❌ Error unlocking node:', error);
      return false;
    }
  }

  // Subscribe to real-time updates
  subscribeToUpdates(callbacks) {
    if (!this.currentSpace) return;

    // Listen for member updates
    this.currentSpace.members.subscribe('update', async () => {
      const otherMembers = await this.currentSpace.members.getOthers();
      callbacks.onMembersUpdate?.(otherMembers);
    });

    // Listen for member presence
    this.currentSpace.members.subscribe('present', async (member) => {
      callbacks.onMemberJoin?.(member);
    });

    this.currentSpace.members.subscribe('absent', async (member) => {
      callbacks.onMemberLeave?.(member);
    });

    // Listen for lock updates
    this.currentSpace.locks.subscribe('acquired', (lock) => {
      callbacks.onNodeLocked?.(lock);
    });

    this.currentSpace.locks.subscribe('released', (lock) => {
      callbacks.onNodeUnlocked?.(lock);
    });

    // Listen for cursor updates
    this.currentSpace.cursors.subscribe('update', (cursorUpdate) => {
      callbacks.onCursorUpdate?.(cursorUpdate);
    });
  }

  // Update cursor position
  async updateCursor(position) {
    if (!this.currentSpace) return;
    
    try {
      await this.currentSpace.cursors.set({
        position: position,
        data: {
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('❌ Error updating cursor:', error);
    }
  }

  // Get current members
  async getCurrentMembers() {
    if (!this.currentSpace) return [];
    
    try {
      const members = await this.currentSpace.members.get();
      return members;
    } catch (error) {
      console.error('❌ Error getting members:', error);
      return [];
    }
  }

  // Check if node is locked
  async isNodeLocked(nodeId) {
    if (!this.currentSpace) return false;
    
    try {
      const lock = this.currentSpace.locks.get(`node-${nodeId}`);
      return !!lock;
    } catch (error) {
      return false;
    }
  }

  // Get lock info for a node
  async getNodeLockInfo(nodeId) {
    if (!this.currentSpace) return null;
    
    try {
      const lock = this.currentSpace.locks.get(`node-${nodeId}`);
      return lock;
    } catch (error) {
      return null;
    }
  }
}

export default new CollaborationService(); 