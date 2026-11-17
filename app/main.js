import { renderBoard } from './views/board.js';
import { renderBounty } from './views/bounty.js';
import { esc } from './format.js';

const main = document.querySelector('main');
let version = 0;
async function route() {
  const current = ++version;
  window.__shotReady = false;
  main.setAttribute('aria-busy', 'true');
  main.innerHTML = '<div class="loading"><span class="spinner"></span> Finding the latest on make.fun…</div>';
  const active = () => current === version;
  try {
    const path = (location.hash || '#/').slice(1).split('?')[0];
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    document.querySelector('#board-nav').classList.toggle('active', !parts.length);
    if (!parts.length) await renderBoard(main, active);
    else if (parts[0] === 'bounty' && parts[1] && parts.length === 2) await renderBounty(main, parts[1], active);
    else if (parts[0] === 'bounty' && parts[2] === 'leaderboard' && parts.length === 3) {
      const { renderLeaderboard } = await import('./views/leaderboard.js');
      if (active()) await renderLeaderboard(main, parts[1], active);
    } else if (parts[0] === 'account' && parts[1] && parts.length === 2) {
      const { renderProfile } = await import('./views/profile.js');
      if (active()) await renderProfile(main, parts[1], active);
    } else main.innerHTML = '<div class="empty"><h1>Page not found</h1><p>There’s plenty more to build.</p><a class="button primary" href="#/">Explore bounties →</a></div>';
  } catch (error) {
    if (active()) {
      main.innerHTML = `<div class="empty"><span class="eyebrow">${error.status === 404 ? 'NOT FOUND' : 'CONNECTION INTERRUPTED'}</span><h1>${error.status === 404 ? 'Nothing here just yet.' : 'Let’s try that again.'}</h1><p>${esc(error.message)}</p><button class="primary" id="retry">Try again</button> <a class="button" href="#/">Back to bounties</a></div>`;
      main.querySelector('#retry').addEventListener('click', route);
    }
  } finally {
    if (active()) {
      main.removeAttribute('aria-busy');
      window.__shotReady = true;
      window.scrollTo(0, 0);
    }
  }
}
window.addEventListener('hashchange', route);
document.addEventListener('error', event => {
  if (event.target instanceof HTMLImageElement) event.target.hidden = true;
}, true);
route();
