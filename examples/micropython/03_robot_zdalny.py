# PROGRAM NA micro:bit W ROBOCIE. Wgraj razem z plikiem borsuk.py.
# Robot jedzie zgodnie z joystickiem; przyciski góra/dół ruszają serwem S2.
# Brak sygnału przez 0,5 s = robot staje.
from microbit import display, Image, sleep
from borsuk import Robot, S2, UP, DOWN, MODE
import music

GRUPA = 1
robot = Robot()
robot.start_remote(GRUPA)

while True:
    wcisniete = robot.remote_update()          # jazda joystickiem dzieje się tu
    if wcisniete & (1 << UP):
        robot.servo_angle(S2, 180)
    if wcisniete & (1 << DOWN):
        robot.servo_angle(S2, 0)
    if wcisniete & (1 << MODE):
        music.play(music.BA_DING, wait=False)
    display.show(Image.HAPPY if robot.remote_connected() else Image.ASLEEP)
    sleep(20)
