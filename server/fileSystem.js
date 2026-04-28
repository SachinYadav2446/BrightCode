const fs = require('fs');
const path = require('path');

/**
 * Robust FileSystem class to manage in-memory file state and disk synchronization.
 * This centralizes all file operations to ensure consistency.
 */
class FileSystem {
    constructor(roomId, initialFiles = {}) {
        this.roomId = roomId;
        this.files = initialFiles; // Flat object: { path: { content, language } }
        // Note: tmp_builds is at the root of the server directory
        this.roomDir = path.join(__dirname, 'tmp_builds', roomId);
        
        if (!fs.existsSync(this.roomDir)) {
            fs.mkdirSync(this.roomDir, { recursive: true });
        }
    }

    /**
     * Helper to get language from extension
     */
    getLanguage(fileName) {
        const ext = (fileName.split('.').pop() || '').toLowerCase();
        const langMap = {
            js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
            py: 'python', html: 'html', htm: 'html', css: 'css', scss: 'css',
            json: 'json', md: 'markdown', mdx: 'markdown', cpp: 'cpp', c: 'cpp',
            h: 'cpp', java: 'java', sql: 'sql', yaml: 'yaml', yml: 'yaml',
            sh: 'shell', txt: 'plaintext', env: 'plaintext'
        };
        return langMap[ext] || 'plaintext';
    }

    /**
     * Create a new file
     */
    createFile(fileName, content = '', language = null) {
        if (this.files[fileName]) return null;
        
        const lang = language || this.getLanguage(fileName);
        this.files[fileName] = { content, language: lang };
        
        this.syncFileToDisk(fileName);
        return { fileName, language: lang, content };
    }

    /**
     * Delete a file
     */
    deleteFile(fileName) {
        if (!this.files[fileName]) return false;
        
        delete this.files[fileName];
        this.deleteFromDisk(fileName);
        return true;
    }

    /**
     * Rename a file
     */
    renameFile(oldName, newName) {
        if (!this.files[oldName] || this.files[newName]) return null;
        
        const fileData = this.files[oldName];
        const newLanguage = this.getLanguage(newName);
        
        const renamedData = { ...fileData, language: newLanguage };
        this.files[newName] = renamedData;
        delete this.files[oldName];
        
        this.renameOnDisk(oldName, newName);
        return { oldName, newName, newLanguage };
    }

    /**
     * Create a folder (represented by a .keep file)
     */
    createFolder(folderPath) {
        const keepFile = path.join(folderPath, '.keep').replace(/\\/g, '/');
        if (this.files[keepFile]) return null;
        
        return this.createFile(keepFile, '', 'plaintext');
    }

    /**
     * Delete a folder and all its contents
     */
    deleteFolder(folderPath) {
        const prefix = folderPath + '/';
        const deletedFiles = [];
        
        Object.keys(this.files).forEach(f => {
            if (f.startsWith(prefix) || f === folderPath) {
                delete this.files[f];
                deletedFiles.push(f);
            }
        });

        if (deletedFiles.length > 0) {
            const fullPath = path.join(this.roomDir, folderPath);
            try {
                if (fs.existsSync(fullPath)) {
                    fs.rmSync(fullPath, { recursive: true, force: true });
                }
            } catch (err) {
                console.error(`[FS FOLDER DELETE ERROR] ${folderPath}:`, err);
            }
            return deletedFiles;
        }
        return null;
    }

    /**
     * Rename a folder and all its contents
     */
    renameFolder(oldPath, newPath) {
        const oldPrefix = oldPath + '/';
        const newPrefix = newPath + '/';
        const renamedMap = {};

        // Check if target already exists
        if (Object.keys(this.files).some(f => f.startsWith(newPrefix))) return null;

        Object.keys(this.files).forEach(f => {
            if (f.startsWith(oldPrefix)) {
                const newName = f.replace(oldPrefix, newPrefix);
                this.files[newName] = { ...this.files[f] };
                this.files[newName].language = this.getLanguage(newName);
                delete this.files[f];
                renamedMap[f] = newName;
            }
        });

        if (Object.keys(renamedMap).length > 0) {
            this.renameOnDisk(oldPath, newPath);
            return renamedMap;
        }
        return null;
    }

    /**
     * Update file content
     */
    updateFileContent(fileName, content) {
        if (!this.files[fileName]) return false;
        this.files[fileName].content = content;
        this.syncFileToDisk(fileName);
        return true;
    }

    /**
     * Sync in-memory file to disk
     */
    syncFileToDisk(fileName) {
        try {
            const filePath = path.join(this.roomDir, fileName);
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(filePath, this.files[fileName].content || '');
        } catch (err) {
            console.error(`[FS SYNC ERROR] ${fileName}:`, err);
        }
    }

    /**
     * Delete file from disk
     */
    deleteFromDisk(fileName) {
        try {
            const filePath = path.join(this.roomDir, fileName);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (err) {
            console.error(`[FS DELETE ERROR] ${fileName}:`, err);
        }
    }

    /**
     * Rename file or folder on disk
     */
    renameOnDisk(oldName, newName) {
        try {
            const oldPath = path.join(this.roomDir, oldName);
            const newPath = path.join(this.roomDir, newName);
            const newDir = path.dirname(newPath);
            
            if (fs.existsSync(oldPath)) {
                if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });
                fs.renameSync(oldPath, newPath);
            }
        } catch (err) {
            console.error(`[FS RENAME ERROR] ${oldName} -> ${newName}:`, err);
        }
    }

    /**
     * Get all files
     */
    getFiles() {
        return this.files;
    }
}

module.exports = FileSystem;
