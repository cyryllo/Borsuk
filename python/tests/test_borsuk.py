"""Testy biblioteki borsuk.py na komputerze (atrapy w katalogu fake/).

Uruchom z katalogu python/:   python3 -m unittest discover -s tests -v
"""
import os
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [os.path.join(HERE, "fake"), os.path.dirname(HERE)]

import microbit  # noqa: E402  (atrapa)
import radio  # noqa: E402
import machine  # noqa: E402
import borsuk  # noqa: E402
from borsuk import Robot, Pilot  # noqa: E402

P = microbit


def motor_state(m):
    pwm, in1, in2 = [(P.pin8, P.pin13, P.pin12), (P.pin16, P.pin14, P.pin15)][m]
    return in1.digital, in2.digital, pwm.analog


def us(pin):
    return round(pin.analog * 20000 / 1023)


class TestRobotDC(unittest.TestCase):
    def setUp(self):
        for n in range(21):
            getattr(P, "pin%d" % n).reset()
        self.r = Robot()

    def test_forward_full(self):
        self.r.drive(borsuk.FORWARD, 100)
        self.assertEqual(motor_state(0), (1, 0, 1023))
        self.assertEqual(motor_state(1), (1, 0, 1023))

    def test_backward_half(self):
        self.r.drive(borsuk.BACKWARD, 50)
        self.assertEqual(motor_state(0), (0, 1, 511))

    def test_turn_left(self):
        self.r.drive(borsuk.LEFT, 40)
        self.assertEqual(motor_state(0)[:2], (0, 1))   # lewe do tyłu
        self.assertEqual(motor_state(1)[:2], (1, 0))   # prawe do przodu

    def test_speed_zero_and_clamp(self):
        # stary kod: prędkość 0 -> write_analog(-1) -> błąd
        self.r.motor_run(borsuk.A, borsuk.FORWARD, 0)
        self.r.motor_run(borsuk.A, borsuk.FORWARD, 500)
        self.assertEqual(motor_state(0)[2], 1023)

    def test_stop(self):
        self.r.drive(borsuk.FORWARD, 80)
        self.r.stop()
        self.assertEqual(motor_state(0), (0, 0, 0))
        self.assertEqual(motor_state(1), (0, 0, 0))

    def test_reverse_and_swap(self):
        self.r.motor_reversed[borsuk.B] = True
        self.r.tank(0, 50)
        self.assertEqual(motor_state(1)[:2], (0, 1))
        self.r.sides_swapped = True
        self.r.tank(70, 0)
        self.assertEqual(motor_state(1)[:2], (0, 1))   # lewe -> silnik B (odwrócony)

    def test_steer_normalizes(self):
        self.r.steer(100, 100)
        self.assertEqual(motor_state(0)[2], 1023)
        self.assertEqual(motor_state(1), (0, 0, 0))     # prawe stoi


class TestRobotServo(unittest.TestCase):
    def setUp(self):
        for n in range(21):
            getattr(P, "pin%d" % n).reset()
        self.r = Robot(borsuk.SERVO360)

    def test_mirrored_wheels(self):
        self.r.drive(borsuk.FORWARD, 100)
        self.assertAlmostEqual(us(P.pin0), 2000, delta=20)
        self.assertAlmostEqual(us(P.pin1), 1000, delta=20)
        self.assertEqual(P.pin0.period, 20)

    def test_stop_releases_servo(self):
        self.r.drive(borsuk.FORWARD, 50)
        self.r.stop()
        self.assertEqual(P.pin0.digital, 0)
        self.assertEqual(P.pin1.digital, 0)

    def test_trim(self):
        self.r.servo_trim[0] = 40
        self.r.servo_spin(borsuk.S0, 0)
        self.assertAlmostEqual(us(P.pin0), 1540, delta=20)

    def test_angle_range(self):
        self.r.servo_angle(borsuk.S2, 0)
        self.assertAlmostEqual(us(P.pin2), 500, delta=20)
        self.r.servo_angle(borsuk.S2, 180)
        self.assertAlmostEqual(us(P.pin2), 2500, delta=20)
        self.r.servo_angle(borsuk.S2, 999)
        self.assertAlmostEqual(us(P.pin2), 2500, delta=20)


class TestDistance(unittest.TestCase):
    def test_distance(self):
        r = Robot()
        machine.echo_us[0] = 580
        self.assertEqual(r.distance(), 10)
        self.assertTrue(r.obstacle_closer_than(20))
        machine.echo_us[0] = -1          # brak echa
        self.assertEqual(r.distance(), 0)
        self.assertFalse(r.obstacle_closer_than(20))


class TestPilotAndRadio(unittest.TestCase):
    def setUp(self):
        for n in range(21):
            getattr(P, "pin%d" % n).reset()
        radio.inbox.clear()
        radio.sent.clear()

    def test_pilot_init(self):
        p = Pilot()
        self.assertFalse(microbit.display.on_)
        self.assertEqual(P.pin6.pull, P.pin6.PULL_UP)   # mode (stary kod JS: P0)
        self.assertEqual((p.x(), p.y()), (0, 0))

    def test_axes_and_direction(self):
        p = Pilot()
        P.pin4.input_analog = 1023
        P.pin3.input_analog = 0
        self.assertEqual((p.x(), p.y()), (100, -100))
        self.assertEqual(p.direction(), "dol-prawo")
        P.pin4.input_analog = 530           # w martwej strefie
        self.assertEqual(p.x(), 0)

    def test_keys(self):
        p = Pilot()
        P.pin6.input_digital = 0            # mode
        self.assertTrue(p.is_pressed(borsuk.MODE))
        self.assertTrue(p.was_pressed(borsuk.MODE))
        self.assertFalse(p.was_pressed(borsuk.MODE))  # tylko raz

    def test_round_trip(self):
        p = Pilot()
        P.pin4.input_analog = 0             # x = -100
        P.pin3.input_analog = 1023          # y = 100
        P.pin10.input_digital = 0           # góra
        p.send()
        r = Robot()
        radio.inbox.append(radio.sent[-1])
        pressed = r.remote_update()
        self.assertEqual((r.remote_x, r.remote_y), (-100, 100))
        self.assertTrue(pressed & (1 << borsuk.UP))
        self.assertTrue(r.remote_connected())
        # skręt w lewo przy jeździe do przodu: prawe koło szybciej
        self.assertEqual(motor_state(0), (0, 0, 0))
        self.assertEqual(motor_state(1)[2], 1023)

    def test_failsafe(self):
        r = Robot()
        radio.inbox.append(bytes([0x42, 1, 0, 100, 0]))
        r.remote_update()
        self.assertEqual(motor_state(0)[2], 1023)
        microbit.sleep(600)
        r.remote_update()
        self.assertFalse(r.remote_connected())
        self.assertEqual(motor_state(0), (0, 0, 0))

    def test_ignores_foreign_packets(self):
        r = Robot()
        radio.inbox.append(b"hello")
        r.remote_update()
        self.assertFalse(r.remote_connected())


if __name__ == "__main__":
    unittest.main()
