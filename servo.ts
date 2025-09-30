////////////////////
//################//
//##            ##//
//##  servo.ts  ##//
//##            ##//
//################//
////////////////////

enum ServoType {
    Continuous = 0,
    ST90 = 90,
    ST180 = 180,
    ST270 = 270,
    ST360 = 360,
}

namespace Servo {

    export class Device {

        pin: AnalogPin
        servo: ServoType
        minpw: number = 1000
        maxpw: number = 2000

        constructor(_pin: AnalogPin, _type: ServoType) {
            this.pin = _pin
            this.servo = _type
        }

        setPulse(_min: number, _max: number) {
            this.minpw = _min;
            this.maxpw = _max;
        }

        angle(_angle: number) {
            _angle = Math.map(_angle, this.minpw, this.maxpw, 0, this.servo)
            pins.servoSetPulse(this.pin, _angle)
            //pins.servoWritePin(this.pin, _angle)
        }

        speed(_speed: number) {
            _speed = Math.map(_speed, this.minpw, this.maxpw, -100, 100)
            pins.servoSetPulse(this.pin, _speed)
        }
    }

    export function create(_pin: AnalogPin, _type: ServoType): Device {
        let device = new Device(_pin, _type)
        return device
    }
}
