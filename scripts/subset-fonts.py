#!/usr/bin/env python3
"""
Subsets the site's fonts to the characters it uses. Requires: pip install fonttools brotli

  python3 scripts/subset-fonts.py <BigShoulders-latin-wght.woff2> <InstrumentSans-latin-wght.woff2>

Sources: the latin wght files from @fontsource-variable/big-shoulders and
@fontsource-variable/instrument-sans (SIL Open Font License).
Keep UNICODES in step with lib/charset.ts, which a unit test checks content against.
"""
import sys
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

UNICODES = (
    list(range(0x20, 0x7F))  # printable ASCII
    + [0xA0, 0xA9, 0xD7, 0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026]
)


def build(src, dest, axis):
    font = TTFont(src)
    # Display face is only ever used at 800: freeze it. Body keeps its weight range.
    font = instancer.instantiateVariableFont(font, axis)
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["kern", "liga", "ccmp", "locl", "tnum", "pnum"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    sub = subset.Subsetter(options)
    sub.populate(unicodes=UNICODES)
    sub.subset(font)
    font.flavor = "woff2"
    font.save(dest)


if __name__ == "__main__":
    big, body = sys.argv[1:3]
    build(big, "app/fonts/BigShoulders-latin-800.woff2", {"wght": 800})
    build(body, "app/fonts/InstrumentSans-latin-wght.woff2", {"wght": (400, 700)})
    print("Wrote app/fonts/BigShoulders-latin-800.woff2 and InstrumentSans-latin-wght.woff2")
