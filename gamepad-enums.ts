///////////////////////////
//#######################//
//##                   ##//
//##  gampad-enums.ts  ##//
//##                   ##//
//#######################//
///////////////////////////

enum Joystick {
        //% block="none"
        //% block.loc.nl="geen"
        None,
        //% block="up"
        //% block.loc.nl="omhoog"
        Up,
        //% block="right up"
        //% block.loc.nl="rechts omhoog"
        UpRight,
        //% block="right"
        //% block.loc.nl="rechts"
        Right,
        //% block="right down"
        //% block.loc.nl="rechts omlaag"
        DownRight,
        //% block="down"
        //% block.loc.nl="omlaag"
        Down,
        //% block="left down"
        //% block.loc.nl="links omlaag"
        DownLeft,
        //% block="left"
        //% block.loc.nl="links"
        Left,
        //% block="left up"
        //% block.loc.nl="links omhoog"
        UpLeft,
}

enum Power {
	//% block="without power"
	//% block.loc.nl="zonder kracht"
    None,
	//% block="Low power"
	//% block.loc.nl="weinig kracht"
    Low,
	//% block="Half power"
	//% block.loc.nl="halve kracht"
    Half,
	//% block="Full power"
	//% block.loc.nl="volle kracht"
    Full,
}

enum Key {
	//% block="up"
	//% block.loc.nl="omhoog"
	Up, //P12
	//% block="down"
	//% block.loc.nl="omlaag"
	Down, //P15 
	//% block="left"
	//% block.loc.nl="links"
	Left, //P13
	//% block="right"
	//% block.loc.nl="rechts"
	Right, //P14
}
