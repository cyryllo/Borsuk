# borsuk.py - Borsuk (Badger) robot library for MicroPython (micro:bit V1/V2)
# https://github.com/cyryllo/Borsuk  (MIT license)
#
# Robot:  Waveshare Motor Driver for micro:bit
#         motor A: P8 (PWM), P13, P12   motor B: P16 (PWM), P14, P15
#         servos S0=P0, S1=P1, S2=P2
# Remote: Keyestudio KS0296 - up=P10 left=P11 right=P9 down=P8 select=P7 mode=P6
#         joystick X=P4 Y=P3 press=P5, buzzer=P0
#
# Function names match the MakeCode extension (Python view).

from microbit import pin0, pin1, pin2, pin3, pin4, pin5, pin6, pin7, pin8, \
    pin9, pin10, pin11, pin12, pin13, pin14, pin15, pin16, display, sleep, \
    running_time

# --- constants
A, B = 0, 1                     # motors
S0, S1, S2 = 0, 1, 2            # servos
FORWARD, BACKWARD, LEFT, RIGHT = 0, 1, 2, 3
DC, SERVO360 = 0, 1             # drive type (v2 / v1)

# remote buttons (number = bit in the radio frame, same as MakeCode)
UP, DOWN, KEY_LEFT, KEY_RIGHT, SELECT, MODE, STICK = 0, 1, 2, 3, 4, 5, 6

_MAGIC, _VERSION = 0x42, 0x01
_TIMEOUT_MS = 500


def _clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


