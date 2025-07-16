import mongoose from 'mongoose';

const nodeSchema = new mongoose.Schema({
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  nodeId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['seed', 'generated', 'multiOption'],
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  position: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lockedAt: {
    type: Date
  },
  // For multi-option nodes
  options: [{
    text: String,
    selected: {
      type: Boolean,
      default: false
    }
  }],
  // For generated nodes
  aiResponse: {
    type: String,
    default: ''
  },
  // Track version for conflict resolution
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes for performance
nodeSchema.index({ boardId: 1, nodeId: 1 }, { unique: true });
nodeSchema.index({ boardId: 1, createdBy: 1 });
nodeSchema.index({ boardId: 1, type: 1 });
nodeSchema.index({ isLocked: 1, lockedBy: 1 });

// Check if user can edit this node
nodeSchema.methods.canUserEdit = function(userId, board) {
  // Owner can edit any node
  if (board.ownerId.equals(userId)) return true;
  
  // Users can only edit their own nodes (except seed node)
  if (this.type === 'seed') return false;
  
  return this.createdBy.equals(userId);
};

// Lock node for editing
nodeSchema.methods.lockForEditing = async function(userId) {
  if (this.isLocked && !this.lockedBy.equals(userId)) {
    throw new Error('Node is locked by another user');
  }
  
  this.isLocked = true;
  this.lockedBy = userId;
  this.lockedAt = new Date();
  return await this.save();
};

// Unlock node
nodeSchema.methods.unlock = async function(userId) {
  if (this.lockedBy && !this.lockedBy.equals(userId)) {
    throw new Error('Cannot unlock node locked by another user');
  }
  
  this.isLocked = false;
  this.lockedBy = null;
  this.lockedAt = null;
  return await this.save();
};

// Auto-unlock after 5 minutes
nodeSchema.methods.checkLockExpiry = async function() {
  if (this.isLocked && this.lockedAt) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (this.lockedAt < fiveMinutesAgo) {
      this.isLocked = false;
      this.lockedBy = null;
      this.lockedAt = null;
      return await this.save();
    }
  }
  return this;
};

export default mongoose.model('Node', nodeSchema); 