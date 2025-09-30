////////////////////
//################//
//##            ##//
//##  dht22.ts  ##//
//##            ##//
//################//
////////////////////

/*
The DHT code is a refactory of an older version of the tinkertanker library:
https://github.com/tinkertanker/pxt-iot-environment-kit/releases/tag/v5.2.7
(MIT-license)
Note that the latest release does not work
*/

type TemperatureHumidity = number[]

const Temperature = 0
const Humidity = 1

namespace DHT22 {

    export class Device {

        pin: DigitalPin

        constructor(pin: DigitalPin) {
            this.pin = pin
        }

        read(): TemperatureHumidity {
            const timeout = 100
            const buffer = pins.createBuffer(40)
            const data = [0, 0, 0, 0, 0]
            let temp = 0
            let hum = 0
            let startTime = control.micros()

            // 1.start signal
            pins.digitalWritePin(this.pin, 0)
            basic.pause(18)

            // 2.pull up and wait 40us
            pins.setPull(this.pin, PinPullMode.PullUp)
            pins.digitalReadPin(this.pin)
            control.waitMicros(40)

            // 3.read data
            startTime = control.micros()
            while (pins.digitalReadPin(this.pin) === 0) {
                if (control.micros() - startTime > timeout) break
            }
            startTime = control.micros()
            while (pins.digitalReadPin(this.pin) === 1) {
                if (control.micros() - startTime > timeout) break
            }

            for (let dataBits = 0; dataBits < 40; dataBits++) {
                startTime = control.micros()
                while (pins.digitalReadPin(this.pin) === 1) {
                    if (control.micros() - startTime > timeout) break
                }
                startTime = control.micros()
                while (pins.digitalReadPin(this.pin) === 0) {
                    if (control.micros() - startTime > timeout) break
                }
                control.waitMicros(28)
                if (pins.digitalReadPin(this.pin) === 1) {
                    buffer[dataBits] = 1
                }
            }

            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 8; j++) {
                    if (buffer[8 * i + j] === 1) {
                        data[i] += 2 ** (7 - j)
                    }
                }
            }

            if (((data[0] + data[1] + data[2] + data[3]) & 0xff) === data[4]) {
                hum = (data[0] << 8) | data[1]
                hum *= 0.1
                temp = data[2] + data[3] * 0.1
            }
            return [temp, hum]
        }
    }

    export function create(pin: DigitalPin): Device {
        let device = new Device(pin)
        return device
    }
}
