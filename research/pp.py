import re, sys
from html.parser import HTMLParser

VOID = {'img','br','hr','input','meta','link','source','area','base','col','embed','track','wbr','path','circle','rect','line','polyline','polygon','ellipse','use','stop'}

class PP(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.depth = 0
        self.out = []
    def handle_starttag(self, tag, attrs):
        if tag == 'svg':
            self.out.append('  '*self.depth + '<svg/>')
            self._skip_svg = True
            return
        a = ' '.join(f'{k}="{v}"' for k,v in attrs if k in ('class','id','href','src','srcset','alt','title','style','data-script-id','aria-label','type','name','placeholder','value','data-icon','data-id','role','aria-expanded','target','data-brx-label','data-query-id'))
        self.out.append('  '*self.depth + f'<{tag} {a}>'.replace(' >','>'))
        if tag not in VOID:
            self.depth += 1
    def handle_endtag(self, tag):
        if tag == 'svg':
            self._skip_svg = False
            return
        if tag not in VOID:
            self.depth = max(0, self.depth-1)
    def handle_data(self, data):
        if getattr(self,'_skip_svg',False): return
        s = ' '.join(data.split())
        if s:
            self.out.append('  '*self.depth + '» ' + s)
    def handle_startendtag(self, tag, attrs):
        if tag=='svg':
            self.out.append('  '*self.depth + '<svg/>'); return
        self.handle_starttag(tag, attrs)
        if tag not in VOID: self.depth = max(0,self.depth-1)

# suppress nested svg content
orig = PP
class PP2(PP):
    def __init__(self):
        super().__init__(); self.svgdepth=0
    def handle_starttag(self, tag, attrs):
        if self.svgdepth>0 or tag=='svg':
            self.svgdepth+=1; return
        super().handle_starttag(tag, attrs)
    def handle_endtag(self, tag):
        if self.svgdepth>0:
            self.svgdepth-=1; return
        super().handle_endtag(tag)
    def handle_data(self, data):
        if self.svgdepth>0: return
        super().handle_data(data)

p = PP2()
p.feed(sys.stdin.read())
print('\n'.join(p.out))
