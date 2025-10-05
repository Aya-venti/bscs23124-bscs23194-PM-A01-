
// Main application functionality
const API_BASE = window.location.origin + '/api';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  console.log('Launch Agency Standards Repository loaded');
  initDataPopulations();
  loadBookmarks();
});

// ========== Standards Actions ==========
async function openStandard(standard, page = null) {
  if (page) {
    window.open(`/docs/${standard}.pdf#page=${page}`, '_blank');
  } else {
    window.open(`/docs/${standard}.pdf`, '_blank');
  }
}

function downloadStandard(standard) {
  window.location.href = `/docs/${standard}.pdf`;
}

async function bookmarkStandard(standard, page = 1, topicKey = null, note = '') {
  try {
    const payload = { standard, page, topicKey, note };
    const res = await fetch(`${API_BASE}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    alert('✅ Bookmark saved');
    console.log(json);
    loadBookmarks();
  } catch (err) {
    console.error(err);
    alert('❌ Failed to save bookmark');
  }
}

// ========== Populate Topics & Scenarios ==========
async function initDataPopulations() {
  try {
    // Fetch topics
    const topicsRes = await fetch(`${API_BASE}/topics`);
    const data = await topicsRes.json();

    // Some APIs return {topics: [...]}, some just return [...]
    const topics = data.topics || data;

    const topicSelect = document.getElementById('topicSelect');
    if (topicSelect) {
      topicSelect.innerHTML = '<option value="">Select a topic...</option>';
      topics.forEach(topic => {
        const opt = document.createElement('option');
        opt.value = topic.key;        // must match backend field
        opt.textContent = topic.title || topic.key; 
        topicSelect.appendChild(opt);
      });
    }

    // Fetch scenarios (for process generator page)
    const scRes = await fetch(`${API_BASE}/scenarios`);
    const scData = await scRes.json();
    const scenarios = scData.scenarios || scData;

    const scenarioSelect = document.getElementById('projectTypeSelect');
    if (scenarioSelect) {
      scenarioSelect.innerHTML = '';
      (Array.isArray(scenarios) ? scenarios : Object.values(scenarios)).forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = s.name;
        scenarioSelect.appendChild(opt);
      });
    }

  } catch (err) {
    console.error('❌ Failed to init data', err);
  }
}

//========== Show Comparison ==========
async function showComparison() {
    const sel = document.getElementById('topicSelect');
    if (!sel) return;
    const topicKey = sel.value;
    if (!topicKey) return;

    try {
        const res = await fetch(`${API_BASE}/topics/${topicKey}`);
        const t = await res.json();
        const out = document.getElementById('comparisonResults');
        if (!out) return;

        out.style.display = 'block';
        out.innerHTML = `
            <h3>${t.title || topicKey}</h3>

            <div class="comparison-tabs">
                <div class="tab active" data-tab="similarities">Similarities</div>
                <div class="tab" data-tab="differences">Differences</div>
                <div class="tab" data-tab="unique">Unique Points</div>
            </div>

            <!-- Similarities -->
            <div class="tab-content active" id="similaritiesTab">
                <ul>
                   ${(t.similarities || '')
                    .split(/\n+/)
                    .map(s => s.trim())
                    .filter(Boolean)
                    .map(s => `<li>${s.replace(/^•?\s*/, '')}</li>`)
                    .join('')}
                </ul>
            </div>

            <!-- Differences -->
            <div class="tab-content" id="differencesTab">
                <div class="comparison-grid">
                    <div class="standard-comparison">
                        <h4>PMBOK</h4>
                        <p>${t.differences?.["PMBOK"] || ''}</p>
                         ${Array.isArray(t.deepLinks?.PMBOK)
                           ? t.deepLinks.PMBOK.map(p => 
                            `<a href="/docs/PMBOK7.pdf#page=${p}" target="_blank" class="deep-link">🔗 PMBOK p.${p}</a>`
                           ).join('<br>')
                           : (t.deepLinks?.PMBOK 
                            ? `<a href="/docs/PMBOK7.pdf#page=${t.deepLinks.PMBOK}" target="_blank" class="deep-link">🔗 PMBOK p.${t.deepLinks.PMBOK}</a>` 
                            : '')}

                    </div>
                    <div class="standard-comparison">
                        <h4>PRINCE2</h4>
                        <p>${t.differences?.PRINCE2 || ''}</p>
                        ${Array.isArray(t.deepLinks?.PRINCE2)
                          ? t.deepLinks.PRINCE2.map(p => 
                          `<a href="/docs/PRINCE2.pdf#page=${p}" target="_blank" class="deep-link">🔗 PRINCE2 p.${p}</a>`
                          ).join('<br>')
                         : (t.deepLinks?.PRINCE2 
                          ? `<a href="/docs/PRINCE2.pdf#page=${t.deepLinks.PRINCE2}" target="_blank" class="deep-link">🔗 PRINCE2 p.${t.deepLinks.PRINCE2}</a>` 
                         : '')}
                        
                    </div>
                    <div class="standard-comparison">
                        <h4>ISO 21502</h4>
                        <p>${t.differences?.["ISO21502"] || ''}</p>
                        ${Array.isArray(t.deepLinks?.ISO21502)
                           ? t.deepLinks.ISO21502.map(p => 
                           `<a href="/docs/ISO21502.pdf#page=${p}" target="_blank" class="deep-link">🔗 ISO21502 p.${p}</a>`
                           ).join('<br>')
                           : (t.deepLinks?.ISO21502 
                           ? `<a href="/docs/ISO21502.pdf#page=${t.deepLinks.ISO21502}" target="_blank" class="deep-link">🔗 ISO21502 p.${t.deepLinks.ISO21502}</a>` 
                          : '')}
                    </div>
                </div>
            </div>

            <!-- Unique Points -->
            <div class="tab-content" id="uniqueTab">
                <div class="comparison-grid">
                    <div class="standard-comparison">
                        <h4>PMBOK</h4>
                        <p>${t.uniquePoints?.["PMBOK"] || ''}</p>
                          ${Array.isArray(t.deepLinks?.PMBOK)
                           ? t.deepLinks.PMBOK.map(p => 
                            `<a href="/docs/PMBOK7.pdf#page=${p}" target="_blank" class="deep-link">🔗 PMBOK p.${p}</a>`
                           ).join('<br>')
                           : (t.deepLinks?.PMBOK 
                            ? `<a href="/docs/PMBOK7.pdf#page=${t.deepLinks.PMBOK}" target="_blank" class="deep-link">🔗 PMBOK p.${t.deepLinks.PMBOK}</a>` 
                            : '')}
                    </div>
                    <div class="standard-comparison">
                        <h4>PRINCE2</h4>
                        <p>${t.uniquePoints?.PRINCE2 || ''}</p>
                         ${Array.isArray(t.deepLinks?.PRINCE2)
                          ? t.deepLinks.PRINCE2.map(p => 
                          `<a href="/docs/PRINCE2.pdf#page=${p}" target="_blank" class="deep-link">🔗 PRINCE2 p.${p}</a>`
                          ).join('<br>')
                         : (t.deepLinks?.PRINCE2 
                          ? `<a href="/docs/PRINCE2.pdf#page=${t.deepLinks.PRINCE2}" target="_blank" class="deep-link">🔗 PRINCE2 p.${t.deepLinks.PRINCE2}</a>` 
                         : '')}
                        
                    </div>
                    </div>
                    <div class="standard-comparison">
                        <h4>ISO 21502</h4>
                        <p>${t.uniquePoints?.["ISO21502"] || ''}</p>
                        ${Array.isArray(t.deepLinks?.ISO21502)
                           ? t.deepLinks.ISO21502.map(p => 
                           `<a href="/docs/ISO21502.pdf#page=${p}" target="_blank" class="deep-link">🔗 ISO21502 p.${p}</a>`
                           ).join('<br>')
                           : (t.deepLinks?.ISO21502 
                           ? `<a href="/docs/ISO21502.pdf#page=${t.deepLinks.ISO21502}" target="_blank" class="deep-link">🔗 ISO21502 p.${t.deepLinks.ISO21502}</a>` 
                          : '')}
                    </div>
                </div>
            </div>

            <button class="action-btn" onclick="bookmarkStandard(null, 1, '${topicKey}')">
                🔖 Bookmark this topic
            </button>
        `;

        // Enable tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                const tabId = tab.getAttribute('data-tab');
                document.getElementById(`${tabId}Tab`).classList.add('active');
            });
        });

    } catch (err) {
        console.error(err);
        alert('❌ Failed to load topic');
    }
}



// ========== Show Tailored Process ==========
async function showTailoredProcess() {
  const sel = document.getElementById('projectTypeSelect');
  if (!sel) return;
  const name = sel.value;
  if (!name) return;

  try {
    const res = await fetch(`${API_BASE}/scenarios`);
    const data = await res.json();
    const scenario = Array.isArray(data.scenarios)
      ? data.scenarios.find(s => s.name === name)
      : data.scenarios[name];

    const out = document.getElementById('processOutput');
    if (!out) return;

    out.innerHTML = `
      <h3>${name}</h3>
      <p>${scenario.summary || ''}</p>
      <div>${(scenario.steps || []).map((s,i)=>`
        <div class="process-step">
          <div class="step-number">${i+1}</div>
          <div class="step-content"><h4>${s}</h4></div>
        </div>`).join('')}
      </div>
    `;
    out.style.display = 'block';
  } catch (err) {
    console.error(err);
    alert('❌ Failed to load scenario');
  }
}

// ========== Load Bookmarks ==========
async function loadBookmarks() {
  const out = document.getElementById('bookmarks');
  if (!out) return;
  try {
    const res = await fetch(`${API_BASE}/bookmarks`);
    const data = await res.json();
    out.innerHTML = '<ul>' + data.map(b =>
      `<li>${b.topicKey || b.standard} (page ${b.page}) — ${new Date(b.createdAt).toLocaleString()}</li>`
    ).join('') + '</ul>';
  } catch (err) {
    console.error(err);
  }
}