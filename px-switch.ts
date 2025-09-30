////////////////////////
//####################//
//##                ##//
//##  px-switch.ts  ##//
//##                ##//
//####################//
////////////////////////

/*
The code below is a refactoring of:
- the ElecFreaks 'pxt-PlanetX' library:
  https://github.com/elecfreaks/pxt-PlanetX/blob/master/basic.ts
MIT-license.
*/

enum Switch {
    //% block="released"
    //% block.loc.nl="losgelaten"
    Released,
    //% block="pressed"
    //% block.loc.nl="ingedrukt"
    Pressed,
}

namespace PxSwitch {

    export class Device {

        port: RJPort

        constructor(port: RJPort) {
            this.port = port
        }

        read(): Switch {
            let pin = Nezha.digitalPin(this.port, RJLine.LA)
            pins.setPull(pin, PinPullMode.PullUp)
            let sensor = pins.digitalReadPin(pin)
            return (sensor ? Switch.Released : Switch.Pressed)
        }
    }

    export function create(port: RJPort): Device {
        let device = new Device(port)
        return device
    }
}
