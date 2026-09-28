"""Extract actual CommonMark navigation without rendering or fetching content."""
from unicodedata import category
from markdown_it import MarkdownIt

_PARSER = MarkdownIt('commonmark').enable('table')

def heading_anchors(text):
    blocks = _PARSER.parse(text)
    used = {}
    for index, block in enumerate(blocks):
        if block.type != 'heading_open':
            continue
        title = ''.join(
            token.content for token in blocks[index + 1].children or ()
            if token.type in ('text', 'code_inline')
        ).lower()
        base = ''.join(
            char for char in title
            if char in ' -' or category(char)[0] in 'LMN' or category(char) == 'Pc'
        ).replace(' ', '-')
        slug = base
        while slug in used:
            used[base] += 1
            slug = f'{base}-{used[base]}'
        used[slug] = 0
    return set(used)

def navigation_links(text):
    for block in _PARSER.parse(text):
        if block.type == 'inline':
            for token in block.children or ():
                if token.type == 'link_open':
                    yield token.attrGet('href')
