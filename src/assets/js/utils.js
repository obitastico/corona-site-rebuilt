CanvasRenderingContext2D.prototype.draw_horizontal_line = function (start, end, y) {
    this.beginPath();
    this.moveTo(start, y);
    this.lineTo(end, y);
    this.stroke();
};

CanvasRenderingContext2D.prototype.draw_vertical_line = function (start, end, x) {
    this.beginPath();
    this.moveTo(x, start);
    this.lineTo(x, end);
    this.stroke();
};

export function round(number, stellen) {
    return Math.round(number * Math.pow(10, stellen)) / Math.pow(10, stellen);
}

export function linspace(start, stop, num) {
    const step = (stop - start) / (num - 1);
    return Array.from({ length: num }, (_, i) => start + step * i);
}

export function map(x, in_min, in_max, out_min, out_max) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}
