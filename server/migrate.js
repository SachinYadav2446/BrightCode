/**
 * migrate.js — BrightCode → Neon DB migration
 * Run once: node migrate.js
 * Reads all local JSON stores and upserts them into Neon PostgreSQL.
 * Uses the standard pg driver (TCP) — works reliably in local environments.
 */

// Allow self-signed / mismatched certs for Neon pooler from local machine
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// channel_binding=require forces SCRAM-SHA-256-PLUS which requires a verified
// TLS channel — incompatible with rejectUnauthorized:false. Strip it for migration.
const rawConn = process.env.DB_CONNECTION_STRING;
const parsed = new URL(rawConn.replace(/^postgres(ql)?:\/\//, 'https://'));
parsed.searchParams.delete('channel_binding');
parsed.searchParams.set('sslmode', 'no-verify');

const migrateConn = `postgresql://${parsed.username}:${parsed.password}@${parsed.hostname}${parsed.port ? ':' + parsed.port : ''}${parsed.pathname}?${parsed.searchParams.toString()}`;

const client = new Client({
    host: parsed.hostname,
    port: parseInt(parsed.port || '5432'),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
    ssl: { rejectUnauthorized: false },
});

// ── helpers ─────────────────────────────────────────────────────────────────
const readJSON = (file) => {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) return null;
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
};

const run = async (query, params = []) => {
    const result = await client.query(query, params);
    return result;
};

// ── 1. CREATE TABLES ─────────────────────────────────────────────────────────
async function createTables() {
    console.log('\n📦 Creating tables...');

    await run(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            xp INTEGER DEFAULT 0,
            css_level INTEGER DEFAULT 0,
            logic_level INTEGER DEFAULT 0,
            react_level INTEGER DEFAULT 0,
            mern_level INTEGER DEFAULT 0,
            java_level INTEGER DEFAULT 0,
            cpp_level INTEGER DEFAULT 0,
            python_level INTEGER DEFAULT 0,
            go_level INTEGER DEFAULT 0,
            level TEXT DEFAULT 'Novice',
            activity JSONB DEFAULT '{}',
            created_count INTEGER DEFAULT 0,
            joined_count INTEGER DEFAULT 0,
            avatar TEXT,
            avatar_id TEXT DEFAULT 'Sniper',
            banner_id TEXT DEFAULT 'crimson',
            bio TEXT DEFAULT '',
            stack JSONB DEFAULT '[]',
            github TEXT DEFAULT '',
            leetcode TEXT DEFAULT '',
            project1 TEXT DEFAULT '',
            project2 TEXT DEFAULT '',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('  ✅ users');

    await run(`
        CREATE TABLE IF NOT EXISTS folders (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            parent_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('  ✅ folders');

    await run(`
        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT DEFAULT 'Untitled Note',
            content TEXT DEFAULT '',
            folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
            tags JSONB DEFAULT '[]',
            challenge_id TEXT,
            challenge_module TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP WITH TIME ZONE
        );
    `);
    console.log('  ✅ notes');

    await run(`
        CREATE TABLE IF NOT EXISTS factions (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            description TEXT DEFAULT '',
            emblem TEXT DEFAULT '⚔️',
            owner_id TEXT NOT NULL,
            owner_name TEXT NOT NULL,
            members JSONB DEFAULT '[]',
            pending_members JSONB DEFAULT '[]',
            is_public BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('  ✅ factions');

    await run(`
        CREATE TABLE IF NOT EXISTS friends (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            requester_id TEXT NOT NULL,
            recipient_id TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(requester_id, recipient_id)
        );
    `);
    console.log('  ✅ friends');
}

// ── 2. MIGRATE USERS ─────────────────────────────────────────────────────────
async function migrateUsers() {
    console.log('\n👤 Migrating users...');
    const data = readJSON('users_db.json');
    if (!data || !data.users) { console.log('  ⚠️  No users_db.json found'); return; }

    let inserted = 0, skipped = 0;
    for (const u of data.users) {
        try {
            await run(`
                INSERT INTO users (
                    id, username, email, password, xp,
                    css_level, logic_level, react_level, mern_level,
                    java_level, cpp_level, python_level, go_level,
                    level, activity, created_count, joined_count,
                    avatar_id, banner_id, bio, stack,
                    github, leetcode, project1, project2, created_at
                ) VALUES (
                    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
                    $14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26
                ) ON CONFLICT (id) DO UPDATE SET
                    xp = EXCLUDED.xp,
                    css_level = EXCLUDED.css_level,
                    logic_level = EXCLUDED.logic_level,
                    react_level = EXCLUDED.react_level,
                    mern_level = EXCLUDED.mern_level,
                    java_level = EXCLUDED.java_level,
                    activity = EXCLUDED.activity,
                    created_count = EXCLUDED.created_count,
                    joined_count = EXCLUDED.joined_count,
                    avatar_id = EXCLUDED.avatar_id,
                    banner_id = EXCLUDED.banner_id,
                    bio = EXCLUDED.bio,
                    stack = EXCLUDED.stack,
                    github = EXCLUDED.github,
                    leetcode = EXCLUDED.leetcode,
                    project1 = EXCLUDED.project1,
                    project2 = EXCLUDED.project2
            `, [
                u.id,
                u.username,
                u.email,
                u.password,
                u.xp || 0,
                u.css_level || 0,
                u.logic_level || 0,
                u.react_level || 0,
                u.mern_level || 0,
                u.java_level || 0,
                u.cpp_level || 0,
                u.python_level || 0,
                u.go_level || 0,
                u.level || 'Novice',
                JSON.stringify(u.activity || {}),
                u.created_count || 0,
                u.joined_count || 0,
                u.avatarId || u.avatar_id || 'Sniper',
                u.bannerId || u.banner_id || 'crimson',
                u.bio || '',
                JSON.stringify(Array.isArray(u.stack) ? u.stack : []),
                u.github || '',
                u.leetcode || '',
                u.project1 || '',
                u.project2 || '',
                u.created_at || u.joinedAt || new Date().toISOString()
            ]);
            inserted++;
        } catch (e) {
            console.error(`  ❌ User ${u.username}: ${e.message}`);
            skipped++;
        }
    }
    console.log(`  ✅ ${inserted} inserted/updated, ${skipped} skipped`);
}

// ── 3. MIGRATE FOLDERS ───────────────────────────────────────────────────────
async function migrateFolders() {
    console.log('\n📁 Migrating folders...');
    const data = readJSON('notes_db.json');
    if (!data || !data.folders) { console.log('  ⚠️  No folders found'); return; }

    let inserted = 0, skipped = 0;
    for (const f of data.folders) {
        try {
            await run(`
                INSERT INTO folders (id, user_id, name, parent_id, created_at)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (id) DO NOTHING
            `, [f.id, f.user_id, f.name, f.parent_id || null, f.created_at]);
            inserted++;
        } catch (e) {
            console.error(`  ❌ Folder ${f.name}: ${e.message}`);
            skipped++;
        }
    }
    console.log(`  ✅ ${inserted} inserted, ${skipped} skipped`);
}

// ── 4. MIGRATE NOTES ─────────────────────────────────────────────────────────
async function migrateNotes() {
    console.log('\n📝 Migrating notes...');
    const data = readJSON('notes_db.json');
    if (!data || !data.notes) { console.log('  ⚠️  No notes found'); return; }

    let inserted = 0, skipped = 0;
    for (const n of data.notes) {
        try {
            await run(`
                INSERT INTO notes (
                    id, user_id, title, content, folder_id, tags,
                    challenge_id, challenge_module, created_at, updated_at, deleted_at
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    content = EXCLUDED.content,
                    updated_at = EXCLUDED.updated_at,
                    deleted_at = EXCLUDED.deleted_at
            `, [
                n.id, n.user_id, n.title || 'Untitled Note',
                n.content || '', n.folder_id || null,
                JSON.stringify(n.tags || []),
                n.challenge_id || null, n.challenge_module || null,
                n.created_at, n.updated_at, n.deleted_at || null
            ]);
            inserted++;
        } catch (e) {
            console.error(`  ❌ Note ${n.title}: ${e.message}`);
            skipped++;
        }
    }
    console.log(`  ✅ ${inserted} inserted/updated, ${skipped} skipped`);
}

// ── 5. MIGRATE FACTIONS ──────────────────────────────────────────────────────
async function migrateFactions() {
    console.log('\n⚔️  Migrating factions...');
    const data = readJSON('factions_db.json');
    if (!Array.isArray(data) || data.length === 0) { console.log('  ⚠️  No factions found'); return; }

    let inserted = 0, skipped = 0;
    for (const f of data) {
        try {
            await run(`
                INSERT INTO factions (
                    id, name, description, emblem, owner_id, owner_name,
                    members, pending_members, is_public, created_at
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                ON CONFLICT (id) DO UPDATE SET
                    members = EXCLUDED.members,
                    pending_members = EXCLUDED.pending_members,
                    is_public = EXCLUDED.is_public
            `, [
                f.id, f.name, f.description || '',
                f.emblem || '⚔️',
                f.ownerId || f.owner_id,
                f.ownerName || f.owner_name,
                JSON.stringify(f.members || []),
                JSON.stringify(f.pendingMembers || f.pending_members || []),
                f.isPublic !== undefined ? f.isPublic : true,
                f.createdAt || f.created_at || new Date().toISOString()
            ]);
            inserted++;
        } catch (e) {
            console.error(`  ❌ Faction ${f.name}: ${e.message}`);
            skipped++;
        }
    }
    console.log(`  ✅ ${inserted} inserted/updated, ${skipped} skipped`);
}

// ── 6. MIGRATE FRIENDS ───────────────────────────────────────────────────────
async function migrateFriends() {
    console.log('\n🤝 Migrating friends...');
    const data = readJSON('friends_db.json');
    if (!Array.isArray(data) || data.length === 0) { console.log('  ℹ️  No friends data'); return; }

    let inserted = 0, skipped = 0;
    for (const f of data) {
        try {
            await run(`
                INSERT INTO friends (id, requester_id, recipient_id, status, created_at)
                VALUES ($1,$2,$3,$4,$5)
                ON CONFLICT (requester_id, recipient_id) DO UPDATE SET
                    status = EXCLUDED.status
            `, [f.id, f.requester_id, f.recipient_id, f.status || 'pending', f.created_at]);
            inserted++;
        } catch (e) {
            console.error(`  ❌ Friend relation: ${e.message}`);
            skipped++;
        }
    }
    console.log(`  ✅ ${inserted} inserted/updated, ${skipped} skipped`);
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
    console.log('🚀 BrightCode → Neon Migration');
    console.log('   Connection:', process.env.DB_CONNECTION_STRING.replace(/:([^:@]+)@/, ':***@'));

    try {
        await client.connect();
        console.log('   ✅ Connected to Neon via TCP (pg)\n');

        await createTables();
        await migrateUsers();
        await migrateFolders();
        await migrateNotes();
        await migrateFactions();
        await migrateFriends();
        console.log('\n✅ Migration complete!\n');
    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
        console.error(err.stack);
        process.exit(1);
    } finally {
        await client.end();
    }
})();
