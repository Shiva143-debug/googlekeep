const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  user: 'oss_admin',
  host: '148.72.246.179',
  database: 'keep',
  password: 'Latitude77',
  schema: "public",
  port: '5432',
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'User already exists' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all notes endpoint
app.get('/notes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM note');
    res.json(result.rows);
    // console.log(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/trash', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trash');
    res.json(result.rows);
    // console.log(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/archeive', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM archeive');
    res.json(result.rows);
    // console.log(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Add note endpoint
app.post('/addnotes', async (req, res) => {
  const { content } = req.body;
  // console.log(content)
  try {
    const result = await pool.query(
      'INSERT INTO note (content) VALUES ($1) RETURNING *',
      [content]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/updatenote/:id', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  // console.log(id)
  // console.log(content)

  try {
    const updateQuery = 'UPDATE note SET content = $1 WHERE id = $2 RETURNING *';
    const values = [content, id];
    const result = await pool.query(updateQuery, values);
    // console.log(result.rowCount)
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note. Please try again later.' });
  }
});

app.put('/updatetrash/:id', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    // console.log(id)
    // console.log(content)
  
    try {
      const updateQuery = 'UPDATE trash SET content = $1 WHERE id = $2 RETURNING *';
      const values = [content, id];
      const result = await pool.query(updateQuery, values);
      // console.log(result.rowCount)
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
  
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({ error: 'Failed to update note. Please try again later.' });
    }
  });
  app.put('/updatearcheive/:id', async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    // console.log(id)
    // console.log(content)
  
    try {
      const updateQuery = 'UPDATE archeive SET content = $1 WHERE id = $2 RETURNING *';
      const values = [content, id];
      const result = await pool.query(updateQuery, values);
      // console.log(result.rowCount)
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
  
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating note:', error);
      res.status(500).json({ error: 'Failed to update note. Please try again later.' });
    }
  });
