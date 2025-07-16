import clientPromise from '../db';

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  if (!id) {
    return res.status(400).json({ error: 'Board ID is required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db("aethel");
    const boardsCollection = db.collection("boards");

    switch (method) {
      case 'GET':
        // Get a specific board by ID
        const board = await boardsCollection.findOne({ id });
        
        if (!board) {
          return res.status(404).json({ error: 'Board not found' });
        }

        res.status(200).json(board);
        break;

      case 'DELETE':
        // Delete a board
        const deleteResult = await boardsCollection.deleteOne({ id });
        
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ error: 'Board not found' });
        }

        res.status(200).json({ 
          success: true, 
          message: 'Board deleted successfully' 
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 