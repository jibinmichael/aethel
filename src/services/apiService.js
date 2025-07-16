class ApiService {
  constructor() {
    this.baseUrl = '/api';
    this.isInitialized = false;
  }

  initialize() {
    this.isInitialized = true;
    console.log('✅ API Service initialized');
  }

  // Generic API call method
  async apiCall(endpoint, options = {}) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Board operations
  async getBoards() {
    return this.apiCall('/boards');
  }

  async getBoard(boardId) {
    return this.apiCall(`/boards/${boardId}`);
  }

  async saveBoard(boardData) {
    return this.apiCall('/boards', {
      method: 'POST',
      body: JSON.stringify(boardData)
    });
  }

  async deleteBoard(boardId) {
    return this.apiCall(`/boards/${boardId}`, {
      method: 'DELETE'
    });
  }

  // Node operations
  async saveNodes(boardId, nodes, edges) {
    return this.apiCall('/boards', {
      method: 'POST',
      body: JSON.stringify({
        id: boardId,
        nodes,
        edges,
        timestamp: Date.now()
      })
    });
  }

  // Batch operations
  async saveBoardWithNodes(boardId, name, nodes, edges, userId = 'anonymous') {
    return this.apiCall('/boards', {
      method: 'POST',
      body: JSON.stringify({
        id: boardId,
        name,
        nodes,
        edges,
        userId,
        timestamp: Date.now()
      })
    });
  }
}

export default new ApiService(); 