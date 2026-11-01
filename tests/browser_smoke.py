"""Optional real Chromium/WebGL regression. Requires Python Playwright + Chromium.
Usage: python tests/browser_smoke.py [base URL] [output directory]
Software rendering validates behavior, not consumer GPU performance.
"""
from pathlib import Path
import json
import os
import sys
from playwright.sync_api import sync_playwright, expect

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:5173/'
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else '/tmp/mythos-browser-check')
OUT.mkdir(parents=True, exist_ok=True)
expect.set_options(timeout=60000)
REPORT = {'renderer': 'Chromium / SwiftShader (software)', 'checks': [], 'errors': [], 'models': [], 'textures': []}

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True,
        args=['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    page = browser.new_page(viewport={'width':1280,'height':800}, device_scale_factor=2, reduced_motion='reduce')
    page.set_default_timeout(60000)
    page.on('pageerror', lambda e: REPORT['errors'].append(str(e)))
    page.on('console', lambda m: REPORT['errors'].append(m.text) if m.type == 'error' and 'THREE.WebGLProgram' in m.text else None)
    page.on('response', lambda r: REPORT['models'].append({'name':r.url.rsplit('/',1)[-1],'status':r.status}) if '.glb' in r.url else None)
    page.on('response', lambda r: REPORT['textures'].append({'name':r.url.rsplit('/',1)[-1],'status':r.status}) if '/textures/' in r.url and '.jpg' in r.url else None)
    # Exercise the audio UI deterministically; actual device audio is a manual check.
    page.add_init_script("window.__spoken = 0; speechSynthesis.speak = () => { window.__spoken++ }; speechSynthesis.cancel = () => {}")
    page.goto(BASE + '?diagnostics=1', wait_until='networkidle')
    page.locator('.loading-screen.is-hidden').wait_for()
    page.wait_for_timeout(500)
    page.screenshot(animations='disabled', path=str(OUT/'welcome.png'))
    page.get_by_role('button', name='ENTER THE MUSEUM').click()
    nav = page.get_by_role('navigation', name='Museum navigation')
    expect(nav.get_by_role('button', name='Greece', exact=True)).to_be_enabled()
    page.get_by_label('Graphics quality').select_option('eco')
    page.screenshot(animations='disabled', path=str(OUT/'atrium.png'))
    def loaded():
        page.wait_for_function("""() => {
          let count = 0;
          window.mythosDiagnostics.scene.traverseVisible(o => { if(o.name === 'exhibit-model') count++ });
          return count > 0;
        }""")
        # A loaded model can precede ResizeObserver/render completion. Capture
        # only after the drawing surface and camera match the final viewport.
        page.wait_for_function("""() => {
          const a=document.querySelector('canvas').getBoundingClientRect();
          const b=document.querySelector('.museum-viewport').getBoundingClientRect();
          const d=window.mythosDiagnostics;
          return Math.abs(a.width-b.width)<1 && Math.abs(a.height-b.height)<1
            && Math.abs(d.camera.aspect-b.width/b.height)<0.01;
        }""")
        page.evaluate("""async () => {
          const d=window.mythosDiagnostics; d.invalidate();
          await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame);
          d.renderer.getContext().finish();
        }""")

    # The dense scan must never enter pointer raycasting. Selection uses a tiny
    # invisible proxy; inspection removes all scene picking handlers.
    nav.get_by_role('button', name='Greece', exact=True).click()
    expect(nav.get_by_role('button', name='Rome', exact=True)).to_be_enabled()
    loaded()
    targets = page.evaluate("""() => {
      const d=window.mythosDiagnostics, result=[];
      d.scene.updateMatrixWorld(true);
      d.scene.traverse(o => {
        if(!o.__r3f?.eventCount) return;
        let triangles=0;
        o.traverse(child => { if(child.isMesh) triangles+=(child.geometry.index?.count ?? child.geometry.attributes.position.count)/3 });
        const point=o.getWorldPosition(o.position.clone()).project(d.camera);
        result.push({name:o.name,triangles,x:point.x,y:point.y});
      });
      return result;
    }""")
    assert len(targets) == 1 and targets[0]['name'] == 'exhibit-hit-target' and targets[0]['triangles'] == 12, targets
    bounds = page.locator('canvas').bounding_box()
    page.mouse.click(bounds['x']+(targets[0]['x']+1)*bounds['width']/2,
                     bounds['y']+(1-targets[0]['y'])*bounds['height']/2)
    expect(page.get_by_role('button', name='Back to Greece', exact=True)).to_be_enabled()
    assert page.evaluate("""() => {let count=0;window.mythosDiagnostics.scene.traverse(o=>{if(o.__r3f?.eventCount)count++});return count}""") == 0
    page.keyboard.press('Escape')
    nav.get_by_role('button', name='Atrium', exact=True).click()
    expect(nav.get_by_role('button', name='Greece', exact=True)).to_be_enabled()
    REPORT['checks'].append('3D sculpture click uses a 12-triangle proxy; inspection registers zero picking targets')
    page.get_by_role('button', name='TOUR', exact=True).click()
    page.get_by_role('button', name='Travel to Hellas', exact=True).click()
    page.get_by_role('button', name='Inspect Athena', exact=True).click()
    expect(page.get_by_role('button', name='Back to Greece', exact=True)).to_be_enabled()

    loaded()
    REPORT['quality'] = []
    print('Athena loaded', flush=True)
    for quality in ['eco', 'balanced', 'high', 'balanced', 'eco']:
        page.get_by_label('Graphics quality').select_option(quality)
        page.wait_for_function('(q) => window.mythosDiagnostics.quality === q', arg=quality)
        loaded()
        info = page.evaluate('window.mythosDiagnostics.snapshot()')
        assert info['dpr'] == {'eco':1,'balanced':1.5,'high':2}[quality], info
        filtering = page.evaluate("""() => {
          const d=window.mythosDiagnostics, samples=[];
          d.scene.traverseVisible(o=>{
            const materials=Array.isArray(o.material)?o.material:[o.material];
            for(const m of materials) if(m?.map?.name==='Marble012_color') samples.push(m.map.anisotropy);
          });
          return {samples,max:d.renderer.capabilities.getMaxAnisotropy()};
        }""")
        assert filtering['samples'] and all(v == min({'eco':2,'balanced':8,'high':16}[quality],filtering['max']) for v in filtering['samples']), filtering
        info['architectural_anisotropy'] = filtering['samples'][0]
        REPORT['quality'].append(info)
        if quality == 'high': page.screenshot(animations='disabled', path=str(OUT/'athena-high.png'))
    print('Quality switching passed', flush=True)
    # DPR=2 budgets were verified above; use a native 1x display for the remaining
    # software-rendered interaction checks and screenshots.
    cdp = page.context.new_cdp_session(page)
    cdp.send('Emulation.setDeviceMetricsOverride', {'width':1280, 'height':800, 'deviceScaleFactor':1, 'mobile':False})
    page.get_by_role('button', name='Owl', exact=True).click()
    expect(page.get_by_role('status')).to_contain_text('Owl')
    page.get_by_role('tab', name='The myth', exact=True).click()
    expect(page.get_by_role('tabpanel')).to_contain_text('Stories are presented')
    page.get_by_role('tab', name='Details', exact=True).click()
    expect(page.get_by_role('tabpanel')).to_contain_text('Fitzwilliam')
    page.get_by_role('button', name='Save to journal', exact=True).click()
    page.get_by_role('button', name='Listen to guide', exact=True).click()
    assert page.evaluate('window.__spoken') == 1
    page.get_by_role('button', name='Stop guide', exact=True).click()
    page.get_by_role('button', name='View sculpture without information panel', exact=True).click()
    canvas = page.locator('canvas')
    box = canvas.bounding_box()
    before = page.evaluate('window.mythosDiagnostics.snapshot().camera')
    page.mouse.move(box['width']*.52, box['height']*.45)
    page.mouse.down(); page.mouse.move(box['width']*.65, box['height']*.48, steps=12); page.mouse.up()
    page.mouse.wheel(0, 100)
    page.wait_for_timeout(500)
    after = page.evaluate('window.mythosDiagnostics.snapshot().camera')
    assert before != after, (before, after)
    page.get_by_role('button', name='Show exhibit information', exact=True).click()
    page.keyboard.press('Escape')
    expect(page.get_by_role('button', name='Continue to the next gallery', exact=True)).to_be_enabled()
    REPORT['checks'].append('Athena: quality budgets, tabs, symbol, journal, audio control, orbit/zoom, Escape')

    print('Exhibit interaction passed', flush=True)
    for exhibit, room in [('Jupiter','Rome'), ('Anubis','Egypt')]:
        page.get_by_role('button', name='Continue to the next gallery', exact=True).click()
        page.get_by_role('button', name='Inspect '+exhibit, exact=True).click()
        page.get_by_label('Graphics quality').select_option('high')
        loaded()
        page.screenshot(animations='disabled', path=str(OUT/(exhibit.lower()+'-high.png')))
        page.get_by_role('button', name='Back to '+room, exact=True).click()
    page.get_by_role('button', name='Complete the journey', exact=True).click()
    page.get_by_role('button', name='Open my journal', exact=True).click()
    expect(page.get_by_role('dialog')).to_contain_text('Athena')
    page.get_by_role('button', name='Close the atlas').click()
    for room in ['Greece','Egypt','Rome','Atrium']:
        nav.get_by_role('button', name=room, exact=True).click()
        page.wait_for_timeout(250)
    page.keyboard.press('a')
    expect(page.get_by_role('dialog')).to_be_visible()
    page.get_by_role('button', name='Timeline', exact=False).click()
    expect(page.get_by_role('group', name='Filter timeline by civilization')).to_be_visible()
    page.keyboard.press('Escape')
    page.reload(wait_until='networkidle')
    page.get_by_role('button', name='ENTER THE MUSEUM').click()
    expect(nav.get_by_role('button', name='Greece', exact=True)).to_be_enabled()
    page.keyboard.press('j')
    expect(page.get_by_role('dialog')).to_contain_text('Athena')
    page.keyboard.press('Escape')
    REPORT['checks'].append('Three-stop tour, cross-room navigation, atlas/timeline, persisted journal')

    # Same warm room circuit must stop adding GPU resources.
    memories = []
    for _ in range(3):
        for room in ['Greece', 'Egypt', 'Rome', 'Atrium']:
            nav.get_by_role('button', name=room, exact=True).click()
            expect(nav.get_by_role('button', name='Egypt' if room != 'Egypt' else 'Rome', exact=True)).to_be_enabled()
            page.wait_for_timeout(150)
        memories.append(page.evaluate('window.mythosDiagnostics.snapshot().memory'))
    assert memories[-1] == memories[-2], memories
    REPORT['warm_circuit_memory'] = memories
    print('Warm memory counts:', memories, flush=True)
    REPORT['checks'].append('Repeated warmed room circuit has stable GPU resource counts')

    # Actual draw durations and animation-frame intervals during a cinematic route.
    page.emulate_media(reduced_motion='no-preference')
    page.get_by_label('Graphics quality').select_option('eco')
    page.get_by_label('Camera movement style').select_option('cinematic')
    page.evaluate("""() => {
      const d = window.mythosDiagnostics, original = d.renderer.render.bind(d.renderer);
      window.__drawTimes = []; window.__intervals = [];
      d.renderer.render = (...args) => {const t=performance.now(); const r=original(...args); window.__drawTimes.push(performance.now()-t); return r};
      let last=performance.now(); const end=last+5000;
      function frame(t){window.__intervals.push(t-last);last=t;if(t<end)requestAnimationFrame(frame)}
      requestAnimationFrame(frame);
    }""")
    nav.get_by_role('button', name='Greece', exact=True).click()
    expect(nav.get_by_role('button', name='Rome', exact=True)).to_be_enabled()
    page.wait_for_timeout(1200)
    REPORT['software_timing'] = page.evaluate("({draw_ms:window.__drawTimes, raf_intervals_ms:window.__intervals})")
    nav.get_by_role('button', name='Egypt', exact=True).click()
    page.get_by_label('Camera movement style').select_option('instant')
    expect(nav.get_by_role('button', name='Rome', exact=True)).to_be_enabled()
    REPORT['checks'].append('Cinematic route completes; INSTANT finishes active travel')

    print('Tour, archives and cinematic path passed', flush=True)
    cdp.send('Emulation.clearDeviceMetricsOverride')
    page.set_viewport_size({'width':390,'height':844})
    page.emulate_media(reduced_motion='reduce')
    nav.get_by_role('button', name='Atrium', exact=True).click()
    page.get_by_role('button', name='TOUR', exact=True).click()
    page.get_by_role('button', name='Travel to Hellas', exact=True).click()
    page.get_by_role('button', name='Inspect Athena', exact=True).click()
    loaded()
    panel = page.locator('.exhibit-panel').bounding_box()
    viewport = page.locator('.museum-viewport').bounding_box()
    assert viewport['y']+viewport['height'] <= panel['y'], (viewport, panel)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    page.screenshot(animations='disabled', path=str(OUT/'mobile-athena.png'))
    REPORT['checks'].append('390px mobile: separate artwork viewport, no horizontal overflow, reduced motion')

    fallback = browser.new_page(viewport={'width':1000,'height':700}, reduced_motion='reduce')
    fallback.set_default_timeout(30000)
    warnings = []
    fallback.on('console', lambda m: warnings.append(m.text) if m.type=='warning' else None)
    fallback.route('**/*.glb', lambda route: route.fulfill(status=404, body='Missing model'))
    fallback.goto(BASE)
    fallback.get_by_role('button', name='ENTER THE MUSEUM').click()
    fallback.get_by_role('button', name='TOUR', exact=True).click()
    fallback.get_by_role('button', name='Travel to Hellas', exact=True).click()
    fallback.get_by_role('button', name='Inspect Athena', exact=True).click()
    expect(fallback.get_by_role('button', name='Back to Greece', exact=True)).to_be_enabled()
    fallback.wait_for_timeout(700)
    assert any('placeholder' in w for w in warnings), warnings
    fallback.screenshot(animations='disabled', path=str(OUT/'missing-model.png'))
    REPORT['checks'].append('Missing GLB: boundary displays fallback and navigation remains usable')
    assert len({t['name'] for t in REPORT['textures'] if t['status'] == 200}) == 21, REPORT['textures']
    assert not REPORT['errors'], REPORT['errors']
    (OUT/'browser-results.json').write_text(json.dumps(REPORT, indent=2))
    print(json.dumps({k:v for k,v in REPORT.items() if k!='software_timing'}, indent=2), flush=True)
    browser.close()
