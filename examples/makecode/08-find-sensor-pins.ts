// Distance sensor pin finder.
// Tries every TRIG/ECHO pair on the free pins of the motor driver
// (P0, P1, P2 and P19, P20 on the bottom header) and shows the working one,
// e.g. "T0 E1 23" = TRIG on P0, ECHO on P1, distance 23 cm.
// Put an obstacle (hand, book) 10–50 cm in front of the sensor and press A.
let pinList = [DigitalPin.P0, DigitalPin.P1, DigitalPin.P2, DigitalPin.P19, DigitalPin.P20]
let pinNames = ["0", "1", "2", "19", "20"]

input.onButtonPressed(Button.A, function () {
    let found = false
    for (let t = 0; t < pinList.length; t++) {
        for (let e = 0; e < pinList.length; e++) {
            if (t == e) continue
            borsuk.setDistanceSensor(pinList[t], pinList[e])
            let d = 0
            for (let i = 0; i < 3; i++) {
                d = Math.max(d, borsuk.distance())
                basic.pause(60)
            }
            if (d > 0) {
                found = true
                serial.writeLine("TRIG=P" + pinNames[t] + " ECHO=P" + pinNames[e] + " -> " + d + " cm")
                basic.showString("T" + pinNames[t] + " E" + pinNames[e] + " " + d)
            }
        }
    }
    // Grove sensor: a single signal pin
    for (let p = 0; p < pinList.length; p++) {
        borsuk.setDistanceSensor(pinList[p], pinList[p])
        let d = borsuk.distance()
        if (d > 0) {
            found = true
            basic.showString("SIG" + pinNames[p] + " " + d)
        }
    }
    if (!found) basic.showIcon(IconNames.No)
})
basic.showString("A")
