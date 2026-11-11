**English** | [Polski](pl/migracja.md)

# Migrating from the old repositories

## MakeCode

1. Remove the old extension (*pxt-Borsuk* / *JoyStick_Borsuk*) from your project:
   **Explorer** (below the simulator) → *Extensions* → trash icon.
2. Add the new one: `https://github.com/cyryllo/Borsuk`.
3. Replace the blocks using the table (speeds are now in %).

| Old (pxt-Borsuk) | New |
|---|---|
| `Borsuk.MotorRun(Motor.A, Dir.forward, 16)` | `borsuk.motorRun(BorsukMotor.A, BorsukDir.Forward, 100)` (0–16 → 0–100 %) |
| `Borsuk.MotorStop(Motor.A)` | `borsuk.motorStop(BorsukMotor.A)` |
| `Borsuk.ServoTurnAngle(Servo.S0, 90)` | `borsuk.servoAngle(BorsukServo.S0, 90)` |
| `Borsuk.ServoStop(Servo.S0)` | `borsuk.servoStop(BorsukServo.S0)` |
| `Borsuk.ServoMotorForward(Servo.S0, 5)` | `borsuk.servoSpin(BorsukServo.S0, 50)` (1–10 → 10–100) |
| `Borsuk.ServoMotorBackward(Servo.S0, 5)` | `borsuk.servoSpin(BorsukServo.S0, -50)` |
| Forward on S0 and S1 together (driving robot v1) | `borsuk.setDriveMode(BorsukDrive.Servos360)` + `borsuk.drive(BorsukMove.Forward, 50)` |

| Old (JoyStick) | New |
|---|---|
| `WSJoyStick.JoyStickInit()` | not needed (`pilot.init()` runs automatically) |
| `WSJoyStick.Listen_Key(KEY.A)` | `pilot.isPressed(PilotKey.Up)` |
| `WSJoyStick.onKey(KEY.A, …)` | `pilot.onKey(PilotKey.Up, …)` |
| `WSJoyStick.Listen_Dir(DIR.U)` | `pilot.isDirection(PilotDir.Up)` |
| `WSJoyStick.PlayMusic(f, ms)` | the regular `music.playTone(f, ms)` block (buzzer on P0) |

Buttons: `A`→`Up`, `B`→`Left`, `C`→`Right`, `D`→`Down`, `E`→`Select`,
`F`→`Mode`, `P`→`Stick` (joystick press).

## MicroPython

Instead of `borsuk.py` + `joystick.py` there is a single new [`python/borsuk.py`](../python/borsuk.py).

| Old | New |
|---|---|
| `Borsuk = MotorDriver()` | `robot = Robot()` |
| `Borsuk.MotorRun(0, 'f', 16)` | `robot.motor_run(A, FORWARD, 100)` |
| `Borsuk.MotorRun(1, 'b', 8)` | `robot.motor_run(B, BACKWARD, 50)` |
| `Borsuk.MotorStop(0)` | `robot.motor_stop(A)` |
| `Borsuk.ServoTurn(0, 50)` | `robot.servo_angle(S0, 50)` |
| `Borsuk.ServosTurnZero(0)` / `ServosTurnFull(0)` | `robot.servo_angle(S0, 0)` / `robot.servo_angle(S0, 180)` |
| `Borsuk.ServosStop(2)` | `robot.servo_stop(S2)` |
| `JoyStick.Up.read_digital() == 0` | `remote.is_pressed(UP)` (`remote = Pilot()`) |
| `JoyStick.JX.read_analog() < 400` | `remote.x() < -30` or `remote.direction() == 'left'` |

## Grove_rpipico

The [Grove_rpipico](https://github.com/cyryllo/Grove_rpipico) repository is for the
**Raspberry Pi Pico** (a different microcontroller), so it is not part of the micro:bit library.
The distance sensor – the only module the robot needs – is supported directly by the Borsuk
library (including the Grove Ultrasonic Ranger).
