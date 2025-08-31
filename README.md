# Blog Aggregator

A command-line RSS feed aggregator that lets you follow multiple blogs and browse their latest posts in one place.

## Prerequisites

Before setting up the blog aggregator, make sure you have the following installed:

- **Node.js**: Version 18.0.0 or higher (recommended: 22.15.0)
- **npm**: Comes with Node.js
- **PostgreSQL**: Version 12 or higher
- **Git**: For cloning the repository

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Ozmanovic/blog-aggregator.git
cd blog-aggregator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up the Database

Create a PostgreSQL database for the application:

```sql
CREATE DATABASE blog_aggregator;
```

### 4. Create Configuration File

Create a `.gatorconfig.json` file in your home directory (`~/.gatorconfig.json`):

```json
{
  "db_url": "postgres://username:password@localhost:5432/blog_aggregator"
}
```

Replace `username`, `password`, and database details with your PostgreSQL credentials.

### 5. Run Database Migrations

Generate and apply the database schema:

```bash
npm run generate
npm run migrate
```

## Usage

The blog aggregator uses a command-line interface with the following commands:

### User Management

**Register a new user:**
```bash
npm start register johndoe
```

**Login as an existing user:**
```bash
npm start login johndoe
```

### Feed Management

**Add a new RSS feed:**
```bash
npm start addfeed "Tech Blog" "https://example.com/feed.xml"
```

**View all available feeds:**
```bash
npm start feeds
```

**Follow a feed:**
```bash
npm start follow "https://example.com/feed.xml"
```

**View feeds you're following:**
```bash
npm start following
```

**Unfollow a feed:**
```bash
npm start unfollow "https://example.com/feed.xml"
```

### Content Aggregation

**Start the feed aggregator (fetches new posts periodically):**
```bash
npm start agg 30s
```

Time intervals can be specified as:
- `30s` - 30 seconds
- `5m` - 5 minutes  
- `1h` - 1 hour

**Browse your aggregated posts:**
```bash
npm start browse
```

### Utility Commands

**View all users:**
```bash
npm start users
```

**Reset all data (removes all users and feeds):**
```bash
npm start reset
```

## Example RSS Feeds

Here are some working RSS feeds you can use for testing:

1. **Hacker News**: `https://hnrss.org/frontpage`
2. **DEV Community**: `https://dev.to/feed`
3. **GitHub Blog**: `https://github.blog/feed/`

### Quick Start Example

```bash
# Register and login
npm start register alice
npm start login alice

# Add and follow some feeds
npm start addfeed "Hacker News" "https://hnrss.org/frontpage"
npm start follow "https://hnrss.org/frontpage"

# Start aggregating (in a separate terminal)
npm start agg 1m

# Browse posts
npm start browse
```

## Project Structure

- `src/` - Source code
  - `commandHandler.ts` - Command implementations
  - `config.ts` - Configuration management
  - `index.ts` - Main entry point
  - `lib/` - Database and RSS utilities
- `drizzle.config.ts` - Database configuration
- `package.json` - Dependencies and scripts

## Troubleshooting

**Database connection issues:**
- Verify PostgreSQL is running
- Check your database credentials in `~/.gatorconfig.json`
- Ensure the database exists

**Command not found:**
- Make sure you're in the project directory
- Verify dependencies are installed with `npm install`

**Feed parsing errors:**
- Some RSS feeds may have non-standard formats
- Try different feeds if one doesn't work
