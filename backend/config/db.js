const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let dbMode = 'json'; // 'mongodb' or 'json'
const JSON_DIR = path.join(__dirname, '../data');

// Create data directory if it doesn't exist
if (!fs.existsSync(JSON_DIR)) {
  fs.mkdirSync(JSON_DIR, { recursive: true });
}

// Helper to read JSON files
const readJsonFile = (filename) => {
  const filePath = path.join(JSON_DIR, `${filename}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading ${filename}.json, resetting:`, err);
    return [];
  }
};

// Helper to write JSON files
const writeJsonFile = (filename, data) => {
  const filePath = path.join(JSON_DIR, `${filename}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.log('⚠️  No MONGO_URI specified in env. Activating WoodNest local JSON file-based database store.');
    dbMode = 'json';
    return;
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    dbMode = 'mongodb';
    console.log('✅ Connected to MongoDB Atlas successfully.');
  } catch (err) {
    console.log(`❌ MongoDB connection failed: ${err.message}`);
    console.log('⚠️  Falling back to WoodNest local JSON file-based database store.');
    dbMode = 'json';
  }
};

// Unified DB engine interface
const dbEngine = {
  getMode: () => dbMode,

  // General CRUD helper for JSON fallback
  find: async (modelName, query = {}) => {
    if (dbMode === 'mongodb') {
      const Model = mongoose.model(modelName);
      return await Model.find(query);
    } else {
      let data = readJsonFile(modelName);
      // Simple filter matching
      return data.filter(item => {
        for (let key in query) {
          if (query[key] !== undefined && item[key] !== query[key]) {
            return false;
          }
        }
        return true;
      });
    }
  },

  findOne: async (modelName, query = {}) => {
    if (dbMode === 'mongodb') {
      const Model = mongoose.model(modelName);
      return await Model.findOne(query);
    } else {
      let data = readJsonFile(modelName);
      return data.find(item => {
        for (let key in query) {
          if (query[key] !== undefined && item[key] !== query[key]) {
            return false;
          }
        }
        return true;
      }) || null;
    }
  },

  findById: async (modelName, id) => {
    if (dbMode === 'mongodb') {
      const Model = mongoose.model(modelName);
      return await Model.findById(id);
    } else {
      let data = readJsonFile(modelName);
      return data.find(item => item._id === id || item.id === id) || null;
    }
  },

  create: async (modelName, doc) => {
    if (dbMode === 'mongodb') {
      const Model = mongoose.model(modelName);
      const newDoc = new Model(doc);
      return await newDoc.save();
    } else {
      let data = readJsonFile(modelName);
      const newDoc = {
        _id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
        ...doc,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.push(newDoc);
      writeJsonFile(modelName, data);
      return newDoc;
    }
  },

  findByIdAndUpdate: async (modelName, id, update) => {
    if (dbMode === 'mongodb') {
      const Model = mongoose.model(modelName);
      return await Model.findByIdAndUpdate(id, update, { new: true });
    } else {
      let data = readJsonFile(modelName);
      const index = data.findIndex(item => item._id === id || item.id === id);
      if (index === -1) return null;
      
      const updated = {
        ...data[index],
        ...update,
        updatedAt: new Date().toISOString()
      };
      data[index] = updated;
      writeJsonFile(modelName, data);
      return updated;
    }
  },

  findByIdAndDelete: async (modelName, id) => {
    if (dbMode === 'mongodb') {
      const Model = mongoose.model(modelName);
      return await Model.findByIdAndDelete(id);
    } else {
      let data = readJsonFile(modelName);
      const index = data.findIndex(item => item._id === id || item.id === id);
      if (index === -1) return null;
      const removed = data[index];
      data.splice(index, 1);
      writeJsonFile(modelName, data);
      return removed;
    }
  }
};

module.exports = { connectDB, dbEngine };
