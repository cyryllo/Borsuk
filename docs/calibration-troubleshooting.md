**English** | [Polski](pl/kalibracja-i-problemy.md)

# Calibration and troubleshooting

Quickest way: flash the calibration example
([MakeCode](../examples/makecode/07-calibration.ts) /
[MicroPython](../examples/micropython/06_calibration.py)) and change the settings until the
robot drives correctly. Then copy the same settings to the start of your programs.

## 1. Wheel directions (DC motors)

| Symptom | Fix |
|---|---|
| "forward" – one wheel spins backward | `reverse motor` (A or B) |
| "forward" – the robot drives backward | reverse **both** motors |
| "left" – the robot spins right | `swap left and right wheel` |

You can also swap the motor wires in the driver terminals – then no settings are needed in the program.

## 2. 360° servos (robot v1)

A continuous rotation servo stands still at about 1500 µs, but every unit is a bit different.

1. Flash the calibration example and press **A+B** – both wheels should spin very slowly
   forward, at the same speed.
2. If one stands still or spins the other way – change its `offset` (trim) by ±10…20 µs and try again.
3. Some servos have an adjustment potentiometer (a hole on the side) – you can set it with a
   screwdriver while running `servoSpin(…, 0)`.

Stopping the robot (`stop robot`) turns the servo signal off, so the servos always stand
still, even without perfect calibration.

## 3. Remote joystick

The stick center is remembered at start – **don't touch the joystick during the first
second after turning the remote on**. If needed, use the `calibrate joystick center` block.
Small deflections (below 8 %) are ignored.

## Common problems

| Problem | Cause / fix |
|---|---|
| The robot doesn't react to the remote | different radio groups; remote and robot in different environments (MakeCode vs MicroPython); no `receive remote control` block in the robot |
| The robot keeps stopping while driving with the remote | weak batteries in the remote / too far away; the failsafe stops the robot after 0.5 s without a signal |
| The "mode" button doesn't work on the remote | the old JoyStick library had it on P0 instead of P6 – use this library |
| Joystick readings jump, strange behavior | the remote program uses the LED display – it shares pins with the joystick |
| Distance is always 0 | wrong TRIG/ECHO pins (use the [pin finder](../examples/makecode/08-find-sensor-pins.ts)); a 5 V sensor without a divider on ECHO; nothing in range (up to ~4 m) |
| The robot resets when it starts moving | flat batteries |
| A servo jitters while the motors run (V1) | micro:bit V1 PWM channel limit – see [hardware](hardware.md#microbit-v1-vs-v2) |
| `MemoryError` in MicroPython (V1) | not enough memory – shorten the program or use a micro:bit V2 |
| A servo buzzes at an end position | narrow the range: `servo range: 0° = 600 µs, 180° = 2400 µs` |
