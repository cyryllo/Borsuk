/**
 * Pilot robota Borsuk – płytka z joystickiem dla micro:bit.
 *
 *   Góra=P10  Lewo=P11  Prawo=P9  Dół=P8  Select=P7  Mode=P6
 *   Joystick: X=P4, Y=P3, wciśnięcie=P5,  buzzer=P0
 *
 * UWAGA: piny P3, P4, P6, P7, P9, P10 są współdzielone z wyświetlaczem LED,
 * dlatego pilot wyłącza wyświetlacz micro:bita.
 */

enum PilotKey {
    //% block="góra"
    Up = 0,
    //% block="dół"
    Down = 1,
    //% block="lewo"
    Left = 2,
    //% block="prawo"
    Right = 3,
    //% block="select"
    Select = 4,
    //% block="mode"
    Mode = 5,
    //% block="joystick (wciśnięty)"
    Stick = 6
}

enum PilotAxis {
    //% block="X (lewo-prawo)"
    X = 0,
    //% block="Y (dół-góra)"
    Y = 1
}

enum PilotDir {
    //% block="na środku"
    None = 0,
    //% block="w górę"
    Up = 1,
    //% block="w dół"
    Down = 2,
    //% block="w lewo"
    Left = 3,
    //% block="w prawo"
    Right = 4,
    //% block="w górę i w lewo"
    UpLeft = 5,
    //% block="w górę i w prawo"
    UpRight = 6,
    //% block="w dół i w lewo"
    DownLeft = 7,
    //% block="w dół i w prawo"
    DownRight = 8
}

/**
 * Pilot z joystickiem do robota Borsuk
 */
//% weight=90 color=#d83b01 icon="" block="Borsuk Pilot"
//% groups='["Przyciski", "Joystick", "Wysyłanie do robota"]'
namespace pilot {
    const KEY_COUNT = 7
    const AXIS_X = AnalogPin.P4
    const AXIS_Y = AnalogPin.P3
    // % wychylenia, poniżej którego joystick traktujemy jako „na środku”
    const DEADZONE = 8
    // % wychylenia, od którego liczymy kierunek (blok „joystick wychylony …”)
    const DIR_THRESHOLD = 40

    let started = false
    let centerX = 512
    let centerY = 512
    let handlers: (() => void)[] = []
    let lastKeys = 0

    /** Pin przycisku. */
    export function keyPin(key: PilotKey): DigitalPin {
        switch (key) {
            case PilotKey.Up: return DigitalPin.P10
            case PilotKey.Down: return DigitalPin.P8
            case PilotKey.Left: return DigitalPin.P11
            case PilotKey.Right: return DigitalPin.P9
            case PilotKey.Select: return DigitalPin.P7
            case PilotKey.Mode: return DigitalPin.P6
            default: return DigitalPin.P5
        }
    }

    /**
     * Przygotuj pilota: wyłącza wyświetlacz LED, włącza podciąganie
     * przycisków i zapamiętuje środkowe położenie joysticka.
     * Inne bloki pilota wywołują to same, więc nie musisz go używać.
     */
    //% blockId=pilot_init block="uruchom pilota"
    //% group="Przyciski" weight=100
    export function init(): void {
        if (started) return
        started = true
        led.enable(false)
        for (let k = 0; k < KEY_COUNT; k++) {
            pins.setPull(keyPin(k), PinPullMode.PullUp)
        }
        calibrate()
        control.inBackground(function () {
            while (true) {
                const keys = readKeys()
                const pressed = keys & ~lastKeys
                lastKeys = keys
                for (let k = 0; k < KEY_COUNT; k++) {
                    if ((pressed & (1 << k)) && handlers[k]) control.runInParallel(handlers[k])
                }
                basic.pause(20)
            }
        })
    }

    /** Stan wszystkich przycisków jako maska bitowa (bit = PilotKey). */
    export function readKeys(): number {
        let keys = 0
        for (let k = 0; k < KEY_COUNT; k++) {
            if (pins.digitalReadPin(keyPin(k)) == 0) keys |= 1 << k
        }
        return keys
    }

