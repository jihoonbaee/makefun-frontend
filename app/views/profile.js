import { getProfile } from '../api.js';
import { esc, money, number, date, bountyUrl, pager, avatar } from '../format.js';

export async function renderProfile(root, handle, active) {
  let profile;
  try { profile = await getProfile(handle); }
  catch (error) {
    if (error.status !== 404) throw error;
    if (active()) { document.title = 'Account not found — make.fun'; root.innerHTML = '<div class="empty"><span class="eyebrow">ACCOUNT NOT FOUND</span><h1>A builder yet to be discovered.</h1><p>No public account exists at this handle.</p><a class="button primary" href="#/">Explore bounties →</a></div>'; }
    return;
  }
  if (!active()) return;
  document.title = '@' + profile.handle + ' — make.fun';
  const record = profile.record || {};
  const solutions = profile.solutions || [];
  let page = 0;
  root.innerHTML = `<div class="breadcrumb"><a href="#/">Bounties</a><span>/</span><span>Builder profile</span></div><section class="profile-hero"><div class="profile-avatar">${avatar(profile.avatar || profile.image, profile.handle)}</div><div><span class="eyebrow">THE PEOPLE WHO MAKE</span><h1>${esc(profile.display_name || profile.handle)}</h1><span class="muted">@${esc(profile.handle)} · Joined ${date(profile.joined_at, true)}</span><p>${esc(profile.bio || 'Building and competing on make.fun.')}</p></div></section><section class="record-grid" aria-label="Competition record">${[['Entered', record.competitions_entered], ['Placed', record.competitions_placed], ['Won', record.competitions_won], ['Best placement', record.best_placement ? '#' + record.best_placement : '—'], ['Prize total', money(record.prize_usd)]].map(([label, value]) => `<div><span>${label}</span><strong>${typeof value === 'number' ? number(value) : value ?? 0}</strong></div>`).join('')}</section><div class="section-title"><h2>The builds <span class="count">${solutions.length}</span></h2><span class="muted">A record of ideas put to the test.</span></div><section class="leader-panel"><div class="table-scroll"><table><thead><tr><th>Solution / Competition</th><th>Placement</th><th>Prize</th><th>Score</th></tr></thead><tbody id="solutions"></tbody></table></div><div id="pagination" class="pagination"></div></section>`;
  const draw = () => {
    root.querySelector('#solutions').innerHTML = solutions.length ? solutions.slice(page * 20, (page + 1) * 20).map(solution => `<tr><td><a class="solution-title" href="${bountyUrl(solution.competition.slug)}">${esc(solution.title)}</a><small class="solution-competition">${esc(solution.competition.title)}</small></td><td>${solution.placement ? '#' + number(solution.placement) : 'Unplaced'}</td><td class="main-score">${money(solution.prize_usd)}</td><td>${esc(solution.score?.display ?? solution.score?.value ?? '—')}<small class="solution-competition">${esc(solution.score?.column ?? '')}</small></td></tr>`).join('') : '<tr><td colspan="4"><div class="empty compact"><h3>The next build is still ahead.</h3><p>No public solutions yet.</p></div></td></tr>';
    root.querySelector('#pagination').innerHTML = pager(page, solutions.length, 20);
  };
  root.querySelector('#pagination').addEventListener('click', event => { const button = event.target.closest('[data-page]'); if (button && !button.disabled) { page = Number(button.dataset.page); draw(); } });
  draw();
}
