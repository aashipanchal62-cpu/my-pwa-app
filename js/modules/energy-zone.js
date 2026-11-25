/**
 * STUDYVERSE – Energy Zone (Motivation, Instagram Reels, YouTube Shorts, Focus Music)
 * energy-zone.js
 * Links study reels to both YouTube and Instagram for all major CA subjects.
 */
window.SV = window.SV || {};

SV.EnergyZone = (() => {
  let activeTab = 'reels'; // 'reels' | 'videos' | 'music'
  let activePlatformFilter = 'all'; // 'all' | 'instagram' | 'youtube'

  const CA_REELS = [
    {
      id: 'r1',
      title: 'CA Final May 2027 Exam Notification & BoS Important Guidelines',
      subject: 'ICAI Official',
      handle: '@icai_official',
      category: 'Exam Notification',
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=600&fit=crop&q=80',
      views: '180K', likes: '24.5K',
      instagramUrl: 'https://www.instagram.com/icai.official/',
      youtubeUrl: 'https://www.youtube.com/results?search_query=ICAI+CA+Final+May+2027+Scheme',
      youtubeEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'r2',
      title: 'Ind AS 115 Revenue 5-Step Model Explained in 60 Seconds',
      subject: 'Financial Reporting',
      handle: '@ca_aspirants_india',
      category: 'Study Tip',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=600&fit=crop&q=80',
      views: '95K', likes: '15.8K',
      instagramUrl: 'https://www.instagram.com/',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Ind+AS+115+5+step+model+CA+Final',
      youtubeEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'r3',
      title: 'Black-Scholes Call Option Model & Greeks in 90 Seconds',
      subject: 'AFM',
      handle: '@cafinalcracker',
      category: 'AFM Formula',
      thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=600&fit=crop&q=80',
      views: '84K', likes: '11.4K',
      instagramUrl: 'https://www.instagram.com/',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Black+Scholes+model+CA+Final+AFM',
      youtubeEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'r4',
      title: 'SA 701 Key Audit Matters (KAM) Criteria & CARO 2020 Clause Review',
      subject: 'Advanced Auditing',
      handle: '@ca_audit_hub',
      category: 'Auditing Standard',
      thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=600&fit=crop&q=80',
      views: '110K', likes: '18.2K',
      instagramUrl: 'https://www.instagram.com/',
      youtubeUrl: 'https://www.youtube.com/results?search_query=SA+701+Key+Audit+Matters+CA+Final',
      youtubeEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'r5',
      title: 'Transfer Pricing 6 Methods Comparison – Quick Revision Reel',
      subject: 'Direct Tax',
      handle: '@cafinalcracker',
      category: 'International Tax',
      thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=600&fit=crop&q=80',
      views: '76K', likes: '12.3K',
      instagramUrl: 'https://www.instagram.com/',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Transfer+Pricing+methods+CA+Final+DT',
      youtubeEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'r6',
      title: 'GST Input Tax Credit Blocked Supplies (Section 17(5)) in 2 Mins',
      subject: 'Indirect Tax',
      handle: '@ca_aspirants_india',
      category: 'GST Revision',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=600&fit=crop&q=80',
      views: '145K', likes: '22.4K',
      instagramUrl: 'https://www.instagram.com/',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Section+17+5+blocked+credit+GST+CA+Final',
      youtubeEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'r7',
      title: 'How AIR 1 Studied in Last 60 Days – Daily Routine & Study Hacks',
      subject: 'CA Motivation',
      handle: '@motivationforcastudents',
      category: 'Topper Strategy',
      thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=600&fit=crop&q=80',
      views: '310K', likes: '42.1K',
      instagramUrl: 'https://www.instagram.com/',
      youtubeUrl: 'https://www.youtube.com/results?search_query=AIR+1+CA+Final+topper+interview+routine',
      youtubeEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'r8',
      title: 'Study 10+ Hours Daily Without Losing Focus or Getting Burned Out',
      subject: 'Mental Wellness',
      handle: '@motivationforcastudents',
      category: 'Focus & Habits',
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=600&fit=crop&q=80',
      views: '220K', likes: '28.7K',
      instagramUrl: 'https://www.instagram.com/',
      youtubeUrl: 'https://www.youtube.com/results?search_query=How+to+study+12+hours+daily+for+CA+exams',
      youtubeEmbed: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    }
  ];

  const MOTIVATIONAL_VIDEOS = [
    {
      id: 'v1', title: 'AIR 1 CA Final Strategy & Daily Mindset', creator: 'ICAI Toppers Talk', duration: '14 mins',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&fit=crop&q=60',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'Ranker Interview', views: '124K',
      youtubeUrl: 'https://www.youtube.com/results?search_query=CA+Final+Ranker+Interview+AIR+1'
    },
    {
      id: 'v2', title: 'How to Study 12 Hours Every Day Without Burnout', creator: 'CA Mentorship Club', duration: '18 mins',
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&fit=crop&q=60',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'Discipline & Habits', views: '98K',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Study+12+hours+everyday+without+burnout+CA'
    },
    {
      id: 'v3', title: 'Overcoming CA Exam Anxiety & Pressure in Last 90 Days', creator: 'Mindset & Success', duration: '12 mins',
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&fit=crop&q=60',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'Mental Wellness', views: '85K',
      youtubeUrl: 'https://www.youtube.com/results?search_query=Overcoming+exam+anxiety+CA+Final'
    },
    {
      id: 'v4', title: 'The Unstoppable CA Dream – Official ICAI Motivation Anthem', creator: 'ICAI Official BOS', duration: '5 mins',
      thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&fit=crop&q=60',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', category: 'Official Inspiration', views: '250K',
      youtubeUrl: 'https://www.youtube.com/results?search_query=ICAI+CA+Anthem+Official+Song'
    }
  ];

  const MUSIC_TRACKS = [
    { id: 'm1', name: 'Deep Focus Alpha Waves (40 Hz)', duration: '∞ loop', genre: 'Binaural Beats', bpm: '40 Hz', emoji: '🎧' },
    { id: 'm2', name: 'Lo-Fi Study Beats – Exam Season', duration: '3 hrs', genre: 'Lo-Fi Hip Hop', bpm: '70 BPM', emoji: '🎵' },
    { id: 'm3', name: 'Classical Mozart Study Concentration', duration: '2 hrs', genre: 'Classical', bpm: 'Varied', emoji: '🎻' },
    { id: 'm4', name: 'Brown Noise for Deep Work', duration: '∞ loop', genre: 'Ambient Noise', bpm: 'N/A', emoji: '🌊' },
    { id: 'm5', name: 'Epic Study Motivation Playlist', duration: '90 mins', genre: 'Cinematic', bpm: '120 BPM', emoji: '🏆' },
    { id: 'm6', name: 'Indian Classical – Ragas for Concentration', duration: '2 hrs', genre: 'Indian Classical', bpm: 'Varied', emoji: '🪘' }
  ];

  async function render(params = {}) {
    if (params && params.tab) activeTab = params.tab;

    return `
      <div class="energy-container animate-fade-in">

        <div class="page-header">
          <div>
            <h1 class="page-title">⚡ Energy Zone – CA Reels, Motivation & Focus Music</h1>
            <p class="page-subtitle">Linked to Instagram Reels & YouTube Shorts · Topper Strategy · Binaural Waves</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" onclick="SV.EnergyZone.playFocusBinaural()">
              🎧 Play Focus Music
            </button>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="tabs-nav mb-6">
          <button class="tab-btn ${activeTab === 'reels' ? 'active' : ''}" onclick="SV.EnergyZone.switchTab('reels')">
            📱 Reels & Shorts (Instagram & YouTube)
          </button>
          <button class="tab-btn ${activeTab === 'videos' ? 'active' : ''}" onclick="SV.EnergyZone.switchTab('videos')">
            🎬 Motivation Videos
          </button>
          <button class="tab-btn ${activeTab === 'music' ? 'active' : ''}" onclick="SV.EnergyZone.switchTab('music')">
            🎵 Focus Music Playlists
          </button>
        </div>

        <!-- ════ TAB: REELS & SHORTS ════ -->
        <div style="display:${activeTab === 'reels' ? 'block' : 'none'}">

          <!-- Platform Filter Banner -->
          <div class="card mb-6" style="padding:16px 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
              <div>
                <h3 class="section-title" style="margin-bottom:4px;">Linked to YouTube & Instagram</h3>
                <p style="font-size:12px; color:var(--text-secondary); margin:0;">
                  Click any card to watch on YouTube Shorts or open on Instagram.
                </p>
              </div>
              <div style="display:flex; gap:8px;">
                <button class="filter-chip ${activePlatformFilter === 'all' ? 'active' : ''}" onclick="SV.EnergyZone.filterPlatform('all')">
                  🌟 All Reels (${CA_REELS.length})
                </button>
                <button class="filter-chip ${activePlatformFilter === 'instagram' ? 'active' : ''}" onclick="SV.EnergyZone.filterPlatform('instagram')">
                  📸 Instagram Reels
                </button>
                <button class="filter-chip ${activePlatformFilter === 'youtube' ? 'active' : ''}" onclick="SV.EnergyZone.filterPlatform('youtube')">
                  ▶️ YouTube Shorts
                </button>
              </div>
            </div>
          </div>

          <!-- Reels Grid -->
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:20px;">
            ${CA_REELS.map(r => `
              <div class="card" style="padding:0; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; transition:transform 0.2s;"
                onmouseenter="this.style.transform='translateY(-4px)'" onmouseleave="this.style.transform='none'">
                
                <!-- Reel Thumbnail Area -->
                <div style="position:relative; height:320px; background:#111; overflow:hidden; cursor:pointer;"
                  onclick="SV.EnergyZone.openReelModal('${r.id}')">
                  <img src="${r.thumbnail}" alt="${r.title}"
                    style="width:100%; height:100%; object-fit:cover; opacity:0.85;"
                    onerror="this.style.display='none'">
                  
                  <!-- Play icon overlay -->
                  <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.25);">
                    <div style="width:52px; height:52px; border-radius:50%; background:rgba(255,255,255,0.92);
                      display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:0 4px 20px rgba(0,0,0,0.5);">
                      ▶
                    </div>
                  </div>

                  <!-- Category & Subject Badges -->
                  <div style="position:absolute; top:10px; left:10px; display:flex; flex-direction:column; gap:4px;">
                    <span style="background:var(--brand-primary); color:white; padding:3px 8px; border-radius:12px; font-size:10px; font-weight:700;">
                      ${r.subject}
                    </span>
                    <span style="background:rgba(0,0,0,0.65); color:white; padding:2px 8px; border-radius:12px; font-size:10px;">
                      ${r.category}
                    </span>
                  </div>

                  <!-- Dual Platform Tag -->
                  <div style="position:absolute; bottom:10px; left:10px; display:flex; gap:6px;">
                    <span style="background:#E1306C; color:white; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:700;">📸 Instagram</span>
                    <span style="background:#FF0000; color:white; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:700;">▶️ YouTube</span>
                  </div>
                </div>

                <!-- Info and Dual Launch Buttons -->
                <div style="padding:14px;">
                  <h4 style="font-size:13px; font-weight:600; line-height:1.4; margin-bottom:10px; color:var(--text-primary); min-height:36px;">
                    ${r.title}
                  </h4>
                  <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-secondary); margin-bottom:12px;">
                    <span>❤️ ${r.likes}</span>
                    <span>👁 ${r.views} views</span>
                    <span style="font-weight:600; color:var(--brand-primary);">${r.handle}</span>
                  </div>

                  <!-- Action Buttons linked to YouTube & Instagram -->
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                    <a href="${r.youtubeUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-secondary"
                      style="display:flex; align-items:center; justify-content:center; gap:4px; font-size:11px; text-decoration:none; padding:6px;">
                      <span style="color:#FF0000; font-weight:800;">▶️</span> YouTube
                    </a>
                    <a href="${r.instagramUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-secondary"
                      style="display:flex; align-items:center; justify-content:center; gap:4px; font-size:11px; text-decoration:none; padding:6px;">
                      <span style="color:#E1306C; font-weight:800;">📸</span> Instagram
                    </a>
                  </div>
                </div>

              </div>
            `).join('')}
          </div>

          <!-- Copyright / Attribution Note -->
          <div style="margin-top:24px; padding:14px; background:var(--bg-surface-2); border-radius:10px; font-size:12px; color:var(--text-tertiary); line-height:1.5; text-align:center;">
            📌 <strong>Dual-Platform Gateway:</strong> STUDYVERSE links directly to official YouTube channels and Instagram creators to respect copyright and privacy. All rights belong to respective educators and creators.
          </div>
        </div>

        <!-- ════ TAB: MOTIVATION VIDEOS ════ -->
        <div style="display:${activeTab === 'videos' ? 'block' : 'none'}">
          <div class="grid-auto">
            ${MOTIVATIONAL_VIDEOS.map(v => `
              <div class="card" style="padding:0; overflow:hidden;">
                <div style="position:relative; height:180px; background:#000; cursor:pointer;"
                  onclick="SV.EnergyZone.playVideo('${v.title.replace(/'/g,"\\'")}', '${v.embedUrl}')">
                  <img src="${v.thumbnail}" alt="${v.title}" style="width:100%; height:100%; object-fit:cover; opacity:0.85;">
                  <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;">
                    <div style="width:48px; height:48px; border-radius:50%; background:rgba(255,255,255,0.9); display:flex; align-items:center; justify-content:center; font-size:20px;">▶</div>
                  </div>
                  <span class="badge badge-primary" style="position:absolute; top:12px; left:12px;">${v.category}</span>
                  <span style="position:absolute; bottom:12px; right:12px; background:rgba(0,0,0,0.7); color:white; padding:2px 6px; border-radius:4px; font-size:11px;">${v.duration}</span>
                </div>
                <div style="padding:16px;">
                  <h3 style="font-size:14px; font-weight:600; line-height:1.4; margin-bottom:8px;">${v.title}</h3>
                  <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-secondary); margin-bottom:12px;">
                    <span>${v.creator}</span>
                    <span>${v.views} views</span>
                  </div>
                  <div style="display:flex; gap:8px;">
                    <button class="btn btn-sm btn-primary flex-1" onclick="SV.EnergyZone.playVideo('${v.title.replace(/'/g,"\\'")}', '${v.embedUrl}')">
                      ▶ In-App Player
                    </button>
                    <a href="${v.youtubeUrl}" target="_blank" rel="noopener" class="btn btn-sm btn-secondary" style="text-decoration:none;">
                      YouTube ↗
                    </a>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ════ TAB: FOCUS MUSIC ════ -->
        <div style="display:${activeTab === 'music' ? 'block' : 'none'}">
          <div class="card mb-6" style="background:linear-gradient(135deg,#6C63FF1A,#FF65841A); border-left:4px solid var(--brand-primary); padding:20px;">
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;">
              <div>
                <h3 style="font-weight:700; margin-bottom:4px;">Alpha Waves Study Audio Engine</h3>
                <p style="font-size:13px; color:var(--text-secondary); line-height:1.5;">
                  Binaural beats (40 Hz) stimulate bilateral brain synchronization, enhancing recall for Ind AS numbers and tax sections.
                </p>
              </div>
              <button class="btn btn-primary" onclick="SV.EnergyZone.playFocusBinaural()">
                ▶ Start 40Hz Alpha Session
              </button>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:16px;">
            ${MUSIC_TRACKS.map(t => `
              <div class="card" style="display:flex; align-items:center; gap:16px; cursor:pointer; transition:transform 0.2s;"
                onmouseenter="this.style.transform='translateX(4px)'" onmouseleave="this.style.transform='none'"
                onclick="SV.EnergyZone.playTrack('${t.id}', '${t.name.replace(/'/g,"\\'")}')">
                <div style="width:50px; height:50px; border-radius:12px; background:var(--brand-primary-light); color:var(--brand-primary); display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0;">
                  ${t.emoji}
                </div>
                <div style="flex:1; min-width:0;">
                  <div style="font-weight:600; font-size:14px; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.name}</div>
                  <div style="font-size:12px; color:var(--text-secondary);">${t.genre} · ${t.duration}</div>
                </div>
                <div style="width:36px; height:36px; border-radius:50%; background:var(--bg-surface-2); display:flex; align-items:center; justify-content:center; font-size:14px; color:var(--brand-primary); flex-shrink:0;">
                  ▶
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }

  return {
    render,

    switchTab(tab) {
      activeTab = tab;
      SV.Router.refresh();
    },

    filterPlatform(p) {
      activePlatformFilter = p;
      SV.Router.refresh();
    },

    openReelModal(id) {
      const r = CA_REELS.find(x => x.id === id);
      if (!r) return;

      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal modal-md">
          <div class="modal-header">
            <h3 class="modal-title" style="font-size:14px; line-height:1.3;">📱 ${r.title}</h3>
            <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
          </div>
          <div class="modal-body" style="text-align:center; padding:24px;">
            <div style="display:flex; justify-content:center; gap:16px; font-size:40px; margin-bottom:16px;">
              <span>▶️</span>
              <span>📸</span>
            </div>
            <div style="font-weight:700; font-size:16px; margin-bottom:8px;">Choose Your Viewing Platform</div>
            <p style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom:24px;">
              This CA study reel is available across both YouTube and Instagram. Choose where you would like to view it:
            </p>

            <div style="display:flex; flex-direction:column; gap:12px; max-width:320px; margin:0 auto 16px;">
              <a href="${r.youtubeUrl}" target="_blank" rel="noopener" class="btn"
                style="background:#FF0000; color:white; font-weight:700; padding:12px 20px; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px; border-radius:10px;">
                ▶️ Watch on YouTube Shorts ↗
              </a>
              <a href="${r.instagramUrl}" target="_blank" rel="noopener" class="btn"
                style="background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888); color:white; font-weight:700; padding:12px 20px; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px; border-radius:10px;">
                📸 Open in Instagram Reels ↗
              </a>
            </div>

            <p style="font-size:11px; color:var(--text-tertiary);">Opens in a new tab. STUDYVERSE links directly to authorized educational content.</p>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    playVideo(title, url) {
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3 class="modal-title">🎬 ${title}</h3>
            <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
          </div>
          <div class="modal-body" style="padding:0;">
            <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden;">
              <iframe src="${url}?autoplay=1" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allowfullscreen></iframe>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    playTrack(id, name) {
      const urls = {
        m1: 'https://www.youtube.com/embed/W9z7DfpZI0A?autoplay=1',
        m2: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1',
        m3: 'https://www.youtube.com/embed/8D7OzBdU5Lk?autoplay=1',
        m4: 'https://www.youtube.com/embed/q76bMs-NwRk?autoplay=1',
        m5: 'https://www.youtube.com/embed/2tseXUvj2OI?autoplay=1',
        m6: 'https://www.youtube.com/embed/HZnxDi-Nwls?autoplay=1'
      };
      const url = urls[id] || 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1';
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3 class="modal-title">🎵 ${name}</h3>
            <span class="modal-close" onclick="this.closest('.modal-backdrop').remove()">✕</span>
          </div>
          <div class="modal-body" style="padding:0;">
            <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden;">
              <iframe src="${url}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allowfullscreen></iframe>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    },

    playFocusBinaural() {
      this.playTrack('m1', 'Deep Focus Alpha Waves (40 Hz)');
    }
  };
})();
