# MongoDB Integration Guide

This guide explains how to set up and use MongoDB with the Reset Pixel Art Tool.

## Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB Community Edition or MongoDB Atlas account

## Option 1: Local MongoDB Installation

### Windows

1. Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Run the installer and follow the installation wizard
3. MongoDB should be installed at `C:\Program Files\MongoDB\Server\7.0\`
4. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```

### macOS

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu)

```bash
curl https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-org
systemctl start mongod
```

## Option 2: MongoDB Atlas (Cloud)

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Set up Network Access (IP Whitelist) - for development, you can allow access from anywhere (0.0.0.0/0)
4. Create a database user (note the username and password)
5. Get your connection string and update `.env`

## Configuration

### .env Setup

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/reset

# For MongoDB Atlas
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/reset?retryWrites=true&w=majority

# Enable MongoDB integration
USE_MONGODB=true
NODE_ENV=development
```

Replace `<username>`, `<password>`, and `<cluster>` with your actual MongoDB Atlas credentials.

## Running the Application

### Start Development Server with MongoDB

```bash
npm run dev
```

The server will automatically connect to MongoDB at startup.

### Database Connection Logging

The server logs connection status. Look for:
```
MongoDB connected successfully
```

## Migration from JSON to MongoDB

If you have existing data in the JSON file system, migrate it to MongoDB:

```bash
npm run migrate
```

This script will:
1. Read all users and files from the `/data` directory
2. Create corresponding documents in MongoDB
3. Preserve all file history and undo/redo states
4. Report migration status and any errors

**Note:** The migration is one-way and non-destructive. Original JSON files are not deleted.

## Using MongoDB

### Create a User

```
POST /api/users
Content-Type: application/json

{
  "username": "artist",
  "email": "artist@example.com",
  "password": "securepassword"
}
```

### Login

```
POST /api/users/login
Content-Type: application/json

{
  "username": "artist",
  "password": "securepassword"
}
```

### Create a File

```
POST /api/files/create
Content-Type: application/json
x-user-name: artist

{
  "fileName": "my-art.pax",
  "width": 64,
  "height": 64
}
```

## Troubleshooting

### MongoDB Connection Refused

**Error:** `connect ECONNREFUSED 127.0.0.1:27017`

**Solution:** Ensure MongoDB is running:
- Windows: `net start MongoDB`
- macOS: `brew services start mongodb-community`
- Linux: `systemctl start mongod`

### Authentication Failed (MongoDB Atlas)

**Error:** `authentication failed`

**Solution:**
1. Verify username and password in connection string
2. Check IP whitelist in MongoDB Atlas (Network Access)
3. Ensure password doesn't contain special characters that need URL encoding

### Connection Timeout

**Error:** `connect timeout` after 30 seconds

**Solution:**
1. Include `?serverSelectionTimeoutMS=10000` in connection string to extend timeout
2. Check firewall rules
3. For Atlas, ensure IP is whitelisted

## Switching Between Storage Backends

To switch between JSON file storage and MongoDB:

- **Use JSON:** Set `USE_MONGODB=false` in `.env` (or leave it unset)
- **Use MongoDB:** Set `USE_MONGODB=true` in `.env`

Run the server:
```bash
npm run dev
```

## Best Practices

1. **Always backup your data** before migrating
2. **Use MongoDB Atlas** for production with proper authentication
3. **Set strong passwords** for MongoDB
4. **Use connection pooling** for better performance
5. **Monitor database usage** on MongoDB Atlas dashboard

## Performance Tips

- Indexed queries on `username` and `filename` for fast lookups
- Compound index on `(username, filename)` for file uniqueness
- Consider sharding for large deployments

## Support

For issues related to:
- **MongoDB setup:** https://docs.mongodb.com/
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/
- **Mongoose:** https://mongoosejs.com/docs/
