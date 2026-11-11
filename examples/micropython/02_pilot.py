# PROGRAM NA micro:bit W PILOCIE. Wgraj razem z plikiem borsuk.py.
# Wysyła joystick i przyciski do robota 20 razy na sekundę.
from microbit import sleep
from borsuk import Pilot

GRUPA = 1                  # taka sama jak w robocie!
pilot = Pilot()            # wyłącza wyświetlacz LED (dzieli piny z joystickiem)
pilot.start_sending(GRUPA)

while True:
    pilot.send()
    sleep(50)
