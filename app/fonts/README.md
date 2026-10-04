# DM Sans

`dm-sans.woff2` is bundled for `next/font/local`, so builds do not fetch fonts from Google Fonts.

Source: [`DMSans[opsz,wght].ttf` from Google Fonts](https://github.com/google/fonts/tree/main/ofl/dmsans), version 4.004, Git blob `c672f98060af9b2c85fca704ebd5ad9a8717c1df`.

The optical-size axis is fixed at `14`, matching the previous Google Fonts response. The weight axis remains variable from 100 to 1000. The font includes Latin and Latin Extended characters. Glyph advance widths were checked against the previously downloaded Latin font at weights 400, 500, and 700.

Generated with FontTools:

```python
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

font = instantiateVariableFont(
    TTFont("DMSans[opsz,wght].ttf"), {"opsz": 14}, inplace=True
)
font.flavor = "woff2"
font.save("dm-sans.woff2")
```

The font is licensed under the SIL Open Font License 1.1. See `OFL.txt` for the original copyright and license.
