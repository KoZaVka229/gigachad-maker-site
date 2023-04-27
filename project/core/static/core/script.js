const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

var form = document.getElementById('form');
var image_input = document.getElementById('id_image');
var image = null;
var template_points_row = document.getElementById('template-points-row')
var points_node = document.getElementById('points');
var moves_btn = document.getElementById('moves-btn');
var moves_input = document.getElementById('id_moves_json');
var moves_modal = document.getElementById('moves');
var frame_width = document.getElementById('id_frame_width');
var frame_height = document.getElementById('id_frame_height');


function PointGroup(x, y) {
    this.node = template_points_row.cloneNode(true);
    this.node.id = '';

    this.delete_button = this.node.querySelector('.delete-button');
    this.delete_button.addEventListener('click', () => {
        control_panel.points.pop(this);
        draw();
    });

    this.nodes = {
        frames: this.node.querySelector('.frames-input'),
        color: this.node.querySelector('.color-input'),
    };
    this.nodes.color.addEventListener('change', draw);

    this.camsize = {
        width: 100,
        height: 100,
        nodes: {
            width: this.node.querySelector('.camsize-width-input'),
            height: this.node.querySelector('.camsize-height-input')
        }
    };

    this.first = {
        x: x,
        y: y,
        nodes: {
            x: this.node.querySelector('.x1-input'),
            y: this.node.querySelector('.y1-input'),
        }
    };

    this.second = {
        x: x,
        y: y,
        nodes: {
            x: this.node.querySelector('.x2-input'),
            y: this.node.querySelector('.y2-input'),
        }
    };

    this.first.nodes.x.max = this.second.nodes.x.max = canvas.width - 1;
    this.first.nodes.y.max = this.second.nodes.y.max = canvas.height - 1;

    this.updateNodes = function() {
        this.first.nodes.x.value = String(this.first.x);
        this.first.nodes.y.value = String(this.first.y);

        this.second.nodes.x.value = String(this.second.x);
        this.second.nodes.y.value = String(this.second.y);

        this.camsize.nodes.width.value = String(this.camsize.width);
        this.camsize.nodes.height.value = String(this.camsize.height);
    };
    this.updateValues = function() {
        let x = Number.parseInt(this.first.nodes.x.value);
        let y = Number.parseInt(this.first.nodes.y.value);

        this.first.x = x < canvas.width ? x : canvas.width - 1;
        this.first.y = y < canvas.height ? y : canvas.height - 1;

        x = Number.parseInt(this.second.nodes.x.value);
        y = Number.parseInt(this.second.nodes.y.value);

        this.second.x = x < canvas.width ? x : canvas.width - 1;
        this.second.y = y < canvas.height ? y : canvas.height - 1;

        this.camsize.width = Number.parseInt(this.camsize.nodes.width.value);
        this.camsize.height = Number.parseInt(this.camsize.nodes.height.value);

        draw();
        this.drawCameraRects();
    };

    this.drawCameraRects = function() {
        draw_camera_rects(this.first.x, this.first.y, this.second.x, this.second.y, this.camsize.width, this.camsize.height);
    };

    for (const el of [this.first.nodes.x, this.first.nodes.y, this.second.nodes.x, this.second.nodes.y]) {
        el.addEventListener('change', () => {
            last_group = null;
            this.updateValues();
        });
    }
    for (const el of [this.nodes.frames]) {
        el.addEventListener('change', () => {
            this.updateValues();
        });
    }
    for (const el of [this.camsize.nodes.width, this.camsize.nodes.height]) {
        el.addEventListener('change', () => {
            this.updateValues();
            draw();
            this.drawCameraRects();
        });
    }

    this.updateNodes();

    points_node.appendChild(this.node);

    return this;
}


