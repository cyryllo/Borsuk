**English** | [Polski](CHANGELOG.pl.md)

# Changelog

## 1.1.0 – English as the main language (2026-11)

- MakeCode blocks are now in English, with a full Polish translation in `_locales/pl/`
  (Polish blocks appear when the editor language is set to Polish). Block IDs are unchanged,
  so existing programs keep working.
- Documentation in English (`README.md`, `docs/`), Polish version in `README.pl.md` and `docs/pl/`.
- Examples renamed to English and translated (e.g. `01-first-drive.ts`, `03_remote_robot.py`).
- MicroPython: `Pilot.direction()` returns English names (`'up'`, `'down-left'`, …).
- New example: distance sensor pin finder (P0, P1, P2, P19, P20).
- Hardware docs: full parts list, Waveshare driver specs and pinout (driven by pins, not I2C),
  Keyestudio KS0296 remote, RCW-0001 wiring.

## 1.0.0 – projects merged (2026-11)

The **pxt-Borsuk**, **BorsukPY** and **JoyStick** repositories merged into one project
(the history of all three is kept in this repository).

### New

- One MakeCode extension with two categories: **Borsuk** (robot) and **Borsuk Remote**.
- Drive blocks: `drive`, `drive … for … ms`, `stop robot`, `wheels: left/right`,
  `steer like joystick` – work the same for v1 (360° servos) and v2 (DC motors).
- Remote → robot radio control with one block on each side, with a **failsafe**
  (the robot stops after 0.5 s without a signal) and remote button events.
- Distance sensor (RCW-0001, HC-SR04P, RCWL-1601, Grove): `distance (cm)`, `obstacle closer than`.
- Settings: reversing motors, swapping sides, 360° servo calibration, servo range.
- Single-file MicroPython library (`Robot` + `Pilot`) with the same functions,
  including 360° servo driving and radio.
- Examples, documentation, v2 DXF file + SVG preview + `tools/dxf_preview.py`.
- CI (GitHub Actions): compiles the extension and all examples, runs the Python library tests.

### Fixed bugs

**JoyStick (MakeCode)**
- Button **F / Mode** was mapped to **P0** (buzzer) instead of **P6** – it didn't work,
  and setting the pull-up broke the sound.
- The LED display was not turned off – pins P3, P4, P6, P7, P9, P10 are shared with the
  LED matrix, so joystick and button readings were disturbed (test.ts also drew on the display).
- `blockId==…` (double `=`) and two blocks with the same text "Key %pin Press".
- `onKey` used `pins.onPulsed(…, Low)`, which fires on button **release**, not press.
- `Listen_Dir` had hard-coded pins instead of constants.

**pxt-Borsuk (MakeCode)**
- Global `Motor`, `Servo`, `Dir` types clashed with other extensions
  (e.g. the original waveshare pxt-Motor) – now `BorsukMotor`, `BorsukServo`, `BorsukDir`.
- Generic block IDs (`MotorStop`, `ServoStop`…) – now prefixed with `borsuk_`.
- Servo angle: `angle * 10 + 500` gave 500–2300 µs instead of 500–2500 µs.
- No range limits: `test.ts` called `ServoMotorForward(S1, 180)` with a 1–10 range,
  which gave a negative angle.
- Reversing servo S1 was hard-coded in low-level functions (S2 behaved like S0).
- Typo in the package name (`ptx-Borsuk`) and wrong Chinese translations copied from the original.

**BorsukPY (MicroPython)**
- `MotorRun(…, 0)` computed `0 * 64 - 1 = -1` and `write_analog(-1)` raised an error;
  speeds > 16 were silently ignored.
- `ServoTurn` passed a float to `write_analog`, and 180° gave 2.25 ms instead of 2.5 ms.
- No 360° servo functions – robot v1 could not be driven from Python.
- Joystick: no button pull-ups (`set_pull`), `display.off()` executed on import.
- Comments in the joystick example described the X axis while reading the Y axis.

### Breaking changes

Speeds are now in **percent 0–100** (previously 0–16 and 1–10), and function names were
unified. Mapping table: [docs/migration.md](docs/migration.md).
