////////////////////
//################//
//##            ##//
//##  nezha.ts  ##//
//##            ##//
//################//
////////////////////

enum RJPort {
    //% block="port J1"
    //% bloc.loc.nl="poort J1"
    J1,
    //% block="port J2"
    //% bloc.loc.nl="poort J2"
    J2,
    //% block="port J3"
    //% bloc.loc.nl="poort J3"
    J3,
    //% block="port J4"
    //% bloc.loc.nl="poort J4"
    J4,
}

enum RJLine {
    //% block="line A"
    LA,
    //% block="line B"
    LB,
}

enum MotorPort {
    //% block="M1"
    M1,
    //% block="M2"
    M2,
    //% block="M3"
    M3,
    //% block="M4"
    M4,
}

enum MotorPosition {
    Left,
    Right,
    FrontLeft,
    FrontRight,
    RearLeft,
    RearRight,
}

type Motor = {Port:MotorPort, Revert:boolean}

namespace Nezha {

    let AnalogRJ = [AnalogPin.P8, AnalogPin.P1,
    AnalogPin.P12, AnalogPin.P2,
    AnalogPin.P14, AnalogPin.P13,
    AnalogPin.P16, AnalogPin.P15]

    let DigitalRJ = [DigitalPin.P8, DigitalPin.P1,
    DigitalPin.P12, DigitalPin.P2,
    DigitalPin.P14, DigitalPin.P13,
    DigitalPin.P16, DigitalPin.P15]

    let MFL: Motor = {Port:MotorPort.M1, Revert:false}
    let MRL: Motor = {Port:MotorPort.M2, Revert:false}
    let MFR: Motor = {Port:MotorPort.M3, Revert:false}
    let MRR: Motor = {Port:MotorPort.M4, Revert:false}

    export function analogPin(port: RJPort, line: RJLine): AnalogPin {
        return AnalogRJ[port * 2 + line]
    }

    export function digitalPin(port: RJPort, line: RJLine): DigitalPin {
        return DigitalRJ[port * 2 + line]
    }

    export function setTwoWheelMotors(left: Motor, right: Motor) {
        MFL = left
        MFR = right
    }

    export function setFourWheelMotors(frontleft: Motor, frontright: Motor,
        rearleft: Motor, rearright: Motor) {
        MFL = frontleft
        MFR = frontright
        MRL = rearleft
        MFR = rearright
    }

    export function getMotor(position: MotorPosition): Motor {
        switch (position) {
            case MotorPosition.Left: return MFL
            case MotorPosition.Right: return MFR
            case MotorPosition.FrontLeft: return MFL
            case MotorPosition.FrontRight: return MFR
            case MotorPosition.RearLeft: return MRL
            case MotorPosition.RearRight: return MRR
        }
        return MFL
    }
}
