#!/usr/bin/env python3
"""Extract structured content data for the Astro rebuild from the captured
WordPress sources (research/html/*.html and research/posts_full.json)."""
import json, re, os, html as H

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, 'out')
os.makedirs(OUT, exist_ok=True)


def unesc(s):
    return H.unescape(s)


def strip_tags(s):
    return re.sub('<[^>]+>', '', s)


def read(name):
    return open(os.path.join(BASE, 'html', name + '.html'), encoding='utf-8').read()


# ---------------------------------------------------------------- posts
posts_rest = json.load(open(os.path.join(BASE, 'posts_full.json'), encoding='utf-8'))

# categories per language
CATS = {
    'de': {'allgemein': 'Allgemein', 'insights': 'Insights', 'leadership': 'Leadership'},
    'en': {'generally': 'Generally', 'insights': 'Insights', 'leadership': 'Leadership'},
}
POST_CATS = {
    1365: 'generally', 1359: 'allgemein',
    1330: 'generally', 1323: 'allgemein',
    1319: 'insights', 1312: 'insights',
    1275: 'insights', 1267: 'insights',
    1249: 'leadership', 1226: 'leadership',
    1174: 'insights', 1105: 'insights',
}

PAGE_SLUG = {
    'de': {'home': 'jmc-streamline-processes', 'blog': 'blog'},
    'en': {'home': 'jmc-streamline-processes', 'blog': 'blog'},
}


def img_src(tag):
    m = re.search(r'data-src="([^"]+)"', tag)
    if m:
        return m.group(1)
    m = re.search(r'srcset="([^"]+)"', tag)
    if m:
        return m.group(1).split(',')[0].strip().split(' ')[0]
    m = re.search(r'\ssrc="([^"]+)"', tag)
    return m.group(1) if m else None


def rewrite_media(html):
    """Point WordPress media URLs to the local /media copies and drop srcset."""
    html = re.sub(r'\s+srcset="[^"]*"', '', html)
    html = re.sub(r'\s+sizes="[^"]*"', '', html)
    html = re.sub(
        r'https://www\.jmc-streamline\.com/wp-content/uploads/([^"\')\s]+)',
        lambda m: '/media/' + m.group(1).rsplit('/', 1)[-1],
        html)
    return html


def extract_post(p):
    lang = p['lang']
    slug = p['slug']
    t = read(f'{lang}__{slug}')
    title = unesc(p['title']['rendered']).strip()

    # displayed truncated card title + lede (used on listing / home cards)
    card_title = title
    card_lede = ''
    m = re.search(
        r'href="https://www\.jmc-streamline\.com/' + lang + '/' + re.escape(slug) +
        r'/"[^>]*>\s*([^<]+)</a>', t)
    # values are gathered later from listing pages instead

    # post page bits
    m = re.search(r'blog-post-harlem__content-lede[^>]*>(.*?)</div>', t, re.S)
    lede = unesc(strip_tags(m.group(1))).strip() if m else ''
    m = re.search(r'blog-post-harlem__accent-heading[^>]*>(.*?)</p>', t, re.S)
    date_display = unesc(strip_tags(m.group(1))).strip() if m else ''
    m = re.search(r'class="breadcrumb breadcrumb--first"[^>]*>(.*?)</a>', t, re.S)
    home_label = unesc(strip_tags(m.group(1))).strip() if m else 'Home'

    # featured image (from post page)
    featured = None
    fm = re.search(r'<figure class="brxe-image blog-post-harlem__featured-image[^"]*"[^>]*>\s*(<img[^>]*>)', t, re.S)
    if fm:
        tag = fm.group(1)
        al = re.search(r'alt="([^"]*)"', tag)
        src = img_src(tag)
        featured = {'src': '/media/' + src.rsplit('/', 1)[-1], 'alt': unesc(al.group(1)) if al else ''}

    body = rewrite_media(p['content']['rendered']).strip()

    # table of contents entries (h2 + h3 as rendered by the toc script)
    toc = []
    for m in re.finditer(r'<h([23])[^>]*>(.*?)</h\1>', body, re.S):
        txt = unesc(strip_tags(m.group(2))).strip()
        if txt:
            toc.append({'level': int(m.group(1)), 'text': txt})

    excerpt = unesc(strip_tags(p['excerpt']['rendered'])).strip()

    return {
        'id': p['id'],
        'lang': lang,
        'slug': slug,
        'title': title,
        'date': p['date'][:10],
        'dateDisplay': date_display,
        'category': {'slug': POST_CATS[p['id']], 'name': CATS[lang][POST_CATS[p['id']]]},
        'featured': featured,
        'excerpt': excerpt,
        'lede': lede,
        'toc': toc,
        'body': body,
        'homeLabel': home_label,
    }


posts = [extract_post(p) for p in posts_rest]

