// First drive: press A – the robot drives forward, turns around and comes back.
// Robot v1 (360° servos)? Uncomment the line below.
// borsuk.setDriveMode(BorsukDrive.Servos360)

input.onButtonPressed(Button.A, function () {
    basic.showArrow(ArrowNames.North)
    borsuk.driveFor(BorsukMove.Forward, 60, 1500)
    basic.showArrow(ArrowNames.East)
    borsuk.driveFor(BorsukMove.Right, 50, 700)   // adjust the time for a ~180° turn
    basic.showArrow(ArrowNames.North)
    borsuk.driveFor(BorsukMove.Forward, 60, 1500)
    basic.showIcon(IconNames.Happy)
})
input.onButtonPressed(Button.B, function () {
    borsuk.stop()
    basic.showIcon(IconNames.No)
})
basic.showIcon(IconNames.Happy)
