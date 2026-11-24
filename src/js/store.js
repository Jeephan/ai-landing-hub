// ============================================================
// 本地持久化层：种子数据 + localStorage 用户提交内容
// 说明：当前版本为前端演示，数据保存在浏览器本地；
// 后端 API / 数据库接入路线见 README「数据层规划」。
// ============================================================

import { SEED_PROJECTS, SEED_DEVELOPERS } from "./data.js";

const KEYS = {
  projects: "alh:projects:v1",
  developers: "alh:developers:v1",
  wishProjects: "alh:wishlist:projects",
  wishDevs: "alh:wishlist:developers",
  interests: "alh:interests:v1"
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 隐私模式等场景下降级为内存态 */
  }
}

// ---------- 需求（招标） ----------
export function getProjects() {
  const custom = read(KEYS.projects, []);
  return [...custom, ...SEED_PROJECTS];
}

export function getProject(id) {
  return getProjects().find((p) => p.id === id) || null;
}

export function addProject(data) {
  const custom = read(KEYS.projects, []);
  const project = {
    id: `custom-${Date.now()}`,
    status: "open",
    views: 0,
    createdAt: new Date().toISOString(),
    ...data
  };
  custom.unshift(project);
  write(KEYS.projects, custom);
  return project;
}

// ---------- 开发者 ----------
export function getDevelopers() {
  const custom = read(KEYS.developers, []);
  return [...custom, ...SEED_DEVELOPERS];
}

export function getDeveloper(id) {
  return getDevelopers().find((d) => d.id === id) || null;
}

export function addDeveloper(data) {
  const custom = read(KEYS.developers, []);
  const dev = {
    id: `custom-${Date.now()}`,
    rating: 5.0,
    projectsDone: 0,
    verified: false,
    ...data
  };
  custom.unshift(dev);
  write(KEYS.developers, custom);
  return dev;
}

// ---------- 收藏 ----------
export function getWishProjects() {
  return read(KEYS.wishProjects, []);
}
export function toggleWishProject(id) {
  const list = getWishProjects();
  const idx = list.indexOf(id);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(id);
  write(KEYS.wishProjects, list);
  return idx < 0;
}
export function isWishProject(id) {
  return getWishProjects().includes(id);
}

export function getWishDevs() {
  return read(KEYS.wishDevs, []);
}
export function toggleWishDev(id) {
  const list = getWishDevs();
  const idx = list.indexOf(id);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(id);
  write(KEYS.wishDevs, list);
  return idx < 0;
}
export function isWishDev(id) {
  return getWishDevs().includes(id);
}

// ---------- 投标意向 ----------
export function addInterest(record) {
  const list = read(KEYS.interests, []);
  list.unshift({ at: new Date().toISOString(), ...record });
  write(KEYS.interests, list);
}
export function getInterests() {
  return read(KEYS.interests, []);
}
