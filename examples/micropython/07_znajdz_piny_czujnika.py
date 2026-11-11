# Wykrywacz pinów czujnika odległości. Wgraj razem z plikiem borsuk.py.
# Sprawdza pary TRIG/ECHO na złączach S0/S1/S2 (pin0, pin1, pin2).
# Postaw przeszkodę 10-50 cm przed czujnikiem i wciśnij A.
# Wynik np. "T0 E1 23" = TRIG na P0, ECHO na P1, odległość 23 cm.
from microbit import button_a, display, Image, sleep, pin0, pin1, pin2
from borsuk import Robot

robot = Robot()
PINY = (pin0, pin1, pin2)
display.scroll('A', wait=False)

while True:
    if button_a.was_pressed():
        znaleziono = False
        for t in range(3):
            for e in range(3):
                if t == e:
                    continue
                robot.set_distance_sensor(PINY[t], PINY[e])
                d = 0
                for _ in range(3):
                    d = max(d, robot.distance())
                    sleep(60)
                if d > 0:
                    znaleziono = True
                    wynik = 'T%d E%d %d' % (t, e, d)
                    print(wynik)
                    display.scroll(wynik)
        if not znaleziono:
            display.show(Image.NO)
    sleep(20)
