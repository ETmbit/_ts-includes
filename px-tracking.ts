//////////////////////////
//######################//
//##                  ##//
//##  px-tracking.ts  ##//
//##                  ##//
//######################//
//////////////////////////

namespace PxTracking {

    export class Device {

        port: RJPort
        trackType: TrackType

        constructor(port: RJPort, _type: TrackType) {
            this.port = port
            this.trackType = _type
        }

        fetch(): Track {
            let track = Track.OffTrack
            let rpin = Nezha.digitalPin(this.port, RJLine.LA)
            let lpin = Nezha.digitalPin(this.port, RJLine.LB)
            pins.setPull(rpin, PinPullMode.PullUp)
            pins.setPull(lpin, PinPullMode.PullUp)
            let rsensor = !pins.digitalReadPin(rpin)
            let lsensor = !pins.digitalReadPin(lpin)
            if (rsensor) track += Track.Right
            if (lsensor) track += Track.Left
            return track
        }

        read(): Track {
            let track = this.fetch()
            track = trackPosition(track, TrackMask.Track2, this.trackType)
            return track
        }

        isTrackAtLeft(): boolean {
            let track = this.fetch()
            track = trackPosition(track, TrackMask.Track2, this.trackType)
            return (track == Track.Left || track == Track.FarLeft)
        }

        isTrackAtRight(): boolean {
            let track = this.fetch()
            track = trackPosition(track, TrackMask.Track2, this.trackType)
            return (track == Track.Right || track == Track.FarRight)
        }

        isOnTrack(): boolean {
            let track = this.fetch()
            track = trackPosition(track, TrackMask.Track2, this.trackType)
            return (track == Track.Mid)
        }

        isOffTrack(): boolean {
            let track = this.fetch()
            track = trackPosition(track, TrackMask.Track2, this.trackType)
            return (track == Track.OffTrack)
        }
    }

    export function create(port: RJPort, _type: TrackType = TrackType.BlackOnWhite): Device {
        let device = new Device(port, _type)
        return device
    }
}
