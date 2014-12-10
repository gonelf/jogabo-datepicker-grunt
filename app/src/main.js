/* globals define */
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('famous/core/Surface');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var Scrollview = require('famous/views/Scrollview');
    var GridLayout = require('famous/views/GridLayout');
    var EventHandler = require('famous/core/EventHandler');
    var moment = require('moment');
    var MomentSurface = require('MomentSurface');
    var ScrollviewGoto = require('ScrollviewGoto');

    // create the main context
    var mainContext = Engine.createContext();

    // constants

    var width = window.innerWidth * 0.5;
    var height = window.innerHeight * 0.4;

    var gridContainerHeight = window.innerHeight * 0.5;
    var gridHeight = gridContainerHeight * 0.8;
    var gridTitleHeight = gridContainerHeight * 0.2;

    var bottomButtonHeight = window.innerHeight * 0.1;
    var timeCellHeight = height/5;
    // left scroll view

    var leftScrollViewModifier = new Modifier({
        align: [0, 0.5]
    });


    var leftScrollview = new Scrollview({
        paginated: true
    });

    leftScrollview.on('pageChange', function(data){
        selectedHours.unselected();
        var newHour = leftScrollview._node._.array[(data.index+2)];
        newHour.selected();
        selectedHours = newHour;
        bottomButtonUpdateEventHandler.trigger('update');
    });
    var leftSurfaces = [];
    leftScrollview.sequenceFrom(leftSurfaces);
    var selectedHours = new MomentSurface;
    var currentHours = moment().format('H');
    var maxLeftItems = 28;
    for (var i = 0, temp; i < maxLeftItems; i++) {

        // add 2 empty views at the beguining and end to keep the selected item centered

        if (i<2 || i>(maxLeftItems-3)) {
            
                temp = new Surface({
                    content: "",
                    size: [undefined, timeCellHeight],
                     properties: {
                         lineHeight: timeCellHeight+"px",
                         textAlign: "center"
                     }
                });   

                temp.pipe(leftScrollview);
                leftSurfaces.push(temp); 
                        
        }
        else {
            temp = new MomentSurface({
                 content: ""+(i-2),
                 size: [undefined, timeCellHeight],
                 properties: {
                     lineHeight: timeCellHeight+"px",
                     textAlign: "center"
                 },
                 classes: ['unselected']
            })

            // add on click
            temp.on('click', function (){
                selectedHours.unselected();
                this.selected();
                selectedHours = this;
                leftScrollview.goToIndex(selectedHours.content);
                bottomButtonUpdateEventHandler.trigger('update');
            });

            if (i == currentHours) {
                temp.selected();
                selectedHours = temp;
            }

            temp.pipe(leftScrollview);
            leftSurfaces.push(temp);
        }
    }

    var leftScrollViewContainer = new ContainerSurface({
        size:[width, height],
        properties: {
            overflow: 'hidden'
        },
        classes: ["leftScroll"]
    });

    leftScrollViewContainer.add(leftScrollview);
    leftScrollview.goToIndex(selectedHours.content);

    mainContext.add(leftScrollViewModifier)
                .add(leftScrollViewContainer);

    // right Scroll

    var rightScrollViewModifier = new Modifier({
        align: [0.5, 0.5]
    });


    var rightScrollview = new Scrollview({
        paginated: true
    });

    rightScrollview.on('pageChange', function(data){
        selectedMinutes.unselected();
        var newMinute = rightScrollview._node._.array[(data.index+2)];
        newMinute.selected();
        selectedMinutes = newMinute;
        bottomButtonUpdateEventHandler.trigger('update');
    });

    var rightSurfaces = [];
    rightScrollview.sequenceFrom(rightSurfaces);

    var selectedMinutes = new MomentSurface;
    var currentMinutes = moment().format('m');
    var decimals = Math.floor(currentMinutes/10);
    var decimalMins = decimals*10;
    if (currentMinutes > decimalMins+5) {
        var less = Math.abs(currentMinutes - (decimalMins+5));
        var more = Math.abs(currentMinutes - (decimalMins+10));
        if (less < more) {
            currentMinutes = decimalMins+5
        }
        else {
            currentMinutes = decimalMins+10;
        }
    }
    else {
        var less = Math.abs(currentMinutes - (decimalMins));
        var more = Math.abs(currentMinutes - (decimalMins+5));
        if (less < more) {
            currentMinutes = decimalMins
        }
        else {
            currentMinutes = decimalMins+5;
        }
    }

    var maxRightItems = 60;
    for (var i = 0, temp; i < maxRightItems; i++) {

        // add 2 empty views at the beguining and end to keep the selected item centered

        if (i<2 || i>(maxRightItems-3)) {
            
            temp = new Surface({
                content: "",
                size: [undefined, timeCellHeight],
                 properties: {
                     lineHeight: timeCellHeight+"px",
                     textAlign: "center"
                 }
            });   

            temp.pipe(rightScrollview);
            rightSurfaces.push(temp); 
                        
        }
        else {
            var a = (i-2);
            if (a%5==0) {
                var pre = (a<10)?"0":"";
                temp = new MomentSurface({
                     content: pre+a,
                     size: [undefined, timeCellHeight],
                     properties: {
                         lineHeight: timeCellHeight+"px",
                         textAlign: "center"
                     },
                     classes: ['unselected']
                });

                // add on click
                temp.on('click', function (){
                    selectedMinutes.unselected();
                    this.selected();
                    selectedMinutes = this;
                    rightScrollview.goToIndex(selectedMinutes.content/5);
                    bottomButtonUpdateEventHandler.trigger('update');
                });

                if (a == currentMinutes) {
                    temp.selected();
                    selectedMinutes = temp;
                }

                temp.pipe(rightScrollview);
                rightSurfaces.push(temp);   
            };
        }
    }

    var rightScrollViewContainer = new ContainerSurface({
        size:[width, height],
        properties: {
            overflow: 'hidden'
        }
    });

    rightScrollViewContainer.add(rightScrollview);
    rightScrollview.goToIndex(selectedMinutes.content/5);
    
    mainContext.add(rightScrollViewModifier)
                .add(rightScrollViewContainer);

    // calendar
    var selectedDay = new MomentSurface();
    var selectedMoment;
    function createCalendarMonthView(offset){

        var currentMonth = Number(moment().format("M"));
        var absOffset = Math.abs(offset);
        var firstDay = 0;
        var month = 0;
        var year = 0;
        var momentAdjusted;

        if (offset < 0) {
            momentAdjusted = moment().subtract(absOffset, "months");
            month = Number(momentAdjusted.format("M"))-1;
            year = Number(momentAdjusted.format("YYYY"));
        }
        else {
            momentAdjusted = moment().add(absOffset, "months");
            month = Number(momentAdjusted.format("M"))-1;
            year = Number(momentAdjusted.format("YYYY"));
        }

        var firstDay = Number(moment([year, month]).format("d"));

        var gridNumLines = 7;

        var grid = new GridLayout({
            dimensions: [7, gridNumLines]
        });

        var gridCleanEventHandler = new EventHandler();
        

        var gridSurfaces = [];
        grid.sequenceFrom(gridSurfaces);

        var gridDaysOfTheWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var daysThisMonth = moment([year, month]).daysInMonth();
        for(var i = 0; i < daysThisMonth+firstDay+7; i++) {
            var content;
            var day = 0;
            if (i < 7) {
                content = gridDaysOfTheWeek[i];
            }
            else if (i > 6 && i < 7+firstDay) {
                content = "";
            }
            else {
                day = i - (6+firstDay);
                content = day;
            }

            var squareSide = gridHeight / gridNumLines;

            var daySurface = new MomentSurface({
                content: content,
                size: [squareSide, squareSide],
                classes: ['unselected'],
                properties: {
                    lineHeight: squareSide + 'px',
                    textAlign: 'center'
                }
            });

            var thisDayMoment = moment([year, month, day]);
            daySurface.setMoment(thisDayMoment);

            // select the current day
            var today = moment().format("D M YYYY");
            if (today == thisDayMoment.format("D M YYYY")) {
                daySurface.selectedRound();
                selectedDay = daySurface;
            }

            if (i > 6+firstDay) {
                daySurface.on('click', function(){
                    selectedDay.unselected();
                    this.selectedRound();
                    selectedDay = this;
                    bottomButtonUpdateEventHandler.trigger('update');
                });
            };


            var centerModifier = new Modifier({
                align: [0.5, 0.5],
                origin: [0.5, 0.5]
            });

            var dayContainerSurface = new ContainerSurface({size: [undefined, undefined]});
            dayContainerSurface.add(centerModifier).add(daySurface);
            
            gridSurfaces.push(dayContainerSurface);
        }

        var gridContainer = new ContainerSurface({
            size:[undefined, gridHeight],
            classes: ["grid"]
        });
        gridContainer.add(grid);

        var gridModifier = new Modifier({
            align: [0, 0.2]
        });

        // grid title
        var gridTitle = new Surface ({
            size: [undefined, gridTitleHeight],
            content: moment([year, month]).format("MMMM YYYY"),
            properties: {
                color: "black",
                textAlign: "center",
                lineHeight: gridTitleHeight + "px"
            }
        });
        // console.log(gridTitleHeight)
        var gridTitleModifier = new Modifier({
            align: [0, 0]
        });

        var gridTitleContainer = new ContainerSurface ({
            size: [undefined, gridTitleHeight]
        });
        gridTitleContainer.add(gridTitle);  

        // title and grid container
        var gridAndTitleContainer = new ContainerSurface({
            size: [undefined, gridContainerHeight]
        });

        gridAndTitleContainer.add(gridTitleModifier).add(gridTitleContainer);
        gridAndTitleContainer.add(gridModifier).add(gridContainer);

        return gridAndTitleContainer;
    }

    // calendar scroll view

    var gridScrollview = new Scrollview({
        direction: 0, 
        paginated: true
    });
    var gridSurfaces = [];
    gridScrollview.sequenceFrom(gridSurfaces);

    for (var i = 0, temp; i < 12; i++) {
        
            var gridAndTitleContainer = createCalendarMonthView(i);
            gridAndTitleContainer.pipe(gridScrollview);
            gridSurfaces.push(gridAndTitleContainer);   
        
    }

    mainContext.add(gridScrollview);

     // bottom button

    var bottomButtonSurface = new Surface({
        size: [undefined, bottomButtonHeight],
        properties: {
            lineHeight: bottomButtonHeight + 'px',
            textAlign: 'center'
        },
        classes: ['bottomButton']
    });

    var bottomButtonModifier = new Modifier({
        align: [0, 0.9]
    });

    var bottomButtonUpdateEventHandler = new EventHandler();

    bottomButtonUpdateEventHandler.on('update', function(){
        // TODO: get the content set to the button
        var mmt = selectedDay.getMoment();
        var label = mmt.format('dddd, MMMM Do - ')+selectedHours.content+":"+selectedMinutes.content+((selectedHours.content<13)?"AM":"PM");
        bottomButtonSurface.setContent(label);
    })

    bottomButtonSurface.pipe(bottomButtonUpdateEventHandler);

    mainContext.add(bottomButtonModifier).add(bottomButtonSurface);


    bottomButtonUpdateEventHandler.trigger('update');
    
});
