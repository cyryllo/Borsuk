# PROGRAM FOR THE micro:bit IN THE ROBOT. Flash together with borsuk.py.
# The robot drives by the joystick; up/down buttons move servo S2.
# No signal for 0.5 s = the robot stops.
from microbit import display, Image, sleep
from borsuk import Robot, S2, UP, DOWN, MODE
import music

GROUP = 1
robot = Robot()
robot.start_remote(GROUP)

while True:
    pressed = robot.remote_update()          # joystick driving happens here
    if pressed & (1 << UP):
        robot.servo_angle(S2, 180)
    if pressed & (1 << DOWN):
        robot.servo_angle(S2, 0)
    if pressed & (1 << MODE):
        music.play(music.BA_DING, wait=False)
    display.show(Image.HAPPY if robot.remote_connected() else Image.ASLEEP)
    sleep(20)
