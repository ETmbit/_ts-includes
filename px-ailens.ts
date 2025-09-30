////////////////////////
//####################//
//##                ##//
//##  px-ailens.ts  ##//
//##                ##//
//####################//
////////////////////////

/*
The code below is a refactoring of:
- the ElecFreaks 'pxt-PlanetX-AI' library:
  https://github.com/elecfreaks/pxt-PlanetX-AI/blob/master/main.ts
MIT-license.
*/

enum Recognition {
    //% block="balls"
    //% block.loc.nl="ballen"
    Ball = 7,
    //% block="colors"
    //% block.loc.nl="kleuren"
    Color = 9
}

namespace PxAILens {

    const CameraAddr = 0X14;
    let DataBuffer = pins.createBuffer(9);
    let ITEM = 0

    export function init() {
        let timeout = input.runningTime()
        while (!(pins.i2cReadNumber(CameraAddr, NumberFormat.Int8LE))) {
            if (input.runningTime() - timeout > 30000) {
                while (true) {
                    basic.showString("Init of AI-Lens failed")
                }
            }
        }
    }

    export function setRecognition(item: Recognition): void {
        ITEM = item
        let buff = pins.i2cReadBuffer(CameraAddr, 9)
        buff[0] = 0x20
        buff[1] = item
        pins.i2cWriteBuffer(CameraAddr, buff)
    }

    export function fetch(): void {
        DataBuffer = pins.i2cReadBuffer(CameraAddr, 9)
        basic.pause(30)
    }

    export function readCount(): number {
        if (DataBuffer[0] != ITEM)
            return 0
        return DataBuffer[7]
    }

    export function readID(): number {
        return DataBuffer[8]
    }

    export function readConfidence(): number {
        return 100 - DataBuffer[6]
    }

    export function readPosX(): number {
        return DataBuffer[2]
    }

    export function readPosY(): number {
        return DataBuffer[3]
    }

    export function readSize(): number {
        return DataBuffer[4]
    }

    export function readolor(): Color {
        // measured color numbers:
        // =======================
        // 0 = red
        // 1 = green
        // 2 = blue
        // 3 = yellow
        // 4 = black
        // 5 = orange
        // 6 = white

        switch (DataBuffer[1]) {
            case 0: return Color.Red;
            case 1: return Color.Green;
            case 2: return Color.Blue;
            case 3: return Color.Yellow;
            case 4: return Color.Black;
            case 5: return Color.Orange;
            case 6: return Color.White;
        }
        return Color.None
    }

    export function isColor(color: Color): boolean {
        // measured color numbers:
        // =======================
        // red = 0
        // green = 1
        // blue = 2
        // yellow = 3
        // black = 4
        // orange = 5
        // white = 6

        switch (color) {
            case Color.Red: return (DataBuffer[1] == 0)
            case Color.Green: return (DataBuffer[1] == 1)
            case Color.Blue: return (DataBuffer[1] == 2)
            case Color.Yellow: return (DataBuffer[1] == 3)
            case Color.Black: return (DataBuffer[1] == 4)
            case Color.Orange: return (DataBuffer[1] == 5)
            case Color.White: return (DataBuffer[1] == 6)
        }

        return false
    }
}

PxAILens.init()
