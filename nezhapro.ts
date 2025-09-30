///////////////////////
//###################//
//##               ##//
//##  nezhapro.ts  ##//
//##               ##//
//###################//
///////////////////////

/*
The code below is a refactoring of:
- the ElecFreaks 'pxt-nezha2' library:
  https://github.com/elecfreaks/pxt-nezha2/blob/master/main.ts
MIT-license.
*/

namespace NezhaPro {

    let i2cAddr: number = 0x10;
    let servoSpeedGlobal = 900
    let relAngleArr = [0, 0, 0, 0];

    let MFL: Motor = { Port: MotorPort.M1, Revert: false }
    let MRL: Motor = { Port: MotorPort.M2, Revert: false }
    let MFR: Motor = { Port: MotorPort.M3, Revert: false }
    let MRR: Motor = { Port: MotorPort.M4, Revert: false }

    enum Mode {
        Circle = 1,
        Degree = 2,
        Second = 3
    }

    enum DelayMode {
        AutoDelayStatus = 1,
        NoDelay = 0
    }

    function delayMs(ms: number): void {

        let time = input.runningTime() + ms
        while (time >= input.runningTime()) { }
    }

    function motorDelay(value: number, motorFunction: Mode) {

        let delayTime = 0;
        if (value == 0 || servoSpeedGlobal == 0) {
            return;
        } else if (motorFunction == Mode.Circle) {
            delayTime = value * 360000.0 / servoSpeedGlobal + 500;
        } else if (motorFunction == Mode.Second) {
            delayTime = (value * 1000);
        } else if (motorFunction == Mode.Degree) {
            delayTime = value * 1000.0 / servoSpeedGlobal + 500;
        }
        basic.pause(delayTime);
    }

    function _move(motor: MotorPort, rotation: Rotate, value: number, mode: Mode): void {

        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor + 1;
        buf[3] = rotation + 1;
        buf[4] = 0x70;
        buf[5] = (value >> 8) & 0XFF;
        buf[6] = mode;
        buf[7] = (value >> 0) & 0XFF;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }

    function _turnToAngle(motor: MotorPort, rotation: Rotate, angle: number, isDelay: DelayMode = DelayMode.AutoDelayStatus): void {

        while (angle < 0)
            angle += 360
        angle %= 360
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor + 1;
        buf[3] = 0x00;
        buf[4] = 0x5D;
        buf[5] = (angle >> 8) & 0XFF;
        buf[6] = rotation + 1;
        buf[7] = (angle >> 0) & 0XFF;
        pins.i2cWriteBuffer(i2cAddr, buf);
        delayMs(4); // due to bug in ???
        if (isDelay)
            motorDelay(0.5, Mode.Second)
    }

    function _start(motor: MotorPort, rotation: Rotate, speed: number): void {
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor + 1;
        buf[3] = rotation + 1;
        buf[4] = 0x60;
        buf[5] = Math.floor(speed);
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }

    function _stop(motor: MotorPort): void {
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor + 1;
        buf[3] = 0x00;
        buf[4] = 0x5F;
        buf[5] = 0x00;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }

    function _readSpeed(motor: MotorPort): number {
        delayMs(4)
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor + 1;
        buf[3] = 0x00;
        buf[4] = 0x47;
        buf[5] = 0x00;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
        delayMs(4)
        let arr = pins.i2cReadBuffer(i2cAddr, 2);
        let retData = (arr[1] << 8) | (arr[0]);
        return Math.floor(retData / 3.6) * 0.01;
    }

    function _readAngle(motor: MotorPort): number {
        delayMs(4)
        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor + 1;
        buf[3] = 0x00;
        buf[4] = 0x46;
        buf[5] = 0x00;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
        delayMs(4)
        let arr = pins.i2cReadBuffer(i2cAddr, 4);
        return (arr[3] << 24) | (arr[2] << 16) | (arr[1] << 8) | (arr[0]);
    }

