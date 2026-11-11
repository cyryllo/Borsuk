// Pierwsza jazda: po wciśnięciu A robot jedzie do przodu, obraca się i wraca.
// Robot v1 (serwa 360°)? Odkomentuj linię poniżej.
// borsuk.setDriveMode(BorsukDrive.Servos360)

input.onButtonPressed(Button.A, function () {
    basic.showArrow(ArrowNames.North)
    borsuk.driveFor(BorsukMove.Forward, 60, 1500)
    basic.showArrow(ArrowNames.East)
    borsuk.driveFor(BorsukMove.Right, 50, 700)   // dobierz czas tak, by obrót miał ~180°
    basic.showArrow(ArrowNames.North)
    borsuk.driveFor(BorsukMove.Forward, 60, 1500)
    basic.showIcon(IconNames.Happy)
})
input.onButtonPressed(Button.B, function () {
    borsuk.stop()
    basic.showIcon(IconNames.No)
})
basic.showIcon(IconNames.Happy)
