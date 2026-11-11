// Robot jeździ sam i omija przeszkody (czujnik ultradźwiękowy).
// Ustaw piny, do których podłączony jest Twój czujnik.
borsuk.setDistanceSensor(DigitalPin.P1, DigitalPin.P2)
let jedzie = false

input.onButtonPressed(Button.A, function () {
    jedzie = true
})
input.onButtonPressed(Button.B, function () {
    jedzie = false
    borsuk.stop()
})

basic.forever(function () {
    if (!jedzie) return
    if (borsuk.obstacleCloserThan(20)) {
        basic.showIcon(IconNames.Surprised)
        borsuk.driveFor(BorsukMove.Backward, 50, 400)
        // losowo w lewo albo w prawo
        if (Math.randomBoolean()) {
            borsuk.driveFor(BorsukMove.Left, 50, 400)
        } else {
            borsuk.driveFor(BorsukMove.Right, 50, 400)
        }
    } else {
        basic.showIcon(IconNames.Happy)
        borsuk.drive(BorsukMove.Forward, 50)
    }
    basic.pause(50)
})
