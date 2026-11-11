// Borsuk remote – Keyestudio KS0296 Joystick Breakout Board for micro:bit.
//
//   Up=P10  Left=P11  Right=P9  Down=P8  Select=P7  Mode=P6
//   Joystick: X=P4, Y=P3, press (Z)=P5,  buzzer=P0
//
// NOTE: pins P3, P4, P6, P7, P9, P10 are shared with the LED display,
// so the remote turns the micro:bit display off.

enum PilotKey {
    //% block="up"
    Up = 0,
    //% block="down"
    Down = 1,
    //% block="left"
    Left = 2,
    //% block="right"
    Right = 3,
    //% block="select"
    Select = 4,
    //% block="mode"
    Mode = 5,
    //% block="joystick (pressed)"
    Stick = 6
}

enum PilotAxis {
    //% block="X (left-right)"
    X = 0,
    //% block="Y (down-up)"
    Y = 1
}

enum PilotDir {
    //% block="centered"
    None = 0,
    //% block="up"
    Up = 1,
    //% block="down"
    Down = 2,
    //% block="left"
    Left = 3,
    //% block="right"
    Right = 4,
    //% block="up-left"
    UpLeft = 5,
    //% block="up-right"
    UpRight = 6,
    //% block="down-left"
    DownLeft = 7,
    //% block="down-right"
    DownRight = 8
}

/**
 * Joystick remote for the Borsuk robot
 */
//% weight=90 color=#d83b01 icon="" block="Borsuk Remote"
//% groups='["Buttons", "Joystick", "Send to robot"]'
namespace pilot {
    const KEY_COUNT = 7
    const AXIS_X = AnalogPin.P4
    const AXIS_Y = AnalogPin.P3
    // % of deflection below which the joystick counts as centered
    const DEADZONE = 8
    // % of deflection from which a direction is reported ("joystick pushed …" block)
    const DIR_THRESHOLD = 40

    let started = false
    let centerX = 512
    let centerY = 512
    let handlers: (() => void)[] = []
    let lastKeys = 0

    /** Pin of a button. */
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
     * Prepare the remote: turns off the LED display, enables button pull-ups
     * and remembers the joystick center position.
     * Other remote blocks call this automatically, so you don't have to use it.
     */
    //% blockId=pilot_init block="start remote"
    //% group="Buttons" weight=100
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

    /** State of all buttons as a bit mask (bit = PilotKey). */
    export function readKeys(): number {
        let keys = 0
        for (let k = 0; k < KEY_COUNT; k++) {
            if (pins.digitalReadPin(keyPin(k)) == 0) keys |= 1 << k
        }
        return keys
    }

    /**
     * Is the button pressed right now?
     */
    //% blockId=pilot_is_pressed block="remote button %key|is pressed"
    //% group="Buttons" weight=90
    export function isPressed(key: PilotKey): boolean {
        init()
        return pins.digitalReadPin(keyPin(key)) == 0
    }

    /**
     * Run code when a button is pressed.
     */
    //% blockId=pilot_on_key block="on remote button %key pressed"
    //% group="Buttons" weight=85
    export function onKey(key: PilotKey, handler: () => void): void {
        handlers[key] = handler
        init()
    }

    /**
     * Remember the current joystick position as its center.
     * Don't touch the joystick during calibration.
     */
    //% blockId=pilot_calibrate block="calibrate joystick center"
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
     * Joystick deflection from -100 to 100 (0 = center).
     * X: negative = left. Y: negative = down.
     */
    //% blockId=pilot_axis block="joystick axis %axis"
    //% group="Joystick" weight=80
    export function axis(axis: PilotAxis): number {
        init()
        if (axis == PilotAxis.X) return scale(pins.analogReadPin(AXIS_X), centerX)
        return scale(pins.analogReadPin(AXIS_Y), centerY)
    }

    /**
     * Direction the joystick is pushed in.
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
     * Is the joystick pushed in the given direction?
     */
    //% blockId=pilot_is_dir block="joystick pushed %dir"
    //% group="Joystick" weight=75
    export function isDirection(dir: PilotDir): boolean {
        return direction() == dir
    }

    /**
     * Keep sending the joystick and button state to the robot over radio
     * in the background (about 20 times per second). The robot needs the same
     * radio group and the "receive remote control" block.
     * @param radioGroup radio group 0..255 – every remote+robot pair needs its own, eg: 1
     */
    //% blockId=pilot_start_sending block="send control to robot, radio group %radioGroup"
    //% radioGroup.min=0 radioGroup.max=255 radioGroup.defl=1
    //% group="Send to robot" weight=60
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
