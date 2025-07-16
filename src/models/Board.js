import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shareSettings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    },
    shareUrl: {
      type: String,
      unique: true,
      sparse: true
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
boardSchema.index({ ownerId: 1 });
boardSchema.index({ 'shareSettings.shareUrl': 1 });
boardSchema.index({ 'collaborators.userId': 1 });
boardSchema.index({ lastModified: -1 });

// Generate share URL
boardSchema.methods.generateShareUrl = function() {
  const baseUrl = process.env.BASE_URL || 'https://lumina.app';
  return `${baseUrl}/board/${this._id}`;
};

// Check if user can edit
boardSchema.methods.canUserEdit = function(userId) {
  if (this.ownerId.equals(userId)) return true;
  
  const collaborator = this.collaborators.find(c => c.userId.equals(userId));
  return collaborator && collaborator.permission === 'edit';
};

// Check if user can view
boardSchema.methods.canUserView = function(userId) {
  if (this.ownerId.equals(userId)) return true;
  if (this.shareSettings.isPublic) return true;
  
  const collaborator = this.collaborators.find(c => c.userId.equals(userId));
  return collaborator && (collaborator.permission === 'view' || collaborator.permission === 'edit');
};

export default mongoose.model('Board', boardSchema); 