app.put('/notebackground/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { background } = req.body;
  console.log(background)

  if (!background) {
    return res.status(400).send({ error: 'Background color is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE note SET background = $1 WHERE id = $2 RETURNING *',
      [background, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ error: 'Note not found' });
    }

    res.send(result.rows[0]);
  } catch (error) {
    console.error('Error updating note background:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.put('/trashbackground/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { background } = req.body;
  console.log(background)

  if (!background) {
    return res.status(400).send({ error: 'Background color is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE trash SET background = $1 WHERE id = $2 RETURNING *',
      [background, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ error: 'Note not found' });
    }

    res.send(result.rows[0]);
  } catch (error) {
    console.error('Error updating note background:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.put('/archeivebackground/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { background } = req.body;
  console.log(background)

  if (!background) {
    return res.status(400).send({ error: 'Background color is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE archeive SET background = $1 WHERE id = $2 RETURNING *',
      [background, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ error: 'Note not found' });
    }

    res.send(result.rows[0]);
  } catch (error) {
    console.error('Error updating note background:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});


app.delete('/deletenotesinnote/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
      const client = await pool.connect();

      // Check if the note exists and get its content
      const selectQuery = 'SELECT content FROM note WHERE id = $1';
      const selectResult = await client.query(selectQuery, [id]);

      if (selectResult.rows.length === 0) {
          // Note with the specified ID doesn't exist
          client.release();
          return res.status(404).json({ error: `Note with ID ${id} not found` });
      }

      const noteContent = selectResult.rows[0].content;

      // Begin transaction for atomic operations
      await client.query('BEGIN');

      // Insert the note into the trash table
      const insertQuery = 'INSERT INTO trash (id, content) VALUES ($1, $2)';
      await client.query(insertQuery, [id, noteContent]);

      // Delete the note from the note table
      const deleteQuery = 'DELETE FROM note WHERE id = $1';
      await client.query(deleteQuery, [id]);

      // Commit transaction
      await client.query('COMMIT');
      client.release();

      // Respond with success message
      return res.status(200).json({ message: `Note with ID ${id} deleted and moved to trash. `});

  } catch (err) {
      console.error('Error deleting note:', err);

      // Rollback transaction on error
      await client.query('ROLLBACK');
      client.release();

      return res.status(500).json({ error: 'Internal server error' });
  }
});

// app.delete('/deletenotesintrash/:id', async (req, res) => {
//     const id = parseInt(req.params.id);
  
//     try {
//         const client = await pool.connect();
  
//         // Check if the note exists and get its content
//         const selectQuery = 'SELECT content FROM note WHERE id = $1';
//         const selectResult = await client.query(selectQuery, [id]);
  
//         if (selectResult.rows.length === 0) {
//             // Note with the specified ID doesn't exist
//             client.release();
//             return res.status(404).json({ error: `Note with ID ${id} not found` });
//         }
  
//         const noteContent = selectResult.rows[0].content;
  
//         // Begin transaction for atomic operations
//         await client.query('BEGIN');
  
//         // Insert the note into the trash table
//         const insertQuery = 'INSERT INTO trash (id, content) VALUES ($1, $2)';
//         await client.query(insertQuery, [id, noteContent]);
  
//         // Delete the note from the note table
//         const deleteQuery = 'DELETE FROM note WHERE id = $1';
//         await client.query(deleteQuery, [id]);
  
//         // Commit transaction
//         await client.query('COMMIT');
//         client.release();
  
//         // Respond with success message
//         return res.status(200).json({ message: `Note with ID ${id} deleted and moved to trash. `});
  
//     } catch (err) {
//         console.error('Error deleting note:', err);
  
//         // Rollback transaction on error
//         await client.query('ROLLBACK');
//         client.release();
  
//         return res.status(500).json({ error: 'Internal server error' });
//     }
//   });
  
  app.delete('/deletenotesintrash/:id', (req, res) => {
     const id = parseInt(req.params.id);
  
    
    const sql = "DELETE FROM trash WHERE id=$1"
    pool.query(sql, [id], (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
  
      return res.json(data);
    });
  
  });

  app.delete('/deletenotesinarcheive/:id', async (req, res) => {
    const id = parseInt(req.params.id);
  
    try {
        const client = await pool.connect();
  
        // Check if the note exists and get its content
        const selectQuery = 'SELECT content FROM archeive WHERE id = $1';
        const selectResult = await client.query(selectQuery, [id]);
  
        if (selectResult.rows.length === 0) {
            // Note with the specified ID doesn't exist
            client.release();
            return res.status(404).json({ error: `Note with ID ${id} not found` });
        }
  
        const noteContent = selectResult.rows[0].content;
  
        // Begin transaction for atomic operations
        await client.query('BEGIN');
  
        // Insert the note into the trash table
        const insertQuery = 'INSERT INTO trash (id, content) VALUES ($1, $2)';
        await client.query(insertQuery, [id, noteContent]);
  
        // Delete the note from the note table
        const deleteQuery = 'DELETE FROM archeive WHERE id = $1';
        await client.query(deleteQuery, [id]);
  
        // Commit transaction
        await client.query('COMMIT');
        client.release();
  
        // Respond with success message
        return res.status(200).json({ message: `Note with ID ${id} deleted and moved to trash. `});
  
    } catch (err) {
        console.error('Error deleting note:', err);
  
        // Rollback transaction on error
        await client.query('ROLLBACK');
        client.release();
  
        return res.status(500).json({ error: 'Internal server error' });
    }
  });

//   app.delete('/deletenotesinarcheive/:id', (req, res) => {
//     const id = parseInt(req.params.id);
 
   
//    const sql = "DELETE FROM archeive WHERE id=$1"
//    pool.query(sql, [id], (err, data) => {
//      if (err) {
//        console.error(err);
//        return res.status(500).json({ message: 'Internal Server Error' });
//      }
 
//      return res.json(data);
//    });
 
//  });
app.delete('/archievenotes/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  console.log(id)
  try {
      const client = await pool.connect();

      // Check if the note exists and get its content
      const selectQuery = 'SELECT content FROM note WHERE id = $1';
      const selectResult = await client.query(selectQuery, [id]);

      if (selectResult.rows.length === 0) {
          // Note with the specified ID doesn't exist
          client.release();
          return res.status(404).json({ error: `Note with ID ${id} not found.` });
      }

      const noteContent = selectResult.rows[0].content;

      // Begin transaction for atomic operations
      await client.query('BEGIN');

      // Insert the note into the trash table
      const insertQuery = 'INSERT INTO archeive (id, content) VALUES ($1, $2)';
      await client.query(insertQuery, [id, noteContent]);

      // Delete the note from the note table
      const deleteQuery = 'DELETE FROM note WHERE id = $1';
      await client.query(deleteQuery, [id]);

      // Commit transaction
      await client.query('COMMIT');
      client.release();

      // Respond with success message
      return res.status(200).json({ message:` Note with ID ${id} deleted and moved to trash.` });

  } catch (err) {
      console.error('Error deleting note:', err);

      // Rollback transaction on error
      await client.query('ROLLBACK');
      client.release();

      return res.status(500).json({ error: 'Internal server error' });
  }
});

// app.delete('/notes/:id', async (req, res) => {
//   const id = parseInt(req.params.id);

//   try {
//       const client = await pool.connect();
//       const result = await client.query('DELETE FROM note WHERE id = $1 RETURNING *', [id]);
//       client.release();

//       if (result.rowCount > 0) {
//           console.log(Note with ID ${id} deleted successfully.);
//           res.status(200).json({ message: Note with ID ${id} deleted successfully. });
//       } else {
//           console.log(Note with ID ${id} not found.);
//           res.status(404).json({ error: Note with ID ${id} not found. });
//       }
//   } catch (err) {
//       console.error('Error deleting note:', err);
//       res.status(500).json({ error: 'Internal server error' });
//   }
// });


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});