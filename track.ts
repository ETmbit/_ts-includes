////////////////////
//################//
//##            ##//
//##  track.ts  ##//
//##            ##//
//################//
////////////////////

enum TrackType {
    //% block="black on white"
    //% block.loc.nl="zwart op wit"
    BlackOnWhite,
    //% block="white on black"
    //% block.loc.nl="wit op zwart"
    WhiteOnBlack,
}

enum TrackMask {
    //% block="two sensors"
    //% block.loc.nl="twee sensoren"
    Track2 = 10,
    //% block="three sensors"
    //% block.loc.nl="drie sensoren"
    Track3 = 14,
    //% block="four sensors"
    //% block.loc.nl="vier sensoren"
    Track4 = 27,
    //% block="five sensors"
    //% block.loc.nl="vijf sensoren"
    Track5 = 31,
}

enum Track {
    //% block="off the track"
    //% block.loc.nl="van de lijn af"
    OffTrack = 0,
    //% block="the track at far left"
    //% block.loc.nl="de lijn op uiterst links"
    FarLeft = 1,
    //% block="the track at left"
    //% block.loc.nl="de lijn op links"
    Left = 2,
    //% block="on the track"
    //% block.loc.nl="op de lijn"
    Mid = 4,
    //% block="the track at right"
    //% block.loc.nl="de lijn op rechts"
    Right = 8,
    //% block="the track at far right"
    //% block.loc.nl="de lijn op uiterst rechts"
    FarRight = 16,
}

function trackPosition(track: number, mask = TrackMask.Track2, tracktype = TrackType.BlackOnWhite): Track {
    if (tracktype == TrackType.WhiteOnBlack) track = ~track
    track = (track & mask)

    if (!track)
        return Track.OffTrack
    if (track & 17) { // extreme left or right sensor
        if (track & 4) { // mid sensor too
            if (track & 1) return Track.Left
            if (track & 16) return Track.Right
        }
        else { // whitout mid sensor
            if (track & 1) return Track.FarLeft
            if (track & 16) return Track.FarRight
        }
    }
    if (((track & 10) == 10) ||   // both left and right sensor
        ((track & 4) == track)) // mid sensor only
        return Track.Mid
    if (track & 2)
        return Track.Left
    if (track & 8)
        return Track.Right
    return Track.OffTrack
}
