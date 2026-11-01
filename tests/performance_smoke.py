"""Focused pointer-cost and idle-render regression (software WebGL, not a GPU FPS test).
Usage: python tests/performance_smoke.py [base URL] [output JSON]
Requires optional Python Playwright and installed Chromium.
"""
import json
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

base = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:4173/'
out = Path(sys.argv[2] if len(sys.argv) > 2 else '/tmp/mythos-performance.json')
report = {'renderer': 'Chromium / SwiftShader', 'viewport': [1280, 800], 'dpr': 1, 'quality': 'balanced'}
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True,
        args=['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    page = browser.new_page(viewport={'width':1280, 'height':800}, device_scale_factor=1, reduced_motion='reduce')
    page.set_default_timeout(60000)
    expect.set_options(timeout=60000)
    page.add_init_script("localStorage.setItem('mythos.graphics.quality.v1', 'balanced')")
    page.goto(base+'?diagnostics=1', wait_until='networkidle')
    page.get_by_role('button', name='ENTER THE MUSEUM').click()
    nav = page.get_by_role('navigation', name='Museum navigation')
    nav.get_by_role('button', name='Greece', exact=True).click()
    expect(nav.get_by_role('button', name='Rome', exact=True)).to_be_enabled()
    page.wait_for_function("""() => {let n=0;window.mythosDiagnostics.scene.traverseVisible(o=>{if(o.name==='exhibit-model')n++});return n>0}""")
    report['gallery_pick'] = page.evaluate("""() => {
        const d=window.mythosDiagnostics, objects=[];
        d.scene.updateMatrixWorld(true);
        d.scene.traverse(o=>{if(o.__r3f?.eventCount)objects.push(o)});
        const rays=objects[0].__r3f.root.getState().raycaster;
        const samples=[]; let hits=0;
        for(let i=0;i<40;i++) {
            rays.setFromCamera({x:(i%5-2)*.025,y:(i%7-3)*.025},d.camera);
            const t=performance.now(); hits+=rays.intersectObjects(objects,true).length;
            samples.push(performance.now()-t);
        }
        const point=objects[0].getWorldPosition(objects[0].position.clone()).project(d.camera);
        return {targets:objects.map(o=>o.name),ms:samples,hits,x:point.x,y:point.y};
    }""")
    assert report['gallery_pick']['targets'] == ['exhibit-hit-target'], report
    assert report['gallery_pick']['hits'] > 0, report
    bounds=page.locator('canvas').bounding_box()
    point=report['gallery_pick']
    page.mouse.click(bounds['x']+(point['x']+1)*bounds['width']/2, bounds['y']+(1-point['y'])*bounds['height']/2)
    expect(page.get_by_role('button', name='Back to Greece', exact=True)).to_be_enabled()
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1200)
    report['inspection'] = page.evaluate("window.mythosDiagnostics.snapshot()")
    report['inspection_targets'] = page.evaluate("""() => {let n=0;window.mythosDiagnostics.scene.traverse(o=>{if(o.__r3f?.eventCount)n++});return n}""")
    assert report['inspection_targets'] == 0, report
    initial=page.evaluate('window.mythosDiagnostics.renderer.info.render.frame')
    # Software rendering may finish a queued hover/damping frame late. Require
    # two consecutive quiet seconds after it settles, within a bounded window.
    samples=[]
    for _ in range(5):
        page.wait_for_timeout(1000)
        idle=page.evaluate('window.mythosDiagnostics.renderer.info.render.frame')
        samples.append(idle-initial)
        initial=idle
        if len(samples) >= 2 and samples[-2:] == [0,0]:
            break
    report['settling_draws_per_second']=samples
    report['idle_draws_in_one_second']=samples[-1]
    bounds=page.locator('canvas').bounding_box()
    page.mouse.move(bounds['x']+bounds['width']*.35,bounds['y']+bounds['height']*.4)
    page.mouse.move(bounds['x']+bounds['width']*.65,bounds['y']+bounds['height']*.6,steps=40)
    after=page.evaluate('window.mythosDiagnostics.renderer.info.render.frame')
    report['draws_for_40_unpressed_pointer_moves']=after-idle
    assert samples[-2:] == [0,0], report
    assert report['draws_for_40_unpressed_pointer_moves'] == 0, report
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report),flush=True)
    browser.close()
