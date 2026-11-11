**English** | [Polski](pl/micropython.md)

# MicroPython library

One file: [`python/borsuk.py`](../python/borsuk.py), with the `Robot` and `Pilot` (remote) classes.
Function names match the Python view in MakeCode.

## Flashing

**python.microbit.org (easiest):**

1. Open <https://python.microbit.org>.
2. **Open…** → choose `borsuk.py` → *Add file borsuk.py*.
3. Write your program in `main.py` (or paste an example) and click **Send to micro:bit**.
   The editor flashes both files.

**From a computer (Thonny / microfs):**

```bash
pip install microfs
ufs put python/borsuk.py
ufs put examples/micropython/03_remote_robot.py main.py
```

## Constants

```python
A, B                              # motors
S0, S1, S2                        # servos
FORWARD, BACKWARD, LEFT, RIGHT    # drive directions
DC, SERVO360                      # drive type (v2 / v1)
UP, DOWN, KEY_LEFT, KEY_RIGHT, SELECT, MODE, STICK   # remote buttons
```

## `Robot(drive_mode=DC)`

```python
from borsuk import *
robot = Robot()            # v2 – DC motors
robot = Robot(SERVO360)    # v1 – 360° servos
```

| Method | Description |
|---|---|
| `drive(move, speed)` | drive `FORWARD/BACKWARD/LEFT/RIGHT`, speed 0–100 |
| `drive_for(move, speed, ms)` | drive for a time, then stop |
| `stop()` | stop |
| `tank(left, right)` | each wheel separately, -100…100 |
| `steer(x, y)` | like a joystick: y = forward/backward, x = turn |
| `motor_run(motor, direction, speed)` | a single DC motor, `direction` = `FORWARD`/`BACKWARD` |
| `motor_stop(motor)` | |
| `servo_angle(servo, angle)` | standard servo 0–180° |
| `servo_spin(servo, speed)` | 360° servo, -100…100 |
| `servo_stop(servo)` | turns the servo signal off |
| `set_distance_sensor(trig, echo)` | sensor pins, e.g. `pin1, pin2` (default) |
| `distance()` | distance in cm, 0 = no reading |
| `obstacle_closer_than(cm)` | `True`/`False` |
| `start_remote(group=1)` | turns the radio on in the robot |
| `remote_update(auto_drive=True)` | **call in a loop** – receives frames, drives by the joystick, 0.5 s failsafe; returns a mask of newly pressed buttons |
| `remote_connected()` | is the remote transmitting |
| `remote_key_pressed(key)` | is a remote button held down |
| `remote_x`, `remote_y` | last joystick deflection of the remote |

Settings (attributes):

```python
robot.motor_reversed[A] = True   # reverse motor A
robot.sides_swapped = True       # swap left and right wheel
robot.servo_trim[S0] = 20        # 360° servo stop-point calibration (µs)
robot.servo_min_us, robot.servo_max_us = 600, 2400   # standard servo range
```

Checking a button in the mask:

```python
pressed = robot.remote_update()
if pressed & (1 << UP):
    ...
```

## `Pilot()` (remote)

```python
from borsuk import Pilot, UP
remote = Pilot()       # turns the LED display off, calibrates the joystick center
```

| Method | Description |
|---|---|
| `is_pressed(key)` | is the button pressed |
| `was_pressed(key)` | `True` only once per press |
| `keys()` | mask of all buttons |
| `x()`, `y()` | deflection -100…100 |
| `direction()` | `''`, `'up'`, `'down'`, `'left'`, `'right'`, `'up-left'`, … |
| `calibrate()` | remember the current position as the center |
| `start_sending(group=1)` | turns the radio on |
| `send()` | sends one frame – call about every 50 ms |

## Examples

| File | Which micro:bit |
|---|---|
| [01_first_drive.py](../examples/micropython/01_first_drive.py) | robot |
| [02_remote.py](../examples/micropython/02_remote.py) | **remote** |
| [03_remote_robot.py](../examples/micropython/03_remote_robot.py) | robot |
| [04_obstacle_avoidance.py](../examples/micropython/04_obstacle_avoidance.py) | robot |
| [05_remote_test.py](../examples/micropython/05_remote_test.py) | remote |
| [06_calibration.py](../examples/micropython/06_calibration.py) | robot |
| [07_find_sensor_pins.py](../examples/micropython/07_find_sensor_pins.py) | robot |

## Notes

- **MakeCode and MicroPython don't talk to each other over radio** – the remote and the robot
  must run programs from the same environment (both MakeCode or both MicroPython).
- **micro:bit V1** has little memory. If you get a `MemoryError` on import, shorten `main.py`
  or use a V2.
- Library tests on a computer: `cd python && python3 -m unittest discover -s tests -v`.
