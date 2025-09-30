//////////////////////////
//######################//
//##                  ##//
//##  px-distance.ts  ##//
//##                  ##//
//######################//
//////////////////////////

namespace PxDistance {

    export class Device {

        trigger: DigitalPin
        echo: DigitalPin

        constructor(port: RJPort) {
            this.echo = Nezha.digitalPin(port, RJLine.LA)
            this.trigger = Nezha.digitalPin(port, RJLine.LB)
        }

        read(): number {
            pins.digitalWritePin(this.trigger, 0)
            control.waitMicros(2)
            pins.digitalWritePin(this.trigger, 1)
            control.waitMicros(10)
            pins.digitalWritePin(this.trigger, 0)
            let distance = Math.idiv(pins.pulseIn(this.echo, PulseValue.High), 58)
            return distance
        }
    }

    export function create(port: RJPort): Device {
        let device = new Device(port)
        return device
    }
}
