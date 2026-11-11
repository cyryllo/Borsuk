// PROGRAM NA micro:bit W PILOCIE.
// Wysyła joystick i przyciski do robota. Grupa radiowa musi być taka sama jak w robocie!
pilot.startSending(1)

// Dodatkowo: dźwięk przy wciśnięciu „select” (buzzer pilota jest na P0).
pilot.onKey(PilotKey.Select, function () {
    music.playTone(Note.C5, music.beat(BeatFraction.Eighth))
})
