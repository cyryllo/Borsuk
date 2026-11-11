#!/usr/bin/env python3
"""Podgląd pliku DXF jako SVG (do wyświetlenia na GitHubie).

Bez zewnętrznych bibliotek. Obsługuje: LINE, CIRCLE, ARC, LWPOLYLINE (z łukami),
SPLINE (B-spline / NURBS). Jednostki przyjmowane z pliku (Borsuk: mm).

Użycie:
    python3 tools/dxf_podglad.py hardware/Borsuk_v2.dxf hardware/Borsuk_v2_podglad.svg
"""
import math
import sys


def read_pairs(path):
    with open(path, encoding="latin-1") as f:
        lines = [line.strip() for line in f]
    return list(zip(lines[0::2], lines[1::2]))


def entities(pairs):
    """Zwraca listę (typ, [(kod, wartość), ...]) z sekcji ENTITIES."""
    out, section, cur = [], None, None
    for i, (code, val) in enumerate(pairs):
        if code == "0" and val == "SECTION":
            section = pairs[i + 1][1]
            continue
        if section != "ENTITIES":
            continue
        if code == "0":
            if cur:
                out.append(cur)
            cur = None if val == "ENDSEC" else (val, [])
        elif cur:
            cur[1].append((code, val))
    return out


def first(props, code, default=0.0):
    for c, v in props:
        if c == code:
            return float(v)
    return default


def arc_points(cx, cy, r, a0, a1, n=None):
    """Punkty łuku od kąta a0 do a1 (stopnie, przeciwnie do wskazówek zegara)."""
    while a1 <= a0:
        a1 += 360.0
    n = n or max(8, int((a1 - a0) / 6))
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * k / n)),
             cy + r * math.sin(math.radians(a0 + (a1 - a0) * k / n))) for k in range(n + 1)]


def bulge_points(p0, p1, bulge):
    if abs(bulge) < 1e-9:
        return [p1]
    (x0, y0), (x1, y1) = p0, p1
    theta = 4 * math.atan(bulge)
    chord = math.hypot(x1 - x0, y1 - y0)
    r = chord / (2 * math.sin(abs(theta) / 2))
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    d = math.sqrt(max(r * r - (chord / 2) ** 2, 0))
    ux, uy = (x1 - x0) / chord, (y1 - y0) / chord
    sign = 1 if (bulge > 0) == (abs(theta) < math.pi) else -1
    cx, cy = mx - sign * d * uy, my + sign * d * ux
    a0 = math.atan2(y0 - cy, x0 - cx)
    a1 = math.atan2(y1 - cy, x1 - cx)
    if bulge > 0:
        while a1 <= a0:
            a1 += 2 * math.pi
    else:
        while a1 >= a0:
            a1 -= 2 * math.pi
    n = max(4, int(abs(a1 - a0) / math.radians(6)))
    return [(cx + r * math.cos(a0 + (a1 - a0) * k / n),
             cy + r * math.sin(a0 + (a1 - a0) * k / n)) for k in range(1, n + 1)]


def lwpolyline(props):
    verts, closed = [], int(first(props, "70")) & 1
    for c, v in props:
        if c == "10":
            verts.append([float(v), 0.0, 0.0])
        elif c == "20" and verts:
            verts[-1][1] = float(v)
        elif c == "42" and verts:
            verts[-1][2] = float(v)
    if not verts:
        return []
    pts = [(verts[0][0], verts[0][1])]
    seq = verts + ([verts[0]] if closed else [])
    for a, b in zip(seq, seq[1:]):
        pts += bulge_points((a[0], a[1]), (b[0], b[1]), a[2])
    return pts


def spline(props):
    degree = int(first(props, "71", 3))
    knots = [float(v) for c, v in props if c == "40"]
    weights = [float(v) for c, v in props if c == "41"]
    ctrl, fit = [], []
    for c, v in props:
        if c == "10":
            ctrl.append([float(v), 0.0])
        elif c == "20" and ctrl:
            ctrl[-1][1] = float(v)
        elif c == "11":
            fit.append([float(v), 0.0])
        elif c == "21" and fit:
            fit[-1][1] = float(v)
    if not ctrl or len(knots) != len(ctrl) + degree + 1:
        return [tuple(p) for p in (fit or ctrl)]
    w = weights if len(weights) == len(ctrl) else [1.0] * len(ctrl)

    def de_boor(t):
        k = degree
        while k < len(ctrl) - 1 and t >= knots[k + 1]:
            k += 1
        d = [[ctrl[j][0] * w[j], ctrl[j][1] * w[j], w[j]] for j in range(k - degree, k + 1)]
        for r in range(1, degree + 1):
            for j in range(degree, r - 1, -1):
                i = j + k - degree
                den = knots[i + degree - r + 1] - knots[i]
                a = 0.0 if den == 0 else (t - knots[i]) / den
                d[j] = [(1 - a) * d[j - 1][m] + a * d[j][m] for m in range(3)]
        return (d[degree][0] / d[degree][2], d[degree][1] / d[degree][2])

    t0, t1 = knots[degree], knots[len(ctrl)]
    n = max(24, len(ctrl) * 8)
    return [de_boor(t0 + (t1 - t0) * k / n) for k in range(n + 1)]


def to_paths(ents):
    paths = []
    for kind, p in ents:
        if kind == "LINE":
            paths.append([(first(p, "10"), first(p, "20")), (first(p, "11"), first(p, "21"))])
        elif kind == "CIRCLE":
            paths.append(arc_points(first(p, "10"), first(p, "20"), first(p, "40"), 0, 360, 48))
        elif kind == "ARC":
            paths.append(arc_points(first(p, "10"), first(p, "20"), first(p, "40"),
                                    first(p, "50"), first(p, "51")))
        elif kind == "LWPOLYLINE":
            paths.append(lwpolyline(p))
        elif kind == "SPLINE":
            paths.append(spline(p))
    return [pts for pts in paths if len(pts) > 1]


def main(src, dst):
    paths = to_paths(entities(read_pairs(src)))
    xs = [x for pts in paths for x, _ in pts]
    ys = [y for pts in paths for _, y in pts]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    w, h, m = maxx - minx, maxy - miny, 5
    d = " ".join("M" + " L".join("%.2f,%.2f" % (x - minx + m, maxy - y + m) for x, y in pts)
                 for pts in paths)
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" width="%.1fmm" height="%.1fmm" '
        'viewBox="0 0 %.2f %.2f">\n'
        '<rect width="100%%" height="100%%" fill="#f6efe4"/>\n'
        '<path d="%s" fill="none" stroke="#7a3e12" stroke-width="0.4" '
        'stroke-linejoin="round"/>\n</svg>\n'
    ) % (w + 2 * m, h + 2 * m, w + 2 * m, h + 2 * m, d)
    with open(dst, "w") as f:
        f.write(svg)
    print("Elementów: %d, obszar: %.1f x %.1f mm -> %s" % (len(paths), w, h, dst))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
