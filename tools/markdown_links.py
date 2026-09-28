"""Extract actual CommonMark navigation without rendering or fetching content."""
from markdown_it import MarkdownIt

_PARSER = MarkdownIt('commonmark').enable('table')

def navigation_links(text):
    for block in _PARSER.parse(text):
        if block.type == 'inline':
            for token in block.children or ():
                if token.type == 'link_open':
                    yield token.attrGet('href')
