// Test pilota bez robota: wysyła odczyty joysticka i przycisków przez USB
// (otwórz „Show console Device” w MakeCode). Wyświetlacz LED jest wyłączony,
// bo dzieli piny z joystickiem – sygnalizacja tylko dźwiękiem.
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
