import { getLeaderboard } from '../api.js';
import { esc, number, bountyUrl, pager } from '../format.js';

export async function renderLeaderboard(root, slug, active) {
  const data = await getLeaderboard(slug);
  if (!active()) return;
  const competition = data.competition;
  const columns = (data.columns || []).filter(column => !column.hidden);
  let entries = data.entries || [];
  let page = 0;
  let sortKey = 'rank';
  let direction = 1;
  document.title = 'Leaderboard — ' + competition.title + ' — make.fun';
  root.innerHTML = `<div class="breadcrumb"><a href="#/">Bounties</a><span>/</span><a href="${bountyUrl(slug)}">${esc(competition.title)}</a><span>/</span><span>Leaderboard</span></div><section class="leader-hero"><div><div class="eyebrow">THE BUILDERS. THE BENCHMARKS.</div><h1>May the best build win<span class="green">.</span></h1><p>${esc(competition.title)}</p></div><div class="leader-count"><strong>${number(entries.length)}</strong><span>ranked entries <span class="green">↗</span></span></div></section><nav class="tabs" aria-label="Bounty navigation"><a href="${bountyUrl(slug)}">Overview</a><a class="selected" href="${bountyUrl(slug)}/leaderboard">Leaderboard</a></nav><section class="leader-panel"><div class="leader-toolbar"><div><span class="live-label"><i></i> Live standings</span><span class="muted">${esc(data.phase?.title || (typeof data.phase === 'string' ? data.phase : ''))} · ${columns.length} scoring metrics</span></div><label class="search-label"><span>⌕</span><input id="entry-search" type="search" placeholder="Search entries or handles…" aria-label="Search leaderboard"></label></div><div class="table-scroll"><table><caption class="sr-only">Leaderboard for ${esc(competition.title)}</caption><thead><tr><th><button data-sort="rank">Rank ↕</button></th><th>Builder</th><th>Entry</th>${columns.map(column => `<th class="numeric" title="${esc(column.sorting === 'asc' ? 'Lower is better' : 'Higher is better')}"><button data-sort="${esc(column.key)}">${esc(column.title)} ${column.sorting === 'asc' ? '↑' : '↓'}</button></th>`).join('')}</tr></thead><tbody id="leader-rows"></tbody></table></div><div class="pagination" id="pagination"></div><div class="table-note"><span>Scores and ranks are reported by make.fun. Standings may change until results are final.</span><a href="${bountyUrl(slug)}">View challenge ↗</a></div></section>`;
  const draw = () => {
    const query = root.querySelector('#entry-search').value.toLowerCase();
    const filtered = entries.filter(entry => ((entry.handle || '') + ' ' + entry.title).toLowerCase().includes(query));
    const sorted = [...filtered].sort((a, b) => direction * (Number(sortKey === 'rank' ? a.rank ?? Infinity : a.values?.[sortKey] ?? -Infinity) - Number(sortKey === 'rank' ? b.rank ?? Infinity : b.values?.[sortKey] ?? -Infinity)));
    root.querySelector('#leader-rows').innerHTML = sorted.length ? sorted.slice(page * 50, (page + 1) * 50).map(entry => `<tr><td><span class="rank ${entry.rank <= 3 ? 'top-rank rank-' + entry.rank : ''}">${entry.rank == null ? '—' : number(entry.rank)}</span></td><td>${entry.handle ? `<a class="handle" href="#/account/${encodeURIComponent(entry.handle)}"><span class="mini-avatar">${esc(entry.handle.slice(0, 1).toUpperCase())}</span>${esc(entry.handle)}</a>` : '<span class="muted">Anonymous entry</span>'}</td><td class="entry-title"><span title="${esc(entry.title)}">${esc(entry.title || 'Untitled entry')}</span>${entry.house ? '<small class="house-tag">HOUSE</small>' : ''}</td>${columns.map(column => {
      const raw = entry.values?.[column.key];
      const display = entry.display?.[column.key] ?? (typeof raw === 'number' ? raw.toLocaleString('en-US', { maximumFractionDigits: column.precision ?? 2 }) : raw ?? '—');
      return `<td class="numeric ${column === columns[0] ? 'main-score' : ''}">${esc(display)}</td>`;
    }).join('')}</tr>`).join('') : `<tr><td colspan="${3 + columns.length}"><div class="empty compact"><h2>${entries.length ? 'No matching entries' : 'The starting line is open.'}</h2><p>${entries.length ? 'Try a different title or handle.' : 'No leaderboard has been published yet. Check back after entries are scored.'}</p><a href="${bountyUrl(slug)}">Back to the challenge →</a></div></td></tr>`;
    root.querySelector('#pagination').innerHTML = pager(page, filtered.length, 50);
    root.querySelectorAll('[data-sort]').forEach(button => button.closest('th').setAttribute('aria-sort', button.dataset.sort === sortKey ? direction === 1 ? 'ascending' : 'descending' : 'none'));
  };
  root.querySelector('#entry-search').addEventListener('input', () => { page = 0; draw(); });
  root.querySelector('thead').addEventListener('click', event => {
    const button = event.target.closest('[data-sort]');
    if (!button) return;
    const key = button.dataset.sort;
    direction = key === sortKey ? -direction : key === 'rank' || columns.find(column => column.key === key)?.sorting === 'asc' ? 1 : -1;
    sortKey = key; page = 0; draw();
  });
  root.querySelector('#pagination').addEventListener('click', event => { const button = event.target.closest('[data-page]'); if (button && !button.disabled) { page = Number(button.dataset.page); draw(); root.querySelector('.leader-panel').scrollIntoView(); } });
  draw();
}
