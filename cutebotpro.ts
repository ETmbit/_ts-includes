/////////////////////////
//#####################//
//##                 ##//
//##  cutebotpro.ts  ##//
//##                 ##//
//#####################//
/////////////////////////

enum Led {
    //% block="left led"
    //% block.loc.nl="linker led"
    Left,
    //% block="right led"
    //% block.loc.nl="rechter led"
    Right,
    //% block="both leds"
    //% block.loc.nl="beide leds"
    Both
}

enum ServoPort {
    S1,
    S2,
    S3,
    S4,
}

enum GpioPort {
    G1,
    G2,
    G3,
    G4,
}

namespace CutebotPro {
    // supports CutebotPro V2

    const cutebotProAddr = 0x10

    let trackType = TrackType.BlackOnWhite

    let AnalogGP = [AnalogPin.P1, AnalogPin.P2, AnalogPin.P13, AnalogPin.P14]
    let DigitalGP = [DigitalPin.P1, DigitalPin.P2, DigitalPin.P13, DigitalPin.P14]

    function delay_ms(ms: number) {
        let endTime = input.runningTime() + ms;
        while (endTime > input.runningTime()) { }
    }

    export function pid_delay_ms(ms: number) {
        let time = control.millis() + ms
        while (1) {
            i2cCommandSend(0xA0, [0x05])
            if (pins.i2cReadNumber(cutebotProAddr, NumberFormat.UInt8LE, false) || control.millis() >= time) {
                basic.pause(500)
                break
            }
            basic.pause(10)
        }
    }

    export function i2cCommandSend(command: number, params: number[]) {
        let buff = pins.createBuffer(params.length + 4);
        buff[0] = 0xFF;
        buff[1] = 0xF9;
        buff[2] = command;
        buff[3] = params.length;
        for (let i = 0; i < params.length; i++) {
            buff[i + 4] = params[i];
        }
        pins.i2cWriteBuffer(cutebotProAddr, buff);
        delay_ms(1);
    }

    // MOTION MODULE

    export function speed(left: number, right: number): void {
        // speed in % [-100, 100]

        let direction: number = 0;
        if (left < 0) direction |= 0x01;
        if (right < 0) direction |= 0x02;
        i2cCommandSend(0x10, [2, Math.abs(left), Math.abs(right), direction]);
    }

    export function move(speed: number, distance: number): void {
        // speed in % [-100, -40] backward and [40, 100] forward
        // distance in cm [0, 6000]

        distance = ((distance > 6000 ? 6000 : distance) < 0 ? 0 : distance);
        distance *= 10 // cm to mm
        let distance_h = distance >> 8;
        let distance_l = distance & 0xFF;

        let direction2: number
        if (speed <= 0) {
            speed = -speed
            direction2 = 3
        } else
            direction2 = 0

        speed *= 5 // % to mm/s
        speed = ((speed > 500 ? 500 : speed) < 200 ? 200 : speed);
        let speed_h = speed >> 8;
        let speed_l = speed & 0xFF;

        i2cCommandSend(0x84, [distance_h, distance_l, speed_h, speed_l, direction2]);
        pid_delay_ms(Math.round(distance * 1.0 / 1000 * 8000 + 3000))
    }

    // MOTOR MODULE

    export function motor(speed: number): void {
        let direction: number = (speed > 0 ? 1 : 0)
        i2cCommandSend(0x30, [Math.abs(speed), direction])
    }

    // SERVO MODULE

    export function servoAngle(port: ServoPort, angle: number, _type: ServoType = ServoType.ST180) {
        angle = Math.map(angle, 0, _type, 0, 180)
        i2cCommandSend(0x40, [port, angle])
    }

    export function servoSpeed(port: ServoPort, speed: number) {
        speed = Math.map(speed, -100, 100, 0, 180)
        i2cCommandSend(0x40, [port, speed])
    }

    // LED MODULE

    export function ledColor(led: Led, color: Color): void {
        let rgbval = fromColor(color)
        let red = (rgbval >> 16) & 0xFF;
        let green = (rgbval >> 8) & 0xFF;
        let blue = (rgbval) & 0xFF;
        i2cCommandSend(0x20, [led, red, green, blue]);
    }

    // TRACKING MODULE

    export function setTrackType(_type: TrackType) {
        trackType = _type
    }

    export function readTrack(): Track {
        i2cCommandSend(0x60, [0x00])
        let state = pins.i2cReadNumber(cutebotProAddr, NumberFormat.UInt8LE, true)
        // From left to right the track sensors represent a bit in 'state'.
        // This agrees with the 'Track' extension. So use it without conversion.
        let track = (state & 3) + ((state & 12) << 1)
        track = trackPosition(track, TrackMask.Track4, trackType)
        return track
    }

    export function isTrackAtLeft(): boolean {
        let state = readTrack()
        let track = trackPosition(state, TrackMask.Track4, trackType)
        return (track == Track.Left || track == Track.FarLeft)
    }

    export function isTrackAtRight(): boolean {
        let state = readTrack()
        let track = trackPosition(state, TrackMask.Track4, trackType)
        return (track == Track.Right || track == Track.FarRight)
    }

    export function isOnTrack(): boolean {
        let state = readTrack()
        let track = trackPosition(state, TrackMask.Track4, trackType)
        return (track == Track.Mid)
    }

    export function isOffTrack(): boolean {
        let state = readTrack()
        let track = trackPosition(state, TrackMask.Track4, trackType)
        return (track == Track.OffTrack)
    }

    // DISTANCE MODULE

    export function readDistance(): number {
        // send pulse

        pins.setPull(DigitalPin.P8, PinPullMode.PullNone);
        pins.digitalWritePin(DigitalPin.P8, 0);
        control.waitMicros(2);
        pins.digitalWritePin(DigitalPin.P8, 1);
        control.waitMicros(10);
        pins.digitalWritePin(DigitalPin.P8, 0);

        // read pulse

        // the next code is replacing the original since
        // driving the motors causes interference with pulseIn

        while (!pins.digitalReadPin(DigitalPin.P12)) { }
        let tm1 = input.runningTimeMicros()
        while (pins.digitalReadPin(DigitalPin.P12)) {
            if (input.runningTimeMicros() - tm1 > 7288)
                return 999 // timeout at further than 250 cm
        }
        let tm2 = input.runningTimeMicros()
        let dist = (tm2 - tm1) * 343 / 20000
        return Math.floor(dist)
    }

    // GPIO MODULE

    export function analogPin(port: GpioPort): AnalogPin {
        return AnalogGP[port]
    }

    export function digitalPin(port: GpioPort): DigitalPin {
        return DigitalGP[port]
    }
}
