[English](../micropython.md) | **Polski**

# Biblioteka MicroPython

Jeden plik: [`python/borsuk.py`](../../python/borsuk.py), zawiera klasy `Robot` i `Pilot`.
Nazwy funkcji są takie same jak w widoku Python w MakeCode.

## Wgrywanie

**python.microbit.org (najprościej):**

1. Otwórz <https://python.microbit.org>.
2. **Open…** → wybierz `borsuk.py` → *Add file borsuk.py*.
3. W `main.py` napisz program (albo wklej przykład) i kliknij **Send to micro:bit**.
   Edytor wgra oba pliki.

**Z komputera (Thonny / microfs):**

```bash
pip install microfs
ufs put python/borsuk.py
ufs put examples/micropython/03_remote_robot.py main.py
```

## Stałe

```python
A, B                              # silniki
S0, S1, S2                        # serwa
FORWARD, BACKWARD, LEFT, RIGHT    # kierunki jazdy
DC, SERVO360                      # rodzaj napędu (v2 / v1)
UP, DOWN, KEY_LEFT, KEY_RIGHT, SELECT, MODE, STICK   # przyciski pilota
```

## `Robot(drive_mode=DC)`

```python
from borsuk import *
robot = Robot()            # v2 – silniki DC
robot = Robot(SERVO360)    # v1 – serwa 360°
```

| Metoda | Opis |
|---|---|
| `drive(move, speed)` | jazda w kierunku `FORWARD/BACKWARD/LEFT/RIGHT`, prędkość 0–100 |
| `drive_for(move, speed, ms)` | jazda przez czas, potem stop |
| `stop()` | zatrzymanie |
| `tank(left, right)` | każde koło osobno, -100…100 |
| `steer(x, y)` | jak joystick: y = przód/tył, x = skręt |
| `motor_run(motor, direction, speed)` | pojedynczy silnik DC, `direction` = `FORWARD`/`BACKWARD` |
| `motor_stop(motor)` | |
| `servo_angle(servo, angle)` | zwykłe serwo 0–180° |
| `servo_spin(servo, speed)` | serwo 360°, -100…100 |
| `servo_stop(servo)` | wyłącza sygnał serwa |
| `set_distance_sensor(trig, echo)` | piny czujnika, np. `pin1, pin2` (domyślnie) |
| `distance()` | odległość w cm, 0 = brak odczytu |
| `obstacle_closer_than(cm)` | `True`/`False` |
| `start_remote(group=1)` | włącza radio w robocie |
| `remote_update(auto_drive=True)` | **wywołuj w pętli** – odbiera ramki, jedzie joystickiem, failsafe 0,5 s; zwraca maskę nowo wciśniętych przycisków |
| `remote_connected()` | czy pilot nadaje |
| `remote_key_pressed(key)` | czy przycisk pilota jest trzymany |
| `remote_x`, `remote_y` | ostatnie wychylenie joysticka pilota |

Ustawienia (atrybuty):

```python
robot.motor_reversed[A] = True   # odwróć kierunek silnika A
robot.sides_swapped = True       # zamień lewe i prawe koło
robot.servo_trim[S0] = 20        # kalibracja zatrzymania serwa 360° (µs)
robot.servo_min_us, robot.servo_max_us = 600, 2400   # zakres zwykłych serw
```

Sprawdzanie przycisku z maski:

```python
wcisniete = robot.remote_update()
if wcisniete & (1 << UP):
    ...
```

## `Pilot()`

```python
from borsuk import Pilot, UP
pilot = Pilot()        # wyłącza wyświetlacz LED, kalibruje środek joysticka
```

| Metoda | Opis |
|---|---|
| `is_pressed(key)` | czy przycisk jest wciśnięty |
| `was_pressed(key)` | `True` tylko raz po wciśnięciu |
| `keys()` | maska wszystkich przycisków |
| `x()`, `y()` | wychylenie -100…100 |
| `direction()` | `''`, `'up'`, `'down'`, `'left'`, `'right'`, `'up-left'`, … (nazwy po angielsku) |
| `calibrate()` | zapamiętaj obecne położenie jako środek |
| `start_sending(group=1)` | włącza radio |
| `send()` | wysyła jedną ramkę – wywołuj co ~50 ms |

## Przykłady

| Plik | Na który micro:bit |
|---|---|
| [01_first_drive.py](../../examples/micropython/01_first_drive.py) | robot |
| [02_remote.py](../../examples/micropython/02_remote.py) | **pilot** |
| [03_remote_robot.py](../../examples/micropython/03_remote_robot.py) | robot |
| [04_obstacle_avoidance.py](../../examples/micropython/04_obstacle_avoidance.py) | robot |
| [05_remote_test.py](../../examples/micropython/05_remote_test.py) | pilot |
| [06_calibration.py](../../examples/micropython/06_calibration.py) | robot |
| [07_find_sensor_pins.py](../../examples/micropython/07_find_sensor_pins.py) | robot |

## Uwagi

- **MakeCode i MicroPython nie dogadają się przez radio** – pilot i robot muszą mieć
  programy z tego samego środowiska (oba MakeCode albo oba MicroPython).
- Na **micro:bit V1** pamięci jest mało. Jeśli przy imporcie pojawi się `MemoryError`,
  skróć `main.py` albo użyj V2.
- Testy biblioteki na komputerze: `cd python && python3 -m unittest discover -s tests -v`.
