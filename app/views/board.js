import { getBounties, get } from '../api.js';
import { esc, money, pot, date, timeLeft, number, bountyUrl, isOpen, pager } from '../format.js';

export async function renderBoard(root, active) {
  const data = await getBounties();
  let items = [...data.items];
  let cursor = data.next_cursor;
  while (cursor) {
    const next = await get('/competitions?status=open&activity=times&cursor=' + encodeURIComponent(cursor));
    items.push(...next.items);
    if (next.next_cursor === cursor) break;
    cursor = next.next_cursor;
  }
  if (!active()) return;
  items = items.filter(isOpen);
  let page = 0;
  const size = 8;
  document.title = 'Bounties — make.fun';
  root.innerHTML = `<section class="board-hero"><div><div class="eyebrow"><span class="tiny-cross">✳</span> THE PLAYGROUND FOR BUILDERS</div><h1>Build something<br>that <span class="accent-word">wins.<svg viewBox="0 0 270 15" aria-hidden="true"><path d="M3 11 Q125 -2 267 7"/></svg></span></h1><p>Real challenges. Open competition. Rewards for the best.<br>Find your next idea and make it happen.</p><a class="text-link" href="#bounties">Find your next challenge <span>↓</span></a></div><aside class="hero-stats"><span class="eyebrow">OPPORTUNITY, IN REAL TIME</span><strong>${money(items.reduce((sum, item) => sum + Number(item.potUsd ?? item.rewardAmount ?? 0), 0))}<span class="spark">✳</span></strong><span>in live bounty rewards</span><div><span><b>${items.length}</b> open bounties</span><span><b>${number(items.reduce((sum, item) => sum + Number(item.submissionCount || 0), 0))}</b> entries and counting</span></div><small><i></i> Big ideas start with a little competition.</small></aside></section>
  <section id="bounties"><div class="section-title"><h2>The bounty board <span class="count">${items.length}</span></h2><span class="live-label"><i></i> Accepting entries now</span></div><div class="toolbar"><div class="filter-tabs"><span class="selected">All bounties</span><select id="category" aria-label="Filter by category"><option value="">All categories</option>${[...new Set(items.map(item => item.category).filter(Boolean))].map(category => `<option>${esc(category)}</option>`).join('')}</select></div><div class="board-tools"><label class="search-label"><span>⌕</span><input id="search" type="search" placeholder="Find a bounty…" aria-label="Search bounties"></label><label class="sort-label">Sort by <select id="sort"><option value="deadline">Closing soon</option><option value="reward">Highest reward</option></select></label></div></div><div class="board-head"><span>BOUNTY / CHALLENGE</span><span>LIVE REWARD</span><span>ENTRY FEE</span><span>DEADLINE</span><span>ENTRIES</span><span></span></div><div id="rows"></div><div class="pagination" id="pagination"></div></section><div class="board-note"><span>↗</span><div><strong>Made for the ones who make.</strong><span>Every bounty is a chance to turn a “what if” into something real.</span></div><span class="note-end">Your next build starts here.</span></div>`;
  root.querySelector('.text-link').addEventListener('click', event => { event.preventDefault(); root.querySelector('#bounties').scrollIntoView({ behavior: 'smooth' }); });
  const draw = () => {
    const query = root.querySelector('#search').value.toLowerCase();
    const category = root.querySelector('#category').value;
    const filtered = items.filter(item => (!category || item.category === category) && (item.title + ' ' + item.summary).toLowerCase().includes(query));
    filtered.sort(root.querySelector('#sort').value === 'reward' ? (a, b) => Number(b.potUsd ?? b.rewardAmount) - Number(a.potUsd ?? a.rewardAmount) : (a, b) => Date.parse(a.deadline) - Date.parse(b.deadline));
    page = Math.min(page, Math.max(0, Math.ceil(filtered.length / size) - 1));
    root.querySelector('#rows').innerHTML = filtered.length ? filtered.slice(page * size, (page + 1) * size).map(item => `<article class="bounty-row"><div class="bounty-title"><span class="category-icon">${({ Games: '♞', Code: '⌘', Trading: '↗', Growth: '✳', Forecasting: '⌁' })[item.category] || '◇'}</span><div><a href="${bountyUrl(item.slug)}">${esc(item.title)}</a><span class="row-meta">${esc(item.category || 'Challenge')}<span>·</span><span class="open-dot">Open</span></span></div></div><div class="reward-cell"><strong>${pot(item)}</strong><small>USD prize pot</small></div><div class="fee-cell">${Number(item.entryFeeUsd) ? money(item.entryFeeUsd) : '<span class="free">Free</span>'}</div><div class="deadline-cell"><strong>${timeLeft(item.deadline)}</strong><small>${date(item.deadline, true)}</small></div><div class="entries-cell">${number(item.submissionCount)}<small>entries</small></div><a class="row-arrow" href="${bountyUrl(item.slug)}" aria-label="View ${esc(item.title)}">↗</a></article>`).join('') : '<div class="empty compact"><h3>No matching bounties</h3><p>Try another search or category.</p></div>';
    root.querySelector('#pagination').innerHTML = pager(page, filtered.length, size);
  };
  root.querySelector('#search').addEventListener('input', () => { page = 0; draw(); });
  for (const id of ['category', 'sort']) root.querySelector('#' + id).addEventListener('change', () => { page = 0; draw(); });
  root.querySelector('#pagination').addEventListener('click', event => { const button = event.target.closest('[data-page]'); if (button && !button.disabled) { page = Number(button.dataset.page); draw(); } });
  draw();
}
