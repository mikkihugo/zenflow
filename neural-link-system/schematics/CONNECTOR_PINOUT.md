# CONNECTOR PINOUT SPECIFICATIONS

## 1. ELECTRODE CONNECTOR (DB-68 HIGH DENSITY)

```
┌─────────────────────────────────────────────────────────────────┐
│                    68-PIN ELECTRODE CONNECTOR                   │
│                         (Female, PCB Mount)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Pin Layout (Top View):                                        │
│                                                                 │
│  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17          │
│  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●          │
│  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●          │
│  18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34          │
│                                                                 │
│  35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51          │
│  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●          │
│  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●          │
│  52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

PIN ASSIGNMENTS:
┌────┬─────────────┬────────────────────────────────────────┐
│Pin │ Signal      │ Description                            │
├────┼─────────────┼────────────────────────────────────────┤
│ 1  │ CH1+        │ Channel 1 Positive (Fp1)              │
│ 2  │ CH1-        │ Channel 1 Negative (Reference)        │
│ 3  │ CH2+        │ Channel 2 Positive (Fp2)              │
│ 4  │ CH2-        │ Channel 2 Negative (Reference)        │
│ 5  │ CH3+        │ Channel 3 Positive (F7)               │
│ 6  │ CH3-        │ Channel 3 Negative (Reference)        │
│... │ ...         │ ... (Channels 4-31)                   │
│ 63 │ CH32+       │ Channel 32 Positive (Oz)              │
│ 64 │ CH32-       │ Channel 32 Negative (Reference)       │
│ 65 │ REF         │ Reference Electrode (A1/A2)           │
│ 66 │ GND_DRL     │ Driven Right Leg Ground               │
│ 67 │ SHIELD      │ Cable Shield                          │
│ 68 │ CHASSIS_GND │ Chassis Ground                        │
└────┴─────────────┴────────────────────────────────────────┘

Electrical Specifications:
• Contact Resistance: < 20mΩ
• Insulation Resistance: > 1000MΩ
• Voltage Rating: 50V
• Current Rating: 1A per contact
• Durability: 10,000 mating cycles
```

## 2. USB-C CONNECTOR (24-PIN)

```
┌───────────────────────────────────────────────────────────┐
│                    USB-C RECEPTACLE                       │
│                    (Top View - PCB)                       │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  A1 A2 A3 A4 A5 A6 A7 A8 A9 A10 A11 A12                 │
│  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●   ●   ●                   │
│  ─────────────────────────────────────                   │
│  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●   ●   ●                   │
│  B12 B11 B10 B9 B8 B7 B6 B5 B4 B3 B2 B1                 │
│                                                           │
└───────────────────────────────────────────────────────────┘

PIN ASSIGNMENTS:
┌─────┬────────┬─────────────────────────────────┐
│ Pin │ Signal │ Description                     │
├─────┼────────┼─────────────────────────────────┤
│ A1  │ GND    │ Ground                         │
│ A2  │ TX1+   │ SuperSpeed TX Positive         │
│ A3  │ TX1-   │ SuperSpeed TX Negative         │
│ A4  │ VBUS   │ Power (5V)                     │
│ A5  │ CC1    │ Configuration Channel 1        │
│ A6  │ D+     │ USB 2.0 Data Positive         │
│ A7  │ D-     │ USB 2.0 Data Negative         │
│ A8  │ SBU1   │ Sideband Use 1 (Debug UART TX)│
│ A9  │ VBUS   │ Power (5V)                     │
│ A10 │ RX2-   │ SuperSpeed RX Negative         │
│ A11 │ RX2+   │ SuperSpeed RX Positive         │
│ A12 │ GND    │ Ground                         │
│ B1  │ GND    │ Ground                         │
│ B2  │ TX2+   │ SuperSpeed TX Positive         │
│ B3  │ TX2-   │ SuperSpeed TX Negative         │
│ B4  │ VBUS   │ Power (5V)                     │
│ B5  │ CC2    │ Configuration Channel 2        │
│ B6  │ D+     │ USB 2.0 Data Positive         │
│ B7  │ D-     │ USB 2.0 Data Negative         │
│ B8  │ SBU2   │ Sideband Use 2 (Debug UART RX)│
│ B9  │ VBUS   │ Power (5V)                     │
│ B10 │ RX1-   │ SuperSpeed RX Negative         │
│ B11 │ RX1+   │ SuperSpeed RX Positive         │
│ B12 │ GND    │ Ground                         │
└─────┴────────┴─────────────────────────────────┘

Power Delivery:
• VBUS: 5V @ 3A (15W standard)
• PD Support: Up to 20V @ 5A (100W)
• CC Resistors: 5.1kΩ pull-down
```

