// The robot drives on its own and avoids obstacles (ultrasonic sensor).
// Set the pins your sensor is connected to.
borsuk.setDistanceSensor(DigitalPin.P1, DigitalPin.P2)
let driving = false

input.onButtonPressed(Button.A, function () {
    driving = true
})
input.onButtonPressed(Button.B, function () {
    driving = false
    borsuk.stop()
})

basic.forever(function () {
    if (!driving) return
    if (borsuk.obstacleCloserThan(20)) {
        basic.showIcon(IconNames.Surprised)
        borsuk.driveFor(BorsukMove.Backward, 50, 400)
        // randomly left or right
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
