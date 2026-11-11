// PROGRAM FOR THE micro:bit IN THE ROBOT.
// The robot drives by the remote's joystick; remote buttons move servo S2.
borsuk.startRemote(1)
basic.showIcon(IconNames.Asleep)

borsuk.onRemoteKey(PilotKey.Up, function () {
    borsuk.servoAngle(BorsukServo.S2, 180)
})
borsuk.onRemoteKey(PilotKey.Down, function () {
    borsuk.servoAngle(BorsukServo.S2, 0)
})
borsuk.onRemoteKey(PilotKey.Mode, function () {
    music.playMelody("C D E F G A B C5 ", 300)
})

basic.forever(function () {
    // smile = remote connected, asleep = no signal (robot stands still)
    if (borsuk.isRemoteConnected()) {
        basic.showIcon(IconNames.Happy)
    } else {
        basic.showIcon(IconNames.Asleep)
    }
    basic.pause(200)
})
