// Kalibracja robota. Wgraj, postaw robota na podłodze i sprawdź:
//  A – oba koła do przodu: robot powinien jechać prosto do przodu,
//  B – obrót w lewo: robot powinien kręcić się w lewo.
// Popraw ustawienia poniżej, aż wszystko będzie się zgadzać.
borsuk.setDriveMode(BorsukDrive.DCMotors)       // lub BorsukDrive.Servos360
borsuk.reverseMotor(BorsukMotor.A, false)       // true, gdy lewe koło kręci się do tyłu
borsuk.reverseMotor(BorsukMotor.B, false)       // true, gdy prawe koło kręci się do tyłu
borsuk.swapSides(false)                         // true, gdy robot skręca w złą stronę
// tylko dla serw 360°: dobierz tak, by serwo stało przy prędkości 0
borsuk.setServoTrim(BorsukServo.S0, 0)
borsuk.setServoTrim(BorsukServo.S1, 0)

input.onButtonPressed(Button.A, function () {
    borsuk.driveFor(BorsukMove.Forward, 50, 1000)
})
input.onButtonPressed(Button.B, function () {
    borsuk.driveFor(BorsukMove.Left, 50, 1000)
})
input.onButtonPressed(Button.AB, function () {
    // serwa 360° z bardzo małą prędkością – oba powinny kręcić się równo
    borsuk.servoSpin(BorsukServo.S0, 5)
    borsuk.servoSpin(BorsukServo.S1, 5)
    basic.pause(2000)
    borsuk.stop()
})
