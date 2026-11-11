// Borsuk (Badger) robot – robot control.
//
// Hardware: micro:bit + Waveshare Motor Driver for micro:bit (TB6612FNG, driven by pins).
//   Motor A: PWMA=P8,  AIN1=P13, AIN2=P12
//   Motor B: PWMB=P16, BIN1=P14, BIN2=P15
//   Servos:  S0=P0, S1=P1, S2=P2
//
// Robot v2 drives on DC motors (A = left wheel, B = right wheel),
// robot v1 on 360° servos (S0 = left wheel, S1 = right wheel, mounted mirrored).

enum BorsukMotor {
    //% block="A (left)"
    A = 0,
    //% block="B (right)"
    B = 1
}

enum BorsukServo {
    //% block="S0"
    S0 = 0,
    //% block="S1"
    S1 = 1,
    //% block="S2"
    S2 = 2
}

enum BorsukDir {
    //% block="forward"
    Forward = 0,
    //% block="backward"
    Backward = 1
}

enum BorsukMove {
    //% block="forward"
    Forward = 0,
    //% block="backward"
    Backward = 1,
    //% block="left (spin)"
    Left = 2,
    //% block="right (spin)"
    Right = 3
}

enum BorsukDrive {
    //% block="DC motors (v2)"
    DCMotors = 0,
    //% block="360° servos (v1)"
    Servos360 = 1
}

/**
 * Borsuk robot blocks
 */
//% weight=100 color=#b5651d icon="" block="Borsuk"
//% groups='["Drive", "Distance sensor", "DC motors", "Servos", "Remote control", "Settings"]'
namespace borsuk {
    const PWMA = AnalogPin.P8
    const AIN1 = DigitalPin.P13
    const AIN2 = DigitalPin.P12
    const PWMB = AnalogPin.P16
    const BIN1 = DigitalPin.P14
    const BIN2 = DigitalPin.P15

    let driveMode = BorsukDrive.DCMotors
    let motorReversed = [false, false]
    let sidesSwapped = false
    // stop-point offset of 360° servos in µs (calibration)
    let servoTrim = [0, 0, 0]
    // pulse range of standard servos (0°..180°)
    let servoMinUs = 500
    let servoMaxUs = 2500
    // ±pulse range around 1500 µs for 360° servos at 100% speed
    let spinRangeUs = 500

    let trigPin = DigitalPin.P1
    let echoPin = DigitalPin.P2

    function servoAnalogPin(s: BorsukServo): AnalogPin {
        if (s == BorsukServo.S0) return AnalogPin.P0
        if (s == BorsukServo.S1) return AnalogPin.P1
        return AnalogPin.P2
    }

    function servoDigitalPin(s: BorsukServo): DigitalPin {
        if (s == BorsukServo.S0) return DigitalPin.P0
        if (s == BorsukServo.S1) return DigitalPin.P1
        return DigitalPin.P2
    }

    /** Sets a motor to speed -100..100 (negative = backward). */
    function setMotor(motor: BorsukMotor, speed: number): void {
        speed = Math.round(Math.constrain(speed, -100, 100))
        if (motorReversed[motor]) speed = -speed
        const duty = Math.idiv(Math.abs(speed) * 1023, 100)
        const in1 = speed >= 0 ? 1 : 0
        const in2 = speed >= 0 ? 0 : 1
        if (motor == BorsukMotor.A) {
            pins.digitalWritePin(AIN1, in1)
            pins.digitalWritePin(AIN2, in2)
            pins.analogWritePin(PWMA, duty)
        } else {
            pins.digitalWritePin(BIN1, in1)
            pins.digitalWritePin(BIN2, in2)
            pins.analogWritePin(PWMB, duty)
        }
    }

    /** Sets one wheel (0 = left, 1 = right) to speed -100..100. */
    function setWheel(side: number, speed: number): void {
        if (sidesSwapped) side = 1 - side
        if (driveMode == BorsukDrive.DCMotors) {
            if (speed == 0) motorStop(side == 0 ? BorsukMotor.A : BorsukMotor.B)
            else setMotor(side == 0 ? BorsukMotor.A : BorsukMotor.B, speed)
        } else {
            // wheel servos are mounted mirrored – the right one spins the other way
            const servo = side == 0 ? BorsukServo.S0 : BorsukServo.S1
            if (speed == 0) servoStop(servo)
            else servoSpin(servo, side == 0 ? speed : -speed)
        }
    }

    // ------------------------------------------------------------------ Drive

