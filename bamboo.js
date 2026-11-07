// 竹簡繪製：深咖啡色竹片（第四版材質）＋麻繩＋捲起的一端。
// 全部輸出 SVG 字串，可以直接放進頁面，也可以轉成圖片當背景。
(function () {
  const PAL = { hue: [27, 33], sat: [46, 58], lit: [35, 43], roll: ['#4a2d13', '#6e4720', '#946234', '#7e5429', '#40270f'], cap: '#7a5129' };
  const FSEEDS = [3, 11, 19, 27];
  const rng = seed => { let s = (Math.abs(seed) % 2147483646) + 1; return () => (s = (s * 16807) % 2147483647, (s - 1) / 2147483646); };
  const f = n => (+n).toFixed(1);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function defs() {
    const filters = FSEEDS.map((sd, k) => `
      <filter id="bbfd${k}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.55 0.0045" numOctaves="4" seed="${sd}"/><feColorMatrix type="matrix" values="0 0 0 0 0.10  0 0 0 0 0.05  0 0 0 0 0.01  2.4 0 0 0 -1.08"/></filter>
      <filter id="bbfl${k}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.006" numOctaves="3" seed="${sd + 5}"/><feColorMatrix type="matrix" values="0 0 0 0 0.93  0 0 0 0 0.72  0 0 0 0 0.45  2.2 0 0 0 -1.12"/></filter>
      <filter id="bbfm${k}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.006" numOctaves="2" seed="${sd + 9}"/><feColorMatrix type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.06  0 0 0 0 0.01  1.6 0 0 0 -0.62"/></filter>`).join('');
    const r = PAL.roll;
    return `<defs>${filters}
      <linearGradient id="bbShade" x1="0" x2="1">
        <stop offset="0" stop-color="rgb(20,10,2)" stop-opacity=".5"/><stop offset=".1" stop-color="rgb(20,10,2)" stop-opacity=".14"/>
        <stop offset=".34" stop-color="rgb(255,222,170)" stop-opacity=".13"/><stop offset=".55" stop-color="rgb(255,222,170)" stop-opacity="0"/>
        <stop offset=".86" stop-color="rgb(20,10,2)" stop-opacity=".16"/><stop offset="1" stop-color="rgb(20,10,2)" stop-opacity=".55"/>
      </linearGradient>
      <linearGradient id="bbEnds" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="rgb(25,12,3)" stop-opacity=".55"/><stop offset=".045" stop-color="rgb(25,12,3)" stop-opacity="0"/>
        <stop offset=".955" stop-color="rgb(25,12,3)" stop-opacity="0"/><stop offset="1" stop-color="rgb(25,12,3)" stop-opacity=".6"/>
      </linearGradient>
      <linearGradient id="bbCyl" x1="0" x2="1">
        <stop offset="0" stop-color="${r[0]}"/><stop offset=".18" stop-color="${r[1]}"/><stop offset=".45" stop-color="${r[2]}"/><stop offset=".7" stop-color="${r[3]}"/><stop offset="1" stop-color="${r[4]}"/>
      </linearGradient>
      <filter id="bbRopeBlur" x="-5%" y="-600%" width="110%" height="1300%"><feGaussianBlur stdDeviation="1"/></filter>
      <filter id="bbRopeTex" x="-5%" y="-600%" width="110%" height="1300%"><feTurbulence type="fractalNoise" baseFrequency="1.6 0.5" numOctaves="2" seed="5"/><feColorMatrix type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0 0.08  0 0 0 1.4 -0.6"/><feComposite in2="SourceGraphic" operator="in"/></filter>
      <linearGradient id="bbGap" x1="0" x2="1"><stop offset="0" stop-color="rgba(35,25,12,0)"/><stop offset=".5" stop-color="rgba(35,25,12,.6)"/><stop offset="1" stop-color="rgba(35,25,12,0)"/></linearGradient>
    </defs>`;
  }

  // 一根竹片
  function slip(r, x, y, w, h, s) {
    const btw = (a, b) => a + (b - a) * r();
    const hue = btw(...PAL.hue), sat = btw(...PAL.sat), lit = btw(...PAL.lit);
    const k = Math.floor(r() * FSEEDS.length), ox = Math.round(r() * 400), oy = Math.round(r() * 900);
    const lay = (id, op) => `<g transform="translate(${f(x - ox)} ${f(y - oy)})"><rect x="${ox}" y="${oy}" width="${f(w)}" height="${f(h)}" filter="url(#${id}${k})" opacity="${op}"/></g>`;
    let grain = '';
    const n = Math.max(3, Math.round(btw(7, 13) * Math.min(1, w / 28)));
    for (let i = 0; i < n; i++) {
      const gx = x + btw(1.2, w - 1.2), dark = r() < 0.7;
      const y0 = r() < 0.7 ? 0 : btw(0, h * 0.5), y1 = r() < 0.7 ? h : btw(h * 0.5, h), drift = btw(-0.8, 0.8) * s;
      grain += `<path d="M${f(gx)} ${f(y + y0)} L${f(gx + drift)} ${f(y + y1)}" stroke="${dark ? 'rgb(30,15,4)' : 'rgb(235,195,140)'}" stroke-opacity="${btw(dark ? 0.12 : 0.08, dark ? 0.3 : 0.18).toFixed(2)}" stroke-width="${f(btw(0.35, 0.9) * Math.max(s, 0.6))}"/>`;
    }
    let node = '';
    if (r() < 0.4) {
      const ny = y + btw(h * 0.3, h * 0.7);
      node = `<rect x="${f(x)}" y="${f(ny - 1.5 * s)}" width="${f(w)}" height="${f(2.2 * s)}" fill="rgb(30,14,3)" opacity=".16"/>
        <rect x="${f(x)}" y="${f(ny + 0.8 * s)}" width="${f(w)}" height="${f(1.2 * s)}" fill="rgb(240,200,145)" opacity=".12"/>
        <rect x="${f(x)}" y="${f(ny - 6 * s)}" width="${f(w)}" height="${f(12 * s)}" fill="rgb(30,14,3)" opacity=".05"/>`;
    }
    let spots = '';
    for (let i = 0, m = Math.round(btw(0, 3)); i < m; i++) {
      spots += `<ellipse cx="${f(x + btw(3, w - 3))}" cy="${f(y + btw(10, h - 10))}" rx="${f(btw(0.8, 1.8) * s)}" ry="${f(btw(1.5, 4) * s)}" fill="rgb(25,12,3)" opacity="${btw(0.25, 0.5).toFixed(2)}"/>`;
    }
    const rx = f(2 * s);
    return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx}" fill="hsl(${hue.toFixed(1)} ${sat.toFixed(1)}% ${lit.toFixed(1)}%)"/>` +
      lay('bbfm', 0.4) + lay('bbfd', 0.6) + lay('bbfl', 0.75) + grain + node + spots +
      `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx}" fill="url(#bbShade)"/><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx}" fill="url(#bbEnds)"/>`;
  }

  // 麻繩（已定案的畫法）
  function cord(r, pts, T, gaps, edgeDark) {
    const btw = (a, b) => a + (b - a) * r();
    const line = dy => pts.map(p => f(p.x) + ',' + f(p.y + dy)).join(' ');
    let out = `<polyline points="${line(1.6 * T / 4.4)}" stroke="rgba(50,35,15,.4)" stroke-width="${f(T)}" fill="none" filter="url(#bbRopeBlur)"/>
      <polyline points="${line(0)}" stroke="#8a7a5c" stroke-width="${f(T)}" stroke-linecap="round" fill="none"/>
      <polyline points="${line(-T * 0.27)}" stroke="rgba(235,220,185,.22)" stroke-width="${f(T * 0.3)}" fill="none"/>
      <polyline points="${line(T * 0.3)}" stroke="rgba(40,30,15,.32)" stroke-width="${f(T * 0.36)}" fill="none"/>`;
    const d = T * 0.62, sw = T / 4.4;
    for (const p of pts) {
      const dark = edgeDark ? edgeDark(p) : 0, j = btw(-0.25, 0.25) * sw;
      const x1 = p.x - d / 2 + j, y1 = p.y - T / 2, x2 = p.x + d / 2 + j, y2 = p.y + T / 2;
      out += `<path d="M${f(x1)} ${f(y1)} Q${f(p.x + j + 0.5 * sw)} ${f(p.y)} ${f(x2)} ${f(y2)}" stroke="rgba(42,32,18,${(0.55 + dark * 0.3).toFixed(2)})" stroke-width="${f(btw(0.45, 0.7) * Math.max(sw, 0.6))}" fill="none"/>`;
      out += `<path d="M${f(x1 + 0.8 * sw)} ${f(y1 + 0.3 * sw)} Q${f(p.x + j + 1.2 * sw)} ${f(p.y)} ${f(x2 + 0.6 * sw)} ${f(y2 - 0.6 * sw)}" stroke="rgba(215,198,160,${(0.35 - dark * 0.3).toFixed(2)})" stroke-width="${f(0.4 * Math.max(sw, 0.6))}" fill="none"/>`;
      if (r() < 0.22 && sw > 0.5) {
        const side = r() < 0.5 ? -1 : 1, len = btw(1.5, 3.5) * sw, ang = (p.a + side * btw(40, 80)) * Math.PI / 180;
        const sx = p.x, sy = p.y + side * T * 0.45;
        out += `<path d="M${f(sx)} ${f(sy)} q${f(Math.cos(ang) * len * 0.5)} ${f(side * len * 0.4)} ${f(Math.cos(ang) * len)} ${f(Math.sin(ang) * len * side)}" stroke="rgba(150,132,100,.55)" stroke-width=".35" fill="none"/>`;
      }
    }
    out += `<polyline points="${line(0)}" stroke="#000" stroke-width="${f(T)}" fill="none" filter="url(#bbRopeTex)" opacity=".35"/>`;
    for (const g of gaps) {
      const p = pts.reduce((b, q) => Math.abs(q.x - g) < Math.abs(b.x - g) ? q : b, pts[0]);
      out += `<rect x="${f(g - 2 * sw)}" y="${f(p.y - T * 0.65)}" width="${f(4 * sw)}" height="${f(T * 1.3)}" fill="url(#bbGap)"/>`;
    }
    return out;
  }

  // 一整排攤開的竹片，從 x0 開始往右排滿 width
  function slipsRow(r, { x0, y0, H, width, s, cords }) {
    const btw = (a, b) => a + (b - a) * r();
    const gap = s >= 0.6 ? 1 : 0.6;
    let x = x0, out = '', seams = '';
    const gaps = [], end = x0 + width;
    let prevH = null;
    while (x < end - 0.5) {
      let w = btw(25, 31) * s;
      if (end - x - w < 9 * s) w = end - x;
      const mt = btw(-2, 2) * s, h = H + btw(-3, 3) * s;
      out += slip(r, x, y0 + mt, w, h, s);
      if (prevH !== null) seams += `<rect x="${f(x - gap)}" y="${f(y0 + 2 * s)}" width="${f(gap)}" height="${f(H - 4 * s)}" fill="#2e1c0c"/>`;
      prevH = h;
      x += w;
      if (x < end - 0.5) { gaps.push(x + gap / 2); x += gap; }
    }
    const T = Math.max(2.2, 4.4 * s), step = Math.max(1.5, 2.7 * s);
    let cordsOut = '';
    cords.forEach((cy, k) => {
      const pts = [];
      for (let px = x0 - 1; px <= end + 1; px += step) {
        const ph = px / (37 * s) + k * 2;
        pts.push({ x: px, y: y0 + H * cy + Math.sin(ph) * 0.7 * Math.max(s, 0.6), a: Math.cos(ph) * 1.1 });
      }
      cordsOut += cord(r, pts, T, gaps);
    });
    return seams + out + cordsOut;
  }

  // 捲起的一端，可以在竹片上寫書名，或貼一張紙題簽
  let bandId = 0;
  function roll(r, { x, y0, H, W, s, cords, title, tag, fontSize, titleY, clear }) {
    const cap = Math.max(3, 8 * s);
    const seams = [];
    for (let k = 1; k < 12; k++) seams.push(x + (W / 2) * (1 - Math.cos(Math.PI * k / 12)));
    let out = `<rect x="${f(x)}" y="${f(y0)}" width="${f(W)}" height="${f(H)}" rx="${f(3 * s)}" fill="url(#bbCyl)"/>
      <rect x="${f(x)}" y="${f(y0)}" width="${f(W)}" height="${f(H)}" filter="url(#bbfm1)" opacity=".5"/>
      <rect x="${f(x)}" y="${f(y0)}" width="${f(W)}" height="${f(H)}" filter="url(#bbfd1)" opacity=".85"/>
      <rect x="${f(x)}" y="${f(y0)}" width="${f(W)}" height="${f(H)}" filter="url(#bbfl1)" opacity=".55"/>`;
    out += seams.map(sx => `<line x1="${f(sx)}" y1="${f(y0)}" x2="${f(sx)}" y2="${f(y0 + H)}" stroke="rgba(30,16,4,.5)" stroke-width="${(0.6 + 0.6 * Math.sin(Math.PI * (sx - x) / W)).toFixed(2)}"/>`).join('');
    if (tag) {
      const tw = W * 0.62, tx = x + (W - tw) / 2, ty = y0 + H * 0.24, th = H * 0.52;
      out += `<rect x="${f(tx + 1)}" y="${f(ty + 1.5)}" width="${f(tw)}" height="${f(th)}" fill="rgba(20,10,2,.35)"/>
        <rect x="${f(tx)}" y="${f(ty)}" width="${f(tw)}" height="${f(th)}" fill="#efe4cc" stroke="#b89f74" stroke-width=".6"/>
        <text x="${f(x + W / 2)}" y="${f(ty + fontSize * 0.5)}" font-family="Noto Serif TC, Songti TC, serif" font-weight="600" font-size="${fontSize}" fill="#3a2a18" style="writing-mode:vertical-rl;text-orientation:upright" letter-spacing="${f(fontSize * 0.25)}">${tag}</text>`;
    } else if (title && clear) {
      // 書架窄捆用：宋體加粗、不描邊，寫字那一段的竹紋壓淡（上下漸淡），小字也看得清楚
      const ty0 = y0 + H * (titleY == null ? 0.27 : titleY), by = ty0 - fontSize * 0.9, bh = title.length * fontSize * 1.25 + fontSize * 1.1, id = 'bbBand' + (++bandId);
      out += `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".18" stop-color="#fff"/><stop offset=".82" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <mask id="${id}"><rect x="${f(x)}" y="${f(by)}" width="${f(W)}" height="${f(bh)}" fill="url(#${id}g)"/></mask></defs>
        <g mask="url(#${id})"><rect x="${f(x)}" y="${f(by)}" width="${f(W)}" height="${f(bh)}" fill="url(#bbCyl)" opacity=".72"/><rect x="${f(x)}" y="${f(by)}" width="${f(W)}" height="${f(bh)}" fill="#3a2412" opacity=".28"/></g>
        <text x="${f(x + W / 2)}" y="${f(ty0)}" font-family="Noto Serif TC, Songti TC, serif" font-weight="900" font-size="${fontSize}" fill="#f3e4c4" style="writing-mode:vertical-rl;text-orientation:upright" letter-spacing="${f(fontSize * 0.25)}">${title}</text>`;
    } else if (title) {
      out += `<text x="${f(x + W / 2)}" y="${f(y0 + H * (titleY == null ? 0.27 : titleY))}" font-family="Noto Serif TC, Songti TC, serif" font-weight="600" font-size="${fontSize}" fill="#efdcb8" fill-opacity=".93" stroke="rgba(25,12,3,.55)" stroke-width="${f(Math.max(1, fontSize * 0.08))}" paint-order="stroke" style="writing-mode:vertical-rl;text-orientation:upright" letter-spacing="${f(fontSize * 0.25)}">${title}</text>`;
    }
    const T = Math.max(2.2, 4.4 * s), step = Math.max(1.2, 2.3 * s), bulge = 6 * s;
    cords.forEach(cy => {
      const pts = [];
      for (let px = 0; px <= W; px += step) {
        const t = px / W;
        pts.push({ x: x + px, y: y0 + H * cy + bulge * 4 * t * (1 - t), a: Math.atan2(bulge * 4 * (1 - 2 * t) / W, 1) * 180 / Math.PI });
      }
      out += cord(r, pts, T, [], p => Math.pow(Math.abs(p.x - x - W / 2) / (W / 2), 2));
    });
    const sp = [];
    for (let i = 0; i <= 160; i++) {
      const t = i / 160, a = t * 5 * Math.PI * 2, rr = 1 - t * 0.88;
      sp.push((i ? 'L' : 'M') + f(x + W / 2 + Math.cos(a) * (W / 2 - 3 * s) * rr) + ' ' + f(y0 + Math.sin(a) * (cap - 2.5 * s) * rr));
    }
    out += `<ellipse cx="${f(x + W / 2)}" cy="${f(y0)}" rx="${f(W / 2)}" ry="${f(cap - 1)}" fill="${PAL.cap}" stroke="rgba(35,18,5,.55)" stroke-width=".8"/>
      <path d="${sp.join('')}" fill="none" stroke="rgba(35,18,5,.65)" stroke-width="${f(0.7 * Math.max(s, 0.6))}"/>
      <ellipse cx="${f(x + W / 2)}" cy="${f(y0)}" rx="${f(5 * s)}" ry="${f(1.4 * s)}" fill="rgba(30,16,4,.7)"/>`;
    return out;
  }

  const metrics = H => {
    const s = clamp(H / 340, 0.3, 1.3);
    return { s, W: clamp(H * 0.19, 30, 70), cap: Math.max(3, 8 * s), pad: 4 * s + 2, cords: H > 500 ? [0.12, 0.5, 0.88] : [0.17, 0.83] };
  };

  // 頁面上用的一捆竹簡：左邊是捲起的一端，右邊是攤開的部分（由右往左讀）
  // reveal 控制攤開多寬；超過的竹片藏在捲起的一端裡
  function bundle(host, o) {
    // 可選：W（捲軸寬）、cords（繩子位置）、titleY（書名起點）、clear（小字清楚寫法），給書架上的窄捆用
    const m = Object.assign({}, metrics(o.H)), r = rng(o.seed || 1);
    if (o.W) m.W = o.W;
    if (o.cords) m.cords = o.cords;
    const rollH = o.H + m.cap + m.pad * 2;
    const rollSvg = `<svg class="bb-roll" width="${f(m.W)}" height="${f(rollH)}" viewBox="0 0 ${f(m.W)} ${f(rollH)}" aria-hidden="true">${roll(r, { x: 0, y0: m.cap + m.pad, H: o.H, W: m.W, s: m.s, cords: m.cords, title: o.title, tag: o.tag, fontSize: o.fontSize || Math.round(o.H * 0.1), titleY: o.titleY, clear: o.clear })}</svg>`;
    const sw = Math.max(1, o.slipsWidth);
    const slipsSvg = `<svg class="bb-slips" width="${f(sw)}" height="${f(o.H + m.pad * 2)}" viewBox="0 0 ${f(sw)} ${f(o.H + m.pad * 2)}" aria-hidden="true">${slipsRow(r, { x0: 0, y0: m.pad, H: o.H, width: sw, s: m.s, cords: m.cords })}</svg>`;
    host.innerHTML = `<div class="bb">${rollSvg}<div class="bb-reveal" style="width:${o.reveal || 0}px">${slipsSvg}</div></div>`;
    const rev = host.querySelector('.bb-reveal');
    return { setReveal: px => { rev.style.width = Math.max(0, Math.min(sw, px)) + 'px'; }, max: sw };
  }

  // 整片鋪滿的竹簡（篇頁背景）：完整的 SVG 字串，轉成圖片只需算一次
  function background(Wd, Ht, seed) {
    const r = rng(seed || 3);
    const pad = 6, mm = metrics(Ht - 30);
    const H = Ht - mm.cap - pad * 2, m = metrics(H);
    const y0 = m.cap + pad;
    const body = slipsRow(r, { x0: m.W - 3, y0, H, width: Wd - m.W + 3, s: m.s, cords: m.cords }) +
      roll(r, { x: 0, y0, H, W: m.W, s: m.s, cords: m.cords });
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${Wd}" height="${Ht}" viewBox="0 0 ${Wd} ${Ht}">${defs()}${body}</svg>`;
  }

  function installDefs() {
    if (document.getElementById('bb-defs')) return;
    const d = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    d.id = 'bb-defs';
    d.setAttribute('width', 0); d.setAttribute('height', 0);
    d.setAttribute('aria-hidden', 'true');
    d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML = defs();
    document.body.prepend(d);
  }

  window.Bamboo = { bundle, background, installDefs, metrics };
})();
