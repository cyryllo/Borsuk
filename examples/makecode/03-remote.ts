// PROGRAM FOR THE micro:bit IN THE REMOTE.
// Sends the joystick and buttons to the robot. The radio group must match the robot's!
pilot.startSending(1)

// Extra: beep when "select" is pressed (the remote's buzzer is on P0).
pilot.onKey(PilotKey.Select, function () {
    music.playTone(Note.C5, music.beat(BeatFraction.Eighth))
})
