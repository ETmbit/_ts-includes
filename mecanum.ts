//////////////////////
//##################//
//##              ##//
//##  mecanum.ts  ##//
//##              ##//
//##################//
//////////////////////

namespace Mecanum {

    /* calibrated values for wheel configuration:
                M3 \\ --- // M2
                      ---
                      ---
                M4 // --- \\ M1
    */
    let SF = [20, 20, -19, -20]    // speed forward
    let SB = [-19, -19, 20, 20]    // speed backward
    let SL = [-20, 21, 20, -19]    // speed left
    let SR = [21, -21, -20, 22]    // speed right
    let SC = [-20, -20, -20, -20]  // speed clockwise
    let SA = [20, 20, 20, 20]      // speed anticlockwise
    let STOP = [0, 0, 0, 0]

    export function calibrateMovement(movement: Movement, frontleft: number, frontright: number, rearleft: number, rearright: number) {
        switch (movement) {
            case Movement.Forward:
                SF[0] = rearright; SF[1] = frontright;
                SF[2] = frontleft; SF[3] = rearleft;
                break;
            case Movement.Backward:
                SB[0] = rearright; SB[1] = frontright;
                SB[2] = frontleft; SB[3] = rearleft;
                break;
            case Movement.Left:
                SL[0] = rearright; SL[1] = frontright;
                SL[2] = frontleft; SL[3] = rearleft;
                break;
            case Movement.Right:
                SR[0] = rearright; SR[1] = frontright;
                SR[2] = frontleft; SR[3] = rearleft;
                break;
        }
    }

    export function calibrateRotation(rotation: Rotate, frontleft: number, frontright: number, rearleft: number, rearright: number) {
        switch (rotation) {
            case Rotate.Clockwise:
                SC[0] = rearright; SC[1] = frontright;
                SC[2] = frontleft; SC[3] = rearleft;
                break;
            case Rotate.AntiClockwise:
                SA[0] = rearright; SA[1] = frontright;
                SA[2] = frontleft; SA[3] = rearleft;
                break;
        }
    }

    export function move(movement: Movement) {
        switch (movement) {
            case Movement.Forward:
                NezhaPro.fourWheelSpeed(SF[0], SF[1], SF[2], SF[3]);
                break;
            case Movement.Backward:
                NezhaPro.fourWheelSpeed(SB[0], SB[1], SB[2], SB[3]);
                break;
            case Movement.Left:
                NezhaPro.fourWheelSpeed(SL[0], SL[1], SL[2], SL[3]);
                break;
            case Movement.Right:
                NezhaPro.fourWheelSpeed(SR[0], SR[1], SR[2], SR[3]);
                break;
        }
    }

    export function rotate(rotation: Rotate) {
        if (rotation == Rotate.Clockwise)
            NezhaPro.fourWheelSpeed(SC[0], SC[1], SC[2], SC[3])
        else
            NezhaPro.fourWheelSpeed(SA[0], SA[1], SA[2], SA[3])
    }

    export function stop() {
        NezhaPro.fourWheelStop()
    }
}
