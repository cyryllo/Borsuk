# Sprzęt, połączenia i budowa

## Lista części (robot v2)

| Część | Ilość | Uwagi |
|---|---|---|
| BBC micro:bit V1 lub V2 | 1 | V2 zalecany (więcej pamięci, głośnik) |
| Waveshare *Motor Driver for micro:bit* | 1 | sterownik 2 silników DC + 3 złącza serw |
| Silnik DC z przekładnią („żółty TT”) + koło | 2 | wersja v1: 2 × serwo 360° (np. FS90R) |
| Ultradźwiękowy czujnik odległości | 1 | z logiką **3,3 V** (model do uzupełnienia), patrz niżej |
| Kółko podporowe / ślizg | 1 | |
| Koszyk na akumulatory | 1 | na wizualizacji: 2 ogniwa z tyłu robota |
| Sklejka 3 mm | arkusz min. 160 × 370 mm | plik [`hardware/Borsuk_v2.dxf`](../hardware/Borsuk_v2.dxf) |
| Śruby M2/M2,5/M3 + nakrętki | kpl. | otwory Ø2,3–2,4 mm i Ø3 mm |

> *Uzupełnij typ akumulatorów, kółka podporowego i śrub, jeśli różnią się od Twojej wersji.*

## Wycinanie i składanie

- Plik: [`hardware/Borsuk_v2.dxf`](../hardware/Borsuk_v2.dxf), jednostki **mm**, wszystkie
  części na jednym arkuszu **148 × 360 mm**. Podgląd: [`hardware/Borsuk_v2_podglad.svg`](../hardware/Borsuk_v2_podglad.svg).
- Gniazda na wpusty mają **3 × 7 mm**, więc konstrukcja jest pod sklejkę **3 mm**.
  Przy grubszej/cieńszej sklejce przeskaluj gniazda, nie cały rysunek.
- Części: 2 boki (z otworami na silniki i rzędami otworów montażowych), podstawa,
  przód z „buzią” i otworami na czujnik, tył, perforowana płyta górna,
  drobne elementy (podkładki, zaczepy).

Więcej w [`hardware/README.md`](../hardware/README.md).

![Podgląd DXF](../hardware/Borsuk_v2_podglad.svg)

## Połączenia – robot

micro:bit wkłada się w złącze krawędziowe sterownika Waveshare. Piny są stałe:

| Funkcja | Pin micro:bit |
|---|---|
| Silnik A (lewy) – PWM / IN1 / IN2 | P8 / P13 / P12 |
| Silnik B (prawy) – PWM / IN1 / IN2 | P16 / P14 / P15 |
| Serwo S0 (v1: lewe koło) | P0 |
| Serwo S1 (v1: prawe koło) | P1 |
| Serwo S2 (np. „głowa”, chwytak) | P2 |
| Czujnik odległości TRIG / ECHO | wolne piny złącza płytki rozszerzeń (do uzupełnienia); w bibliotece domyślnie P1 / P2 |

Wolne piny do czujników: P1, P2 (gdy nie używasz S1/S2), P5 i P11 (przyciski A/B),
P19/P20 (I²C), a po wyłączeniu wyświetlacza (`led.enable(false)`) także P3, P4, P6, P7, P9, P10.

### Czujnik odległości – uwaga na 5 V!

W robotach Borsuk używamy czujnika z logiką **3,3 V**, podłączonego do wolnych pinów
złącza płytki rozszerzeń. Piny ustawiasz blokiem `czujnik odległości TRIG … ECHO …`
(MicroPython: `robot.set_distance_sensor(trig, echo)`).

> *Do uzupełnienia: dokładny model czujnika i numery pinów.*

Jeśli kupujesz czujnik samodzielnie:

Klasyczny **HC-SR04** wymaga 5 V i oddaje na pinie ECHO sygnał **5 V**, który może
**uszkodzić micro:bita** (wejścia tolerują maks. 3,6 V). Użyj:

- **HC-SR04P** lub **RCWL-1601** – działają z 3,3 V, podłączasz bezpośrednio,
- albo dzielnika napięcia na ECHO (np. 1 kΩ + 2 kΩ),
- albo czujnika **Grove Ultrasonic Ranger** (jeden pin sygnałowy – w bloku ustaw TRIG = ECHO).

## Pilot

![Pilot z joystickiem](../images/pilot-joystick.jpg)

| Element | Pin micro:bit |
|---|---|
| Przycisk góra | P10 |
| Przycisk dół | P8 |
| Przycisk lewo | P11 (= przycisk B micro:bita) |
| Przycisk prawo | P9 |
| Select | P7 |
| Mode | P6 |
| Joystick X / Y | P4 / P3 |
| Wciśnięcie joysticka | P5 (= przycisk A micro:bita) |
| Buzzer | P0 |

Piny P3, P4, P6, P7, P9 i P10 są współdzielone z **wyświetlaczem LED** micro:bita,
dlatego biblioteka **wyłącza wyświetlacz** w pilocie. Nie używaj w pilocie bloków
wyświetlacza; zamiast tego używaj dźwięku (buzzer na P0, bloki *Muzyka*).

## micro:bit V1 a V2

- Obie wersje są obsługiwane (MakeCode kompiluje do obu).
- **V1** potrafi jednocześnie generować PWM tylko na ograniczonej liczbie pinów
  (w praktyce 3). Wystarcza to na 2 silniki + 1 serwo albo 2 serwa kół + 1 serwo.
  Jeśli serwo zaczyna „wariować”, gdy jadą silniki, to właśnie ten limit.
- **V2** gra dźwięk jednocześnie na głośniku i na pinie **P0**. W robocie P0 to serwo S0,
  więc w robocie v1 (serwa kół na S0/S1) nie używaj bloków *Muzyka* – koło by „tańczyło”.
  W pilocie to zaleta: buzzer pilota jest właśnie na P0.

## Zasilanie

- Silniki/serwa zasila sterownik Waveshare ze swojego źródła (koszyk akumulatorów).
- Gdy robot się „resetuje” przy ruszaniu, akumulatory są za słabe albo rozładowane.
- Pilot można zasilać z USB, z koszyka 2 × AAA micro:bita lub z gniazda DC na płytce pilota.
