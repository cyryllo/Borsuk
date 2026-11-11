# Robot calibration. Flash together with borsuk.py.
# A = forward (should drive straight), B = spin left (should turn left),
# A+B = 360 servos very slowly (both should spin equally).
from microbit import button_a, button_b, sleep
from borsuk import Robot, DC, SERVO360, A, B, S0, S1, FORWARD, LEFT

robot = Robot(DC)                     # or Robot(SERVO360)
robot.motor_reversed[A] = False       # True if the left wheel spins backward
robot.motor_reversed[B] = False       # True if the right wheel spins backward
robot.sides_swapped = False           # True if the robot turns the wrong way
robot.servo_trim[S0] = 0              # 360 servos: stop-point offset in us
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