    /**
     * Drive in a direction. The robot keeps driving until you stop it.
     * @param move direction
     * @param speed speed in percent, eg: 50
     */
    //% blockId=borsuk_drive block="drive %move|at speed %speed"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% group="Drive" weight=100
    export function drive(move: BorsukMove, speed: number): void {
        speed = Math.constrain(speed, 0, 100)
        if (move == BorsukMove.Forward) tank(speed, speed)
        else if (move == BorsukMove.Backward) tank(-speed, -speed)
        else if (move == BorsukMove.Left) tank(-speed, speed)
        else tank(speed, -speed)
    }

    /**
     * Drive for the given time, then stop.
     * @param move direction
     * @param speed speed in percent, eg: 50
     * @param ms driving time in milliseconds, eg: 1000
     */
    //% blockId=borsuk_drive_for block="drive %move|at speed %speed|for %ms ms"
    //% speed.min=0 speed.max=100 speed.defl=50 ms.defl=1000 ms.min=0
    //% group="Drive" weight=95
    export function driveFor(move: BorsukMove, speed: number, ms: number): void {
        drive(move, speed)
        basic.pause(ms)
        stop()
    }

    /**
     * Stop both wheels.
     */
    //% blockId=borsuk_stop block="stop robot"
    //% group="Drive" weight=90
    export function stop(): void {
        setWheel(0, 0)
        setWheel(1, 0)
    }

    /**
     * Set the speed of each wheel separately ("tank" drive).
     * Negative values = backward.
     * @param left left wheel speed -100..100, eg: 50
     * @param right right wheel speed -100..100, eg: 50
     */
    //% blockId=borsuk_tank block="wheels: left %left|right %right"
    //% left.shadow="speedPicker" right.shadow="speedPicker"
    //% group="Drive" weight=85
    export function tank(left: number, right: number): void {
        setWheel(0, Math.constrain(left, -100, 100))
        setWheel(1, Math.constrain(right, -100, 100))
    }

    /**
     * Steer like with a joystick: y = forward/backward, x = turn.
     * Both values -100..100.
     * @param x turn (negative = left), eg: 0
     * @param y drive (negative = backward), eg: 50
     */
    //% blockId=borsuk_steer block="steer like joystick x %x|y %y"
    //% x.shadow="speedPicker" y.shadow="speedPicker"
    //% group="Drive" weight=80
    export function steer(x: number, y: number): void {
        x = Math.constrain(x, -100, 100)
        y = Math.constrain(y, -100, 100)
        let left = y + x
        let right = y - x
        const m = Math.max(Math.abs(left), Math.abs(right))
        if (m > 100) {
            left = Math.idiv(left * 100, m)
            right = Math.idiv(right * 100, m)
        }
        tank(left, right)
    }

    // -------------------------------------------------------- Distance sensor

    /**
     * Set the pins of the ultrasonic sensor (RCW-0001, HC-SR04P, RCWL-1601).
     * For a Grove sensor (single signal pin) pick the same pin twice.
     * @param trig TRIG pin, eg: DigitalPin.P1
     * @param echo ECHO pin, eg: DigitalPin.P2
     */
    //% blockId=borsuk_sonar_pins block="distance sensor TRIG %trig|ECHO %echo"
    //% trig.defl=DigitalPin.P1 echo.defl=DigitalPin.P2
    //% group="Distance sensor" weight=60
    export function setDistanceSensor(trig: DigitalPin, echo: DigitalPin): void {
        trigPin = trig
        echoPin = echo
    }

    /**
     * Measure the distance in centimeters. Returns 0 when there is no reading
     * (no echo / obstacle farther than about 4 m).
     */
    //% blockId=borsuk_distance block="distance (cm)"
    //% group="Distance sensor" weight=55
    export function distance(): number {
        pins.setPull(trigPin, PinPullMode.PullNone)
        pins.digitalWritePin(trigPin, 0)
        control.waitMicros(2)
        pins.digitalWritePin(trigPin, 1)
        control.waitMicros(10)
        pins.digitalWritePin(trigPin, 0)
        // 25 ms ≈ 4.3 m – the sensor is not reliable beyond that anyway
        const us = pins.pulseIn(echoPin, PulseValue.High, 25000)
        return Math.idiv(us, 58)
    }

    /**
     * Is there an obstacle closer than the given distance?
     * @param cm distance in centimeters, eg: 20
     */
    //% blockId=borsuk_obstacle block="obstacle closer than %cm cm"
    //% cm.defl=20 cm.min=2 cm.max=400
    //% group="Distance sensor" weight=50
    export function obstacleCloserThan(cm: number): boolean {
        const d = distance()
        return d > 0 && d < cm
    }

    // -------------------------------------------------------------- DC motors

    /**
     * Run a single DC motor.
     * @param motor motor A or B
     * @param dir direction
     * @param speed speed in percent, eg: 50
     */
    //% blockId=borsuk_motor_run block="motor %motor|run %dir|at speed %speed"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% group="DC motors" weight=40
    export function motorRun(motor: BorsukMotor, dir: BorsukDir, speed: number): void {
        speed = Math.constrain(speed, 0, 100)
        setMotor(motor, dir == BorsukDir.Forward ? speed : -speed)
    }

