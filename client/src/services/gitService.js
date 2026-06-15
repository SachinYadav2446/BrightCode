import axios from 'axios';
import API_URL from '../config';

function authHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const gitApi = axios.create({ baseURL: `${API_URL}/api/git` });

gitApi.interceptors.request.use((config) => {
    config.headers = { ...config.headers, ...authHeaders() };
    return config;
});

export const getOAuthStatus = () => gitApi.get('/oauth/status').then((r) => r.data);
export const getOAuthUrl = () => gitApi.get('/oauth/authorize').then((r) => r.data);
export const savePatToken = (token) => gitApi.post('/oauth/token', { token }).then((r) => r.data);
export const disconnectGitHub = () => gitApi.delete('/oauth/disconnect').then((r) => r.data);

export const getGitStatus = (roomId) => gitApi.get(`/room/${roomId}/status`).then((r) => r.data);
export const getGitLog = (roomId, limit = 20) => gitApi.get(`/room/${roomId}/log`, { params: { limit } }).then((r) => r.data);
export const getGitDiff = (roomId, file, staged = false) =>
    gitApi.get(`/room/${roomId}/diff`, { params: { file, staged } }).then((r) => r.data);

export const initRepo = (roomId) => gitApi.post(`/room/${roomId}/init`).then((r) => r.data);
export const cloneRepo = (roomId, url, branch) => gitApi.post(`/room/${roomId}/clone`, { url, branch }).then((r) => r.data);
export const stageFiles = (roomId, files) => gitApi.post(`/room/${roomId}/stage`, { files }).then((r) => r.data);
export const unstageFiles = (roomId, files) => gitApi.post(`/room/${roomId}/unstage`, { files }).then((r) => r.data);
export const commitChanges = (roomId, message, authorName, authorEmail) =>
    gitApi.post(`/room/${roomId}/commit`, { message, authorName, authorEmail }).then((r) => r.data);
export const checkoutBranch = (roomId, branch) => gitApi.post(`/room/${roomId}/checkout`, { branch }).then((r) => r.data);
export const createBranch = (roomId, name) => gitApi.post(`/room/${roomId}/branch`, { name }).then((r) => r.data);
export const pushChanges = (roomId, remote, branch) => gitApi.post(`/room/${roomId}/push`, { remote, branch }).then((r) => r.data);
export const pullChanges = (roomId, remote, branch) => gitApi.post(`/room/${roomId}/pull`, { remote, branch }).then((r) => r.data);
export const addRemote = (roomId, url, name = 'origin') => gitApi.post(`/room/${roomId}/remote`, { url, name }).then((r) => r.data);

export default gitApi;
