# Pierwsza jazda. Wgraj razem z plikiem borsuk.py.
# A = przejazd tam i z powrotem, B = stop.
from microbit import button_a, button_b, display, Image, sleep
from borsuk import Robot, FORWARD, RIGHT

robot = Robot()            # robot v1 na serwach: Robot(SERVO360)
display.show(Image.HAPPY)

while True:
    if button_a.was_pressed():
        robot.drive_for(FORWARD, 60, 1500)
        robot.drive_for(RIGHT, 50, 700)     # dobierz czas, by obrót miał ~180 stopni
        robot.drive_for(FORWARD, 60, 1500)
    if button_b.was_pressed():
        robot.stop()
    sleep(20)
