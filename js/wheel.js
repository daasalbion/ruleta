// WHEEL!
var wheel = {

    timerHandle : 0,
    timerDelay : 100,

    angleCurrent : 0,
    angleDelta : 0,

    size : 150,

    canvasContext : null,

    colors : [ '#ffff00', '#ffc700', '#ff9100', '#ff6301', '#ff0000', '#c6037e',
        '#713697', '#444ea1', '#2772b2', '#0297ba', '#008e5b', '#8ac819' ],

    segments : [],

    angles : [],

    seg_colors : [], // Cache of segments to colors

    maxSpeed : Math.PI / 16,

    upTime : 100, // How long to spin up for (in ms)
    downTime : 500+100, // How long to slow down for (in ms)

    spinStart : 0,

    frames : 0,

    centerX : 500,
    centerY : 200,

    valorEsperado : 0,

    spin : function() {

        wheel.angleCurrent = 0;
        // Start the wheel only if it's not already spinning
        if (wheel.timerHandle == 0) {
            //wheel.spinStart = new Date().getTime();
            //wheel.maxSpeed = Math.PI / (16 + Math.random()); // Randomly vary how hard the spin is
            wheel.maxSpeed = Math.PI/5
            wheel.frames = 0;
            //wheel.sound.play();

            console.log("angulos iniciales: " + wheel.angles);
            console.log("valor esperado: " + wheel.valorEsperado);
            console.log("tiempo calculado uptime: " + wheel.upTime);
            console.log("tiempo calculado downtime: " + wheel.downTime);

            wheel.calcularTiempo();

            console.log("tiempo calculado uptime: " + wheel.upTime);
            console.log("tiempo calculado downtime: " + wheel.downTime);

            wheel.timerHandle = setInterval(wheel.onTimerTick, wheel.timerDelay);
        }
    },

    onTimerTick : function() {

        console.log("angulos en movimiento: " + wheel.angles);
        wheel.frames++;
        wheel.draw();

        var progress = 0;
        var finished = false;
        //var duration = (new Date().getTime() - wheel.spinStart);
        var duration = (wheel.timerDelay + wheel.spinStart);//avanza de manera constante
        wheel.spinStart = duration;
        console.log("duration: " + duration);

        if (duration < wheel.upTime) {

            //console.log("acelerando...");

            progress = duration / (wheel.upTime + wheel.downTime);
            //wheel.angleDelta = wheel.maxSpeed * Math.sin(progress * Math.PI / 2);

            wheel.angleDelta = wheel.maxSpeed;// * progress;

        } else {

            //finished = true;
            //console.log("desacelerando............................");

            progress = duration / (wheel.upTime + wheel.downTime);
            //wheel.angleDelta = wheel.maxSpeed * Math.sin(progress * Math.PI / 2 + Math.PI / 2);

            wheel.angleDelta =  wheel.maxSpeed;//*(1-progress);

            if (progress >= 1)
                finished = true;
        }

        //console.log("angleDelta: " + wheel.angleDelta);

        wheel.angleCurrent += wheel.angleDelta;

        while (wheel.angleCurrent >= Math.PI * 2){

            wheel.angleCurrent -= Math.PI * 2;
            console.log("angleCurrent ajustado: " + wheel.angleCurrent);
        }

        if (finished) {

            clearInterval(wheel.timerHandle);
            wheel.timerHandle = 0;
            wheel.angleDelta = 0;
            wheel.spinStart = 0;
            $("#counter").html((wheel.frames / duration * 1000) + " FPS");
        }

         // Display RPM
         var rpm = (wheel.angleDelta * (1000 / wheel.timerDelay) * 60) / (Math.PI * 2);
         $("#counter2").html( Math.round(rpm) + " RPM" );
    },

    init : function(optionList) {
        try {
            wheel.initWheel();
            //wheel.initAudio();
            wheel.initCanvas();
            wheel.draw();

            $.extend(wheel, optionList);

        } catch (exceptionData) {
            alert('Wheel is not loaded ' + exceptionData);
        }

    },

    initAudio : function() {
        var sound = document.createElement('audio');
        sound.setAttribute('src', 'wheel.mp3');
        wheel.sound = sound;
    },

    initCanvas : function() {
        var canvas = $('#wheel #canvas').get(0);

        if ($.browser.msie) {
            canvas = document.createElement('canvas');
            $(canvas).attr('width', 300).attr('height', 300).attr('id', 'canvas').appendTo('.wheel');
            canvas = G_vmlCanvasManager.initElement(canvas);
        }

        canvas.addEventListener("click", wheel.spin, false);
        wheel.canvasContext = canvas.getContext("2d");
    },

    initWheel : function() {
        shuffle(wheel.colors);
    },

    // Called when segments have changed
    update : function() {
        // Ensure we start mid way on a item
        //var r = Math.floor(Math.random() * wheel.segments.length);
        var r = 0;
        //wheel.angleCurrent = ((r + 0.5) / wheel.segments.length) * Math.PI * 2;
        wheel.angleCurrent = r;

        var segments = wheel.segments;
        var len      = segments.length;
        var colors   = wheel.colors;
        var colorLen = colors.length;

        // Generate a color cache (so we have consistant coloring)
        var seg_color = new Array();
        for (var i = 0; i < len; i++)
            seg_color.push( colors [ segments[i].hashCode().mod(colorLen) ] );

        wheel.seg_color = seg_color;

        wheel.draw();
    },

    draw : function() {
        wheel.clear();
        wheel.drawWheel();
        wheel.drawNeedle();
    },

    clear : function() {
        var ctx = wheel.canvasContext;
        ctx.clearRect(0, 0, 1000, 800);
    },

    calcularTiempo : function() {
        var angulo_esperado = wheel.angles[wheel.valorEsperado]
        console.log("mirar el angulo esperado: " + angulo_esperado);
        var tiempo = angulo_esperado/wheel.maxSpeed;
        wheel.upTime = (tiempo/2)*100;
        wheel.downTime = (tiempo/2)*100 + 100;
    },

    drawNeedle : function() {
        var ctx = wheel.canvasContext;
        var centerX = wheel.centerX;
        var centerY = wheel.centerY;
        var size = wheel.size;

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.fileStyle = '#ffffff';

        ctx.beginPath();

        ctx.moveTo(centerX + size - 40, centerY);
        ctx.lineTo(centerX + size + 20, centerY - 10);
        ctx.lineTo(centerX + size + 20, centerY + 10);
        ctx.closePath();

        ctx.stroke();
        ctx.fill();

        // Which segment is being pointed to?
        var i = wheel.segments.length - Math.floor((wheel.angleCurrent / (Math.PI * 2))	* wheel.segments.length) - 1;

        // Now draw the winning name
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = '#000000';
        ctx.font = "2em Arial";
        ctx.fillText(wheel.segments[i], centerX + size + 25, centerY);
    },

    drawSegment : function(key, lastAngle, angle) {
        var ctx = wheel.canvasContext;
        var centerX = wheel.centerX;
        var centerY = wheel.centerY;
        var size = wheel.size;

        var segments = wheel.segments;
        var len = wheel.segments.length;
        var colors = wheel.seg_color;

        var value = segments[key];

        ctx.save();
        ctx.beginPath();

        // Start in the centre
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, size, lastAngle, angle, false); // Draw a arc around the edge
        ctx.lineTo(centerX, centerY); // Now draw a line back to the centre

        // Clip anything that follows to this area
        //ctx.clip(); // It would be best to clip, but we can double performance without it
        ctx.closePath();

        ctx.fillStyle = colors[key];
        ctx.fill();
        ctx.stroke();

        // Now draw the text
        ctx.save(); // The save ensures this works on Android devices
        ctx.translate(centerX, centerY);
        ctx.rotate((lastAngle + angle) / 2);

        ctx.fillStyle = '#000000';
        ctx.fillText(value.substr(0, 20), size / 2 + 20, 0);
        ctx.restore();

        ctx.restore();
    },

    drawWheel : function() {
        var ctx = wheel.canvasContext;

        var angleCurrent = wheel.angleCurrent;
        var lastAngle    = angleCurrent;

        var segments  = wheel.segments;
        var len       = wheel.segments.length;
        var colors    = wheel.colors;
        var colorsLen = wheel.colors.length;

        var centerX = wheel.centerX;
        var centerY = wheel.centerY;
        var size    = wheel.size;

        var PI2 = Math.PI * 2;

        ctx.lineWidth    = 1;
        ctx.strokeStyle  = '#000000';
        ctx.textBaseline = "middle";
        ctx.textAlign    = "center";
        ctx.font         = "1.4em Arial";

        for (var i = 1; i <= len; i++) {
            var angle = PI2 * (i / len) + angleCurrent;
            wheel.drawSegment(i - 1, lastAngle, angle);
            wheel.angles[i] = lastAngle;
            lastAngle = angle;
        }
        // Draw a center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, PI2, false);
        ctx.closePath();

        ctx.fillStyle   = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.fill();
        ctx.stroke();

        // Draw outer circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, size, 0, PI2, false);
        ctx.closePath();

        ctx.lineWidth   = 10;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }
}

window.onload = function() {
    wheel.init();

    var segments = new Array();
    $.each($('#venues input:checked'), function(key, cbox) {
        segments.push( cbox.value );
    });

    wheel.segments = segments;
    wheel.update();

    // Hide the address bar (for mobile devices)!
    setTimeout(function() {
        window.scrollTo(0, 1);
    }, 0);
}

$(document).ready(function(){

    $('#confirmar_valor').click(
        function(){
            var angulos = [9, 8, 7, 6, 5, 4, 3 ,2 , 1 , 0]
            //wheel.valorEsperado = angulos[$('#valor_esperado').val()];
            wheel.valorEsperado = $('#valor_esperado').val();

            alert(wheel.valorEsperado);
        }
    )
})