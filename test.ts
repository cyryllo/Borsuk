// Testy kompilacji – ten plik nie jest dołączany, gdy rozszerzenie
// jest używane jako biblioteka. Wywołuje każdy blok przynajmniej raz.

// --- robot
borsuk.setDriveMode(BorsukDrive.DCMotors)
borsuk.reverseMotor(BorsukMotor.B, true)
borsuk.swapSides(false)
borsuk.drive(BorsukMove.Forward, 50)
borsuk.driveFor(BorsukMove.Left, 30, 200)
borsuk.tank(-40, 40)
borsuk.steer(20, 80)
borsuk.stop()
borsuk.motorRun(BorsukMotor.A, BorsukDir.Backward, 100)
borsuk.motorStop(BorsukMotor.A)

borsuk.setDriveMode(BorsukDrive.Servos360)
borsuk.setServoTrim(BorsukServo.S0, 15)
borsuk.setServoRange(600, 2400)
borsuk.servoAngle(BorsukServo.S2, 90)
borsuk.servoSpin(BorsukServo.S0, -50)
borsuk.servoStop(BorsukServo.S0)
borsuk.drive(BorsukMove.Backward, 70)
borsuk.stop()

borsuk.setDistanceSensor(DigitalPin.P1, DigitalPin.P2)
if (borsuk.obstacleCloserThan(20)) basic.showNumber(borsuk.distance())

// --- odbiór z pilota
borsuk.startRemote(1)
borsuk.setRemoteAutoDrive(true)
borsuk.onRemoteKey(PilotKey.Up, function () {
    basic.showArrow(ArrowNames.North)
})
if (borsuk.isRemoteConnected() && borsuk.remoteKeyPressed(PilotKey.Mode)) {
    basic.showNumber(borsuk.remoteAxis(PilotAxis.X))
}

// --- pilot
pilot.onKey(PilotKey.Select, function () {
    music.playTone(Note.C, music.beat(BeatFraction.Quarter))
})
pilot.calibrate()
if (pilot.isPressed(PilotKey.Stick) || pilot.isDirection(PilotDir.UpLeft)) {
    serial.writeValue("x", pilot.axis(PilotAxis.X))
}
pilot.startSending(1)