var control_panel = {
    node: document.getElementById('control-panel'),
    points: {
        __array: [],
        __node: document.getElementById('points'),

        get: function() { return [...this.__array]; },
        add: function(value) {
            this.__array.push(value);
        },
        pop: function(value) {
            points_node.removeChild(value.node);
            let index = this.__array.indexOf(value);
            return this.__array.splice(index, 1);
        },
        clear: function() {
            for (const el of this.__array) points_node.removeChild(el.node);
            this.__array = [];
            draw();
        },
        as_json: function() {
            array = [];
            for (const e of this.__array)
                array.push({
                    p1: {
                        x: e.first.x,
                        y: e.first.y
                    },
                    p2: {
                        x: e.second.x,
                        y: e.second.y
                    },
                    frames: e.nodes.frames.value ? Number.parseInt(e.nodes.frames.value) : null,
                    camsize: {
                        width: e.camsize.width,
                        height: e.camsize.height
                    }
                });
            return JSON.stringify({ array: array, frame_size: [Number(frame_width.value), Number(frame_height.value)], size: [canvas.width, canvas.height]});
        }
    },
    clear: function() {
        this.points.clear();
    }
};


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (image) {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    for (const group of control_panel.points.get()) {
        ctx.beginPath();
        ctx.arc(group.first.x, group.first.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = group.nodes.color.value;
        ctx.fill();

        if (group.second.x && group.second.y) {
            ctx.beginPath();
            ctx.moveTo(group.first.x, group.first.y);
            ctx.lineTo(group.second.x, group.second.y);
            ctx.strokeStyle = group.nodes.color.value;
            ctx.stroke()

            ctx.beginPath();
            ctx.arc(group.second.x, group.second.y, 3, 0, 2 * Math.PI);
            ctx.fillStyle = 'yellow';
            ctx.fill();
        }
    }
}

function draw_camera_rect(x, y, width, height) {
    let rx = x - width / 2, ry = y - height / 2;

    ctx.beginPath();
    ctx.rect(rx, ry, width, height);
    if (rx < 0 || rx + width >= canvas.width || ry < 0 || ry + height >= canvas.height) ctx.strokeStyle = 'red';
    else ctx.strokeStyle = 'green';
    ctx.stroke();
}

function draw_camera_rects(x1, y1, x2, y2, width, height) {
    draw_camera_rect(x1, y1, width, height);
    draw_camera_rect(x2, y2, width, height);
}


var last_group = null;
canvas.addEventListener('mousedown', (e) => {
    const box = canvas.getBoundingClientRect();
    const x = Math.round(e.pageX - box.left);
    const y = Math.round(e.pageY - box.top);

    let temp = last_group;

    if (last_group) {
        last_group.second.x = x;
        last_group.second.y = y;
        last_group.second.frames = 0;
        last_group.updateNodes();

        last_group = null;
    }
    else {
        group = new PointGroup(x, y, 0);
        control_panel.points.add(group);

        last_group = group;
    }

    draw();
    temp?.drawCameraRects();
});

image_input.addEventListener('change', (event) => {
    var selectedFile = event.target.files[0];
    var reader = new FileReader()

    reader.onload = function(event) {
        image = new Image();
        image.src = event.target.result;
        image.onload = () => {
            let ratio = CANVAS_WIDTH / image.width;
            canvas.height = Math.round(image.height * ratio);

            frame_width.value = Number(canvas.width);
            frame_height.value = Number(canvas.height);

            control_panel.clear();
            draw();

            console.log('disable');
        };
    };
    reader.readAsDataURL(selectedFile);
});

moves_modal.addEventListener('hidden.bs.modal', () => {
    let json = control_panel.points.as_json();
    console.log(json);
    moves_input.value = json;
});

for (const el of document.querySelectorAll("input[type=number]")) {
    el.addEventListener('change', (e) => {
        let value = Number.parseInt(e.target.value);
        let min = Number.parseInt(e.target.min);
        let max = Number.parseInt(e.target.max);

        if (value == NaN || value < min) e.target.value = String(min);
        else if (value > max) e.target.value = String(max);
    });
}