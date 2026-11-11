# Sterowanie pilotem przez radio

```
 ┌──────────── pilot ────────────┐     radio, 20×/s     ┌──────────── robot ────────────┐
 │ joystick X/Y + 7 przycisków   │ ───────────────────▶ │ steer(x, y) → koła            │
 │ pilot.startSending(grupa)     │    ramka 5 bajtów    │ borsuk.startRemote(grupa)     │
 └───────────────────────────────┘                      │ brak ramek 0,5 s → stop       │
                                                        └───────────────────────────────┘
```

## Jak to działa

1. Pilot co 50 ms wysyła ramkę ze stanem joysticka i przycisków.
2. Robot po każdej ramce ustawia koła (`steer(x, y)`): wychylenie w górę = jazda do przodu,
   na boki = skręt, ukos = jazda po łuku.
3. Jeśli przez **0,5 s** nie przyjdzie żadna ramka (pilot wyłączony, poza zasięgiem),
   robot się **zatrzymuje** (failsafe).
4. Wciśnięcie przycisku na pilocie wywołuje w robocie zdarzenie
   *gdy na pilocie wciśnięto …* (MakeCode) albo ustawia bit w wyniku
   `remote_update()` (MicroPython).

## Grupy radiowe

Wszystkie micro:bity w tej samej **grupie** słyszą się nawzajem. Gdy w sali jeździ kilka
robotów, każda para pilot + robot musi mieć **inną grupę** (0–255). Najprościej: numer
robota = numer grupy; można go nakleić na robota i pilota.

## Własne sterowanie

Chcesz, żeby przyciski robiły coś innego niż jazda joystickiem? Wyłącz automatyczną jazdę
i sam zdecyduj:

```blocks
borsuk.startRemote(1)
borsuk.setRemoteAutoDrive(false)
basic.forever(function () {
    if (borsuk.remoteKeyPressed(PilotKey.Up)) {
        borsuk.drive(BorsukMove.Forward, 70)
    } else if (borsuk.remoteKeyPressed(PilotKey.Down)) {
        borsuk.drive(BorsukMove.Backward, 70)
    } else {
        borsuk.stop()
    }
})
```

Rozszerzenie używa tylko `radio.sendBuffer` / `radio.onReceivedBuffer`, więc w swoim
programie możesz dalej używać zwykłych bloków radia z liczbami i tekstami.

## Format ramki

5 bajtów, wysyłane jako bufor (`radio.sendBuffer` / `radio.send_bytes`):

| Bajt | Zawartość |
|---|---|
| 0 | `0x42` – znacznik Borsuka (ramki z innym znacznikiem są ignorowane) |
| 1 | `0x01` – wersja protokołu |
| 2 | X joysticka, liczba ze znakiem (int8), -100…100 |
| 3 | Y joysticka, int8, -100…100 |
| 4 | przyciski – bit 0 góra, 1 dół, 2 lewo, 3 prawo, 4 select, 5 mode, 6 joystick |

MakeCode i MicroPython dodają do pakietu radiowego różne nagłówki, dlatego
**pilot MakeCode nie steruje robotem z MicroPythonem** (i odwrotnie).
