import os,json
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
ports=json.load(open('_host/ports.json')) if os.path.exists('_host/ports.json') else {}
rows=[]
for b in ['inspiration/templates','liquid glass and shaders']:
    for r in sorted(os.listdir(b)):
        if r in ports: u=f'http://localhost:{ports[r]}/'; t='dev server'
        elif os.path.exists(os.path.join(b,r,'index.html')): u=f'/{b}/{r}/'.replace(' ','%20'); t='static'
        else: continue
        rows.append(f'<tr><td>{b}</td><td><a href="{u}">{r}</a></td><td>{t}</td></tr>')
open('index.html','w',encoding='utf8').write('<!doctype html><meta charset=utf-8><title>Inspiration Index</title><style>body{font:15px system-ui;margin:2rem}td{padding:.25rem .8rem}</style><h1>Inspiration sites</h1><table>'+''.join(rows)+'</table>')
print(len(rows))