    /**
     * Czy przycisk jest teraz wciśnięty?
     */
    //% blockId=pilot_is_pressed block="przycisk pilota %key|wciśnięty"
    //% group="Przyciski" weight=90
    export function isPressed(key: PilotKey): boolean {
        init()
        return pins.digitalReadPin(keyPin(key)) == 0
    }

    /**
     * Wykonaj kod, gdy przycisk zostanie wciśnięty.
     */
    //% blockId=pilot_on_key block="gdy wciśnięto przycisk pilota %key"
    //% group="Przyciski" weight=85
    export function onKey(key: PilotKey, handler: () => void): void {
        handlers[key] = handler
        init()
    }

    /**
     * Zapamiętaj obecne położenie joysticka jako środek.
     * Nie dotykaj joysticka podczas kalibracji.
     */
    //% blockId=pilot_calibrate block="kalibruj środek joysticka"
    //% group="Joystick" weight=50
    export function calibrate(): void {
        let sx = 0
        let sy = 0
        for (let i = 0; i < 8; i++) {
            sx += pins.analogReadPin(AXIS_X)
            sy += pins.analogReadPin(AXIS_Y)
            basic.pause(5)
        }
        centerX = Math.idiv(sx, 8)
        centerY = Math.idiv(sy, 8)
    }

    function scale(raw: number, center: number): number {
        let v = raw >= center
            ? Math.idiv((raw - center) * 100, Math.max(1, 1023 - center))
            : -Math.idiv((center - raw) * 100, Math.max(1, center))
        v = Math.constrain(v, -100, 100)
        if (Math.abs(v) < DEADZONE) return 0
        return v
    }

    /**
     * Wychylenie joysticka od -100 do 100 (0 = środek).
     * X: ujemne = w lewo. Y: ujemne = w dół.
     */
    //% blockId=pilot_axis block="joystick oś %axis"
    //% group="Joystick" weight=80
    export function axis(axis: PilotAxis): number {
        init()
        if (axis == PilotAxis.X) return scale(pins.analogReadPin(AXIS_X), centerX)
        return scale(pins.analogReadPin(AXIS_Y), centerY)
    }

    /**
     * Kierunek, w którym wychylony jest joystick.
     */
    export function direction(): PilotDir {
        const x = axis(PilotAxis.X)
        const y = axis(PilotAxis.Y)
        const right = x >= DIR_THRESHOLD
        const left = x <= -DIR_THRESHOLD
        const up = y >= DIR_THRESHOLD
        const down = y <= -DIR_THRESHOLD
        if (up && left) return PilotDir.UpLeft
        if (up && right) return PilotDir.UpRight
        if (down && left) return PilotDir.DownLeft
        if (down && right) return PilotDir.DownRight
        if (up) return PilotDir.Up
        if (down) return PilotDir.Down
        if (left) return PilotDir.Left
        if (right) return PilotDir.Right
        return PilotDir.None
    }

    /**
     * Czy joystick jest wychylony w podanym kierunku?
     */
    //% blockId=pilot_is_dir block="joystick wychylony %dir"
    //% group="Joystick" weight=75
    export function isDirection(dir: PilotDir): boolean {
        return direction() == dir
    }

    /**
     * Wysyłaj w tle stan joysticka i przycisków do robota przez radio
     * (ok. 20 razy na sekundę). Robot musi mieć tę samą grupę radiową
     * i blok „odbieraj sterowanie z pilota”.
     * @param radioGroup grupa radiowa 0..255 – każda para pilot+robot musi mieć inną, eg: 1
     */
    //% blockId=pilot_start_sending block="wysyłaj sterowanie do robota, grupa radiowa %radioGroup"
    //% radioGroup.min=0 radioGroup.max=255 radioGroup.defl=1
    //% group="Wysyłanie do robota" weight=60
    export function startSending(radioGroup: number): void {
        init()
        radio.setGroup(radioGroup)
        radio.setTransmitPower(7)
        control.inBackground(function () {
            while (true) {
                radio.sendBuffer(borsuk.encodeControl(
                    axis(PilotAxis.X), axis(PilotAxis.Y), readKeys()))
                basic.pause(50)
            }
        })
    }
}