    /**
     * Stop a DC motor (coast).
     */
    //% blockId=borsuk_motor_stop block="stop motor %motor"
    //% group="DC motors" weight=35
    export function motorStop(motor: BorsukMotor): void {
        if (motor == BorsukMotor.A) {
            pins.analogWritePin(PWMA, 0)
            pins.digitalWritePin(AIN1, 0)
            pins.digitalWritePin(AIN2, 0)
        } else {
            pins.analogWritePin(PWMB, 0)
            pins.digitalWritePin(BIN1, 0)
            pins.digitalWritePin(BIN2, 0)
        }
    }

    // ----------------------------------------------------------------- Servos

    /**
     * Set a standard servo (0–180°) to an angle.
     * @param servo servo connector
     * @param angle angle 0..180, eg: 90
     */
    //% blockId=borsuk_servo_angle block="servo %servo|set angle %angle"
    //% angle.shadow="protractorPicker" angle.defl=90
    //% group="Servos" weight=30
    export function servoAngle(servo: BorsukServo, angle: number): void {
        angle = Math.constrain(angle, 0, 180)
        const us = servoMinUs + Math.idiv(angle * (servoMaxUs - servoMinUs), 180)
        pins.servoSetPulse(servoAnalogPin(servo), us)
    }

    /**
     * Spin a 360° (continuous rotation) servo. Negative speed = other direction.
     * @param servo servo connector
     * @param speed speed -100..100, eg: 50
     */
    //% blockId=borsuk_servo_spin block="360° servo %servo|spin at speed %speed"
    //% speed.shadow="speedPicker"
    //% group="Servos" weight=25
    export function servoSpin(servo: BorsukServo, speed: number): void {
        speed = Math.constrain(speed, -100, 100)
        const us = 1500 + servoTrim[servo] + Math.idiv(speed * spinRangeUs, 100)
        pins.servoSetPulse(servoAnalogPin(servo), us)
    }

    /**
     * Turn off the servo signal – a standard servo stops holding its position,
     * a 360° servo stops.
     */
    //% blockId=borsuk_servo_stop block="stop servo %servo"
    //% group="Servos" weight=20
    export function servoStop(servo: BorsukServo): void {
        pins.digitalWritePin(servoDigitalPin(servo), 0)
    }

    // --------------------------------------------------------------- Settings

    /**
     * Choose what the robot drives on: DC motors (v2) or 360° servos (v1).
     * Default: DC motors.
     */
    //% blockId=borsuk_set_drive block="robot drive: %mode"
    //% group="Settings" weight=15
    export function setDriveMode(mode: BorsukDrive): void {
        stop()
        driveMode = mode
    }

    /**
     * Reverse the direction of a DC motor (when a wheel spins the wrong way).
     */
    //% blockId=borsuk_reverse_motor block="reverse motor %motor|%reversed"
    //% reversed.shadow="toggleOnOff" reversed.defl=true
    //% group="Settings" weight=12
    export function reverseMotor(motor: BorsukMotor, reversed: boolean): void {
        motorReversed[motor] = reversed
    }

    /**
     * Swap sides – when the robot turns the opposite way.
     */
    //% blockId=borsuk_swap_sides block="swap left and right wheel %swapped"
    //% swapped.shadow="toggleOnOff" swapped.defl=true
    //% group="Settings" weight=11
    export function swapSides(swapped: boolean): void {
        sidesSwapped = swapped
    }

    /**
     * 360° servo calibration: stop-point offset in µs.
     * Increase/decrease until the servo spins equally slowly in both directions.
     * @param servo servo connector
     * @param trim offset in microseconds, eg: 0
     */
    //% blockId=borsuk_servo_trim block="calibrate 360° servo %servo|offset %trim µs"
    //% trim.min=-200 trim.max=200
    //% group="Settings" weight=10 advanced=true
    export function setServoTrim(servo: BorsukServo, trim: number): void {
        servoTrim[servo] = Math.constrain(trim, -200, 200)
    }

    /**
     * Pulse range of standard servos (for 0° and 180°). Default 500–2500 µs.
     * Narrow the range if the servo buzzes at the ends.
     * @param minUs pulse for 0°, eg: 500
     * @param maxUs pulse for 180°, eg: 2500
     */
    //% blockId=borsuk_servo_range block="servo range: 0° = %minUs µs|180° = %maxUs µs"
    //% group="Settings" weight=9 advanced=true
    export function setServoRange(minUs: number, maxUs: number): void {
        servoMinUs = Math.constrain(minUs, 300, 2700)
        servoMaxUs = Math.constrain(maxUs, 300, 2700)
    }
}
