namespace Fudge {
  export abstract class ViewAnimationSheet {
    view: ViewAnimation;
    seq: FudgeCore.AnimationSequence[];
    crc2: CanvasRenderingContext2D;
    scale: FudgeCore.Vector2;
    protected position: FudgeCore.Vector2;
    protected savedImage: ImageData;
    protected keys: ViewAnimationKey[] = [];
    protected sequences: ViewAnimationSequence[] = [];
    protected labels: ViewAnimationLabel[] = [];
    protected events: ViewAnimationEvent[] = [];

    //TODO stop using hardcoded colors

    constructor(_view: ViewAnimation, _crc: CanvasRenderingContext2D, _seq: FudgeCore.AnimationSequence[], _scale: FudgeCore.Vector2 = new FudgeCore.Vector2(1, 1), _pos: FudgeCore.Vector2 = new FudgeCore.Vector2()) {
      this.view = _view;
      this.crc2 = _crc;
      this.seq = _seq;
      this.scale = _scale;
      this.position = _pos;
    }
    moveTo(_time: number, _value: number = this.position.y): void {
      this.position.x = _time;
      this.position.y = _value;
    }
    translate(): void {
      this.crc2.translate(this.position.x, this.position.y);
    }
    redraw(_time: number): void {
      this.translate();
      this.clear();
      this.drawTimeline();
      this.drawEventsAndLabels();
      this.drawCursor(_time);
    }
    clear(): void {
      let maxDistance: number = 10000;
      this.crc2.clearRect(0, 0, maxDistance, this.crc2.canvas.height);
    }
    drawTimeline(): void {
      let timelineHeight: number = 50;
      let maxDistance: number = 10000;
      let timeline: Path2D = new Path2D();
      timeline.moveTo(0, timelineHeight);
      //TODO make this use some actually sensible numbers, maybe 2x the animation length
      timeline.lineTo(maxDistance, timelineHeight);
      //TODO: make this scale nicely/use the animations SPS
      let baseWidth: number = 1000;
      let pixelPerSecond: number = Math.floor(baseWidth * this.scale.x);
      let stepsPerSecond: number = this.view.animation.stepsPerSecond;
      let stepsPerDisplayText: number = 1;
      // [stepsPerSecond, stepsPerDisplayText] = this.calculateDisplay(pixelPerSecond);
      let pixelPerStep: number = pixelPerSecond / stepsPerSecond;
      let steps: number = 0;
      // console.log(pixelPerSecond, pixelPerStep);
      this.crc2.strokeStyle = "black";
      this.crc2.fillStyle = "black";
      for (let i: number = 0; i < maxDistance; i += pixelPerStep) {
        timeline.moveTo(i, timelineHeight);
        if (steps % stepsPerDisplayText == 0) {
          //TODO: stop using hardcoded heights
          timeline.lineTo(i, timelineHeight - 25);
          this.crc2.fillText(steps.toString(), i - 3, timelineHeight - 28);
          if (Math.round(i) % Math.round(1000 * this.scale.x) == 0)
            //TODO: make the time display independent of the SPS display. Trying to tie the two together was a stupid idea.
            this.crc2.fillText((Math.round(100 * (i / 1000 / this.scale.x)) / 100).toString() + "s", i - 3, 10);
        } else {
          timeline.lineTo(i, timelineHeight - 20);
        }
        steps++;
      }
      this.crc2.stroke(timeline);
    }

    drawCursor(_time: number): void {
      _time *= this.scale.x;
      let cursor: Path2D = new Path2D();
      cursor.rect(_time - 3, 0, 6, 50);
      cursor.moveTo(_time, 50);
      cursor.lineTo(_time, this.crc2.canvas.height);
      this.crc2.strokeStyle = "red";
      this.crc2.fillStyle = "red";
      this.crc2.stroke(cursor);
      this.crc2.fill(cursor);
    }

    initAnimation(): void {
      //;
    }

    getObjectAtPoint(_x: number, _y: number): ViewAnimationLabel | ViewAnimationKey | ViewAnimationEvent {
      for (let l of this.labels) {
        if (this.crc2.isPointInPath(l.path2D, _x, _y)) {
          return l;
        }
      }
      for (let e of this.events) {
        if (this.crc2.isPointInPath(e.path2D, _x, _y)) {
          return e;
        }
      }
      for (let k of this.keys) {
        if (this.crc2.isPointInPath(k.path2D, _x, _y)) {
          return k;
        }
      }
      return null;
    }

    private drawEventsAndLabels(): void {
      let maxDistance: number = 10000;
      let labelDisplayHeight: number = 30 + 50;
      let line: Path2D = new Path2D();
      line.moveTo(0, labelDisplayHeight);
      line.lineTo(maxDistance, labelDisplayHeight);

      this.crc2.strokeStyle = "black";
      this.crc2.fillStyle = "black";
      this.crc2.stroke(line);

      this.labels = [];
      this.events = [];
      if (!this.view.animation) return;
      for (let l in this.view.animation.labels) {
        //TODO stop using hardcoded values
        let p: Path2D = new Path2D;
        this.labels.push({ label: l, path2D: p });
        let position: number = this.view.animation.labels[l] * this.scale.x;
        p.moveTo(position - 3, labelDisplayHeight - 28);
        p.lineTo(position - 3, labelDisplayHeight - 2);
        p.lineTo(position + 3, labelDisplayHeight - 2);
        p.lineTo(position + 3, labelDisplayHeight - 25);
        p.lineTo(position, labelDisplayHeight - 28);
        p.lineTo(position - 3, labelDisplayHeight - 28);
        this.crc2.fill(p);
        this.crc2.stroke(p);
        let p2: Path2D = new Path2D();
        p2.moveTo(position, labelDisplayHeight - 28);
        p2.lineTo(position, labelDisplayHeight - 25);
        p2.lineTo(position + 3, labelDisplayHeight - 25);
        this.crc2.strokeStyle = "white";
        this.crc2.stroke(p2);
        this.crc2.strokeStyle = "black";
      }
      for (let e in this.view.animation.events) {
        let p: Path2D = new Path2D;
        this.events.push({ event: e, path2D: p });
        let position: number = this.view.animation.events[e] * this.scale.x;
        p.moveTo(position - 3, labelDisplayHeight - 28);
        p.lineTo(position - 3, labelDisplayHeight - 5);
        p.lineTo(position, labelDisplayHeight - 2);
        p.lineTo(position + 3, labelDisplayHeight - 5);
        p.lineTo(position + 3, labelDisplayHeight - 28);
        p.lineTo(position - 3, labelDisplayHeight - 28);
        // this.crc2.fill(p);
        this.crc2.stroke(p);
      }
    }

    private calculateDisplay(_ppS: number): [number, number] {
      // let minPixelPerStep: number = 10;
      // let maxPixelPerStep: number = 50;
      // //TODO: use animation SPS
      // let currentPPS: number = _ppS;
      // while (currentPPS < minPixelPerStep || maxPixelPerStep < currentPPS) {
      //   if(currentPPS < minPixelPerStep) {
      //     currentPPS /= 1.5;
      //   }
      // }
      return [60, 10];
    }
  }
}