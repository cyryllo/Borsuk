# Kalibracja robota. Wgraj razem z plikiem borsuk.py.
# A = do przodu (ma jechać prosto), B = obrót w lewo (ma kręcić w lewo),
# A+B = serwa 360 bardzo wolno (oba mają kręcić się tak samo).
from microbit import button_a, button_b, sleep
from borsuk import Robot, DC, SERVO360, A, B, S0, S1, FORWARD, LEFT

robot = Robot(DC)                     # lub Robot(SERVO360)
robot.motor_reversed[A] = False       # True, gdy lewe koło kręci się do tyłu
robot.motor_reversed[B] = False       # True, gdy prawe koło kręci się do tyłu
robot.sides_swapped = False           # True, gdy robot skręca w złą stronę
robot.servo_trim[S0] = 0              # serwa 360: przesunięcie zatrzymania w us
robot.servo_trim[S1] = 0

while True:
    if button_a.is_pressed() and button_b.is_pressed():
        robot.servo_spin(S0, 5)
        robot.servo_spin(S1, 5)
        sleep(2000)
        robot.stop()
    elif button_a.was_pressed():
        robot.drive_for(FORWARD, 50, 1000)
    elif button_b.was_pressed():
        robot.drive_for(LEFT, 50, 1000)
    sleep(20)