class Robot:
    def __init__(self, drive_mode=DC):
        self.drive_mode = drive_mode
        self.motor_reversed = [False, False]
        self.sides_swapped = False
        self.servo_trim = [0, 0, 0]           # us, 360 servo calibration
        self.servo_min_us, self.servo_max_us = 500, 2500
        self.spin_range_us = 500
        self._pwm = (pin8, pin16)
        self._in1 = (pin13, pin14)
        self._in2 = (pin12, pin15)
        self._servo = (pin0, pin1, pin2)
        self._servo_pwm = [False, False, False]
        self._trig, self._echo = pin1, pin2
        # remote state
        self.remote_x = self.remote_y = self.remote_keys = 0
        self._last_packet = None

    # ----------------------------------------------------------- DC motors
    def _set_motor(self, motor, speed):
        speed = int(_clamp(speed, -100, 100))
        if self.motor_reversed[motor]:
            speed = -speed
        self._in1[motor].write_digital(1 if speed >= 0 else 0)
        self._in2[motor].write_digital(0 if speed >= 0 else 1)
        self._pwm[motor].write_analog(abs(speed) * 1023 // 100)

    def motor_run(self, motor, direction, speed):
        speed = _clamp(speed, 0, 100)
        self._set_motor(motor, speed if direction == FORWARD else -speed)

    def motor_stop(self, motor):
        self._pwm[motor].write_analog(0)
        self._in1[motor].write_digital(0)
        self._in2[motor].write_digital(0)

    # -------------------------------------------------------------- servos
    def _servo_pulse(self, servo, us):
        # servo pulse: 20 ms period, duty 0..1023
        pin = self._servo[servo]
        pin.write_analog(int(us * 1023 / 20000))
        if not self._servo_pwm[servo]:
            pin.set_analog_period(20)
            self._servo_pwm[servo] = True

    def servo_angle(self, servo, angle):
        angle = _clamp(angle, 0, 180)
        us = self.servo_min_us + angle * (self.servo_max_us - self.servo_min_us) // 180
        self._servo_pulse(servo, us)

    def servo_spin(self, servo, speed):
        speed = _clamp(speed, -100, 100)
        self._servo_pulse(servo,
                          1500 + self.servo_trim[servo] + speed * self.spin_range_us // 100)

    def servo_stop(self, servo):
        self._servo[servo].write_digital(0)
        self._servo_pwm[servo] = False

    # --------------------------------------------------------------- drive
    def _wheel(self, side, speed):
        if self.sides_swapped:
            side = 1 - side
        if self.drive_mode == DC:
            if speed == 0:
                self.motor_stop(side)
            else:
                self._set_motor(side, speed)
        else:
            # wheel servos are mounted mirrored: S0 = left, S1 = right
            if speed == 0:
                self.servo_stop(side)
            else:
                self.servo_spin(side, speed if side == 0 else -speed)

    def tank(self, left, right):
        self._wheel(0, _clamp(left, -100, 100))
        self._wheel(1, _clamp(right, -100, 100))

    def drive(self, move, speed):
        speed = _clamp(speed, 0, 100)
        if move == FORWARD:
            self.tank(speed, speed)
        elif move == BACKWARD:
            self.tank(-speed, -speed)
        elif move == LEFT:
            self.tank(-speed, speed)
        else:
            self.tank(speed, -speed)

    def drive_for(self, move, speed, ms):
        self.drive(move, speed)
        sleep(ms)
        self.stop()

    def stop(self):
        self._wheel(0, 0)
        self._wheel(1, 0)

    def steer(self, x, y):
        x, y = _clamp(x, -100, 100), _clamp(y, -100, 100)
        left, right = y + x, y - x
        m = max(abs(left), abs(right))
        if m > 100:
            left, right = left * 100 // m, right * 100 // m
        self.tank(left, right)

    # ----------------------------------------------------- distance sensor
    def set_distance_sensor(self, trig, echo):
        self._trig, self._echo = trig, echo

    def distance(self):
        """Distance in cm, 0 = no reading."""
        from machine import time_pulse_us
        from utime import sleep_us
        self._trig.write_digital(0)
        sleep_us(2)
        self._trig.write_digital(1)
        sleep_us(10)
        self._trig.write_digital(0)
        self._echo.read_digital()       # switch the pin to input mode
        us = time_pulse_us(self._echo, 1, 25000)
        return us // 58 if us > 0 else 0

    def obstacle_closer_than(self, cm):
        d = self.distance()
        return 0 < d < cm

    # ------------------------------------------------------ radio remote
    def start_remote(self, group=1):
        import radio
        radio.config(group=group, length=32)
        radio.on()

    def remote_update(self, auto_drive=True):
        """Call often in a loop. Returns a mask of newly pressed buttons."""
        import radio
        pressed = 0
        msg = radio.receive_bytes()
        while msg:
            if len(msg) >= 5 and msg[0] == _MAGIC and msg[1] == _VERSION:
                self.remote_x = msg[2] - 256 if msg[2] > 127 else msg[2]
                self.remote_y = msg[3] - 256 if msg[3] > 127 else msg[3]
                pressed |= msg[4] & ~self.remote_keys
                self.remote_keys = msg[4]
                self._last_packet = running_time()
            msg = radio.receive_bytes()
        if self._last_packet is not None:
            if running_time() - self._last_packet > _TIMEOUT_MS:
                self._last_packet = None
                self.remote_x = self.remote_y = self.remote_keys = 0
                if auto_drive:
                    self.stop()
            elif auto_drive:
                self.steer(self.remote_x, self.remote_y)
        return pressed

    def remote_connected(self):
        return self._last_packet is not None

    def remote_key_pressed(self, key):
        return bool(self.remote_keys & (1 << key))


class Pilot:
    # order matches UP, DOWN, KEY_LEFT, KEY_RIGHT, SELECT, MODE, STICK
    KEY_PINS = (pin10, pin8, pin11, pin9, pin7, pin6, pin5)
    DEADZONE = 8
    DIR_THRESHOLD = 40

    def __init__(self):
        # P3, P4, P6, P7, P9, P10 are shared with the LED display
        display.off()
        for p in self.KEY_PINS:
            p.set_pull(p.PULL_UP)
        self._last_keys = 0
        self.calibrate()

    def calibrate(self):
        sx = sy = 0
        for _ in range(8):
            sx += pin4.read_analog()
            sy += pin3.read_analog()
            sleep(5)
        self.center_x, self.center_y = sx // 8, sy // 8

    def is_pressed(self, key):
        return self.KEY_PINS[key].read_digital() == 0

    def keys(self):
        k = 0
        for i, p in enumerate(self.KEY_PINS):
            if p.read_digital() == 0:
                k |= 1 << i
        return k

    def was_pressed(self, key):
        """True only once per press (like button_a.was_pressed)."""
        k = self.keys()
        new = k & ~self._last_keys
        self._last_keys = k
        return bool(new & (1 << key))

    def _scale(self, raw, center):
        if raw >= center:
            v = (raw - center) * 100 // max(1, 1023 - center)
        else:
            v = -((center - raw) * 100 // max(1, center))
        v = _clamp(v, -100, 100)
        return 0 if abs(v) < self.DEADZONE else v

    def x(self):
        return self._scale(pin4.read_analog(), self.center_x)

    def y(self):
        return self._scale(pin3.read_analog(), self.center_y)

    def direction(self):
        """Returns '', 'up', 'down', 'left', 'right', 'up-left', ..."""
        x, y, t = self.x(), self.y(), self.DIR_THRESHOLD
        v = 'up' if y >= t else 'down' if y <= -t else ''
        h = 'left' if x <= -t else 'right' if x >= t else ''
        return v + '-' + h if v and h else v or h

    def start_sending(self, group=1):
        import radio
        radio.config(group=group, length=32, power=7)
        radio.on()

    def send(self):
        """Send one control frame. Call about every 50 ms."""
        import radio
        radio.send_bytes(bytes([_MAGIC, _VERSION, self.x() & 0xFF,
                                self.y() & 0xFF, self.keys() & 0x7F]))
