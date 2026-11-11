# Jazda autonomiczna z omijaniem przeszkód. Wgraj razem z plikiem borsuk.py.
# A = start, B = stop. Ustaw piny swojego czujnika odległości.
from microbit import button_a, button_b, display, Image, sleep, pin1, pin2
from borsuk import Robot, FORWARD, BACKWARD, LEFT, RIGHT
import random

robot = Robot()
robot.set_distance_sensor(trig=pin1, echo=pin2)
jedzie = False

while True:
    if button_a.was_pressed():
        jedzie = True
    if button_b.was_pressed():
        jedzie = False
        robot.stop()
    if jedzie:
        if robot.obstacle_closer_than(20):
            display.show(Image.SURPRISED)
            robot.drive_for(BACKWARD, 50, 400)
            robot.drive_for(random.choice((LEFT, RIGHT)), 50, 400)
        else:
            display.show(Image.HAPPY)
            robot.drive(FORWARD, 50)
    sleep(50)
