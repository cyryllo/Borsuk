// Radio control: remote -> robot.
//
// Frame (radio.sendBuffer), 5 bytes:
//   [0] 0x42 ('B')    – Borsuk marker
//   [1] 0x01          – protocol version
//   [2] x  (int8)     – joystick X, -100..100
//   [3] y  (int8)     – joystick Y, -100..100
//   [4] buttons       – bit mask, bit n = PilotKey n
namespace borsuk {
    const MAGIC = 0x42
    const VERSION = 0x01
    // the robot stops after this long without a frame (failsafe)
    const TIMEOUT_MS = 500

    let remoteStarted = false
    let remoteAutoDrive = true
    let remoteConnected = false
    let lastPacketAt = 0
    let rx = 0
    let ry = 0
    let rkeys = 0
    let remoteHandlers: (() => void)[] = []

    /** Encodes a control frame (used by the remote). */
    export function encodeControl(x: number, y: number, keys: number): Buffer {
        const buf = pins.createBuffer(5)
        buf[0] = MAGIC
        buf[1] = VERSION
        buf.setNumber(NumberFormat.Int8LE, 2, Math.constrain(x, -100, 100))
        buf.setNumber(NumberFormat.Int8LE, 3, Math.constrain(y, -100, 100))
        buf[4] = keys & 0x7f
        return buf
    }

    /**
     * Receive control from the remote. The robot drives by the joystick on its own
     * and stops when it gets no signal for half a second.
     * @param radioGroup radio group – the same as on the remote, eg: 1
     */
    //% blockId=borsuk_remote_start block="receive remote control, radio group %radioGroup"
    //% radioGroup.min=0 radioGroup.max=255 radioGroup.defl=1
    //% group="Remote control" weight=70
    export function startRemote(radioGroup: number): void {
        radio.setGroup(radioGroup)
        if (remoteStarted) return
        remoteStarted = true
        radio.onReceivedBuffer(function (buf: Buffer) {
            if (buf.length < 5 || buf[0] != MAGIC || buf[1] != VERSION) return
            rx = buf.getNumber(NumberFormat.Int8LE, 2)
            ry = buf.getNumber(NumberFormat.Int8LE, 3)
            const keys = buf[4]
            const pressed = keys & ~rkeys
            rkeys = keys
            lastPacketAt = control.millis()
            remoteConnected = true
            if (remoteAutoDrive) steer(rx, ry)
            for (let k = 0; k < 7; k++) {
                if ((pressed & (1 << k)) && remoteHandlers[k]) control.runInParallel(remoteHandlers[k])
            }
        })
        control.inBackground(function () {
            while (true) {
                if (remoteConnected && control.millis() - lastPacketAt > TIMEOUT_MS) {
                    remoteConnected = false
                    rx = 0
                    ry = 0
                    rkeys = 0
                    if (remoteAutoDrive) stop()
                }
                basic.pause(100)
            }
        })
    }

    /**
     * Run code when a button is pressed on the remote.
     */
    //% blockId=borsuk_on_remote_key block="on remote %key pressed"
    //% group="Remote control" weight=65
    export function onRemoteKey(key: PilotKey, handler: () => void): void {
        remoteHandlers[key] = handler
    }

    /**
     * Is a button on the remote pressed right now?
     */
    //% blockId=borsuk_remote_key_pressed block="remote %key is pressed"
    //% group="Remote control" weight=60
    export function remoteKeyPressed(key: PilotKey): boolean {
        return (rkeys & (1 << key)) != 0
    }

    /**
     * Joystick deflection on the remote (-100..100).
     */
    //% blockId=borsuk_remote_axis block="remote joystick axis %axis"
    //% group="Remote control" weight=55
    export function remoteAxis(axis: PilotAxis): number {
        return axis == PilotAxis.X ? rx : ry
    }

    /**
     * Is the robot receiving the remote's signal?
     */
    //% blockId=borsuk_remote_connected block="remote connected"
    //% group="Remote control" weight=50
    export function isRemoteConnected(): boolean {
        return remoteConnected
    }

    /**
     * Turn automatic joystick driving on/off. Turn it off if you want to
     * decide yourself what the robot does (e.g. driving with buttons).
     */
    //% blockId=borsuk_remote_autodrive block="drive with remote joystick %on"
    //% on.shadow="toggleOnOff" on.defl=true
    //% group="Remote control" weight=45
    export function setRemoteAutoDrive(on: boolean): void {
        remoteAutoDrive = on
        if (!on) stop()
    }
}
