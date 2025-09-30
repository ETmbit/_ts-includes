/////////////////////////
//#####################//
//##                 ##//
//##  nezhabrick.ts  ##//
//##                 ##//
//#####################//
/////////////////////////

/*
The code below is a refactoring of:
- the ElecFreaks 'pxt-nezha' library:
  https://github.com/elecfreaks/pxt-nezha/blob/master/main.ts
MIT-license.
*/

enum ServoPort {
    S1,
    S2,
    S3,
    S4,
}

namespace NezhaBrick {

    // MOTOR MODULE

    // speed in %
    export function motorSpeed(port: MotorPort, speed: number): void {
        speed = Math.map(speed, 0, 100, 0, 150)

        let iic_buffer = pins.createBuffer(4);

        if (speed > 150) speed = 150
        else
            if (speed < -150) speed = -150

        iic_buffer[0] = port + 1
        if (speed >= 0) {
            iic_buffer[1] = 0x01; // forward
            iic_buffer[2] = speed;
        }
        else {
            iic_buffer[1] = 0x02; // reverse
            iic_buffer[2] = -speed;
        }
        iic_buffer[3] = 0;

        pins.i2cWriteBuffer(0x10, iic_buffer);
    }

    // speed in %
    export function twoWheelSpeed(left: number, right: number) {
        // supply positive values to obtain 'forward' spinning
        let ml = Nezha.getMotor(MotorPosition.FrontLeft)
        let mr = Nezha.getMotor(MotorPosition.FrontRight)
        motorSpeed(ml.Port, ml.Revert ? -left : left)
        motorSpeed(mr.Port, mr.Revert ? -right : right)
    }

    // speed in %
    export function fourWheelSpeed(frontleft: number, frontright: number, rearleft: number, rearright: number) {
        // supply positive values to obtain 'forward' spinning
        let mfl = Nezha.getMotor(MotorPosition.FrontLeft)
        let mfr = Nezha.getMotor(MotorPosition.FrontRight)
        let mrl = Nezha.getMotor(MotorPosition.RearLeft)
        let mrr = Nezha.getMotor(MotorPosition.RearRight)
        motorSpeed(mfl.Port, mfl.Revert ? -frontleft : frontleft)
        motorSpeed(mfr.Port, mfr.Revert ? -frontright : frontright)
        motorSpeed(mrl.Port, mrl.Revert ? -rearleft : rearleft)
        motorSpeed(mrr.Port, mrr.Revert ? -rearright : rearright)
    }

    // SERVO MODULE

    let Servos = [180, 180, 180, 180] // all ServoType.ST180

    export function setServoType(port: ServoPort, _type: ServoType) {
        Servos[port] = _type
    }

    export function servoAngle(port: ServoPort, angle: number): void {
        angle = Math.map(angle, 0, Servos[port], 0, 180)
        let iic_buffer = pins.createBuffer(4);
        iic_buffer[0] = 0x10 + port
        iic_buffer[1] = angle;
        iic_buffer[2] = 0;
        iic_buffer[3] = 0;
        pins.i2cWriteBuffer(0x10, iic_buffer);
    }

    export function servoSpeed(port: ServoPort, speed: number): void {
        if (Servos[port] != ServoType.ST180) return
        speed = Math.map(speed, -100, 100, 0, 180)
        let iic_buffer = pins.createBuffer(4);
        iic_buffer[0] = 0x10 + port
        iic_buffer[1] = speed;
        iic_buffer[2] = 0;
        iic_buffer[3] = 0;
        pins.i2cWriteBuffer(0x10, iic_buffer);
    }
}