    function _absAngle(motor: MotorPort): number {
        let position = _readAngle(motor)
        while (position < 0) {
            position += 3600;
        }
        return (position % 3600) * 0.1;
    }

    function _setRelAngleNullPos(motor: MotorPort) {
        relAngleArr[motor] = _readAngle(motor);
    }

    function _relAngle(motor: MotorPort): number {
        return (_readAngle(motor) - relAngleArr[motor]) * 0.1;
    }

    function _setServoSpeed(speed: number): void {
        if (speed < 0) speed = 0;
        speed *= 9;
        servoSpeedGlobal = speed;
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = 0x00;
        buf[3] = 0x00;
        buf[4] = 0x77;
        buf[5] = (speed >> 8) & 0XFF;
        buf[6] = 0x00;
        buf[7] = (speed >> 0) & 0XFF;
        pins.i2cWriteBuffer(i2cAddr, buf);
    }

    function _reset(motor: MotorPort): void {
        let buf = pins.createBuffer(8)
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = motor + 1;
        buf[3] = 0x00;
        buf[4] = 0x1D;
        buf[5] = 0x00;
        buf[6] = 0xF5;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
        relAngleArr[motor - 1] = 0;
        motorDelay(1, Mode.Second)
    }

    function _version(): string {
        let buf = pins.createBuffer(8);
        buf[0] = 0xFF;
        buf[1] = 0xF9;
        buf[2] = 0x00;
        buf[3] = 0x00;
        buf[4] = 0x88;
        buf[5] = 0x00;
        buf[6] = 0x00;
        buf[7] = 0x00;
        pins.i2cWriteBuffer(i2cAddr, buf);
        let version = pins.i2cReadBuffer(i2cAddr, 3);
        return `V ${version[0]}.${version[1]}.${version[2]}`;
    }

    // MOTOR MODULE

    // speed in %
    export function motorSpeed(motor: MotorPort, speed: number): void {
        _start(motor, speed >= 0 ? Rotate.Clockwise : Rotate.AntiClockwise, speed)
    }

    // speed in %
    export function twoWheelSpeed(left: number, right: number) {
        // supply positive values to obtain 'forward' Rotatening
        let ml = Nezha.getMotor(MotorPosition.FrontLeft)
        let mr = Nezha.getMotor(MotorPosition.FrontRight)
        motorSpeed(ml.Port, ml.Revert ? -left : left)
        motorSpeed(mr.Port, mr.Revert ? -right : right)
    }

    // speed in %
    export function fourWheelSpeed(frontleft: number, frontright: number, rearleft: number, rearright: number) {
        // supply positive values to obtain 'forward' Rotatening
        let mfl = Nezha.getMotor(MotorPosition.FrontLeft)
        let mfr = Nezha.getMotor(MotorPosition.FrontRight)
        let mrl = Nezha.getMotor(MotorPosition.RearLeft)
        let mrr = Nezha.getMotor(MotorPosition.RearRight)
        motorSpeed(mfl.Port, mfl.Revert ? -frontleft : frontleft)
        motorSpeed(mfr.Port, mfr.Revert ? -frontright : frontright)
        motorSpeed(mrl.Port, mrl.Revert ? -rearleft : rearleft)
        motorSpeed(mrr.Port, mrr.Revert ? -rearright : rearright)
    }

    export function twoWheelStop() {
        let ml = Nezha.getMotor(MotorPosition.Left)
        let mr = Nezha.getMotor(MotorPosition.Right)
        _stop(ml.Port)
        _stop(mr.Port)
    }

    export function fourWheelStop() {
        _stop(MotorPort.M1)
        _stop(MotorPort.M2)
        _stop(MotorPort.M3)
        _stop(MotorPort.M4)
    }

    // angle in degrees
    export function motorAngle(motor: Motor, rotation: Rotate, angle: number, speed: number = 100): void {
        _setServoSpeed(speed)
        _turnToAngle(motor.Port, rotation, angle)
    }

    // angle in degrees
    export function readMotorAngle(motor: Motor): number {
        return _absAngle(motor.Port)
    }
}
