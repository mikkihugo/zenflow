# PCB LAYOUT DESIGN - NEURAL LINK SYSTEM

## MAIN BOARD PCB LAYOUT (6-LAYER HDI)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          TOP LAYER - COMPONENT PLACEMENT                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│  │
│  │  │ ADS  │ │ ADS  │ │ ADS  │ │ ADS  │ │ ADS  │ │ ADS  │ │ ADS  │ │ ADS  ││  │
│  │  │ 1299 │ │ 1299 │ │ 1299 │ │ 1299 │ │ 1299 │ │ 1299 │ │ 1299 │ │ 1299 ││  │
│  │  │  #1  │ │  #2  │ │  #3  │ │  #4  │ │  #5  │ │  #6  │ │  #7  │ │  #8  ││  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘│  │
│  │                                                                             │  │
│  │  ┌─────────────────┐  ┌────────────────────────┐  ┌─────────────────────┐│  │
│  │  │                 │  │                        │  │                     ││  │
│  │  │   STM32H743     │  │    Spartan-7 FPGA     │  │   DDR4 Memory      ││  │
│  │  │   480MHz MCU    │  │    XC7S50-1CSGA324    │  │   512MB            ││  │
│  │  │   BGA-240       │  │    324-pin BGA        │  │   96-ball FBGA     ││  │
│  │  │                 │  │                        │  │                     ││  │
│  │  └─────────────────┘  └────────────────────────┘  └─────────────────────┘│  │
│  │                                                                             │  │
│  │  ┌──────┐  ┌──────┐  ┌─────────────┐  ┌──────────┐  ┌─────────────────┐│  │
│  │  │ESP32 │  │nRF52 │  │  Power      │  │ Crystal  │  │   USB-C        ││  │
│  │  │ WiFi │  │ BLE  │  │  Management │  │ 25MHz    │  │   Connector    ││  │
│  │  └──────┘  └──────┘  └─────────────┘  └──────────┘  └─────────────────┘│  │
│  │                                                                             │  │
│  │  64x Analog Input Channels (Bottom Edge)                                   │  │
│  │  ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○      │  │
│  │  ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○      │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  Board Dimensions: 120mm x 80mm                                                │
└─────────────────────────────────────────────────────────────────────────────────┘

LAYER STACKUP:
┌─────────────────────┐
│ L1: Signal (Top)    │ ← Component placement, high-speed signals
├─────────────────────┤
│ L2: Ground Plane    │ ← Solid ground reference
├─────────────────────┤
│ L3: Power Planes    │ ← Split planes: 3.3V, 1.8V, 1.2V, 5V
├─────────────────────┤
│ L4: Signal (Inner)  │ ← SPI buses, I2C, control signals  
├─────────────────────┤
│ L5: Ground Plane    │ ← Second ground reference
├─────────────────────┤
│ L6: Signal (Bottom) │ ← Power routing, low-speed signals
└─────────────────────┘

