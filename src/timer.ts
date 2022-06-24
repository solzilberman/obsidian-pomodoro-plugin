import {Notice} from 'obsidian';
// A Simple Timer ts class
type TimerState = 'pause' | 'play' | 'off';
type TimerMode = 'focus' | 'break' | 'off';

export class Timer {
    public timerState: TimerState;
    public time: number;
    public mode: TimerMode;
    public focus_duration: number;
    public break_duration: number;

    constructor(
        focus_duration: number = 0,
        break_duration: number = 0
    ) { 
        this.timerState = 'off';
        this.time = focus_duration*60;
        this.mode = 'off';
        this.focus_duration = focus_duration*60;
        this.break_duration = break_duration*60;
    }

    tick() {
        if (this.time > 0 && this.timerState !== 'off' && this.timerState !== 'pause') {
            // tick 1 second
            this.time--;
        }
        if (this.time == 0 && this.timerState == 'play') {
            // tick when time is up and timer is playing
            this.time = this.mode == 'focus' ? this.break_duration : this.focus_duration;
            this.mode = this.mode == 'focus' ? 'break' : 'focus';
            new Notice('This is a notice!');
        }
    }

    play() {
        this.timerState = 'play';
    }

    pause() {
        this.timerState = 'pause';
    }

    reset() {
        this.timerState = 'off';
        // this.time = this.mode === 'focus' ? this.focus_duration : this.break_duration;
        if (this.mode === 'focus') {
            this.time = this.focus_duration;
        } else if (this.mode === 'break') {
            this.time = this.break_duration;
        } else {
            this.time = this.focus_duration;
        }
    }

    setMode(val:string){
        this.mode = val === 'focus' ? 'focus' : 'break';
    }
}