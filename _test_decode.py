import re

# Test decoding
s = 'Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢'
try:
    b = s.encode('cp1252')
    r1 = b.decode('utf-8')
    print('cp1252->utf8 1 level:', repr(r1))
    b2 = r1.encode('cp1252')
    r2 = b2.decode('utf-8')
    print('cp1252->utf8 2 levels:', repr(r2))
except Exception as e:
    print('Error:', e)

# Test with the known subtitle start
sample = '50+ parallel engines orchestrated as a unified brain with anticipatory thinking \u2014 adversarial analysis'
print('\nSample:', sample)
