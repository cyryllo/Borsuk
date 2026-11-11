/**
 * Robot Borsuk – sterowanie robotem.
 *
 * Sprzęt: micro:bit + Waveshare Motor Driver for micro:bit.
 *   Silnik A: PWMA=P8,  AIN1=P13, AIN2=P12
 *   Silnik B: PWMB=P16, BIN1=P14, BIN2=P15
 *   Serwa:    S0=P0, S1=P1, S2=P2
 *
 * Wersja v2 robota jeździ na silnikach DC (A = lewe koło, B = prawe koło),
 * wersja v1 na serwach 360° (S0 = lewe koło, S1 = prawe koło, zamontowane lustrzanie).
 */

enum BorsukMotor {
    //% block="A (lewy)"
    A = 0,
    //% block="B (prawy)"
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
    //% block="do przodu"
    Forward = 0,
    //% block="do tyłu"
    Backward = 1
}

enum BorsukMove {
    //% block="do przodu"
    Forward = 0,
    //% block="do tyłu"
    Backward = 1,
    //% block="w lewo (obrót)"
    Left = 2,
    //% block="w prawo (obrót)"
    Right = 3
}

enum BorsukDrive {
    //% block="silniki DC (v2)"
    DCMotors = 0,
    //% block="serwa 360° (v1)"
    Servos360 = 1
}

/**
 * Bloki robota Borsuk
 */
