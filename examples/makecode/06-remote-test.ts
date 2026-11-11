// Remote test without a robot: sends joystick and button readings over USB
// (open "Show console Device" in MakeCode). The LED display is off because it
// shares pins with the joystick – feedback is sound only.
pilot.onKey(PilotKey.Up, function () { music.playTone(Note.C, 100) })
pilot.onKey(PilotKey.Down, function () { music.playTone(Note.D, 100) })
pilot.onKey(PilotKey.Left, function () { music.playTone(Note.E, 100) })
pilot.onKey(PilotKey.Right, function () { music.playTone(Note.F, 100) })
pilot.onKey(PilotKey.Select, function () { music.playTone(Note.G, 100) })
pilot.onKey(PilotKey.Mode, function () { music.playTone(Note.A, 100) })
pilot.onKey(PilotKey.Stick, function () { music.playTone(Note.B, 100) })

basic.forever(function () {
    serial.writeValue("x", pilot.axis(PilotAxis.X))
    serial.writeValue("y", pilot.axis(PilotAxis.Y))
    basic.pause(100)
})
