const fs = require('fs');
const path = require('path');
const { simpleGit } = require('simple-git');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

const BLOCKED_URL_PATTERNS = [
    /^file:/i,
    /^git@[^:]+:(\d+|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/,
    /^https?:\/\/(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i,
];

const DEFAULT_IGNORE = new Set([
    '.git',
    'node_modules',
    '.env',
    '.env.local',
]);

function validateRemoteUrl(url) {
    if (!url || typeof url !== 'string') {
        throw new Error('Repository URL is required');
    }
    const trimmed = url.trim();
    if (BLOCKED_URL_PATTERNS.some((pattern) => pattern.test(trimmed))) {
        throw new Error('This repository URL is not allowed');
    }
    if (!/^https:\/\/|^git@|^ssh:\/\//i.test(trimmed)) {
        throw new Error('Use an HTTPS or SSH Git remote URL');
    }
    return trimmed;
}

function withAuthUrl(url, token) {
    if (!token) return url;
    if (url.startsWith('https://')) {
        return url.replace('https://', `https://x-access-token:${token}@`);
    }
    return url;
}

function stripAuthFromUrl(url) {
    return url.replace(/https:\/\/x-access-token:[^@]+@/i, 'https://');
}

class GitService {
    constructor(roomDir) {
        this.roomDir = roomDir;
        this.git = simpleGit({ baseDir: roomDir });
    }

    async isRepo() {
        return fs.existsSync(path.join(this.roomDir, '.git'));
    }

    async status() {
        const isRepo = await this.isRepo();
        if (!isRepo) {
            return { isRepo: false, branch: null, ahead: 0, behind: 0, staged: [], modified: [], untracked: [], deleted: [], conflicted: [] };
        }

        const status = await this.git.status();
        return {
            isRepo: true,
            branch: status.current,
            tracking: status.tracking || null,
            ahead: status.ahead,
            behind: status.behind,
            staged: status.staged,
            modified: status.modified,
            untracked: status.not_added,
            deleted: status.deleted,
            conflicted: status.conflicted,
            isClean: status.isClean(),
        };
    }

    async init() {
        if (await this.isRepo()) {
            throw new Error('Repository already initialized');
        }
        await this.git.init();
        await this.ensureGitignore();
        return { success: true };
    }

    async ensureGitignore() {
        const gitignorePath = path.join(this.roomDir, '.gitignore');
        if (fs.existsSync(gitignorePath)) return;
        const defaults = ['node_modules/', '.env', '.env.local', 'dist/', 'build/', '.DS_Store'];
        fs.writeFileSync(gitignorePath, defaults.join('\n') + '\n');
    }

    async clone(url, token, branch) {
        validateRemoteUrl(url);
        const authUrl = withAuthUrl(url, token);
        const cloneDir = path.join(this.roomDir, '__clone_tmp__');

        if (fs.existsSync(cloneDir)) {
            fs.rmSync(cloneDir, { recursive: true, force: true });
        }

        const args = ['clone', '--depth', '50'];
        if (branch) {
            args.push('--branch', branch);
        }
        args.push(authUrl, cloneDir);

        await execFileAsync('git', args, { cwd: this.roomDir, maxBuffer: 10 * 1024 * 1024 });

        const entries = fs.readdirSync(cloneDir);
        for (const entry of entries) {
            if (entry === '.git') continue;
            const src = path.join(cloneDir, entry);
            const dest = path.join(this.roomDir, entry);
            if (fs.existsSync(dest)) {
                fs.rmSync(dest, { recursive: true, force: true });
            }
            fs.renameSync(src, dest);
        }

        const gitSrc = path.join(cloneDir, '.git');
        const gitDest = path.join(this.roomDir, '.git');
        if (fs.existsSync(gitDest)) fs.rmSync(gitDest, { recursive: true, force: true });
        fs.renameSync(gitSrc, gitDest);

        fs.rmSync(cloneDir, { recursive: true, force: true });

        this.git = simpleGit({ baseDir: this.roomDir });
        const remotes = await this.git.getRemotes(true);
        if (remotes.length === 0) {
            await this.git.addRemote('origin', stripAuthFromUrl(url));
        } else {
            await this.git.remote(['set-url', 'origin', stripAuthFromUrl(url)]);
        }

        return { success: true, branch: branch || (await this.git.revparse(['--abbrev-ref', 'HEAD'])) };
    }

    async branches() {
        if (!(await this.isRepo())) return { current: null, branches: [], remotes: [] };
        const summary = await this.git.branch(['-a']);
        const remotes = await this.git.getRemotes(true);
        return {
            current: summary.current,
            branches: summary.all.filter((b) => !b.startsWith('remotes/')),
            remotes: remotes.map((r) => ({ name: r.name, url: stripAuthFromUrl(r.refs.fetch || r.refs.push || '') })),
        };
    }

    async checkout(branch) {
        await this.git.checkout(branch);
        return { branch };
    }

    async createBranch(name) {
        await this.git.checkoutLocalBranch(name);
        return { branch: name };
    }

    async stage(files) {
        if (!files || files.length === 0) {
            await this.git.add('.');
        } else {
            await this.git.add(files);
        }
        return this.status();
    }

    async unstage(files) {
        if (!files || files.length === 0) {
            await this.git.reset(['HEAD']);
        } else {
            await this.git.reset(['HEAD', '--', ...files]);
        }
        return this.status();
    }

    async commit(message, author) {
        if (!message?.trim()) throw new Error('Commit message is required');
        const opts = {};
        if (author?.name) opts['--author'] = `${author.name}${author.email ? ` <${author.email}>` : ''}`;
        await this.git.commit(message.trim(), undefined, opts);
        const log = await this.log(1);
        return { commit: log[0] || null };
    }

    async push(token, remote = 'origin', branch) {
        const currentBranch = branch || (await this.git.revparse(['--abbrev-ref', 'HEAD']));
        const remotes = await this.git.getRemotes(true);
        const target = remotes.find((r) => r.name === remote);
        if (!target) throw new Error(`Remote "${remote}" not found`);

        const cleanUrl = stripAuthFromUrl(target.refs.push || target.refs.fetch);
        if (token) {
            await this.git.remote(['set-url', remote, withAuthUrl(cleanUrl, token)]);
        }
        try {
            await this.git.push(remote, currentBranch, ['--set-upstream']);
        } finally {
            if (token) {
                await this.git.remote(['set-url', remote, cleanUrl]);
            }
        }
        return { branch: currentBranch, remote };
    }

    async pull(token, remote = 'origin', branch) {
        const currentBranch = branch || (await this.git.revparse(['--abbrev-ref', 'HEAD']));
        const remotes = await this.git.getRemotes(true);
        const target = remotes.find((r) => r.name === remote);
        if (!target) throw new Error(`Remote "${remote}" not found`);

        const cleanUrl = stripAuthFromUrl(target.refs.fetch || target.refs.push);
        if (token) {
            await this.git.remote(['set-url', remote, withAuthUrl(cleanUrl, token)]);
        }
        try {
            await this.git.pull(remote, currentBranch);
        } finally {
            if (token) {
                await this.git.remote(['set-url', remote, cleanUrl]);
            }
        }
        return { branch: currentBranch };
    }

    async log(limit = 20) {
        if (!(await this.isRepo())) return [];
        const result = await this.git.log({ maxCount: limit });
        return result.all.map((entry) => ({
            hash: entry.hash,
            message: entry.message,
            author: entry.author_name,
            email: entry.author_email,
            date: entry.date,
        }));
    }

    async diff(filePath, staged = false) {
        if (!(await this.isRepo())) return '';
        const args = staged ? ['--cached'] : [];
        if (filePath) args.push('--', filePath);
        return this.git.diff(args);
    }

    async addRemote(name, url) {
        validateRemoteUrl(url);
        const remotes = await this.git.getRemotes();
        if (remotes.some((r) => r.name === name)) {
            await this.git.remote(['set-url', name, url]);
        } else {
            await this.git.addRemote(name, url);
        }
        return this.branches();
    }
}

function walkDir(dir, baseDir, files = [], exclude = DEFAULT_IGNORE) {
    if (!fs.existsSync(dir)) return files;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (exclude.has(entry.name)) continue;
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        if (entry.isDirectory()) {
            walkDir(fullPath, baseDir, files, exclude);
        } else if (entry.isFile() && !relPath.endsWith('.keep')) {
            files.push(relPath);
        }
    }
    return files;
}

function loadFilesFromDisk(roomDir, existingFs) {
    const langFn = existingFs?.getLanguage?.bind(existingFs) || (() => 'plaintext');
    const filePaths = walkDir(roomDir, roomDir);
    const files = {};
    for (const filePath of filePaths) {
        try {
            const content = fs.readFileSync(path.join(roomDir, filePath), 'utf8');
            files[filePath] = { content, language: langFn(filePath) };
        } catch {
            // skip binary/unreadable files
        }
    }
    return files;
}

module.exports = {
    GitService,
    validateRemoteUrl,
    loadFilesFromDisk,
    stripAuthFromUrl,
};
