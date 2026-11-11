// Robot calibration. Flash it, put the robot on the floor and check:
//  A – both wheels forward: the robot should drive straight forward,
//  B – spin left: the robot should turn left.
// Change the settings below until everything is right.
borsuk.setDriveMode(BorsukDrive.DCMotors)       // or BorsukDrive.Servos360
borsuk.reverseMotor(BorsukMotor.A, false)       // true if the left wheel spins backward
borsuk.reverseMotor(BorsukMotor.B, false)       // true if the right wheel spins backward
borsuk.swapSides(false)                         // true if the robot turns the wrong way
// 360° servos only: adjust so the servo stands still at speed 0
borsuk.setServoTrim(BorsukServo.S0, 0)
borsuk.setServoTrim(BorsukServo.S1, 0)

input.onButtonPressed(Button.A, function () {
    borsuk.driveFor(BorsukMove.Forward, 50, 1000)
})
input.onButtonPressed(Button.B, function () {
    borsuk.driveFor(BorsukMove.Left, 50, 1000)
})
input.onButtonPressed(Button.AB, function () {
    // 360° servos at very low speed – both should spin equally
    borsuk.servoSpin(BorsukServo.S0, 5)
    borsuk.servoSpin(BorsukServo.S1, 5)
    basic.pause(2000)
    borsuk.stop()
})
