export const esc = value => String(value ?? '').replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`);
export function money(value) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2 }) : '—';
}
export function date(value, short = false) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Not announced';
  return new Date(value).toLocaleString('en-US', short ? { dateStyle: 'medium', timeZone: 'UTC' } : { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + (short ? '' : ' UTC');
}
export function timeLeft(value) {
  const remaining = Date.parse(value) - Date.now();
  if (!Number.isFinite(remaining)) return 'No deadline';
  if (remaining <= 0) return 'Entries closed';
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor(remaining / 3600000) % 24;
  const minutes = Math.floor(remaining / 60000) % 60;
  return days ? `${days}d ${hours}h left` : hours ? `${hours}h ${minutes}m left` : `${Math.max(1, minutes)}m left`;
}
export const number = value => Number(value ?? 0).toLocaleString('en-US');
export const pot = bounty => money(bounty.potUsd ?? bounty.rewardAmount ?? bounty.reward_usd);
export const bountyUrl = slug => '#/bounty/' + encodeURIComponent(slug);
export const isOpen = bounty => Date.parse(bounty.deadline) > Date.now() && !['closed', 'resolved', 'cancelled'].includes(bounty.status);
export const status = bounty => isOpen(bounty) ? 'Open for entries' : bounty.status === 'open' ? 'Awaiting results' : String(bounty.status ?? 'Closed').replaceAll('_', ' ');
export function pager(page, total, size) {
  const pages = Math.max(1, Math.ceil(total / size));
  return `<span>${total ? number(page * size + 1) : 0}–${number(Math.min((page + 1) * size, total))} of ${number(total)}</span><div class="page-controls"><button data-page="${page - 1}" ${page === 0 ? 'disabled' : ''}>← Previous</button><span>Page ${page + 1} of ${pages}</span><button data-page="${page + 1}" ${page + 1 >= pages ? 'disabled' : ''}>Next →</button></div>`;
}
export function prose(value) {
  return String(value ?? '').split(/\n\n+/).map(block => {
    if (/^#{1,4} /.test(block)) {
      const lines = block.split('\n');
      return `<h3>${esc(lines.shift().replace(/^#+ /, ''))}</h3>${lines.length ? `<p>${inline(lines.join('\n'))}</p>` : ''}`;
    }
    return `<p>${inline(block)}</p>`;
  }).join('');
}
function inline(value) {
  return esc(value).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}
export function avatar(source, label) {
  if (!source) return `<span class="avatar fallback">${esc(String(label || '?').slice(0, 1).toUpperCase())}</span>`;
  try {
    const url = new URL(source, 'https://make.fun');
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    return `<img class="avatar" crossorigin="anonymous" src="${esc(url.href)}" alt="" loading="lazy">`;
  } catch { return ''; }
}
