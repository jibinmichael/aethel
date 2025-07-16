const { MongoClient } = require('mongodb');

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

module.exports = async function handler(req, res) {
  const { method } = req;

  console.log('🔗 API /boards called with method:', method);
  console.log('🔑 MongoDB URI exists:', !!process.env.MONGODB_URI);

  try {
    console.log('🔌 Connecting to database...');
    const client = await connectToDatabase();
    const db = client.db("aethel");
    const boardsCollection = db.collection("boards");
    console.log('✅ Database connected successfully');

    switch (method) {
      case 'GET':
        // Get all boards
        const boards = await boardsCollection.find({}).toArray();
        res.status(200).json(boards);
        break;

      case 'POST':
        // Create or update a board
        const { id, name, nodes, edges, userId, timestamp } = req.body;
        
        const boardData = {
          id,
          name: name || 'Untitled Board',
          nodes: nodes || [],
          edges: edges || [],
          userId: userId || 'anonymous',
          timestamp: timestamp || Date.now(),
          updatedAt: Date.now()
        };

        const result = await boardsCollection.updateOne(
          { id },
          { $set: boardData },
          { upsert: true }
        );

        res.status(200).json({ 
          success: true, 
          message: 'Board saved successfully',
          boardId: id 
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 