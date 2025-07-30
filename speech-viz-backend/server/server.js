require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const fs = require('fs');
const cors = require('cors');
const mysql = require('mysql2');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Multer setup
const upload = multer({ dest: 'uploads/' });

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Global DB config variable
let dynamicDbConfig = null;

// 🔹 Save DB config from frontend
app.post('/set-db-config', (req, res) => {
  const { host, user, password, database } = req.body;
  if (!host || !user || !database) {
    console.log('❌ Incomplete DB config received:', req.body);
    return res.status(400).send('Incomplete DB config');
  }
  dynamicDbConfig = { host, user, password, database };
  console.log('✅ DB config saved:', dynamicDbConfig);
  res.send('DB config saved.');
});

// 🔹 Upload and transcribe audio
app.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    const filePath = req.file?.path;
    if (!filePath) return res.status(400).send('No audio file uploaded');

    // Upload to Cloudinary
    const cloudinaryRes = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
    });
    const audioUrl = cloudinaryRes.secure_url;

    // Send to AssemblyAI
    const transcriptRes = await axios.post(
      'https://api.assemblyai.com/v2/transcript',
      { audio_url: audioUrl },
      { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } }
    );
    const transcriptId = transcriptRes.data.id;

    // Poll AssemblyAI
    let completed = false;
    let transcription = '';
    while (!completed) {
      const polling = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        { headers: { authorization: process.env.ASSEMBLYAI_API_KEY } }
      );
      if (polling.data.status === 'completed') {
        completed = true;
        transcription = polling.data.text;
      } else if (polling.data.status === 'error') {
        throw new Error('Transcription failed: ' + polling.data.error);
      } else {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    fs.unlinkSync(filePath); // cleanup
    res.json({ audio_url: audioUrl, transcription });
  } catch (err) {
    console.error('❌ Error processing audio:', err.message);
    res.status(500).send('Error processing audio');
  }
});

// 🔹 Process transcription → SQL using Gemini + dynamic schema
app.post('/process-transcription', async (req, res) => {
  try {
    const { transcription, dbConfig } = req.body;

    if (!transcription || !dbConfig) {
      console.log('❌ Missing transcription or dbConfig:', req.body);
      return res.status(400).json({ error: 'Missing transcription or DB config' });
    }

    console.log('📝 Received transcription:', transcription);
    console.log('✅ DB config received:', dbConfig);

    const db = mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
    });

    try {
      await db.promise().connect();
      console.log('✅ Connected to MySQL');

      const [activeDb] = await db.promise().query('SELECT DATABASE() AS currentDb');
      console.log('🧭 Current DB in use:', activeDb[0].currentDb);
    } catch (connErr) {
      console.error('❌ DB connection failed:', connErr.message);
      return res.status(500).send('Database connection failed: ' + connErr.message);
    }

    const promiseDb = db.promise();

    try {
      const [tables] = await promiseDb.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = ?",
        [dbConfig.database]
      );

      let schemaText = `Tables and columns:\n`;
      for (const row of tables) {
        const table = row.TABLE_NAME || row.table_name;
        const [cols] = await promiseDb.query(`SHOW COLUMNS FROM \`${table}\``);
        const colList = cols.map(col => `${col.Field} (${col.Type})`).join(', ');
        schemaText += `- ${table}(${colList})\n`;
      }

      const [foreignKeys] = await promiseDb.query(`
        SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL
      `, [dbConfig.database]);

      let relationships = `\nTable relationships:\n`;
      if (foreignKeys.length === 0) {
        relationships += `- No foreign key relationships found.\n`;
      } else {
        for (const row of foreignKeys) {
          relationships += `- ${row.TABLE_NAME}.${row.COLUMN_NAME} → ${row.REFERENCED_TABLE_NAME}.${row.REFERENCED_COLUMN_NAME}\n`;
        }
      }

      console.log('📊 Extracted DB Schema:\n', schemaText);
      console.log('🔗 Foreign Key Relationships:\n', relationships);

      const prompt = `
You are a MySQL assistant. Convert natural language into SQL queries using ONLY this schema and relationships.

${schemaText}
${relationships}

IMPORTANT:
- Do NOT assume any additional columns or tables.
- Use JOINs only when needed based on relationships.
- If no valid SQL can be generated, return a comment explaining why.
- Return a clean SQL query in this format:

\`\`\`sql
SELECT ...
\`\`\`

User request: "${transcription}"
`;


      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const fullText = response.text();

      console.log('📄 Full Gemini Response:\n', fullText);

      const sqlMatch = fullText.match(/```sql\s*([\s\S]*?)```/i);
      const vizMatch = fullText.match(/```viz\s*([\s\S]*?)```/i);
      const vizType = vizMatch ? vizMatch[1].trim().toLowerCase() : 'table';

      if (!sqlMatch) {
        console.log('❌ No SQL found in Gemini response.');
        return res.json({ sql_query: null, explanation: fullText, results: null, viz_type: vizType });
      }

      const sqlQuery = sqlMatch[1].trim();
      console.log('📄 Extracted SQL:\n', sqlQuery);

      try {
        const [results] = await promiseDb.query(sqlQuery);
        
                console.log('✅ Query Results:', results);

        // 🔁 Second Gemini prompt to refine viz_type using query + schema + sample results
        const enhancedVizPrompt = `
You are a data visualization expert.

Based on the following:
- User request: "${transcription}"
- SQL Query: \`\`\`sql\n${sqlQuery}\n\`\`\`
- Database schema:\n${schemaText}
${relationships}
- Query result sample:\n${JSON.stringify(results.slice(0, 5), null, 2)}

Choose the most suitable visualization from this list:
[bar, pie, line, table, KPI, map, heatmap, hierarchical, text summary, scatter, bubble, radar, funnel, treemap, geo map]

Guidelines:
- Use pie for proportions or categorical breakdowns.
- Use bar for comparisons across categories.
- Use line for trends over time.
- Use KPI for single summary metrics (e.g., total users, revenue).
- Use heatmap for matrix-like data comparisons.
- Use hierarchical/treemap for parent-child category breakdowns.
- Use scatter for correlation between two numeric fields.
- Use bubble if there's a third dimension (size) on top of scatter.
- Use funnel for step-wise processes (e.g., sales funnel).
- Use map/geo map for geographic data with coordinates or region fields.
- Use table as fallback for complex, multidimensional queries.
- Use text summary if data is too complex to visualize or better explained in words.

Return only this format:
\`\`\`viz
<best_chart_type>
\`\`\`

Then explain why you chose that chart.
`;


        const vizModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const vizResult = await vizModel.generateContent(enhancedVizPrompt);
        const vizResponse = await vizResult.response;
        const vizText = vizResponse.text();

        console.log('📊 Final Visualization Suggestion:\n', vizText);

        const finalVizMatch = vizText.match(/```viz\s*([\s\S]*?)```/i);
        const finalVizType = finalVizMatch ? finalVizMatch[1].trim().toLowerCase() : vizType;

        // Final response includes refined viz suggestion and explanation
        res.json({
          sql_query: sqlQuery,
          results,
          viz_type: finalVizType,
          explanation: vizText
        });

      } catch (queryErr) {
        console.error('❌ SQL Query failed:', queryErr.message);
        console.log('🔍 Offending SQL:', sqlQuery);
        res.status(500).json({
          error: 'SQL execution failed',
          message: queryErr.message,
          sql_query: sqlQuery,
          viz_type: vizType
        });
      }

    } catch (schemaErr) {
      console.error('❌ Schema extraction error:', schemaErr.message);
      res.status(500).send('Failed to extract DB schema: ' + schemaErr.message);
    }

  } catch (err) {
    console.error('❌ Error processing transcription:', err.message);
    res.status(500).send('Error processing transcription');
  }
});

