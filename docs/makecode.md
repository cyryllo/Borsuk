# Bloki MakeCode

## Dodanie rozszerzenia

1. <https://makecode.microbit.org> → **Nowy projekt**.
2. Koło zębate → **Rozszerzenia** (albo kategoria *Rozszerzenia* na dole listy bloków).
3. Wklej `https://github.com/cyryllo/Borsuk` i kliknij znalezione rozszerzenie **borsuk**.

To samo rozszerzenie dodajesz w programie robota i w programie pilota.
Rozszerzenie dodaje też *Radio* (jest potrzebne do pilota).

Bloki mają polskie opisy. W widoku JavaScript/Python funkcje mają angielskie nazwy
(podane niżej), np. `borsuk.drive(...)` / `borsuk.drive(...)`.

---

## Kategoria „Borsuk” (robot)

### Jazda

| Blok | Kod | Opis |
|---|---|---|
| jedź **[do przodu]** z prędkością **50** | `borsuk.drive(BorsukMove.Forward, 50)` | jedzie, dopóki go nie zatrzymasz; kierunki: do przodu, do tyłu, w lewo (obrót), w prawo (obrót); prędkość 0–100 % |
| jedź **[do przodu]** z prędkością **50** przez **1000** ms | `borsuk.driveFor(move, speed, ms)` | jedzie przez podany czas i staje |
| zatrzymaj robota | `borsuk.stop()` | |
| koła: lewe **50** prawe **50** | `borsuk.tank(left, right)` | każde koło osobno, -100…100 (ujemne = do tyłu) – łuki, slalomy |
| steruj jak joystickiem x **0** y **50** | `borsuk.steer(x, y)` | y = przód/tył, x = skręt, -100…100 |

### Czujnik odległości

| Blok | Kod | Opis |
|---|---|---|
| czujnik odległości TRIG **P1** ECHO **P2** | `borsuk.setDistanceSensor(trig, echo)` | wywołaj raz na początku; dla czujnika Grove wybierz ten sam pin dwa razy |
| odległość (cm) | `borsuk.distance()` | 0 = brak odczytu (nic w zasięgu ~4 m) |
| przeszkoda bliżej niż **20** cm | `borsuk.obstacleCloserThan(cm)` | prawda/fałsz; brak odczytu = brak przeszkody |

