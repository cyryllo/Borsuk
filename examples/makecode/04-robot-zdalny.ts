// PROGRAM NA micro:bit W ROBOCIE.
// Robot jeździ zgodnie z joystickiem pilota, a przyciski pilota sterują serwem S2.
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
    // uśmiech = pilot połączony, sen = brak sygnału (robot stoi)
    if (borsuk.isRemoteConnected()) {
        basic.showIcon(IconNames.Happy)
    } else {
        basic.showIcon(IconNames.Asleep)
    }
    basic.pause(200)
})
