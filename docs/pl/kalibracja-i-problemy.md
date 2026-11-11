[English](../calibration-troubleshooting.md) | **Polski**

# Kalibracja i rozwiązywanie problemów

Najszybciej: wgraj przykład kalibracyjny
([MakeCode](../../examples/makecode/07-calibration.ts) /
[MicroPython](../../examples/micropython/06_calibration.py)) i zmieniaj ustawienia, aż
robot jedzie poprawnie. Potem skopiuj te same ustawienia na początek swoich programów.

## 1. Kierunki kół (silniki DC)

| Objaw | Rozwiązanie |
|---|---|
| „do przodu” – jedno koło kręci się do tyłu | `odwróć kierunek silnika` (A lub B) |
| „do przodu” – robot jedzie do tyłu | odwróć **oba** silniki |
| „w lewo” – robot kręci się w prawo | `zamień lewe i prawe koło` |

Można też zamienić przewody silnika w zaciskach sterownika – wtedy żadne ustawienia w
programie nie są potrzebne.

## 2. Serwa 360° (robot v1)

Serwo ciągłego obrotu stoi przy impulsie ok. 1500 µs, ale każdy egzemplarz trochę inaczej.

1. Wgraj przykład kalibracyjny, wciśnij **A+B** – oba koła powinny kręcić się
   bardzo wolno do przodu i jednakowo.
2. Jeśli któreś stoi albo kręci się w drugą stronę – zmień jego `przesunięcie` (trim)
   o ±10…20 µs i spróbuj znowu.
3. Niektóre serwa mają potencjometr regulacyjny (otwór z boku) – wtedy można je
   ustawić śrubokrętem przy `servoSpin(…, 0)`.

Zatrzymanie robota (`zatrzymaj robota`) wyłącza sygnał serw, więc stoją one zawsze,
nawet bez idealnej kalibracji.

## 3. Joystick pilota

Środek gałki jest zapamiętywany przy starcie – **nie dotykaj joysticka przez
pierwszą sekundę po włączeniu pilota**. W razie potrzeby użyj bloku
`kalibruj środek joysticka`. Małe wychylenia (poniżej 8 %) są ignorowane.

## Częste problemy

| Problem | Przyczyna / rozwiązanie |
|---|---|
| Robot nie reaguje na pilota | różne grupy radiowe; pilot i robot w różnych środowiskach (MakeCode vs MicroPython); w robocie brak bloku `odbieraj sterowanie z pilota` |
| Robot co chwilę staje podczas jazdy pilotem | słabe baterie w pilocie / zbyt duża odległość; failsafe zatrzymuje robota po 0,5 s bez sygnału |
| W pilocie nie działa przycisk „mode” | stara wersja biblioteki JoyStick miała ten przycisk na P0 zamiast P6 – używaj tej biblioteki |
| Odczyty joysticka „skaczą”, dziwne zachowanie | w programie pilota użyto wyświetlacza LED – wspólne piny z joystickiem |
| Odległość zawsze 0 | złe piny TRIG/ECHO (użyj [wykrywacza pinów](../../examples/makecode/08-find-sensor-pins.ts)); czujnik zasilany 5 V bez dzielnika na ECHO; nic w zasięgu (do ~4 m) |
| Robot resetuje się przy ruszaniu | rozładowane akumulatory |
| Serwo drga, gdy kręcą się silniki (V1) | limit kanałów PWM micro:bita V1 – patrz [sprzęt](sprzet.md#microbit-v1-a-v2) |
| `MemoryError` w MicroPython (V1) | za mało pamięci – skróć program albo użyj micro:bita V2 |
| Serwo buczy w skrajnym położeniu | zmniejsz zakres: `zakres serw: 0° = 600 µs, 180° = 2400 µs` |
