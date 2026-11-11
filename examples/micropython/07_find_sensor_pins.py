# Distance sensor pin finder. Flash together with borsuk.py.
# Tries TRIG/ECHO pairs on the free motor-driver pins: P0, P1, P2, P19, P20.
# Put an obstacle 10-50 cm in front of the sensor and press A.
# Result e.g. "T0 E1 23" = TRIG on P0, ECHO on P1, distance 23 cm.
from microbit import button_a, display, Image, sleep, pin0, pin1, pin2, pin19, pin20
from borsuk import Robot

robot = Robot()
PINS = (pin0, pin1, pin2, pin19, pin20)
NAMES = (0, 1, 2, 19, 20)
display.scroll('A', wait=False)

while True:
    if button_a.was_pressed():
        found = False
        for t in range(len(PINS)):
            for e in range(len(PINS)):
                if t == e:
                    continue
                robot.set_distance_sensor(PINS[t], PINS[e])
                d = 0
                for _ in range(3):
                    d = max(d, robot.distance())
                    sleep(60)
                if d > 0:
                    found = True
                    result = 'T%d E%d %d' % (NAMES[t], NAMES[e], d)
                    print(result)
                    display.scroll(result)
        if not found:
            display.show(Image.NO)
    sleep(20)
