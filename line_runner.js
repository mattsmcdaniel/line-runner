var five = require("johnny-five");
var keypress = require('keypress');
var board = new five.Board();

board.on("ready", function() {
  var leds = new five.Leds([2, 3, 4, 5, 6, 7, 8, 9]),
      pos = leds.length / 2,
      wall_pos = leds.length / 2,
      wall_direction_right = true,
      wall_timer,
      interval = 0;
      interval_time = 2000,
      died = false;

  function run (direction) {
    if (died) return;
    leds[pos].stop().off();

    if (direction === 'left') {
      if (pos > 0) {
        pos--;
      }
    }

    if (direction === 'right') {
      if (pos < (leds.length - 1)) {
        pos++;
      }
    }

    leds[pos].blink(50);

    if (collisionCheck()) {
      die();
    }
  }

  function draw() {
    leds.forEach(function (led, i) {
      if (i === pos) {
        led.blink(50);
      } else if(i !== wall_pos && i !== (wall_pos - 1) && i !== (wall_pos + 1)) {
        led.stop().on();
      } else {
        led.stop().off();
      }
    });
  }

  function drawInterval() {
    interval++;

    if (wall_pos > ((leds.length / 2) + 2) || wall_pos < ((leds.length / 2) - 2)) {
      wall_direction_right = !wall_direction_right;
    }

    wall_pos = wall_direction_right ? wall_pos + 1 : wall_pos - 1;
 
    draw();

    if (collisionCheck()) {
      die();
    }

    if (interval % 4 === 0) {
      interval_time = interval_time - 200;
    }

    clearTimeout(wall_timer);
    wall_timer = setTimeout(drawInterval, interval_time);
  }

  function collisionCheck() {
    return !(pos === wall_pos || pos === wall_pos - 1 || pos === wall_pos + 1);
  }

  function die() {
    leds.on();
    leds.blink(250);
    clearTimeout(wall_timer);
    died = true;
  }

  console.log("~* LINE RUNNER *~");
  console.log("-----------------");
  console.log("Use the arrow keys to dodge the walls!");

  draw();

  drawInterval();

  keypress(process.stdin);

  process.stdin.on('keypress', function (ch, key) {
    if (key && key.name == 'left') {
      run('left');
    }

    if (key && key.name == 'right') {
      run('right');
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();
});
