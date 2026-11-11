# Test pilota bez robota: wypisuje odczyty w konsoli (Serial/REPL).
# Wgraj razem z plikiem borsuk.py.
from microbit import sleep
from borsuk import Pilot, UP, DOWN, KEY_LEFT, KEY_RIGHT, SELECT, MODE, STICK
import music

NAZWY = {UP: 'gora', DOWN: 'dol', KEY_LEFT: 'lewo', KEY_RIGHT: 'prawo',
         SELECT: 'select', MODE: 'mode', STICK: 'joystick'}
pilot = Pilot()

while True:
    for klawisz, nazwa in NAZWY.items():
        if pilot.is_pressed(klawisz):
            print('przycisk:', nazwa)
            music.pitch(440, 50)               # buzzer pilota na P0
    print('x =', pilot.x(), ' y =', pilot.y(), ' kierunek:', pilot.direction())
    sleep(200)
