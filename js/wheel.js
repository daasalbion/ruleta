// WHEEL!
var wheel = {

    timerHandle : 0,
    iterationsHandle: 0,
    timerDelay : 100,

    initialAngle : 0,//Math.PI*3/2,
    angleCurrent : 0,
    angleDelta : 0,

    size : 150,

    canvasContext : null,

    colors : [ '#ff0000', '#00FF00', '#FF00FF', '#FF6600', '#6699CC' ],

    segments : [],

    angles : [],

    seg_colors : [], // Cache of segments to colors

    maxSpeed : Math.PI / 16,

    upTime : 0,// +5*100, // How long to spin up for (in ms)
    downTime : 0,//+5*600, // How long to slow down for (in ms)

    spinStart : 0,

    frames : 0,

    centerX : 300,
    centerY : 300,

    valoresEsperados : [2, 4, 3, 4],
    contadorIterations : 0,
    angulos: [],

    delta_numero_ganador: 0,
    numero_vueltas: 4,

    spin : function() {

        wheel.contadorIterations++;
        console.log("numero de iteraciones: " + wheel.contadorIterations);
        // Start the wheel only if it's not already spinning
        if(wheel.contadorIterations > wheel.valoresEsperados.length){

            clearInterval(wheel.iterationsHandle);
            wheel.contadorIterations = 0;

        }else{

            if (wheel.timerHandle == 0) {
                //wheel.spinStart = new Date().getTime();
                //wheel.maxSpeed = Math.PI / (16 + Math.random()); // Randomly vary how hard the spin is
                wheel.maxSpeed = Math.PI/5;
                wheel.frames = 0;

                console.log("angulo actual: " + wheel.angleCurrent);
                console.log("angulos iniciales: " + wheel.angles);

                wheel.calcularTiempo();
                wheel.timerHandle = setInterval( wheel.onTimerTick, wheel.timerDelay );
            }
        }
    },

    onTimerTick : function() {

        console.log("angulos en movimiento: " + wheel.angles);
        wheel.frames++;
        wheel.draw();

        var progress;
        var finished = false;
        //var duration = (new Date().getTime() - wheel.spinStart);
        var duration = (wheel.timerDelay + wheel.spinStart);//avanza de manera constante
        wheel.spinStart = duration;
        console.log("duration: " + duration);

        progress = duration / (wheel.upTime + wheel.downTime);
        //wheel.delta_numero_ganador = Math.PI/225;

        if (duration < wheel.upTime) {

            //console.log("acelerando...");
            //wheel.angleDelta = wheel.maxSpeed * Math.sin(progress * Math.PI / 2);
            //mirar
            //wheel.delta_numero_ganador = (Math.random() * (Math.PI/125)) +  wheel.angleCurrent;

            //console.log( "RAMDOM: " + wheel.delta_numero_ganador);

            wheel.angleDelta = wheel.maxSpeed + wheel.delta_numero_ganador;// * progress;

        } else {

            //finished = true;
            //console.log("desacelerando............................");
            //wheel.angleDelta = wheel.maxSpeed * Math.sin(progress * Math.PI / 2 + Math.PI / 2);

            wheel.angleDelta =  wheel.maxSpeed - wheel.delta_numero_ganador;//*(1-progress);

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
            //seteo bien el ultimo valor que aumenta al pedo
            wheel.angleCurrent -= wheel.angleDelta;
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
            wheel.initCanvas();
            wheel.draw();

            $.extend(wheel, optionList);

        } catch (exceptionData) {
            alert('Wheel is not loaded ' + exceptionData);
        }

    },

    initCanvas : function() {

        var canvas = $('#wheel').find('#canvas').get(0);

        /*if ($.browser.msie) {
            canvas = document.createElement('canvas');
            $(canvas).attr('width', 300).attr('height', 300).attr('id', 'canvas').appendTo('.wheel');
            canvas = G_vmlCanvasManager.initElement(canvas);
        }*/

        canvas.addEventListener("click", wheel.initIterations, false);
        wheel.canvasContext = canvas.getContext("2d");
    },

    initIterations: function() {
        wheel.iterationsHandle = setInterval(wheel.spin, 8000);
    },

    initWheel : function() {
        shuffle(wheel.colors);
    },

    // Called when segments have changed
    update : function() {
        // Ensure we start mid way on a item
        //var r = Math.floor(Math.random() * wheel.segments.length);
        var r = wheel.initialAngle;
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

        console.log( "angulos iniciales: " + wheel.angles );
        console.log( "angulos indices: " + wheel.angulos );
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

        var angulo_esperado = wheel.angulos[wheel.valoresEsperados[wheel.contadorIterations-1]];
        console.log("mirar el angulo esperado: " + angulo_esperado);
        console.log("angulo actual: " + wheel.angleCurrent);
        var tiempo = (angulo_esperado - wheel.angleCurrent)/wheel.maxSpeed + 1;
        //si algo requerido es el mismo entonces doy 4 vueltas para caer en el mismo
        if(tiempo == 0){

            tiempo = wheel.numero_vueltas*10;
        }

        console.log("tiempo: " + tiempo);
                                                     //le agrego siempre 2 vueltas
        wheel.upTime = (tiempo)*wheel.timerDelay + Math.floor(wheel.numero_vueltas/2)*10*wheel.timerDelay;
                                                     //le agrego siempre 2 vueltas
        wheel.downTime = Math.floor(wheel.numero_vueltas/2)*10*wheel.timerDelay;
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
            wheel.angles[i-1] = lastAngle;
            //guardo el orden de los angulos guardados
            var j = wheel.segments.length - Math.floor((lastAngle / (Math.PI * 2))	* wheel.segments.length) - 3;
            if( j < 0 )
                j = len - (-1)*j;
            wheel.angulos[j] = wheel.angles[i-1];

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

    drawNeedle : function() {

        var ctx = wheel.canvasContext;
        var centerX = wheel.centerX;
        var centerY = wheel.centerY;
        var size = wheel.size;

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.fileStyle = '#ffffff';

        ctx.beginPath();

        /*ctx.moveTo(centerX + size - 40, centerY);
         ctx.lineTo(centerX + size + 20, centerY - 10);
         ctx.lineTo(centerX + size + 20, centerY + 10);*/

        ctx.moveTo(centerX, centerY - size + 35);
        ctx.lineTo(centerX - 15, centerY - size - 20);
        ctx.lineTo(centerX + 15, centerY - size - 20);

        ctx.closePath();

        ctx.stroke();
        ctx.fill();

        //a ver que pasa
        /*var angleCurrent = wheel.angleCurrent - wheel.initialAngle;
        if( angleCurrent < 0 )
            angleCurrent = wheel.initialAngle + wheel.angleCurrent;
        alert(angleCurrent);*/
        console.log('angleCurrent: '+wheel.angleCurrent);
        // Which segment is being pointed to?
        var i = wheel.segments.length - Math.floor((wheel.angleCurrent / (Math.PI * 2))	* wheel.segments.length) - 3;

        // Now draw the winning name
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = '#000000';
        ctx.font = "2em Arial";
        ctx.fillText( wheel.segments[i], centerX, centerY - (size + 40) );
    }

};

window.onload = function() {

    wheel.init();
    //array asociativo para cargar los valores estaticamente en la tombola
    var venues = {
        "116208"  : "0",
        "66271"   : "1",
        "5518"    : "2",
        "392360"  : "3",
        "2210952" : "4",
        "207306"  : "5",
        "41457"   : "6",
        "101161"  : "7",
        "257424"  : "8",
        "512060"  : "9"
    };
    var segments = new Array();

    $.each(venues, function(key, value) {
        segments.push( value );
    });

    console.log("numeros ganadores: " + wheel.valoresEsperados);
    wheel.segments = segments;
    wheel.update();

};



