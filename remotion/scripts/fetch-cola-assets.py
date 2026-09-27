"""Download the CC0 Poly Haven models, HDRI and wood texture used by ColaOrigin into public/ph/.
Kept out of git (about 18 MB). Run once after cloning, then: python3 scripts/prepare-cola-assets.py"""
import json, os, subprocess

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'ph')
get = lambda url: json.loads(subprocess.run(['curl', '-sS', url], capture_output=True, text=True, check=True).stdout)

def dl(url, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    subprocess.run(['curl', '-sSf', '-o', path, url], check=True)

for m in ['jug_01', 'wine_bottles_01', 'binder_notebook', 'pocket_watch', 'round_spectacles', 'chemistry_set']:
    g = get(f'https://api.polyhaven.com/files/{m}')['gltf']['1k']['gltf']
    dl(g['url'], f'{ROOT}/{m}/{m}.gltf')
    for rel, info in g.get('include', {}).items():
        dl(info['url'], f'{ROOT}/{m}/{rel}')
    print('model', m)
dl(get('https://api.polyhaven.com/files/studio_small_09')['hdri']['1k']['hdr']['url'], f'{ROOT}/studio_small_09_1k.hdr')
wood = get('https://api.polyhaven.com/files/dark_wood')
for k in ['Diffuse', 'nor_gl', 'Rough']:
    dl(wood[k]['1k']['jpg']['url'], f'{ROOT}/dark_wood/{k}.jpg')
print('done')
