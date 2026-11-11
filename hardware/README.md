**English** | [Polski](README.pl.md)

# Construction – cutting files

| File | Description |
|---|---|
| [`Borsuk_v2.dxf`](Borsuk_v2.dxf) | all robot v2 parts, units **mm**, sheet **148 × 360 mm** |
| [`Borsuk_v2_preview.svg`](Borsuk_v2_preview.svg) | preview for the browser / GitHub (not for cutting) |

![Preview](Borsuk_v2_preview.svg)

## Parameters

- Material: **3 mm plywood** (tab slots 3 × 7 mm).
- Mounting holes: Ø2.3 and Ø2.4 mm (M2/M2.5 screws or wood screws), Ø3 mm.
- Front panel: two Ø14 mm holes for the ultrasonic sensor transducers.
- All lines are cut lines (layer 0).

## Laser cutting

- Load the DXF in mm (e.g. [Kerfly](https://github.com/cyryllo/Kerfly), LightBurn, RDWorks)
  and check that the sheet is 148 × 360 mm.
- Cut inner holes first, then outlines (most programs do this automatically).
- Before cutting everything, cut one side and test the tab/slot fit –
  "3 mm" plywood is often 2.8–3.2 mm.

## Render

![Borsuk v2](../images/borsuk-v2-render.webp)

## Other files

[MakerWorld (Badger robot for micro:bit)](https://makerworld.com/en/models/2668556-badger-robot-for-micro-bit)
has the **STEP** file (for further development) and the **remote case STL**.
The remote case is also on
[Printables](https://www.printables.com/model/40102-handle-joystick-for-microbit-module-from-keyestudi).

Assembly: motors with 4 × M3 × 25 and nuts, driver with 4 × M3 × 10, body glued with
wood glue. Full parts list: [docs/hardware.md](../docs/hardware.md).

## To do

- [ ] step-by-step assembly guide (photos)
- [ ] v1 DXF (360° servos), if it differs from v2
