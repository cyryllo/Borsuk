// Wykrywacz pinów czujnika odległości.
// Sprawdza wszystkie pary TRIG/ECHO na złączach S0/S1/S2 (P0, P1, P2)
// i pokazuje na wyświetlaczu tę, która daje odczyt, np. „T0 E1 23”
// = TRIG na P0, ECHO na P1, odległość 23 cm.
// Postaw przeszkodę (rękę, książkę) 10–50 cm przed czujnikiem i wciśnij A.
let piny = [DigitalPin.P0, DigitalPin.P1, DigitalPin.P2]

input.onButtonPressed(Button.A, function () {
    let znaleziono = false
    for (let t = 0; t < 3; t++) {
        for (let e = 0; e < 3; e++) {
            if (t == e) continue
            borsuk.setDistanceSensor(piny[t], piny[e])
            let d = 0
            for (let i = 0; i < 3; i++) {
                d = Math.max(d, borsuk.distance())
                basic.pause(60)
            }
            if (d > 0) {
                znaleziono = true
                serial.writeLine("TRIG=P" + t + " ECHO=P" + e + " -> " + d + " cm")
                basic.showString("T" + t + " E" + e + " " + d)
            }
        }
    }
    // czujnik Grove: jeden pin sygnałowy
    for (let p = 0; p < 3; p++) {
        borsuk.setDistanceSensor(piny[p], piny[p])
        let d = borsuk.distance()
        if (d > 0) {
            znaleziono = true
            basic.showString("SIG" + p + " " + d)
        }
    }
    if (!znaleziono) basic.showIcon(IconNames.No)
})
basic.showString("A")
