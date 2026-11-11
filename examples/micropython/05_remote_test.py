# Remote test without a robot: prints readings to the console (Serial/REPL).
# Flash together with borsuk.py.
from microbit import sleep
from borsuk import Pilot, UP, DOWN, KEY_LEFT, KEY_RIGHT, SELECT, MODE, STICK
import music

NAMES = {UP: 'up', DOWN: 'down', KEY_LEFT: 'left', KEY_RIGHT: 'right',
         SELECT: 'select', MODE: 'mode', STICK: 'joystick'}
remote = Pilot()

while True:
    for key, name in NAMES.items():
        if remote.is_pressed(key):
            print('button:', name)
            music.pitch(440, 50)               # remote buzzer on P0
    print('x =', remote.x(), ' y =', remote.y(), ' direction:', remote.direction())
    sleep(200)
