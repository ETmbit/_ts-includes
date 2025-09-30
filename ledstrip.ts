///////////////////////
//###################//
//##               ##//
//##  ledstrip.ts  ##//
//##               ##//
//###################//
///////////////////////

enum NeopixelMode {
    GRB = 1,
    RGBW = 2,
    RGB = 3
}

namespace Ledstrip {

    export class Device {

        pin: DigitalPin
        mode: NeopixelMode
        buffer: Buffer
        size: number
        bright: number = 10

        constructor(pin: DigitalPin, leds: number, mode: NeopixelMode) {
            this.pin = pin
            this.mode = mode
            this.size = leds * (mode == NeopixelMode.RGBW ? 4 : 3)
            this.buffer = pins.createBuffer(this.size)
        }

        show() {
            light.sendWS2812Buffer(this.buffer, this.pin)
        }

        setPixelRGB(offset: number, red: number, green: number, blue: number, white: number = 0): void {
            offset *= (this.mode == NeopixelMode.RGBW ? 4 : 3)
            switch (this.mode) {
                case NeopixelMode.GRB:
                    this.buffer[offset + 0] = Math.floor(green * this.bright / 100)
                    this.buffer[offset + 1] = Math.floor(red * this.bright / 100);
                    this.buffer[offset + 2] = Math.floor(blue * this.bright / 100);
                    break;
                case NeopixelMode.RGB:
                    this.buffer[offset + 0] = Math.floor(red * this.bright / 100);
                    this.buffer[offset + 1] = Math.floor(green * this.bright / 100);
                    this.buffer[offset + 2] = Math.floor(blue * this.bright / 100);
                    break;
                case NeopixelMode.RGBW:
                    this.buffer[offset + 0] = Math.floor(red * this.bright / 100);
                    this.buffer[offset + 1] = Math.floor(green * this.bright / 100);
                    this.buffer[offset + 2] = Math.floor(blue * this.bright / 100);
                    this.buffer[offset + 3] = Math.floor(white * this.bright / 100);
                    break;
            }
        }

        setPixelColor(pixel: number, color: Color, white: number = 0): void {
            if (pixel < 0 || pixel >= 8)
                return;
            let rgb = fromColor(color)
            let red = (rgb >> 16) & 0xFF;
            let green = (rgb >> 8) & 0xFF;
            let blue = (rgb) & 0xFF;
            this.setPixelRGB(pixel, red, green, blue, white)
        }

        setRGB(red: number, green: number, blue: number, white: number = 0) {
            for (let i = 0; i < 8; ++i)
                this.setPixelRGB(i, red, green, blue, white)
        }

        setColor(color: Color, white: number = 0) {
            let rgb = fromColor(color)
            let red = (rgb >> 16) & 0xFF;
            let green = (rgb >> 8) & 0xFF;
            let blue = (rgb) & 0xFF;
            for (let i = 0; i < 8; ++i)
                this.setPixelRGB(i, red, green, blue, white)
        }

        setClear(): void {
            this.buffer.fill(0, 0, this.size);
        }

        setBrightness(brightness: number) {
            if (brightness < 0) brightness = 0
            if (brightness > 100) brightness = 100
			// small steps at low brightness and big steps at high brightness
            brightness = (brightness^2 / 100)
            this.bright = brightness
        }

        setRotate(rotation: Rotate): void {
            let offset = (this.mode == NeopixelMode.RGBW ? 4 : 3)
            if (rotation == Rotate.Clockwise)
                this.buffer.rotate(-offset, 0, this.size)
            else
                this.buffer.rotate(offset, 0, this.size)
        }

        rainbow(rotation: Rotate, pace: Pace = Pace.Normal) {
            if (rotation == Rotate.Clockwise) {
                this.setPixelColor(0, Color.Red)
                this.setPixelColor(1, Color.Orange)
                this.setPixelColor(2, Color.Yellow)
                this.setPixelColor(3, Color.Green)
                this.setPixelColor(4, Color.Blue)
                this.setPixelColor(5, Color.Indigo)
                this.setPixelColor(6, Color.Violet)
                this.setPixelColor(7, Color.Purple)
            }
            else {
                this.setPixelColor(7, Color.Red)
                this.setPixelColor(6, Color.Orange)
                this.setPixelColor(5, Color.Yellow)
                this.setPixelColor(4, Color.Green)
                this.setPixelColor(3, Color.Blue)
                this.setPixelColor(2, Color.Indigo)
                this.setPixelColor(1, Color.Violet)
                this.setPixelColor(0, Color.Purple)
            }
            this.show()
            basic.pause(pace)
            pace = (pace + 1) * 75
            for (let i = 0; i < 7; i++) {
                this.setRotate(rotation)
                this.show()
                basic.pause(pace)
            }
        }

        snake(color: Color, rotation: Rotate, pace: Pace = Pace.Normal) {
            let rgb = fromColor(color)
            let red = (rgb >> 16) & 0xFF;
            let green = (rgb >> 8) & 0xFF;
            let blue = (rgb) & 0xFF;
            this.setClear();
            this.show()
            pace = (pace + 1) * 75
            for (let i = 7; i >= 0; i--) {
                if (rotation == Rotate.Clockwise)
                    this.setPixelRGB(7 - i, red, green, blue)
                else
                    this.setPixelRGB(i, red, green, blue)
                this.show()
                basic.pause(pace)
            }
            this.show()
            for (let i = 6; i >= 0; i--) {
                if (rotation == Rotate.Clockwise)
                    this.setPixelRGB(7 - i, 0, 0, 0)
                else
                    this.setPixelRGB(i, 0, 0, 0)
                this.show()
                basic.pause(pace)
            }
            if (rotation == Rotate.Clockwise)
                this.setPixelRGB(0, 0, 0, 0)
            else
                this.setPixelRGB(7, 0, 0, 0)
            this.show()
            basic.pause(pace)
        }
    }

    export function create(pin: DigitalPin, leds: number, mode: NeopixelMode = NeopixelMode.GRB): Device {
        let device = new Device(pin, leds, mode)
        return device
    }
}
