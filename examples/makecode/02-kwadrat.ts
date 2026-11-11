// Robot jeździ po kwadracie. Dobierz czas obrotu (ms), aby skręcał o 90°.
let czasObrotu = 400
input.onButtonPressed(Button.A, function () {
    for (let i = 0; i < 4; i++) {
        borsuk.driveFor(BorsukMove.Forward, 50, 1000)
        basic.pause(200)
        borsuk.driveFor(BorsukMove.Right, 40, czasObrotu)
        basic.pause(200)
    }
})