# ------------------------------------------------- listing cards (blog + cats)
def extract_listing(page_file, lang, with_footer, titles_by_href=None):
    t = read(page_file)
    cards = []
    for m in re.finditer(r'fr-article-card-echo\b(.*?)fr-article-card-echo__image-overlay', t, re.S):
        seg = m.group(1)
        hm = re.search(r'fr-article-card-echo__heading[^>]*>\s*<a href="([^"]+)"[^>]*>(.*?)</a>', seg, re.S)
        if not hm:
            continue
        href = hm.group(1)
        title = unesc(strip_tags(hm.group(2))).strip()
        cat = re.search(r'fr-article-card-echo__cat[^>]*>(.*?)</div>', seg, re.S)
        day = re.search(r'fr-article-card-echo__day[^>]*>(.*?)</span>', seg, re.S)
        month = re.search(r'fr-article-card-echo__month[^>]*>(.*?)</span>', seg, re.S)
        img = re.search(r'<img[^>]*>', seg)
        img_src_name = img_alt = None
        if img:
            tag = img.group(0)
            al = re.search(r'alt="([^"]*)"', tag)
            _s = img_src(tag)
            img_src_name = _s.rsplit('/', 1)[-1] if _s else None
            img_alt = unesc(al.group(1)) if al else ''
        footer_date = re.search(r'fr-article-card-echo__date"[^>]*>(.*?)</time>', seg, re.S)
        author = re.search(r'fr-article-card-echo__author-name[^>]*>(.*?)</span>', seg, re.S)
        cards.append({
            'href': '/' + href.replace('https://www.jmc-streamline.com/', ''),
            'title': title,
            'cat': unesc(strip_tags(cat.group(1))).strip() if cat else '',
            'day': unesc(strip_tags(day.group(1))).strip() if day else '',
            'month': unesc(strip_tags(month.group(1))).strip() if month else '',
            'image': {'src': '/media/' + img_src_name, 'alt': img_alt} if img_src_name else None,
            'footerDate': unesc(strip_tags(footer_date.group(1))).strip() if footer_date else '',
            'author': unesc(strip_tags(author.group(1))).strip() if author else '',
        })
    return cards


listing = {}
listing['blog'] = {
    'de': extract_listing('de__blog', 'de', False),
    'en': extract_listing('en__blog', 'en', False),
}
for lang, slug in [('de', 'allgemein'), ('de', 'insights'), ('de', 'leadership'),
                   ('en', 'generally'), ('en', 'insights'), ('en', 'leadership')]:
    key = f'{lang}:{slug}'
    listing[key] = extract_listing(f'{lang}__{slug}', lang, True)

# ---------------------------------------------------------------- home cards
def home_cards(page_file):
    t = read(page_file)
    out = []
    for m in re.finditer(r'fr-article-card-foxtrot\b(.*?)fr-article-card-delta__image[^>]*', t, re.S):
        seg = m.group(1)
        hm = re.search(r'fr-article-card-foxtrot__title[^>]*>\s*<a href="([^"]+)"[^>]*>(.*?)</a>', seg, re.S)
        if not hm:
            continue
        lm = re.search(r'fr-article-card-foxtrot__lede[^>]*>(.*?)</p>', seg, re.S)
        dm = re.search(r'fr-article-card-foxtrot__date[^>]*>(.*?)</time>', seg, re.S)
        out.append({
            'href': '/' + hm.group(1).replace('https://www.jmc-streamline.com/', ''),
            'title': unesc(strip_tags(hm.group(2))).strip(),
            'lede': unesc(strip_tags(lm.group(1))).strip().replace('\u2026', '…') if lm else '',
            'date': unesc(strip_tags(dm.group(1))).strip() if dm else '',
        })
    # images separately (they follow the body div)
    imgs = []
    for m in re.finditer(r'fr-article-card-delta__image[^>]*?>', t):
        pass
    for m in re.finditer(r'<img[^>]*class="[^"]*fr-article-card-delta__image[^"]*"[^>]*>', t):
        tag = m.group(0)
        al = re.search(r'alt="([^"]*)"', tag)
        _s = img_src(tag)
        if _s:
            imgs.append(('/media/' + _s.rsplit('/', 1)[-1], unesc(al.group(1)) if al else ''))
    for c, im in zip(out, imgs):
        c['image'] = {'src': im[0], 'alt': im[1]}
    return out


home_cards_data = {'de': home_cards('de'), 'en': home_cards('en')}

# ---------------------------------------------------------------- legal pages
def extract_legal(page_file):
    t = read(page_file)
    main = t[t.find('<main id="brx-content"'):]
    m = re.search(r'<h1[^>]*>(.*?)</h1>', main, re.S)
    h1 = unesc(strip_tags(m.group(1))).strip() if m else ''
    cols = []
    for m in re.finditer(r'<div class="brxe-text"[^>]*>', main):
        start = m.end()
        depth = 1
        i = start
        while depth and i < len(main):
            nxt = re.compile(r'</?div\b').search(main, i)
            if not nxt:
                break
            if main[nxt.start():nxt.start() + 2] == '</':
                depth -= 1
                i = nxt.end()
                if depth == 0:
                    cols.append(rewrite_media(main[start:nxt.start()]).strip())
                    break
            else:
                depth += 1
                i = nxt.end()
    return {'h1': h1, 'columns': cols}


legal = {
    'impressum': extract_legal('de__impressum'),
    'datenschutzerklaerung': extract_legal('de__datenschutzerklaerung'),
    'imprint': extract_legal('en__imprint'),
    'privacy-policy': extract_legal('en__privacy-policy'),
}

json.dump({'posts': posts}, open(os.path.join(OUT, 'posts.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(listing, open(os.path.join(OUT, 'listing.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(home_cards_data, open(os.path.join(OUT, 'home_cards.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(legal, open(os.path.join(OUT, 'legal.json'), 'w'), ensure_ascii=False, indent=1)

print('posts:', len(posts))
print('listing keys:', {k: len(v) for k, v in listing.items()})
print('home cards:', {k: len(v) for k, v in home_cards_data.items()})
print('legal:', {k: (v['h1'], len(v['columns'])) for k, v in legal.items()})
