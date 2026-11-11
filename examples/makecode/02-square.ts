// The robot drives in a square. Adjust the turn time (ms) for a 90° turn.
let turnTime = 400
input.onButtonPressed(Button.A, function () {
    for (let i = 0; i < 4; i++) {
        borsuk.driveFor(BorsukMove.Forward, 50, 1000)
        basic.pause(200)
        borsuk.driveFor(BorsukMove.Right, 40, turnTime)
        basic.pause(200)
    }
})
