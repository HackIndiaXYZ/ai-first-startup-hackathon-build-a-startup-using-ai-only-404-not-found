import os,json,subprocess,sys,time
from concurrent.futures import ThreadPoolExecutor
root=os.path.abspath('.')
bases=['inspiration/templates','liquid glass and shaders']
apps=[]
for b in bases:
    for r in sorted(os.listdir(b)):
        p=os.path.join(root,b,r)
        cand=[p]+[os.path.join(p,d) for d in os.listdir(p) if os.path.isdir(os.path.join(p,d))]
        for c in cand:
            pj=os.path.join(c,'package.json')
            if os.path.exists(pj) and (c==p or not os.path.exists(os.path.join(p,'package.json'))):
                try: s=json.load(open(pj,encoding='utf8')).get('scripts',{})
                except: s={}
                cmd='dev' if 'dev' in s else 'start' if 'start' in s else None
                if cmd: apps.append((r,c,cmd)); break
ports={}
for i,(r,c,cmd) in enumerate(apps): ports[r]=9001+i
json.dump({r:ports[r] for r,_,_ in apps},open('_host/ports.json','w'),indent=1)
os.makedirs('_host/logs',exist_ok=True)
def inst(a):
    r,c,cmd=a
    with open(f'_host/logs/{r}.install.log','w') as f:
        subprocess.run('npm install --ignore-scripts --no-audit --no-fund --legacy-peer-deps',cwd=c,shell=True,stdout=f,stderr=subprocess.STDOUT)
with ThreadPoolExecutor(4) as ex: list(ex.map(inst,apps))
for r,c,cmd in apps:
    env=dict(os.environ,PORT=str(ports[r]),BROWSER='none',HOST='127.0.0.1')
    extra=f'-- --port {ports[r]} --host 127.0.0.1' if cmd=='dev' else ''
    lf=open(f'_host/logs/{r}.run.log','w')
    subprocess.Popen(f'npm run {cmd} {extra}',cwd=c,shell=True,env=env,stdout=lf,stderr=subprocess.STDOUT)
    time.sleep(1)
print('started',len(apps))
time.sleep(10**7)
