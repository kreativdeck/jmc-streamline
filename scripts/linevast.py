#!/usr/bin/env python3
"""Explicit-TLS deployment. Run through Node's env-file loader; secrets stay private."""
import concurrent.futures
import ftplib
import hashlib
import io
import json
import os
from pathlib import Path
import re
import secrets
import ssl
import sys
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
PRIVATE = ROOT / '.deploy'
PRIVATE.mkdir(mode=0o700, exist_ok=True)
STATE = PRIVATE / 'linevast.json'
if STATE.exists():
    state = json.loads(STATE.read_text())
else:
    suffix = secrets.token_hex(6)
    state = {'preview': 'jmc-preview-' + suffix, 'release': '.jmc-release-' + suffix,
             'backup': '.jmc-wordpress-' + suffix, 'operations': 'jmc-operations-' + suffix + '.php',
             'key': secrets.token_urlsafe(48)}
    STATE.write_text(json.dumps(state, indent=2))
    STATE.chmod(0o600)

def connect():
    ftp = ftplib.FTP_TLS(context=ssl.create_default_context(), timeout=45)
    ftp.connect(os.environ['FTP_HOST'], int(os.environ.get('FTP_PORT', 21)))
    ftp.login(os.environ['FTP_USER'], os.environ['FTP_PASSWORD'])
    ftp.prot_p()
    return ftp

def mkdir(ftp, path):
    for index in range(1, len(path.split('/')) + 1):
        part = '/'.join(path.split('/')[:index])
        if not part: continue
        try: ftp.mkd(part)
        except ftplib.error_perm as error:
            if not str(error).startswith('550'): raise

def upload(ftp, path, data, private=False):
    mkdir(ftp, path.rsplit('/', 1)[0])
    ftp.storbinary('STOR ' + path, io.BytesIO(data))
    if private: ftp.sendcmd('SITE CHMOD 600 ' + path)

def operation(action):
    request = urllib.request.Request('https://www.jmc-streamline.com/' + state['operations'] + '?action=' + action,
                                     headers={'X-JMC-Key': state['key']})
    with urllib.request.urlopen(request, timeout=320) as response:
        return json.load(response)

