////////////////////////////
//########################//
//##                    ##//
//##  midi-messages.ts  ##//
//##                    ##//
//########################//
////////////////////////////

// 0: stop playing
// 1: start playing
// 2: pause on
// 3: pause off
// 4: repeat on
// 5: repeat off

// 100-500: transposing = value - 300

// 1000-1199: instrument partiture 1
// 1200-1399: instrument partiture 2
// 1400-1599: instrument partiture 3
// 1600-1799: instrument partiture 4
// 1800-1999: instrument partiture 5

// 2000-2199: volume partiture 1
// 2200-2399: volume partiture 2
// 2400-2599: volume partiture 3
// 2600-2799: volume partiture 4
// 2800-2999: volume partiture 5

// > 3000: duration = value - 3000

enum MidiCommand {
    Stop = 0,
    Start = 1,
    PauseOn = 2,
    PauseOff = 3,
    RepeatOn = 4,
    RepeatOff = 5,
    Transpose = 100,
    Instrument1 = 1000,
    Instrument2 = 1200,
    Instrument3 = 1400,
    Instrument4 = 1600,
    Instrument5 = 1800,
    Volume1 = 2000,
    Volume2 = 2200,
    Volume3 = 2400,
    Volume4 = 2600,
    Volume5 = 2800,
    Duration = 3000
}

type MidiMessage = { Command: MidiCommand, Value: number }

function receiveMidi(radiocmd: number): MidiMessage {
    let msg: MidiMessage = {Command: 0, Value: 0}
    if (radiocmd < 100) {
        msg.Command = radiocmd
        msg.Value = 0
    }
    else
        if (radiocmd < 1000) {
            msg.Command = MidiCommand.Transpose
            msg.Value = radiocmd - 100
        }
        else
            if (radiocmd < 3000) {
                msg.Command = Math.floor(radiocmd / 200) * 200
                msg.Value = radiocmd - msg.Command
            }
            else {
                msg.Command = MidiCommand.Duration
                msg.Value = radiocmd - 3000
            }
    return msg
}

function sendMidi(command: MidiCommand, value: number = 0) {
    if (command >= 100) command += value
    radio.sendNumber(command)
}