//% weight=100 color=#b5651d icon="" block="Borsuk"
//% groups='["Jazda", "Czujnik odległości", "Silniki DC", "Serwa", "Pilot radiowy", "Ustawienia"]'
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
    // przesunięcie punktu zatrzymania serw 360° w µs (kalibracja)
    let servoTrim = [0, 0, 0]
    // zakres impulsu serwa standardowego (0°..180°)
    let servoMinUs = 500
    let servoMaxUs = 2500
    // ±zakres impulsu wokół 1500 µs dla serw 360° przy prędkości 100%
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

    /**
     * Ustawia silnik na prędkość -100..100 (ujemna = do tyłu).
     */
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

    /** Ustawia jedno koło (0 = lewe, 1 = prawe) na prędkość -100..100. */
    function setWheel(side: number, speed: number): void {
        if (sidesSwapped) side = 1 - side
        if (driveMode == BorsukDrive.DCMotors) {
            if (speed == 0) motorStop(side == 0 ? BorsukMotor.A : BorsukMotor.B)
            else setMotor(side == 0 ? BorsukMotor.A : BorsukMotor.B, speed)
        } else {
            // serwa kół są zamontowane lustrzanie – prawe kręci się odwrotnie
            const servo = side == 0 ? BorsukServo.S0 : BorsukServo.S1
            if (speed == 0) servoStop(servo)
            else servoSpin(servo, side == 0 ? speed : -speed)
        }
    }

    // ------------------------------------------------------------------ Jazda

    /**
     * Jedź w wybranym kierunku. Robot jedzie, dopóki go nie zatrzymasz.
     * @param move kierunek jazdy
     * @param speed prędkość w procentach, eg: 50
     */
    //% blockId=borsuk_drive block="jedź %move|z prędkością %speed"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% group="Jazda" weight=100
    export function drive(move: BorsukMove, speed: number): void {
        speed = Math.constrain(speed, 0, 100)
        if (move == BorsukMove.Forward) tank(speed, speed)
        else if (move == BorsukMove.Backward) tank(-speed, -speed)
        else if (move == BorsukMove.Left) tank(-speed, speed)
        else tank(speed, -speed)
    }

    /**
     * Jedź przez podany czas, a potem się zatrzymaj.
     * @param move kierunek jazdy
     * @param speed prędkość w procentach, eg: 50
     * @param ms czas jazdy w milisekundach, eg: 1000
     */
    //% blockId=borsuk_drive_for block="jedź %move|z prędkością %speed|przez %ms ms"
    //% speed.min=0 speed.max=100 speed.defl=50 ms.defl=1000 ms.min=0
    //% group="Jazda" weight=95
    export function driveFor(move: BorsukMove, speed: number, ms: number): void {
        drive(move, speed)
        basic.pause(ms)
        stop()
    }

    /**
     * Zatrzymaj oba koła.
     */
    //% blockId=borsuk_stop block="zatrzymaj robota"
    //% group="Jazda" weight=90
    export function stop(): void {
        setWheel(0, 0)
        setWheel(1, 0)
    }

    /**
     * Ustaw prędkość każdego koła osobno (jazda „czołgowa”).
     * Wartości ujemne = do tyłu.
     * @param left prędkość lewego koła -100..100, eg: 50
     * @param right prędkość prawego koła -100..100, eg: 50
     */
    //% blockId=borsuk_tank block="koła: lewe %left|prawe %right"
    //% left.shadow="speedPicker" right.shadow="speedPicker"
    //% group="Jazda" weight=85
    export function tank(left: number, right: number): void {
        setWheel(0, Math.constrain(left, -100, 100))
        setWheel(1, Math.constrain(right, -100, 100))
    }

    /**
     * Steruj jak joystickiem: y = jazda przód/tył, x = skręt.
     * Obie wartości w zakresie -100..100.
     * @param x skręt (ujemny = w lewo), eg: 0
     * @param y jazda (ujemny = do tyłu), eg: 50
     */
    //% blockId=borsuk_steer block="steruj jak joystickiem x %x|y %y"
    //% x.shadow="speedPicker" y.shadow="speedPicker"
    //% group="Jazda" weight=80
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

    // ------------------------------------------------------- Czujnik odległości

    /**
     * Ustaw piny czujnika ultradźwiękowego (RCW-0001, HC-SR04P, RCWL-1601).
     * Dla czujnika Grove (jeden pin sygnałowy) wybierz ten sam pin dwa razy.
     * @param trig pin TRIG, eg: DigitalPin.P1
     * @param echo pin ECHO, eg: DigitalPin.P2
     */
    //% blockId=borsuk_sonar_pins block="czujnik odległości TRIG %trig|ECHO %echo"
    //% trig.defl=DigitalPin.P1 echo.defl=DigitalPin.P2
    //% group="Czujnik odległości" weight=60
    export function setDistanceSensor(trig: DigitalPin, echo: DigitalPin): void {
        trigPin = trig
        echoPin = echo
    }

    /**
     * Zmierz odległość w centymetrach. Zwraca 0, gdy nie ma odczytu
     * (brak echa / przeszkoda dalej niż ok. 4 m).
     */
    //% blockId=borsuk_distance block="odległość (cm)"
    //% group="Czujnik odległości" weight=55
    export function distance(): number {
        pins.setPull(trigPin, PinPullMode.PullNone)
        pins.digitalWritePin(trigPin, 0)
        control.waitMicros(2)
        pins.digitalWritePin(trigPin, 1)
        control.waitMicros(10)
        pins.digitalWritePin(trigPin, 0)
        // 25 ms ≈ 4,3 m – dalej czujnik i tak nie mierzy wiarygodnie
        const us = pins.pulseIn(echoPin, PulseValue.High, 25000)
        return Math.idiv(us, 58)
    }

    /**
     * Czy przed robotem jest przeszkoda bliżej niż podana odległość?
     * @param cm odległość w centymetrach, eg: 20
     */
    //% blockId=borsuk_obstacle block="przeszkoda bliżej niż %cm cm"
    //% cm.defl=20 cm.min=2 cm.max=400
    //% group="Czujnik odległości" weight=50
    export function obstacleCloserThan(cm: number): boolean {
        const d = distance()
        return d > 0 && d < cm
    }

    // -------------------------------------------------------------- Silniki DC

    /**
     * Uruchom pojedynczy silnik DC.
     * @param motor silnik A lub B
     * @param dir kierunek
     * @param speed prędkość w procentach, eg: 50
     */
    //% blockId=borsuk_motor_run block="silnik %motor|kręć %dir|z prędkością %speed"
    //% speed.min=0 speed.max=100 speed.defl=50
    //% group="Silniki DC" weight=40
    export function motorRun(motor: BorsukMotor, dir: BorsukDir, speed: number): void {
        speed = Math.constrain(speed, 0, 100)
        setMotor(motor, dir == BorsukDir.Forward ? speed : -speed)
    }

    /**
     * Zatrzymaj silnik DC (swobodny wybieg).
     */
    //% blockId=borsuk_motor_stop block="zatrzymaj silnik %motor"
    //% group="Silniki DC" weight=35
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

    // ------------------------------------------------------------------ Serwa

    /**
     * Ustaw zwykłe serwo (0–180°) pod podanym kątem.
     * @param servo złącze serwa
     * @param angle kąt 0..180, eg: 90
     */
    //% blockId=borsuk_servo_angle block="serwo %servo|ustaw kąt %angle"
    //% angle.shadow="protractorPicker" angle.defl=90
    //% group="Serwa" weight=30
    export function servoAngle(servo: BorsukServo, angle: number): void {
        angle = Math.constrain(angle, 0, 180)
        const us = servoMinUs + Math.idiv(angle * (servoMaxUs - servoMinUs), 180)
        pins.servoSetPulse(servoAnalogPin(servo), us)
    }

    /**
     * Kręć serwem 360° (ciągłego obrotu). Ujemna prędkość = w drugą stronę.
     * @param servo złącze serwa
     * @param speed prędkość -100..100, eg: 50
     */
    //% blockId=borsuk_servo_spin block="serwo 360° %servo|kręć z prędkością %speed"
    //% speed.shadow="speedPicker"
    //% group="Serwa" weight=25
    export function servoSpin(servo: BorsukServo, speed: number): void {
        speed = Math.constrain(speed, -100, 100)
        const us = 1500 + servoTrim[servo] + Math.idiv(speed * spinRangeUs, 100)
        pins.servoSetPulse(servoAnalogPin(servo), us)
    }

    /**
     * Wyłącz sygnał serwa – zwykłe serwo przestaje trzymać pozycję,
     * serwo 360° zatrzymuje się.
     */
    //% blockId=borsuk_servo_stop block="zatrzymaj serwo %servo"
    //% group="Serwa" weight=20
    export function servoStop(servo: BorsukServo): void {
        pins.digitalWritePin(servoDigitalPin(servo), 0)
    }

    // -------------------------------------------------------------- Ustawienia

    /**
     * Wybierz, czym jeździ robot: silniki DC (v2) czy serwa 360° (v1).
     * Domyślnie: silniki DC.
     */
    //% blockId=borsuk_set_drive block="napęd robota: %mode"
    //% group="Ustawienia" weight=15
    export function setDriveMode(mode: BorsukDrive): void {
        stop()
        driveMode = mode
    }

    /**
     * Odwróć kierunek obrotów silnika DC (gdy koło kręci się w złą stronę).
     */
    //% blockId=borsuk_reverse_motor block="odwróć kierunek silnika %motor|%reversed"
    //% reversed.shadow="toggleOnOff" reversed.defl=true
    //% group="Ustawienia" weight=12
    export function reverseMotor(motor: BorsukMotor, reversed: boolean): void {
        motorReversed[motor] = reversed
    }

    /**
     * Zamień strony – gdy robot skręca w przeciwną stronę niż powinien.
     */
    //% blockId=borsuk_swap_sides block="zamień lewe i prawe koło %swapped"
    //% swapped.shadow="toggleOnOff" swapped.defl=true
    //% group="Ustawienia" weight=11
    export function swapSides(swapped: boolean): void {
        sidesSwapped = swapped
    }

    /**
     * Kalibracja serwa 360°: przesunięcie punktu zatrzymania w µs.
     * Zwiększaj/zmniejszaj, aż serwo przy małej prędkości kręci się
     * jednakowo w obie strony.
     * @param servo złącze serwa
     * @param trim przesunięcie w mikrosekundach, eg: 0
     */
    //% blockId=borsuk_servo_trim block="kalibruj serwo 360° %servo|przesunięcie %trim µs"
    //% trim.min=-200 trim.max=200
    //% group="Ustawienia" weight=10 advanced=true
    export function setServoTrim(servo: BorsukServo, trim: number): void {
        servoTrim[servo] = Math.constrain(trim, -200, 200)
    }

    /**
     * Zakres impulsu dla zwykłych serw (dla 0° i 180°). Domyślnie 500–2500 µs.
     * Zmniejsz zakres, jeśli serwo „buczy” na krańcach.
     * @param minUs impuls dla 0°, eg: 500
     * @param maxUs impuls dla 180°, eg: 2500
     */
    //% blockId=borsuk_servo_range block="zakres serw: 0° = %minUs µs|180° = %maxUs µs"
    //% group="Ustawienia" weight=9 advanced=true
    export function setServoRange(minUs: number, maxUs: number): void {
        servoMinUs = Math.constrain(minUs, 300, 2700)
        servoMaxUs = Math.constrain(maxUs, 300, 2700)
    }
}
