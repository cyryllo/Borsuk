# First drive. Flash together with borsuk.py.
# A = there and back, B = stop.
from microbit import button_a, button_b, display, Image, sleep
from borsuk import Robot, FORWARD, RIGHT

robot = Robot()            # robot v1 on servos: Robot(SERVO360)
display.show(Image.HAPPY)

while True:
    if button_a.was_pressed():
        robot.drive_for(FORWARD, 60, 1500)
        robot.drive_for(RIGHT, 50, 700)     # adjust the time for a ~180 degree turn
        robot.drive_for(FORWARD, 60, 1500)
    if button_b.was_pressed():
        robot.stop()
    sleep(20)