Podłączenie czujnika RCW-0001 i uwagi o zamiennikach: [sprzęt](sprzet.md#czujnik-odległości-rcw-0001).

### Silniki DC

| Blok | Kod | Opis |
|---|---|---|
| silnik **A** kręć **do przodu** z prędkością **50** | `borsuk.motorRun(motor, dir, speed)` | pojedynczy silnik, 0–100 % |
| zatrzymaj silnik **A** | `borsuk.motorStop(motor)` | |

### Serwa

| Blok | Kod | Opis |
|---|---|---|
| serwo **S2** ustaw kąt **90** | `borsuk.servoAngle(servo, angle)` | zwykłe serwo 0–180° |
| serwo 360° **S0** kręć z prędkością **50** | `borsuk.servoSpin(servo, speed)` | serwo ciągłego obrotu, -100…100 |
| zatrzymaj serwo **S0** | `borsuk.servoStop(servo)` | wyłącza sygnał (serwo 360° staje, zwykłe przestaje trzymać pozycję) |

### Pilot radiowy (po stronie robota)

| Blok | Kod | Opis |
|---|---|---|
| odbieraj sterowanie z pilota, grupa radiowa **1** | `borsuk.startRemote(group)` | robot sam jeździ joystickiem; staje po 0,5 s bez sygnału |
| gdy na pilocie wciśnięto **[góra]** | `borsuk.onRemoteKey(key, handler)` | zdarzenie |
| na pilocie wciśnięty **[góra]** | `borsuk.remoteKeyPressed(key)` | prawda/fałsz |
| joystick pilota oś **X** | `borsuk.remoteAxis(axis)` | -100…100 |
| pilot połączony | `borsuk.isRemoteConnected()` | |
| jazda joystickiem pilota **wł./wył.** | `borsuk.setRemoteAutoDrive(on)` | wyłącz, gdy chcesz sam programować reakcję robota |

### Ustawienia

| Blok | Kod | Opis |
|---|---|---|
| napęd robota: **silniki DC (v2) / serwa 360° (v1)** | `borsuk.setDriveMode(mode)` | domyślnie silniki DC |
| odwróć kierunek silnika **A** wł. | `borsuk.reverseMotor(motor, on)` | gdy koło kręci się odwrotnie |
| zamień lewe i prawe koło wł. | `borsuk.swapSides(on)` | gdy robot skręca w złą stronę |
| kalibruj serwo 360° **S0** przesunięcie **0** µs | `borsuk.setServoTrim(servo, us)` | *(więcej…)* – patrz [kalibracja](kalibracja-i-problemy.md) |
| zakres serw: 0° = **500** µs, 180° = **2500** µs | `borsuk.setServoRange(min, max)` | *(więcej…)* – gdy serwo buczy na krańcach |

---

## Kategoria „Borsuk Pilot” (joystick)

| Blok | Kod | Opis |
|---|---|---|
| uruchom pilota | `pilot.init()` | nie musisz go używać – inne bloki robią to same |
| przycisk pilota **[góra]** wciśnięty | `pilot.isPressed(key)` | przyciski: góra, dół, lewo, prawo, select, mode, joystick |
| gdy wciśnięto przycisk pilota **[góra]** | `pilot.onKey(key, handler)` | zdarzenie przy wciśnięciu |
| joystick oś **X** | `pilot.axis(axis)` | -100…100, X: ujemne = lewo, Y: ujemne = dół |
| joystick wychylony **[w górę]** | `pilot.isDirection(dir)` | 8 kierunków + „na środku” |
| kalibruj środek joysticka | `pilot.calibrate()` | robione automatycznie przy starcie – nie dotykaj wtedy gałki |
| wysyłaj sterowanie do robota, grupa radiowa **1** | `pilot.startSending(group)` | wysyła 20× na sekundę stan joysticka i przycisków |

**Pilot wyłącza wyświetlacz LED** (wspólne piny z joystickiem). Do sygnalizacji używaj
dźwięku – buzzer jest na P0, działają zwykłe bloki *Muzyka*.

---

## Przykłady

Gotowe programy w [`examples/makecode/`](../examples/makecode/). Aby otworzyć: nowy
projekt → dodaj rozszerzenie → przełącz na **JavaScript** → wklej treść pliku →
wróć do **Bloków**.

| Plik | Na który micro:bit | Co robi |
|---|---|---|
| [01-pierwsza-jazda.ts](../examples/makecode/01-pierwsza-jazda.ts) | robot | A = przejazd tam i z powrotem, B = stop |
| [02-kwadrat.ts](../examples/makecode/02-kwadrat.ts) | robot | jazda po kwadracie |
| [03-pilot.ts](../examples/makecode/03-pilot.ts) | **pilot** | wysyłanie sterowania |
| [04-robot-zdalny.ts](../examples/makecode/04-robot-zdalny.ts) | robot | jazda pilotem + serwo + melodia |
| [05-omijanie-przeszkod.ts](../examples/makecode/05-omijanie-przeszkod.ts) | robot | jazda autonomiczna z czujnikiem odległości |
| [06-test-pilota.ts](../examples/makecode/06-test-pilota.ts) | pilot | test przycisków i joysticka (dźwięk + konsola) |
| [07-kalibracja.ts](../examples/makecode/07-kalibracja.ts) | robot | ustawianie kierunków i serw 360° |
| [08-znajdz-piny-czujnika.ts](../examples/makecode/08-znajdz-piny-czujnika.ts) | robot | wykrywa, na których pinach (P0/P1/P2/P19/P20) jest czujnik odległości |

Wszystkie przykłady są kompilowane w CI, więc na pewno działają z bieżącą wersją rozszerzenia.
