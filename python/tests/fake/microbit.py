"""Fake microbit module for running tests on a computer."""
_time = [0]


class _Pin:
    PULL_UP, PULL_DOWN, NO_PULL = 0, 1, 2

    def __init__(self, n):
        self.n = n
        self.reset()

    def reset(self):
        self.digital = None
        self.analog = None
        self.period = None
        self.pull = None
        self.input_digital = 1
        self.input_analog = 512

    def write_digital(self, v):
        self.digital, self.analog = v, None

    def write_analog(self, v):
        assert isinstance(v, int) and 0 <= v <= 1023, v
        self.analog = v

    def set_analog_period(self, ms):
        self.period = ms

    def set_pull(self, v):
        self.pull = v

    def read_digital(self):
        return self.input_digital

    def read_analog(self):
        return self.input_analog


for _n in range(21):
    globals()["pin%d" % _n] = _Pin(_n)


class _Display:
    on_ = True

    def off(self):
        self.on_ = False


display = _Display()


def sleep(ms):
    _time[0] += ms


def running_time():
    return _time[0]