def prepare():
    config = {key.lower(): os.environ[key] for key in ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD']}
    config.update(origins=['https://www.jmc-streamline.com', 'https://jmc-streamline.com'], state_salt=secrets.token_hex(32))
    encoded = __import__('base64').b64encode(json.dumps(config).encode()).decode()
    ftp = connect()
    mkdir(ftp, '/.jmc-private')
    ftp.sendcmd('SITE CHMOD 700 /.jmc-private')
    for file in (ROOT / 'backend/php').rglob('*'):
        relative = file.relative_to(ROOT / 'backend/php')
        if file.is_file() and relative.parts[0] != 'public':
            upload(ftp, '/.jmc-private/app/' + relative.as_posix(), file.read_bytes(), True)
    # Preserve the salt and idempotency state across later releases.
    ftp.voidcmd('TYPE I')
    try: ftp.size('/.jmc-private/contact-config.php')
    except ftplib.error_perm:
        upload(ftp, '/.jmc-private/contact-config.php', ("<?php\nreturn json_decode(base64_decode('" + encoded + "'), true, 512, JSON_THROW_ON_ERROR);\n").encode(), True)
    upload(ftp, '/.jmc-private/operations.key', state['key'].encode(), True)
    upload(ftp, '/public_html/' + state['operations'], (ROOT / 'deployment/operations.php').read_bytes())
    ftp.quit()
    print(json.dumps(operation('test'), ensure_ascii=False))

def build_release(preview):
    prefix = '/' + state['preview']
    files = []
    for file in (ROOT / 'frontend/dist').rglob('*'):
        if not file.is_file(): continue
        relative = file.relative_to(ROOT / 'frontend/dist').as_posix()
        data = file.read_bytes()
        if preview and file.suffix in ['.html', '.css', '.js']:
            text = data.decode()
            # Prefix local absolute URLs, while retaining canonical/schema URLs.
            text = re.sub(r'([\"\'`(=\s])/(?!/)(?=[A-Za-z_])', lambda match: match[1] + prefix + '/', text)
            text = text.replace(prefix + '/api/contact', prefix + '/api/contact.php')
            if file.suffix == '.html': text = text.replace('<head>', '<head><meta name="robots" content="noindex,nofollow">', 1)
            data = text.encode()
        files.append((relative, data))
    for file in (ROOT / 'backend/php/public').rglob('*'):
        if not file.is_file(): continue
        data = file.read_bytes()
        if preview and file.name == 'contact.php': data = data.replace(b'dirname(__DIR__, 2)', b'dirname(__DIR__, 3)')
        if preview and file.name == '.htaccess': data += b'\nHeader set X-Robots-Tag "noindex, nofollow"\n'
        files.append((file.relative_to(ROOT / 'backend/php/public').as_posix(), data))
    destination = '/public_html/' + state['preview'] if preview else '/' + state['release']
    # Create directories before parallel transfer to avoid mkdir races.
    ftp = connect()
    for directory in sorted({(destination + '/' + name).rsplit('/', 1)[0] for name, _ in files}): mkdir(ftp, directory)
    ftp.quit()
    def transfer(batch):
        connection = connect()
        try:
            for name, data in batch: connection.storbinary('STOR ' + destination + '/' + name, io.BytesIO(data))
        finally: connection.quit()
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        list(executor.map(transfer, [files[index::3] for index in range(3)]))
    manifest = {name: hashlib.sha256(data).hexdigest() for name, data in files}
    (PRIVATE / ('preview-manifest.json' if preview else 'release-manifest.json')).write_text(json.dumps(manifest, indent=2))
    print(json.dumps({'files': len(files), 'bytes': sum(len(data) for _, data in files), 'destination': destination,
                      'url': 'https://www.jmc-streamline.com/' + state['preview'] + '/de/' if preview else None}))

def backup():
    result = operation('backup')
    if result.get('tables', 0) < 1 or result.get('bytes', 0) < 100: raise RuntimeError('Invalid database backup')
    target = PRIVATE / result['backup']
    ftp = connect()
    with target.open('wb') as file: ftp.retrbinary('RETR /.jmc-private/backups/' + result['backup'], file.write)
    target.chmod(0o600)
    if hashlib.sha256(target.read_bytes()).hexdigest() != result['sha256']: raise RuntimeError('Backup hash mismatch')
    ftp.quit()
    state['database_backup'] = result
    STATE.write_text(json.dumps(state, indent=2))
    print(json.dumps(result))

def promote():
    if not state.get('database_backup'): raise RuntimeError('Verified database backup required')
    if not (PRIVATE / 'release-manifest.json').exists(): raise RuntimeError('Release required')
    ftp = connect()
    # Remove the temporary operations endpoint before archiving WordPress.
    ftp.delete('/public_html/' + state['operations'])
    ftp.delete('/.jmc-private/operations.key')
    ftp.rename('/public_html', '/' + state['backup'])
    try: ftp.rename('/' + state['release'], '/public_html')
    except Exception:
        ftp.rename('/' + state['backup'], '/public_html')
        raise
    ftp.quit()
    state['promoted'] = True
    STATE.write_text(json.dumps(state, indent=2))
    print('New release active; WordPress files and database backup preserved outside public_html.')

def cleanup():
    ftp = connect()
    for path in ['/public_html/' + state['operations'], '/.jmc-private/operations.key']:
        try: ftp.delete(path)
        except ftplib.error_perm as error:
            if not str(error).startswith('550'): raise
    ftp.quit()
    print('Temporary operations endpoint and key removed.')

if __name__ == '__main__':
    action = sys.argv[1]
    if action == 'prepare': prepare()
    elif action == 'preview': build_release(True)
    elif action == 'release': build_release(False)
    elif action == 'backup': backup()
    elif action == 'promote': promote()
    elif action == 'cleanup': cleanup()
    else: raise SystemExit('Unknown command')
