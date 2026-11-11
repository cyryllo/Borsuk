# Lista zmian

## 1.0.0 – połączenie projektów (2026-11)

Repozytoria **pxt-Borsuk**, **BorsukPY** i **JoyStick** połączone w jeden projekt
(historia wszystkich trzech jest zachowana w tym repozytorium).

### Nowe

- Jedno rozszerzenie MakeCode z dwiema kategoriami: **Borsuk** (robot) i **Borsuk Pilot**.
- Bloki jazdy: `jedź`, `jedź … przez … ms`, `zatrzymaj robota`, `koła: lewe/prawe`,
  `steruj jak joystickiem` – działają tak samo dla v1 (serwa 360°) i v2 (silniki DC).
- Sterowanie radiowe pilot → robot jednym blokiem po każdej stronie, z **failsafe**
  (robot staje po 0,5 s bez sygnału) i zdarzeniami przycisków pilota.
- Czujnik odległości (RCW-0001, HC-SR04P, RCWL-1601, Grove): `odległość (cm)`, `przeszkoda bliżej niż`.
- Ustawienia: odwracanie silników, zamiana stron, kalibracja serw 360°, zakres serw.
- Biblioteka MicroPython w jednym pliku (`Robot` + `Pilot`) z tymi samymi funkcjami,
  w tym jazda na serwach 360° i radio.
- Przykłady (7 × MakeCode, 6 × MicroPython), pełna dokumentacja po polsku.
- Plik DXF konstrukcji v2 + podgląd SVG + skrypt `tools/dxf_podglad.py`.
- CI (GitHub Actions): kompilacja rozszerzenia i wszystkich przykładów, testy biblioteki Python.

### Poprawione błędy

**JoyStick (MakeCode)**
- Przycisk **F / Mode** był przypisany do **P0** (buzzer) zamiast **P6** – nie działał,
  a ustawienie podciągania psuło dźwięk.
- Brak wyłączenia wyświetlacza LED – piny P3, P4, P6, P7, P9, P10 są wspólne z
  matrycą LED, więc odczyty joysticka i przycisków były zakłócane (test.ts dodatkowo
  rysował po wyświetlaczu).
- `blockId==…` (podwójne `=`) i dwa bloki o identycznym opisie „Key %pin Press”.
- `onKey` używał `pins.onPulsed(…, Low)`, które reaguje na **puszczenie** przycisku, a nie wciśnięcie.
- `Listen_Dir` miał zakodowane na sztywno piny zamiast stałych.

**pxt-Borsuk (MakeCode)**
- Globalne typy `Motor`, `Servo`, `Dir` kolidowały z innymi rozszerzeniami
  (np. oryginalnym waveshare pxt-Motor) – teraz `BorsukMotor`, `BorsukServo`, `BorsukDir`.
- Ogólne identyfikatory bloków (`MotorStop`, `ServoStop`…) – teraz z prefiksem `borsuk_`.
- Kąt serwa: wzór `angle * 10 + 500` dawał 500–2300 µs zamiast 500–2500 µs.
- Brak ograniczenia zakresów: `test.ts` wywoływał `ServoMotorForward(S1, 180)` przy
  zakresie 1–10, co dawało kąt ujemny.
- Odwrócenie serwa S1 było na sztywno w funkcjach niskiego poziomu (S2 zachowywało się jak S0).
- Literówka w nazwie pakietu (`ptx-Borsuk`) i błędne chińskie tłumaczenia skopiowane z oryginału.

**BorsukPY (MicroPython)**
- `MotorRun(…, 0)` liczyło `0 * 64 - 1 = -1` i `write_analog(-1)` kończyło się błędem;
  prędkość > 16 była po cichu ignorowana.
- `ServoTurn` przekazywało liczbę zmiennoprzecinkową do `write_analog`, a 180° dawało 2,25 ms zamiast 2,5 ms.
- Brak funkcji serw 360° – robota v1 nie dało się prowadzić z Pythona.
- Joystick: brak podciągania przycisków (`set_pull`), `display.off()` wykonywane przy samym imporcie.
- Komentarze w przykładzie joysticka opisywały oś X przy odczycie osi Y.

### Zmiany niekompatybilne

Prędkości są teraz w **procentach 0–100** (wcześniej 0–16 i 1–10), a nazwy funkcji
zostały ujednolicone. Tabela odpowiedników: [docs/migracja.md](docs/migracja.md).
