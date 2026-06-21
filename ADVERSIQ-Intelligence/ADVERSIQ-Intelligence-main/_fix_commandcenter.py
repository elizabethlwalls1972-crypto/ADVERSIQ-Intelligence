import re

with open('components/CommandCenter.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

original_size = len(content)
print(f'File size before: {original_size:,} chars')

# The mojibake pattern: long runs of Latin-extended / garbled UTF-8 characters
MOJI_CHARS = r'[ÃÂâ€™ƒÆ†œ¦§¨©ª«\xac\xad®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÄÅÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\x80-\x9f\xa0-\xbf\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013\u2014\u2018\u2019\u201a\u201c\u201d\u201e\u2020\u2021\u2026\u2030\u2039\u203a\u20ac\u2122]'

# Pattern 1: Remove JSX comments that are predominantly mojibake (> 100 chars of it)
jsx_comment_mojibake = re.compile(r'\{/\*\s*(?:' + MOJI_CHARS + r'|[\s]){100,}.*?\*/\}', re.DOTALL)

count1 = len(jsx_comment_mojibake.findall(content))
print(f'Found {count1} mojibake JSX comments to remove')
content = jsx_comment_mojibake.sub('', content)

# Pattern 2: In string values, remove inline mojibake blocks (30+ consecutive mojibake chars)
inline_mojibake = re.compile(MOJI_CHARS + r'{30,}')

def fix_inline(match):
    return '\u2014'  # Replace with em-dash

count2 = len(inline_mojibake.findall(content))
print(f'Found {count2} inline mojibake blocks to fix')
content = inline_mojibake.sub(fix_inline, content)

# Pattern 3: Clean up any remaining very long lines
lines = content.split('\n')
fixed_lines = []
for i, line in enumerate(lines):
    if len(line) > 2000:
        moji_matches = re.findall(MOJI_CHARS, line)
        moji_ratio = len(''.join(moji_matches)) / len(line) if line else 0
        if moji_ratio > 0.3:
            print(f'  Stripping long line {i+1} ({len(line):,} chars, {moji_ratio:.0%} mojibake)')
            line = inline_mojibake.sub('\u2014', line)
    fixed_lines.append(line)
content = '\n'.join(fixed_lines)

final_size = len(content)
print(f'File size after: {final_size:,} chars (reduced by {original_size - final_size:,})')

with open('components/CommandCenter.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done! Checking longest lines:')
lines2 = content.split('\n')
long_lines = [(i+1, len(l)) for i, l in enumerate(lines2) if len(l) > 1000]
for ln, length in sorted(long_lines, key=lambda x: -x[1])[:10]:
    print(f'  Line {ln}: {length:,} chars')