Material: FR-4, εr = 4.3
Thickness: 1.6mm
Copper: 1oz (35μm) outer, 0.5oz inner
Via: 0.2mm drill, 0.1mm finished
Trace/Space: 0.1mm/0.1mm minimum
```

## ANALOG FRONT-END SECTION

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ANALOG SIGNAL CONDITIONING                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CHANNEL 1-8 (Repeated 8x for 64 channels)                                │
│                                                                             │
│     ESD          FILTER         AMP          ADC                           │
│   ┌─────┐      ┌─────┐      ┌─────┐      ┌─────┐                         │
│   │ TVS │      │ RC  │      │AD8428│     │ADS  │                         │
│ ○─┤     ├──────┤     ├──────┤     ├──────┤1299 │                         │
│   │     │      │     │      │G=2000│     │ Ch1 │                         │
│   └─────┘      └─────┘      └─────┘      └─────┘                         │
│                                                                             │
│   Layout Rules:                                                            │
│   • Differential pairs: 100Ω ±10%                                         │
│   • Guard rings around sensitive analog                                    │
│   • Star ground at ADC                                                    │
│   • Isolation gap: >1mm from digital                                      │
│   • Shielding: Faraday cage over analog                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## HIGH-SPEED DIGITAL ROUTING

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FPGA TO MCU INTERFACE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   FPGA                Length Matching               MCU                     │
│  ┌─────┐            ╔═══════════════╗            ┌─────┐                  │
│  │     │            ║               ║            │     │                  │
│  │     ├────────────╬═══════════════╬────────────┤     │ SPI_CLK (80MHz) │
│  │     ├────────────╬═══════════════╬────────────┤     │ SPI_MOSI        │
│  │     ├────────────╬═══════════════╬────────────┤     │ SPI_MISO        │
│  │     ├────────────╬═══════════════╬────────────┤     │ SPI_CS          │
│  │     │            ╚═══════════════╝            │     │                  │
│  └─────┘            All traces ±0.5mm            └─────┘                  │
│                                                                             │
│  Design Rules:                                                             │
│  • Impedance: 50Ω ±10% single-ended                                       │
│  • Differential: 100Ω ±10%                                                │
│  • Max length: 50mm                                                       │
│  • Via stubs: < 0.5mm                                                     │
│  • Reference plane: Continuous ground                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## POWER DISTRIBUTION NETWORK

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      POWER DISTRIBUTION NETWORK                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  USB-C Power                     Regulators                   Distribution │
│  ┌──────┐      ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │ VBUS ├──────┤  5V to   ├────┤  3.3V    ├────┤ Ferrite  ├──→ Analog  │
│  │ 5V   │      │  3.3V    │    │  LDO     │    │  Bead    │    3.3V    │
│  └──────┘      │  Buck    │    │  Linear  │    └──────────┘             │
│                └─────┬────┘    └──────────┘                              │
│                      │                                                     │
│                      │         ┌──────────┐    ┌──────────┐             │
│                      └─────────┤  3.3V to ├────┤  1.8V    ├──→ FPGA    │
│                                │  1.8V    │    │  Core    │    1.8V    │
│                                │  Buck    │    └──────────┘             │
│                                └──────────┘                              │
│                                                                           │
│  Decoupling Strategy:                                                    │
│  • 0.1μF ceramic at each power pin                                      │
│  • 10μF ceramic per power rail section                                  │
│  • 100μF electrolytic at regulators                                     │
│  • Power plane capacitance: ~5nF                                        │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## EMI/EMC CONSIDERATIONS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EMI SHIELDING DESIGN                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                          Shield Can (Tin-plated steel)               │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │                                                               │   │  │
│  │  │   Sensitive Analog Section        Digital Section            │   │  │
│  │  │  ┌──────────────────┐           ┌──────────────────┐       │   │  │
│  │  │  │                  │  Ferrite  │                  │       │   │  │
│  │  │  │  ADCs & Amps    │◄──Beads──►│  FPGA & MCU     │       │   │  │
│  │  │  │                  │           │                  │       │   │  │
│  │  │  └──────────────────┘           └──────────────────┘       │   │  │
│  │  │                                                               │   │  │
│  │  │  Ground Moat ══════════════════════════════════════════     │   │  │
│  │  │                                                               │   │  │
│  │  └─────────────────────────────────────────────────────────────┘   │  │
│  │                                                                      │  │
│  │  Gasket Material: Conductive Fabric over Foam                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  EMC Design Features:                                                      │
│  • Common mode chokes on all I/O                                          │
│  • TVS diodes on all external connections                                 │
│  • Filtered connectors                                                    │
│  • Continuous ground plane with minimal slots                             │
│  • Return current path analysis completed                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## THERMAL MANAGEMENT

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THERMAL DESIGN                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    Heat Spreader (Aluminum)                                │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│           │                    │                    │                       │
│      Thermal Pad          Thermal Pad          Thermal Pad                 │
│           │                    │                    │                       │
│      ┌─────────┐         ┌─────────┐         ┌─────────┐                 │
│      │  FPGA   │         │   MCU   │         │  Power  │                 │
│      │  ~2W    │         │  ~0.3W  │         │  Regs   │                 │
│      └─────────┘         └─────────┘         └─────────┘                 │
│                                                                             │
│  Thermal Resistance:                                                       │
│  • Junction to Case: 5°C/W (FPGA)                                         │
│  • Case to Heatsink: 0.5°C/W (thermal pad)                               │
│  • Heatsink to Ambient: 10°C/W                                           │
│  • Max Junction Temp: 85°C                                                │
│  • Ambient Operating: 25°C                                                │
│                                                                             │
│  Thermal Vias: 0.3mm diameter, 1mm pitch under hot components            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## MANUFACTURING NOTES

```
PCB FABRICATION REQUIREMENTS:
• Technology: HDI (High Density Interconnect)
• Layers: 6
• Material: FR-4 TG170
• Finished Thickness: 1.6mm ±10%
• Copper Weight: 1oz outer, 0.5oz inner
• Surface Finish: ENIG (Gold over Nickel)
• Soldermask: Green, LPI
• Silkscreen: White, both sides
• Min Trace/Space: 0.1mm/0.1mm
• Min Via: 0.2mm drill, 0.1mm finished
• Impedance Control: ±10%
• IPC Class: 3 (High Reliability)

ASSEMBLY NOTES:
• Solder Paste: SAC305, Type 4
• Stencil Thickness: 0.12mm
• Component Placement: ±0.05mm
• Reflow Profile: Per component datasheets
• X-Ray Inspection: Required for BGA
• ICT Testing: Required
• Functional Test: 100% coverage
• Conformal Coating: Parylene C, 25μm

CRITICAL COMPONENTS:
1. ADS1299: Moisture sensitive, handle with care
2. FPGA: ESD sensitive, use proper grounding
3. Crystal: Hand solder to avoid mechanical stress
4. Connectors: Apply no-clean flux before soldering
```

---

## FILES REQUIRED FOR MANUFACTURING

1. **Gerber Files**: All layers, drill files, pick & place
2. **3D Model**: STEP file for mechanical integration  
3. **BOM**: Complete with manufacturer part numbers
4. **Assembly Drawing**: Component orientation, special notes
5. **Test Procedures**: ICT and functional test specs

---

**Note**: This PCB design requires professional layout software (Altium, KiCad) and should be reviewed by a certified PCB designer before manufacturing.