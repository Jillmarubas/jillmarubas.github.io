# Minimal MCP client for `vectorcraft-cli mcp --headless` (newline-delimited JSON-RPC on stdio).
import json, os, shutil, subprocess, sys
class VC:
    def __init__(self):
        self.p = subprocess.Popen([os.environ.get('VECTORCRAFT_CLI') or shutil.which('vectorcraft-cli') or 'vectorcraft-cli', 'mcp', '--headless'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, bufsize=1)
        self.n = 0
        self.rpc('initialize', {"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"iceage","version":"1"}})
        self.p.stdin.write(json.dumps({"jsonrpc":"2.0","method":"notifications/initialized"})+"\n")
    def rpc(self, method, params):
        self.n += 1
        self.p.stdin.write(json.dumps({"jsonrpc":"2.0","id":self.n,"method":method,"params":params})+"\n"); self.p.stdin.flush()
        while True:
            line = self.p.stdout.readline()
            if not line: raise RuntimeError('server closed')
            m = json.loads(line)
            if m.get('id') == self.n: break
        if 'error' in m: raise RuntimeError(f"{method}: {m['error']}")
        return m['result']
    def tool(self, name, **args):
        r = self.rpc('tools/call', {"name": name, "arguments": args})
        txt = ''.join(c.get('text','') for c in r.get('content',[]) if c.get('type')=='text')
        if r.get('isError'): raise RuntimeError(f"{name}: {txt[:600]}")
        try: return json.loads(txt)
        except Exception: return txt
    def cmd(self, command, **params):
        return self.tool('run_command', command=command, params=params)
    def close(self): self.p.stdin.close(); self.p.wait(5)
