# Przejście ze starych repozytoriów

## MakeCode

1. W projekcie usuń stare rozszerzenie (*pxt-Borsuk* / *JoyStick_Borsuk*):
   **Eksplorator** (pod symulatorem) → *Rozszerzenia* → kosz.
2. Dodaj nowe: `https://github.com/cyryllo/BorsukPY`.
3. Zamień bloki według tabeli (prędkości są teraz w %).

| Stare (pxt-Borsuk) | Nowe |
|---|---|
| `Borsuk.MotorRun(Motor.A, Dir.forward, 16)` | `borsuk.motorRun(BorsukMotor.A, BorsukDir.Forward, 100)` (0–16 → 0–100 %) |
| `Borsuk.MotorStop(Motor.A)` | `borsuk.motorStop(BorsukMotor.A)` |
| `Borsuk.ServoTurnAngle(Servo.S0, 90)` | `borsuk.servoAngle(BorsukServo.S0, 90)` |
| `Borsuk.ServoStop(Servo.S0)` | `borsuk.servoStop(BorsukServo.S0)` |
| `Borsuk.ServoMotorForward(Servo.S0, 5)` | `borsuk.servoSpin(BorsukServo.S0, 50)` (1–10 → 10–100) |
| `Borsuk.ServoMotorBackward(Servo.S0, 5)` | `borsuk.servoSpin(BorsukServo.S0, -50)` |
| Forward na S0 i S1 naraz (jazda robota v1) | `borsuk.setDriveMode(BorsukDrive.Servos360)` + `borsuk.drive(BorsukMove.Forward, 50)` |

| Stare (JoyStick) | Nowe |
|---|---|
| `WSJoyStick.JoyStickInit()` | niepotrzebne (`pilot.init()` wywołuje się samo) |
| `WSJoyStick.Listen_Key(KEY.A)` | `pilot.isPressed(PilotKey.Up)` |
| `WSJoyStick.onKey(KEY.A, …)` | `pilot.onKey(PilotKey.Up, …)` |
| `WSJoyStick.Listen_Dir(DIR.U)` | `pilot.isDirection(PilotDir.Up)` |
| `WSJoyStick.PlayMusic(f, ms)` | zwykły blok `music.playTone(f, ms)` (buzzer na P0) |

Przyciski: `A`→`Up` (góra), `B`→`Left`, `C`→`Right`, `D`→`Down`, `E`→`Select`,
`F`→`Mode`, `P`→`Stick` (wciśnięcie joysticka).

## MicroPython

Zamiast `borsuk.py` + `joystick.py` jest jeden nowy [`python/borsuk.py`](../python/borsuk.py).

| Stare | Nowe |
|---|---|
| `Borsuk = MotorDriver()` | `robot = Robot()` |
| `Borsuk.MotorRun(0, 'f', 16)` | `robot.motor_run(A, FORWARD, 100)` |
| `Borsuk.MotorRun(1, 'b', 8)` | `robot.motor_run(B, BACKWARD, 50)` |
| `Borsuk.MotorStop(0)` | `robot.motor_stop(A)` |
| `Borsuk.ServoTurn(0, 50)` | `robot.servo_angle(S0, 50)` |
| `Borsuk.ServosTurnZero(0)` / `ServosTurnFull(0)` | `robot.servo_angle(S0, 0)` / `robot.servo_angle(S0, 180)` |
| `Borsuk.ServosStop(2)` | `robot.servo_stop(S2)` |
| `JoyStick.Up.read_digital() == 0` | `pilot.is_pressed(UP)` (`pilot = Pilot()`) |
| `JoyStick.JX.read_analog() < 400` | `pilot.x() < -30` lub `pilot.direction() == 'lewo'` |

## Grove_rpipico

Repozytorium [Grove_rpipico](https://github.com/cyryllo/Grove_rpipico) dotyczy **Raspberry Pi Pico** (inny mikrokontroler), więc nie
zostało włączone do biblioteki micro:bita. Czujnik odległości – jedyny moduł potrzebny
robotowi – jest obsługiwany bezpośrednio przez bibliotekę Borsuka (także czujnik Grove
Ultrasonic Ranger).
