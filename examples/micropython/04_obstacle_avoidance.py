# Autonomous driving with obstacle avoidance. Flash together with borsuk.py.
# A = start, B = stop. Set the pins of your distance sensor.
from microbit import button_a, button_b, display, Image, sleep, pin1, pin2
from borsuk import Robot, FORWARD, BACKWARD, LEFT, RIGHT
import random

robot = Robot()
robot.set_distance_sensor(trig=pin1, echo=pin2)
driving = False

while True:
    if button_a.was_pressed():
        driving = True
    if button_b.was_pressed():
        driving = False
        robot.stop()
    if driving:
        if robot.obstacle_closer_than(20):
            display.show(Image.SURPRISED)
            robot.drive_for(BACKWARD, 50, 400)
            robot.drive_for(random.choice((LEFT, RIGHT)), 50, 400)
        else:
            display.show(Image.HAPPY)
            robot.drive(FORWARD, 50)
    sleep(50)
