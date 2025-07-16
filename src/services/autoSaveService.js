import { debounce } from 'lodash';

class AutoSaveService {
  constructor() {
    this.saveQueue = new Map();
    this.isSaving = false;
    this.lastSaveTime = 0;
    this.minSaveInterval = 2000; // Minimum 2 seconds between saves
  }

  // Debounced save function
  debouncedSave = debounce(async (boardId, data, saveFunction) => {
    await this.performSave(boardId, data, saveFunction);
  }, 1000); // 1 second debounce

  // Perform the actual save
  async performSave(boardId, data, saveFunction) {
    if (this.isSaving) {
      // Queue this save for later
      this.saveQueue.set(boardId, { data, saveFunction, timestamp: Date.now() });
      return;
    }

    const now = Date.now();
    if (now - this.lastSaveTime < this.minSaveInterval) {
      // Too soon since last save, queue it
      this.saveQueue.set(boardId, { data, saveFunction, timestamp: now });
      return;
    }

    this.isSaving = true;

    try {
      await saveFunction(data);
      this.lastSaveTime = now;
      console.log('✅ Auto-save completed for board:', boardId);
    } catch (error) {
      console.error('❌ Auto-save failed for board:', boardId, error);
      // Retry after a delay
      setTimeout(() => {
        this.processQueue();
      }, 5000);
    } finally {
      this.isSaving = false;
      this.processQueue();
    }
  }

  // Process queued saves
  async processQueue() {
    if (this.isSaving || this.saveQueue.size === 0) return;

    const [boardId, { data, saveFunction }] = this.saveQueue.entries().next().value;
    this.saveQueue.delete(boardId);

    await this.performSave(boardId, data, saveFunction);
  }

  // Save board state
  async saveBoardState(boardId, nodes, edges, userId) {
    const data = {
      boardId,
      nodes,
      edges,
      userId,
      timestamp: Date.now()
    };

    this.debouncedSave(boardId, data, async (saveData) => {
      // This would call your backend API
      const response = await fetch('/api/boards/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData)
      });

      if (!response.ok) {
        throw new Error('Save failed');
      }

      return response.json();
    });
  }

  // Save individual node
  async saveNode(boardId, node, userId) {
    const data = {
      boardId,
      node,
      userId,
      timestamp: Date.now()
    };

    this.debouncedSave(`node-${node.id}`, data, async (saveData) => {
      const response = await fetch('/api/nodes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData)
      });

      if (!response.ok) {
        throw new Error('Node save failed');
      }

      return response.json();
    });
  }

  // Force save (for important changes)
  async forceSave(boardId, data, saveFunction) {
    // Clear any pending debounced saves
    this.debouncedSave.cancel();
    
    // Perform immediate save
    await this.performSave(boardId, data, saveFunction);
  }

  // Get save status
  getSaveStatus() {
    return {
      isSaving: this.isSaving,
      queueSize: this.saveQueue.size,
      lastSaveTime: this.lastSaveTime
    };
  }

  // Clear all pending saves
  clearPendingSaves() {
    this.debouncedSave.cancel();
    this.saveQueue.clear();
  }
}

export default new AutoSaveService(); 