app.post('/schema-mermaid', async (req, res) => {
  try {
    const dbConfig = req.body.dbConfig || dynamicDbConfig;
    if (!dbConfig) return res.status(400).send('Missing DB config');

    const db = mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
    });

    const promiseDb = db.promise();
    await promiseDb.query('SELECT 1'); // Connection test

    const [tables] = await promiseDb.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ?",
      [dbConfig.database]
    );

    const [foreignKeys] = await promiseDb.query(`
      SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [dbConfig.database]);

    let mermaid = `erDiagram\n`;

    for (const row of tables) {
      const table = row.TABLE_NAME || row.table_name;
      const [cols] = await promiseDb.query(`SHOW COLUMNS FROM \`${table}\``);

      // Clean table name for Mermaid (remove special characters, spaces)
      const cleanTableName = table.replace(/[^a-zA-Z0-9_]/g, '_');
      
      mermaid += `    ${cleanTableName} {\n`;
      
      for (const col of cols) {
        // Clean column names and types for Mermaid syntax
        const cleanFieldName = col.Field.replace(/[^a-zA-Z0-9_]/g, '_');
        let cleanType = col.Type.replace(/\(.*?\)/g, '').toUpperCase();
        
        // Map MySQL types to valid Mermaid types
        const typeMapping = {
          'VARCHAR': 'string',
          'TEXT': 'string',
          'CHAR': 'string',
          'INT': 'int',
          'INTEGER': 'int',
          'BIGINT': 'bigint',
          'SMALLINT': 'int',
          'TINYINT': 'int',
          'DECIMAL': 'decimal',
          'FLOAT': 'float',
          'DOUBLE': 'double',
          'DATE': 'date',
          'DATETIME': 'datetime',
          'TIMESTAMP': 'timestamp',
          'TIME': 'time',
          'BOOLEAN': 'boolean',
          'BOOL': 'boolean',
          'JSON': 'json'
        };
        
        const mermaidType = typeMapping[cleanType] || 'string';
        
        // Add key indicators
        let keyIndicator = '';
        if (col.Key === 'PRI') {
          keyIndicator = ' PK';
        } else if (col.Key === 'UNI') {
          keyIndicator = ' UK';
        } else if (col.Key === 'MUL') {
          keyIndicator = ' FK';
        }
        
        mermaid += `        ${mermaidType} ${cleanFieldName}${keyIndicator}\n`;
      }
      mermaid += `    }\n`;
    }

    // Add relationships
    for (const fk of foreignKeys) {
      const cleanRefTable = fk.REFERENCED_TABLE_NAME.replace(/[^a-zA-Z0-9_]/g, '_');
      const cleanTable = fk.TABLE_NAME.replace(/[^a-zA-Z0-9_]/g, '_');
      const cleanRefColumn = fk.REFERENCED_COLUMN_NAME.replace(/[^a-zA-Z0-9_]/g, '_');
      const cleanColumn = fk.COLUMN_NAME.replace(/[^a-zA-Z0-9_]/g, '_');
      
      mermaid += `    ${cleanRefTable} ||--o{ ${cleanTable} : "references ${cleanRefColumn}"\n`;
    }

    
    
    // Close the database connection
    db.end();
    
    res.json({ mermaid });

  } catch (err) {
    console.error('❌ Schema ERD error:', err);
    res.status(500).send('Failed to generate Mermaid schema: ' + err.message);
  }
});




// 🔹 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
