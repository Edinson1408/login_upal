$(function(){

    var currentDate; // Holds the day clicked when adding a new event
    var currentEvent; // Holds the event object when editing an event
	var tiempor; // es el inicio del tiempo de reunion en formato hh:mm
	
    $('#color').colorpicker(); // Colopicker
    $('#time').timepicker({
        minuteStep: 5,
        showInputs: false,
        disableFocus: true,
        showMeridian: false
    });  // Timepicker
		
    var base_url='http://localhost:82/710-MOPH-UTP/moph55/'; // Here i define the base_url
	// get the segments
	var pathArray = window.location.pathname.split( '/' );
   // find where the segment is located
	var indexOfSegment = pathArray.indexOf(window.location.pathname);
   // make base_url be the origin plus the path to the segment
	//var base_url = window.location.origin + pathArray.slice(0,indexOfSegment).join('/') + '/';	
	
	//var base_url = window.location.origin + '/fullcalendar4/';
    // Fullcalendar
    $('#calendar').fullCalendar({
		defaultDate: moment('2016-04-10'),
		axisFormat: 'HH:mm ',
			timeFormat: 'HH:mm ', // uppercase H for 24-hour clock
			agenda: 'HH:mm ', // 5:00 - 6:30		
        //timeFormat: 'H(:mm)',
		defaultTimedEventDuration: '01:00:00',
        //defaultEventMinutes: 60, 
        //aspectRatio: 1.2, 		
		forceEventDuration: true,
		slotEventOverlap: false,
        header: {
			lang: 'es',
            left: 'prev, next, today',
            center: 'title',
            right: 'month, agendaWeek, agendaDay'
        },
		
		// agenda semanal
		firstDay: 1,
		defaultView: 'agendaWeek',
			minTime: '7:00am',
			maxTime: '22:45pm',
			allDaySlot: false,
			columnFormat: {
				month: 'ddd',
				week: 'dddd',
				// week: 'dddd dd/MM',
				day: 'dddd M/d'
			},					
            selectable: false,
            selectConstraint: 'businessHours',
            eventConstraint: 'businessHours',		
			// horario de negocio
			businessHours:
				{
						start: '07:00',
						end:   '22:45',
						dow: [ 0, 1, 2, 3, 4, 5, 6]
				},	

        // Get all events stored in database
        eventLimit: true, // allow "more" link when too many events
        events: base_url+'calendar/getEvents',
		//events: "<?php echo base_url('calendar/getEvents') ?>",
        // Handle Day Click
        dayClick: function(date, event, view) {
            currentDate = date.format();
			tiempor = date.format('LT');
            // Open modal to add event
            modal({
                // Available buttons when adding
                buttons: {
                    add: {
                        id: 'add-event', // Buttons id
                        css: 'btn-success', // Buttons class
                        label: 'Add' // Buttons label
                    }
                },
                title: 'Reunión (' + date.format('LT') + ')' + base_url // Modal title, LT: muestra solo la hora y minutos
            });
        },

         editable: true, // Make the event draggable true 
         eventDrop: function(event, delta, revertFunc) {  

               $.post(base_url+'calendar/dragUpdateEvent', {
                id: event.id,
                date: event.start.format()
				}, function(result){
					if(result)
					{
					alert('Updated');
					}
					else
					{
						alert('Try Again later!')
					}
				});
          },
        // Event Mouseover
        eventMouseover: function(calEvent, jsEvent, view){

            var tooltip = '<div class="event-tooltip">' + calEvent.description + '</div>';
            $("body").append(tooltip);

            $(this).mouseover(function(e) {
                $(this).css('z-index', 10000);
                $('.event-tooltip').fadeIn('500');
                $('.event-tooltip').fadeTo('10', 1.9);
            }).mousemove(function(e) {
                $('.event-tooltip').css('top', e.pageY + 10);
                $('.event-tooltip').css('left', e.pageX + 20);
            });
        },
        eventMouseout: function(calEvent, jsEvent) {
            $(this).css('z-index', 8);
            $('.event-tooltip').remove();
        },
        // Handle Existing Event Click
        eventClick: function(calEvent, jsEvent, view) {
            // Set currentEvent variable according to the event clicked in the calendar
            currentEvent = calEvent;

            // Open modal to edit or delete event
            modal({
                // Available buttons when editing
                buttons: {
                    delete: {
                        id: 'delete-event',
                        css: 'btn-danger',
                        label: 'Delete'
                    },
                    update: {
                        id: 'update-event',
                        css: 'btn-success',
                        label: 'Update'
                    }
                },
                //title: 'Edit Event "' + calEvent.title + '"',
				title: 'Edit Event ' + calEvent.title + '**' + calEvent.date + base_url,
                event: calEvent
            });
        },
		// CAMBIAR TAMAÑO reunion ** eventResize ** 
		eventResize: function(event, delta, revertFunc) {
			alert(event.title + " end is now " + event.end.format());
			//if (!confirm("is this okay?")) {
				//revertFunc();
               $.post(base_url+'calendar/updateEvent', {
                id: event.id,
				title: event.title,
			    description: event.description,
				color: event.color,
				duracion: event.duracion,
                date: event.start.format(),
				end: event.end.format()
				}, function(result){
					if(result)
					{
						alert('Updated');
					}
					else
					{
						alert('Try Again later!')
					}
				});				
			//}
		}		
    });
	// *** EDITAR - Entrada de datos formulario ***
    // *** Prepares the modal window according to data passed
    function modal(data) {
        // Set modal title
        $('.modal-title').html(data.title);
        // Clear buttons except Cancel
        $('.modal-footer button:not(".btn-default")').remove();
        // Set input values
        $('#title').val(data.event ? data.event.title : '');
        if( ! data.event) {
            // When adding set timepicker to current time
            var now = new Date();
            var time = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes());
        } else {
            // When editing set timepicker to event's time
            var time = data.event.date.split(' ')[1].slice(0, -3);
            time = time.charAt(0) === '0' ? time.slice(1) : time;
        }
		//var tiempox = date.format('LT');
        //$('#time').val(time);
		$('#time').val(data.event ? time : tiempor);
        $('#description').val(data.event ? data.event.description : '');
        $('#color').val(data.event ? data.event.color : '#3a87ad');
		$('#duracion').val(data.event ? data.event.duracion : '');
		$('#end').val(data.event ? data.event.end.format() : '');
        // Create Butttons
        $.each(data.buttons, function(index, button){
            $('.modal-footer').prepend('<button type="button" id="' + button.id  + '" class="btn ' + button.css + '">' + button.label + '</button>')
        })
        //Show Modal
        $('.modal').modal('show');
    }
	// NUEVA REUNION
    // Handle Click on Add Button
    $('.modal').on('click', '#add-event',  function(e){
        if(validator(['title', 'description'])) {
            $.post(base_url+'calendar/addEvent', {
                title: $('#title').val(),
                description: $('#description').val(),
                color: $('#color').val(),
				duracion: $('#duracion').val(),
                date: currentDate + ' ' + getTime(),
				end: $('#end').val()
            }, function(result){
                $('.modal').modal('hide');
                $('#calendar').fullCalendar("refetchEvents");
            });
        }
    });

    // UPDATE FORMULARIO *Handle click on Update Button
    $('.modal').on('click', '#update-event',  function(e){
        if(validator(['title', 'description'])) {
            $.post(base_url+'calendar/updateEvent', {
                id: currentEvent._id,
                title: $('#title').val(),
                description: $('#description').val(),
                color: $('#color').val(),
				duracion: $('#duracion').val(),
                date: currentEvent.date.split(' ')[0]  + ' ' +  getTime(),
				end: $('#end').val()
            }, function(result){
                $('.modal').modal('hide');
                $('#calendar').fullCalendar("refetchEvents");
            });
        }
    });

    // Handle Click on Delete Button
    $('.modal').on('click', '#delete-event',  function(e){
        $.get(base_url+'calendar/deleteEvent?id=' + currentEvent._id, function(result){
            $('.modal').modal('hide');
            $('#calendar').fullCalendar("refetchEvents");
        });
    });


    // Get Formated Time From Timepicker
    function getTime() {
        var time = $('#time').val();
        return (time.indexOf(':') == 1 ? '0' + time : time) + ':00';
    }

    // Dead Basic Validation For Inputs
    function validator(elements) {
        var errors = 0;
        $.each(elements, function(index, element){
            if($.trim($('#' + element).val()) == '') errors++;
        });
        if(errors) {
            $('.error').html('Please insert title and description');
            return false;
        }
        return true;
    }
});