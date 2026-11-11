**English** | [Polski](pl/makecode.md)

# MakeCode blocks

## Adding the extension

1. <https://makecode.microbit.org> → **New project**.
2. Gear icon → **Extensions** (or the *Extensions* category at the bottom of the block list).
3. Paste `https://github.com/cyryllo/Borsuk` and click the **borsuk** extension that appears.

Add the same extension to the robot's program and to the remote's program.
The extension also adds *Radio* (needed for the remote).

**Block language:** blocks are in Polish when the MakeCode editor language is set to Polish
(gear icon → *Language* → *Polski*), and in English otherwise. In the JavaScript/Python view
the functions always have the English names listed below, e.g. `borsuk.drive(...)`.

---

## "Borsuk" category (robot)

### Drive

| Block | Code | Description |
|---|---|---|
| drive **[forward]** at speed **50** | `borsuk.drive(BorsukMove.Forward, 50)` | drives until you stop it; directions: forward, backward, left (spin), right (spin); speed 0–100 % |
| drive **[forward]** at speed **50** for **1000** ms | `borsuk.driveFor(move, speed, ms)` | drives for the given time, then stops |
| stop robot | `borsuk.stop()` | |
| wheels: left **50** right **50** | `borsuk.tank(left, right)` | each wheel separately, -100…100 (negative = backward) – arcs, slaloms |
| steer like joystick x **0** y **50** | `borsuk.steer(x, y)` | y = forward/backward, x = turn, -100…100 |

### Distance sensor

| Block | Code | Description |
|---|---|---|
| distance sensor TRIG **P1** ECHO **P2** | `borsuk.setDistanceSensor(trig, echo)` | call once at the start; for a Grove sensor pick the same pin twice |
| distance (cm) | `borsuk.distance()` | 0 = no reading (nothing within ~4 m) |
| obstacle closer than **20** cm | `borsuk.obstacleCloserThan(cm)` | true/false; no reading = no obstacle |

RCW-0001 wiring and notes on replacement sensors: [hardware](hardware.md#rcw-0001-distance-sensor).

### DC motors

| Block | Code | Description |
|---|---|---|
| motor **A** run **forward** at speed **50** | `borsuk.motorRun(motor, dir, speed)` | a single motor, 0–100 % |
| stop motor **A** | `borsuk.motorStop(motor)` | |

### Servos

| Block | Code | Description |
|---|---|---|
| servo **S2** set angle **90** | `borsuk.servoAngle(servo, angle)` | standard servo 0–180° |
| 360° servo **S0** spin at speed **50** | `borsuk.servoSpin(servo, speed)` | continuous rotation servo, -100…100 |
| stop servo **S0** | `borsuk.servoStop(servo)` | turns the signal off (a 360° servo stops, a standard one stops holding its position) |

### Remote control (robot side)

| Block | Code | Description |
|---|---|---|
| receive remote control, radio group **1** | `borsuk.startRemote(group)` | the robot drives by the joystick on its own; stops after 0.5 s without a signal |
| on remote **[up]** pressed | `borsuk.onRemoteKey(key, handler)` | event |
| remote **[up]** is pressed | `borsuk.remoteKeyPressed(key)` | true/false |
| remote joystick axis **X** | `borsuk.remoteAxis(axis)` | -100…100 |
| remote connected | `borsuk.isRemoteConnected()` | |
| drive with remote joystick **on/off** | `borsuk.setRemoteAutoDrive(on)` | turn off when you want to program the robot's reaction yourself |

### Settings

| Block | Code | Description |
|---|---|---|
| robot drive: **DC motors (v2) / 360° servos (v1)** | `borsuk.setDriveMode(mode)` | default: DC motors |
| reverse motor **A** on | `borsuk.reverseMotor(motor, on)` | when a wheel spins the wrong way |
| swap left and right wheel on | `borsuk.swapSides(on)` | when the robot turns the wrong way |
| calibrate 360° servo **S0** offset **0** µs | `borsuk.setServoTrim(servo, us)` | *(more…)* – see [calibration](calibration-troubleshooting.md) |
| servo range: 0° = **500** µs, 180° = **2500** µs | `borsuk.setServoRange(min, max)` | *(more…)* – when a servo buzzes at the ends |

---

## "Borsuk Remote" category (joystick)

| Block | Code | Description |
|---|---|---|
| start remote | `pilot.init()` | you don't need it – other blocks call it automatically |
| remote button **[up]** is pressed | `pilot.isPressed(key)` | buttons: up, down, left, right, select, mode, joystick |
| on remote button **[up]** pressed | `pilot.onKey(key, handler)` | event on press |
| joystick axis **X** | `pilot.axis(axis)` | -100…100, X: negative = left, Y: negative = down |
| joystick pushed **[up]** | `pilot.isDirection(dir)` | 8 directions + "centered" |
| calibrate joystick center | `pilot.calibrate()` | done automatically at start – don't touch the stick then |
| send control to robot, radio group **1** | `pilot.startSending(group)` | sends the joystick and button state 20 times per second |

**The remote turns the LED display off** (it shares pins with the joystick). Use sound for
feedback – the buzzer is on P0, regular *Music* blocks work.

---

## Examples

Ready programs are in [`examples/makecode/`](../examples/makecode/). To open one: new project →
add the extension → switch to **JavaScript** → paste the file → switch back to **Blocks**.

| File | Which micro:bit | What it does |
|---|---|---|
| [01-first-drive.ts](../examples/makecode/01-first-drive.ts) | robot | A = there and back, B = stop |
| [02-square.ts](../examples/makecode/02-square.ts) | robot | drives in a square |
| [03-remote.ts](../examples/makecode/03-remote.ts) | **remote** | sends control |
| [04-remote-robot.ts](../examples/makecode/04-remote-robot.ts) | robot | remote driving + servo + melody |
| [05-obstacle-avoidance.ts](../examples/makecode/05-obstacle-avoidance.ts) | robot | autonomous driving with the distance sensor |
| [06-remote-test.ts](../examples/makecode/06-remote-test.ts) | remote | button and joystick test (sound + console) |
| [07-calibration.ts](../examples/makecode/07-calibration.ts) | robot | setting wheel directions and 360° servos |
| [08-find-sensor-pins.ts](../examples/makecode/08-find-sensor-pins.ts) | robot | finds which pins (P0/P1/P2/P19/P20) the distance sensor is on |

All examples are compiled in CI, so they work with the current version of the extension.

**Block images** of every example: [examples/makecode/README.md](../examples/makecode/README.md).