## 3. EXPANSION CONNECTOR (40-PIN)

```
┌─────────────────────────────────────────────────────┐
│            40-PIN EXPANSION HEADER                  │
│               (2x20, 2.54mm pitch)                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Pin 1 ●  ● Pin 2                                  │
│        ●  ● Pin 4   ...continuing to...           │
│        ●  ●                                        │
│        ●  ●                                        │
│        ●  ●                                        │
│        ●  ●                                        │
│        ●  ●                                        │
│        ●  ●                                        │
│        ●  ●                                        │
│ Pin 39 ●  ● Pin 40                                 │
│                                                     │
└─────────────────────────────────────────────────────┘

PIN ASSIGNMENTS:
┌─────┬──────────────┬─────┬──────────────────┐
│ Pin │ Signal       │ Pin │ Signal           │
├─────┼──────────────┼─────┼──────────────────┤
│  1  │ 3.3V         │  2  │ 5V              │
│  3  │ I2C_SDA      │  4  │ 5V              │
│  5  │ I2C_SCL      │  6  │ GND             │
│  7  │ GPIO_0       │  8  │ UART_TX         │
│  9  │ GND          │ 10  │ UART_RX         │
│ 11  │ GPIO_1       │ 12  │ PWM_0           │
│ 13  │ GPIO_2       │ 14  │ GND             │
│ 15  │ GPIO_3       │ 16  │ GPIO_4          │
│ 17  │ 3.3V         │ 18  │ GPIO_5          │
│ 19  │ SPI_MOSI     │ 20  │ GND             │
│ 21  │ SPI_MISO     │ 22  │ GPIO_6          │
│ 23  │ SPI_CLK      │ 24  │ SPI_CS0         │
│ 25  │ GND          │ 26  │ SPI_CS1         │
│ 27  │ I2C_SDA_AUX  │ 28  │ I2C_SCL_AUX     │
│ 29  │ GPIO_7       │ 30  │ GND             │
│ 31  │ GPIO_8       │ 32  │ PWM_1           │
│ 33  │ PWM_2        │ 34  │ GND             │
│ 35  │ ADC_IN0      │ 36  │ GPIO_9          │
│ 37  │ ADC_IN1      │ 38  │ ADC_IN2         │
│ 39  │ GND          │ 40  │ ADC_IN3         │
└─────┴──────────────┴─────┴──────────────────┘

Signal Specifications:
• GPIO: 3.3V CMOS, 8mA drive
• I2C: 400kHz fast mode
• SPI: Up to 20MHz
• UART: Up to 921600 baud
• PWM: 16-bit resolution
• ADC: 12-bit, 0-3.3V range
```

## 4. DEBUG CONNECTOR (10-PIN CORTEX)

```
┌───────────────────────────────────┐
│   ARM CORTEX DEBUG (SWD + UART)  │
│      10-pin, 1.27mm pitch        │
├───────────────────────────────────┤
│                                   │
│   1 ● ● 2                        │
│   3 ● ● 4                        │
│   5 ● ● 6                        │
│   7 ● ● 8                        │
│   9 ● ● 10                       │
│                                   │
└───────────────────────────────────┘

PIN ASSIGNMENTS:
┌─────┬─────────────────────────┐
│ Pin │ Signal                  │
├─────┼─────────────────────────┤
│  1  │ VDD (3.3V Reference)   │
│  2  │ SWDIO/TMS              │
│  3  │ GND                    │
│  4  │ SWCLK/TCK              │
│  5  │ GND                    │
│  6  │ SWO/TDO                │
│  7  │ NC                     │
│  8  │ TDI                    │
│  9  │ GND                    │
│ 10  │ nRESET                 │
└─────┴─────────────────────────┘
```

