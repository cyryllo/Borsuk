/**
 * Sterowanie radiowe: pilot -> robot.
 *
 * Ramka (radio.sendBuffer), 5 bajtów:
 *   [0] 0x42 ('B')    – znacznik Borsuka
 *   [1] 0x01          – wersja protokołu
 *   [2] x  (int8)     – joystick X, -100..100
 *   [3] y  (int8)     – joystick Y, -100..100
 *   [4] przyciski     – maska bitowa, bit n = PilotKey n
 */
namespace borsuk {
    const MAGIC = 0x42
    const VERSION = 0x01
    // po takim czasie bez ramki robot się zatrzymuje (failsafe)
    const TIMEOUT_MS = 500

    let remoteStarted = false
    let remoteAutoDrive = true
    let remoteConnected = false
    let lastPacketAt = 0
    let rx = 0
    let ry = 0
    let rkeys = 0
    let remoteHandlers: (() => void)[] = []

    /** Koduje ramkę sterowania (używane przez pilota). */
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
     * Odbieraj sterowanie z pilota. Robot sam jeździ zgodnie z joystickiem
     * i zatrzymuje się, gdy przez pół sekundy nie dostanie sygnału.
     * @param radioGroup grupa radiowa – taka sama jak w pilocie, eg: 1
     */
    //% blockId=borsuk_remote_start block="odbieraj sterowanie z pilota, grupa radiowa %radioGroup"
    //% radioGroup.min=0 radioGroup.max=255 radioGroup.defl=1
    //% group="Pilot radiowy" weight=70
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
     * Wykonaj kod, gdy na pilocie zostanie wciśnięty przycisk.
     */
    //% blockId=borsuk_on_remote_key block="gdy na pilocie wciśnięto %key"
    //% group="Pilot radiowy" weight=65
    export function onRemoteKey(key: PilotKey, handler: () => void): void {
        remoteHandlers[key] = handler
    }

    /**
     * Czy przycisk na pilocie jest teraz wciśnięty?
     */
    //% blockId=borsuk_remote_key_pressed block="na pilocie wciśnięty %key"
    //% group="Pilot radiowy" weight=60
    export function remoteKeyPressed(key: PilotKey): boolean {
        return (rkeys & (1 << key)) != 0
    }

    /**
     * Wychylenie joysticka na pilocie (-100..100).
     */
    //% blockId=borsuk_remote_axis block="joystick pilota oś %axis"
    //% group="Pilot radiowy" weight=55
    export function remoteAxis(axis: PilotAxis): number {
        return axis == PilotAxis.X ? rx : ry
    }

    /**
     * Czy robot odbiera sygnał z pilota?
     */
    //% blockId=borsuk_remote_connected block="pilot połączony"
    //% group="Pilot radiowy" weight=50
    export function isRemoteConnected(): boolean {
        return remoteConnected
    }

    /**
     * Włącz/wyłącz automatyczną jazdę joystickiem. Wyłącz, jeśli chcesz
     * sam decydować, co robi robot (np. jazda na przyciskach).
     */
    //% blockId=borsuk_remote_autodrive block="jazda joystickiem pilota %on"
    //% on.shadow="toggleOnOff" on.defl=true
    //% group="Pilot radiowy" weight=45
    export function setRemoteAutoDrive(on: boolean): void {
        remoteAutoDrive = on
        if (!on) stop()
    }
}
