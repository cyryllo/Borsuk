# PROGRAM FOR THE micro:bit IN THE REMOTE. Flash together with borsuk.py.
# Sends the joystick and buttons to the robot 20 times per second.
from microbit import sleep
from borsuk import Pilot

GROUP = 1                  # must match the robot!
remote = Pilot()           # turns the LED display off (it shares pins with the joystick)
remote.start_sending(GROUP)

while True:
    remote.send()
    sleep(50)
