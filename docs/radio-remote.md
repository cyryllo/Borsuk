**English** | [Polski](pl/sterowanie-radiowe.md)

# Radio remote control

```
 ┌──────────── remote ───────────┐     radio, 20×/s     ┌──────────── robot ────────────┐
 │ joystick X/Y + 7 buttons      │ ───────────────────▶ │ steer(x, y) → wheels          │
 │ pilot.startSending(group)     │    5-byte frame      │ borsuk.startRemote(group)     │
 └───────────────────────────────┘                      │ no frames for 0.5 s → stop    │
                                                        └───────────────────────────────┘
```

## How it works

1. Every 50 ms the remote sends a frame with the joystick and button state.
2. After each frame the robot sets its wheels (`steer(x, y)`): stick up = forward,
   sideways = turn, diagonal = drive in an arc.
3. If no frame arrives for **0.5 s** (remote off, out of range), the robot **stops** (failsafe).
4. Pressing a button on the remote fires the *on remote … pressed* event in the robot
   (MakeCode) or sets a bit in the result of `remote_update()` (MicroPython).

## Radio groups

All micro:bits in the same **group** hear each other. When several robots drive in one room,
every remote + robot pair needs a **different group** (0–255). Simplest: robot number =
group number; put a sticker with it on both the robot and the remote.

## Custom control

Want the buttons to do something other than joystick driving? Turn off automatic driving
and decide yourself:

```blocks
borsuk.startRemote(1)
borsuk.setRemoteAutoDrive(false)
basic.forever(function () {
    if (borsuk.remoteKeyPressed(PilotKey.Up)) {
        borsuk.drive(BorsukMove.Forward, 70)
    } else if (borsuk.remoteKeyPressed(PilotKey.Down)) {
        borsuk.drive(BorsukMove.Backward, 70)
    } else {
        borsuk.stop()
    }
})
```

The extension only uses `radio.sendBuffer` / `radio.onReceivedBuffer`, so you can still use
the regular radio blocks with numbers and strings in your program.

## Frame format

5 bytes, sent as a buffer (`radio.sendBuffer` / `radio.send_bytes`):

| Byte | Content |
|---|---|
| 0 | `0x42` – Borsuk marker (frames with another marker are ignored) |
| 1 | `0x01` – protocol version |
| 2 | joystick X, signed (int8), -100…100 |
| 3 | joystick Y, int8, -100…100 |
| 4 | buttons – bit 0 up, 1 down, 2 left, 3 right, 4 select, 5 mode, 6 joystick |

MakeCode and MicroPython add different headers to radio packets, so a **MakeCode remote
does not control a MicroPython robot** (and vice versa).