## 5. AUXILIARY CONNECTOR (12-PIN)

```
┌─────────────────────────────────────┐
│     AUXILIARY I/O CONNECTOR         │
│        12-pin Molex PicoBlade      │
├─────────────────────────────────────┤
│                                     │
│  1  2  3  4  5  6  7  8  9 10 11 12│
│  ▪  ▪  ▪  ▪  ▪  ▪  ▪  ▪  ▪  ▪  ▪  ▪│
│                                     │
└─────────────────────────────────────┘

PIN ASSIGNMENTS:
┌─────┬────────────────────────────┐
│ Pin │ Signal                     │
├─────┼────────────────────────────┤
│  1  │ TRIGGER_IN                │
│  2  │ TRIGGER_OUT               │
│  3  │ SYNC_CLK_IN               │
│  4  │ SYNC_CLK_OUT              │
│  5  │ EVENT_MARKER_1            │
│  6  │ EVENT_MARKER_2            │
│  7  │ ANALOG_OUT_1 (Feedback)   │
│  8  │ ANALOG_OUT_2 (Feedback)   │
│  9  │ ANALOG_REF (1.65V)        │
│ 10  │ EMERGENCY_STOP            │
│ 11  │ GND                       │
│ 12  │ 3.3V_AUX                  │
└─────┴────────────────────────────┘

Signal Specifications:
• Digital I/O: 3.3V CMOS, 50Ω
• Analog Out: 0-3.3V, 12-bit DAC
• Emergency Stop: Active LOW
• Timing Accuracy: <1μs
```

## 6. POWER CONNECTOR (6-PIN)

```
┌───────────────────────────────┐
│    EXTERNAL POWER INPUT       │
│     6-pin Molex Mini-Fit      │
├───────────────────────────────┤
│                               │
│     1    2    3               │
│    ┌─┐  ┌─┐  ┌─┐            │
│    │ │  │ │  │ │            │
│    └─┘  └─┘  └─┘            │
│    ┌─┐  ┌─┐  ┌─┐            │
│    │ │  │ │  │ │            │
│    └─┘  └─┘  └─┘            │
│     4    5    6               │
│                               │
└───────────────────────────────┘

PIN ASSIGNMENTS:
┌─────┬─────────────────────┐
│ Pin │ Signal              │
├─────┼─────────────────────┤
│  1  │ +12V Input         │
│  2  │ +12V Input         │
│  3  │ GND                │
│  4  │ GND                │
│  5  │ Power Enable       │
│  6  │ Power Good Output  │
└─────┴─────────────────────┘

Specifications:
• Voltage: 12V ±5%
• Current: 5A max
• Connector Rating: 8A
• Wire Gauge: 18 AWG
```

## CABLE SPECIFICATIONS

### Electrode Cable Assembly
```
Cable Type: Shielded Twisted Pair
• Conductors: 34 AWG silver-plated copper
• Pairs: 32 differential + 4 auxiliary
• Shield: Aluminum foil + drain wire
• Jacket: Medical-grade PVC
• Length: 1.5m standard
• Flexibility: 10,000 bend cycles
```

### USB-C Cable Requirements
```
• USB 3.2 Gen 2 compliant
• E-Marker chip required for PD
• Length: 1m maximum for full speed
• Shielding: 360° connector shield
```

---

## MATING CONNECTOR PART NUMBERS

| Connector | Manufacturer | Part Number |
|-----------|-------------|-------------|
| DB-68 | Amphenol | MHDM68-F-P-L |
| USB-C | JAE | DX07S024JJ2R1500 |
| 40-pin Header | Samtec | TSW-120-07-G-D |
| Cortex Debug | Samtec | FTSH-105-01-L-DV |
| Aux 12-pin | Molex | 53048-1210 |
| Power 6-pin | Molex | 39-30-1060 |

---

**Note**: All connectors must meet medical device standards for biocompatibility and cleanability.