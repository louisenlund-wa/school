addEventListener("DOMContentLoaded", function () {
    var sliderElem = document.querySelector('.slider');
    //waiting for load img
    var slides = sliderElem.querySelectorAll('.slide');
    var allLoaded = false;
    var slider = false;
    for(var i=0; i < slides.length; i++){
        slides[i].onload = function() {
            this.loaded = true;
            for(var i=0; i < slides.length; i++){
                allLoaded = slides[i].loaded;
                if(!slides[i].loaded){
                    allLoaded = false;
                    break;
                }
            }
            //make slider
            if(slider === false && allLoaded){
                slider = new Slider(sliderElem);
            }
        };
        slides[i].onerror = function() {
            this.loaded = true;
            for(var i=0; i < slides.length; i++){
                allLoaded = slides[i].loaded;
                if(!slides[i].loaded){
                    allLoaded = false;
                    break;
                }
            }
            //make slider
            if(slider === false && allLoaded){
                slider = new Slider(sliderElem);
            }
        };

        function preloadImages(sources, callback) {
          let counter = 0;

          function onLoad() {
            counter++;
            if (counter == sources.length) callback();
          }

          for(let source of sources) {
            let img = document.createElement('img');
            img.onload = img.onerror = onLoad;
            img.src = source;
          }
        }
    }
    
});


//class Slider
function Slider(sliderElem){

    if(!sliderElem) return null;

    var slideSelec = false || '.slide';
    var slides = sliderElem.querySelectorAll(slideSelec);
    var slidesLenghs = 0;//lenghs of all slides
    var container = createContainer();
    var sizing = false || 'no';// no || contain || cover
    var pnButtons = true || false;
    var pnButCycle = true || false;
    var contentButtunFlag = true || false;
    var animTime = 0.5;

    if(!slides) return null;

    this.setCustomStyles = function(){};

    resizeSlider();

    reattachSlidesToContainer();

    if(pnButtons){
        var prevButton = null;
        var nextButton = null;
        createPNButtons();
    }

    if(contentButtunFlag){
        var contentButtuns = [];
        var contentButtunsContainer = createContentButtunsContainer();
        for(var i=0; i < slides.length; i++){
            contentButtuns.push( createContentButtun(contentButtunsContainer, i) );
        }
        //set active first button
        contentButtuns[0].classList.add("active");
    }

    setStyle(this);


    function createContentButtunsContainer(){
        var divContainer = document.createElement('div');
        divContainer.className = 'sliderContentButtunsContainer';
        sliderElem.append(divContainer);
        return divContainer;
    }

    function createContentButtun(cbContainer, iterator){
        var contentButtun = document.createElement('div');
        contentButtun.className = 'sliderContentButtun';
        cbContainer.append(contentButtun);
        contentButtun.addEventListener('click', function(e){
            setActiveSlide(iterator);
        });
        return contentButtun;
    }

    function nextSlide(cycle = false, increment = 1){
        var direction = 'next';
        var slideNumber = getCurrentSlideNumber(direction);
        slideNumber += increment;
        setActiveSlide(slideNumber, cycle);
    }

    function prevSlide(cycle = false, decrement = 1){
        var direction = 'prev';
        var slideNumber = getCurrentSlideNumber(direction);
        slideNumber -= decrement;
        setActiveSlide(slideNumber, cycle);
    }

    function getCurrentSlideNumber(direction){
        var currentPosition = container.style.marginLeft;
        var currentSlide = getNearestSlide(currentPosition, direction);
        return currentSlide.slideNumber;
    }

    function getNearestSlide(position, direction){
        var nearestSlide = slides[0];
        var diff = 99999999;
        var currentDiff = 99999999;
        var centerPosition = 0;
        for(var i=0; i < slides.length; i++){
            if(sizing == 'contain' || sizing == 'cover'){
                currentDiff = Math.abs(slides[i].postionLeft - parseFloat(position));
            }else if(sizing == 'no'){
                currentDiff = Math.abs(slides[i].postionLeft - parseFloat(position));
                centerPosition = sliderElem.offsetWidth/2 - slides[i].offsetWidth/2;
                currentDiff -= centerPosition;
                currentDiff = Math.abs(currentDiff);
            }
            if( currentDiff <= (diff) ){
                diff = currentDiff;
                nearestSlide = slides[i];
            }
        }
        if(sizing == 'no'){
            var lastSlide = slides[slides.length-1];
            var firstSlide = slides[0];
            var endPosition = lastSlide.postionLeft - lastSlide.offsetWidth + sliderElem.offsetWidth;
            //if this is last side
            if( parseFloat(position) == endPosition){
               nearestSlide = lastSlide; 
            }else if(parseFloat(position) == 0 && direction == 'prev'){//if this is first side
                nearestSlide = firstSlide;
            }
        }
        return nearestSlide;
    }

    function setActiveSlide(slideNumber, cycle = false){
        var lastSlideTriger = false;
        var shiftAnimPosition = 0;
        var lastSlide = slides[slides.length-1];
        if(sizing == 'contain' || sizing == 'cover'){
            lastSlideTriger = true;
            if(slideNumber < 0){
                if(cycle){
                    slideNumber = slides.length - 1;
                    lastSlideTriger = false;
                }else{
                    // slideNumber = 0;
                    lastSlideTriger = true;
                    shiftAnimPosition = slides[0].offsetWidth/4;
                    //???????????????? ???????????????????????? ?????? ?????? ???????????? ??????????
                    notCycleShiftAnimation(container, slides[0].postionLeft);
                }
            }else if(slideNumber < slides.length){
                lastSlideTriger = false;
                slideNumber = slideNumber;
            }else if(slides.length <= slideNumber){
                if(cycle){
                    slideNumber = 0;
                    lastSlideTriger = false;
                }else{
                    // slideNumber = slides.length - 1;
                    lastSlideTriger = true;
                    shiftAnimPosition = lastSlide.postionLeft - lastSlide.offsetWidth/4;
                    //???????????????? ???????????????????????? ?????? ?????? ???????????? ??????????
                    notCycleShiftAnimation(container, lastSlide.postionLeft);
                }
            }
            if(!lastSlideTriger){
                container.style.marginLeft = slides[slideNumber].postionLeft+'px';
            }else{
                container.style.marginLeft = shiftAnimPosition+'px';
            }

        }else if(sizing == 'no'){
            if(slideNumber < 0){
                if(cycle){
                    slideNumber = slides.length - 1;
                }else{
                    slideNumber = 0;
                    lastSlideTriger = true;
                }
            }else if(slideNumber >= slides.length){
                if(cycle){
                    slideNumber = 0;
                }else{
                    slideNumber = slides.length - 1;
                    lastSlideTriger = true;
                }
            }

            //slideNumber to position
            var centerPosition = (sliderElem.offsetWidth/2 - slides[slideNumber].offsetWidth/2) + slides[slideNumber].postionLeft;

            var endPosition = lastSlide.postionLeft - lastSlide.offsetWidth + sliderElem.offsetWidth;
            // console.dir(centerPosition);
            // console.dir(slideNumber +'!='+ 0 +'&&'+ lastSlideTriger);
            if(centerPosition > 0 || (slideNumber == 0 && lastSlideTriger) ){
                if(!cycle && lastSlideTriger){
                    centerPosition = slides[0].offsetWidth/2;
                    //???????????????? ???????????????????????? ?????? ?????? ???????????? ??????????
                    notCycleShiftAnimation(container, slides[0].postionLeft);
                }else{
                    centerPosition = 0;
                }
            }else if(centerPosition > endPosition && !lastSlideTriger){
                centerPosition = centerPosition;
                lastSlideTriger = false;
            }else if(endPosition >= centerPosition || (slideNumber != 0 && lastSlideTriger) ){
                    // console.dir(';a;a;');
                if(!cycle  && lastSlideTriger){
                    centerPosition = endPosition - lastSlide.offsetWidth/2;
                    //???????????????? ???????????????????????? ?????? ?????? ?????????????????? ??????????
                    notCycleShiftAnimation(container, endPosition);
                }else{
                    centerPosition = endPosition;
                }
            }
            container.style.marginLeft = centerPosition+'px';
        }
        //set contentButtun if active
        if(contentButtunFlag && contentButtuns){
            for(var i=0; i < contentButtuns.length; i++){
                contentButtuns[i].classList.remove("active");
            }
            contentButtuns[slideNumber].classList.add("active");
        }
    }

    function notCycleShiftAnimation(container, position){
        setTimeout(
            function(container, position){
                container.style.marginLeft = position+'px';
            }, 
            (animTime/2)*1000, container, position
        );
    }

    function setStyle(self){
        for(var i=0; i < slides.length; i++){
            slides[i].style.display = 'inline-block';
            slides[i].slideNuber = i;
            setSlideCoords(slides[i]);
        }
        sliderElem.style.position = 'relative';
        container.style.position = 'relative';
        container.style.transition = 'all '+animTime+'s';
        container.style.marginLeft = slides[0].postionLeft+'px';
        //set custom styles
        self.setCustomStyles.apply(this, arguments);
    }

    function setSlideCoords(slide){
        var biggestSide = findBiggestSide(slide);
        if(sizing == 'contain'){
            if(biggestSide == 'width'){
                resizingSlideByWidth(slide);
            }else if(biggestSide == 'height'){
                resizingSlideByHeight(slide);
            }
        }else if(sizing == 'cover'){
            if(biggestSide == 'width'){
                resizingSlideByHeight(slide);
            }else if(biggestSide == 'height'){
                resizingSlideByWidth(slide);
            }
        }else if(sizing == 'no'){}
        setSlidePosition(slide);
    }

    function setSlidePosition(slide){
        var heightDiff = sliderElem.offsetHeight - slide.offsetHeight;
        var widthDiff = sliderElem.offsetWidth - slide.offsetWidth;
        var slideLeftOfset = getSlideLeftOfset(slide);

        slide.style.position = 'absolute';
        slide.style.top = heightDiff/2+'px';
        if(sizing == 'contain'){
            slide.style.left = widthDiff/2 + slideLeftOfset+'px';
            slide.postionLeft =  -slideLeftOfset;
        }else if(sizing == 'cover'){
            slide.style.left = slideLeftOfset+'px';
            slide.postionLeft = widthDiff/2 - slideLeftOfset;
        }else if(sizing == 'no'){
            slide.style.left = slideLeftOfset+'px';
            slide.postionLeft = -slideLeftOfset;
        }
    }

    function getSlideLeftOfset(slide){
        var leftOfset = 0;
        if(sizing == 'contain'){
            leftOfset = sliderElem.offsetWidth*slide.slideNuber;
        }else if(sizing == 'cover' || sizing == 'no'){
            for(var i=0; i < slides.length; i++){
                if(slide.slideNuber == i) break;
                leftOfset += slides[i].offsetWidth;
            }
        }
        return leftOfset;
    }

    function resizingSlideByWidth(slide){
        coficient = slide.offsetWidth/sliderElem.offsetWidth;
        slide.style.width = sliderElem.offsetWidth+'px';
        slide.style.height = (slide.offsetHeight/coficient)+'px';
    }
    function resizingSlideByHeight(slide){
        coficient = slide.offsetHeight/sliderElem.offsetHeight;
        slide.style.width = (slide.offsetWidth/coficient)+'px';
        slide.style.height = sliderElem.offsetHeight+'px';
    }

    function findBiggestSide(slide){
        var width = slide.offsetWidth - sliderElem.offsetWidth;
        var height = slide.offsetHeight - sliderElem.offsetHeight;
        return width >= height ? 'width' : 'height'
    }

    function getSlidesLength(){
        for(var i=0; i < slides.length; i++){
            slidesLenghs += slides[i].offsetWidth;
        }
    }

    function resizeSlider(){
        for(var i=0; i < slides.length; i++){
            slides[i].style.width = slides[i].offsetWidth+'px';
            slides[i].style.height = slides[i].offsetHeight+'px';
        }
        sliderElem.style.width = sliderElem.offsetWidth+'px';
        getSlidesLength();
        container.style.width = slidesLenghs+'px';
        container.style.height = sliderElem.offsetHeight+'px';
    }

    function reattachSlidesToContainer(){
        //detach slides
        for(var i=0; i < slides.length; i++){
            slides[i].remove();
        }
        //join slides
        for(var i=0; i < slides.length; i++){
            slides[i].slideNumber = i;
            container.append(slides[i]);
        }
    }

    function createPNButtons(){
        prevButton = document.createElement('div');
        prevButton.className = 'sliderButton sliderPrevButton';
        sliderElem.append(prevButton);
        prevButton.addEventListener('click', function(e){
            prevSlide(pnButCycle);
        });
        nextButton = document.createElement('div');
        nextButton.className = 'sliderButton sliderNextButton';
        sliderElem.append(nextButton);
        nextButton.addEventListener('click', function(e){
            nextSlide(pnButCycle);
        });
    }

    function createContainer(){
        var divContainer = document.createElement('div');
        divContainer.className = 'sliderContainer';
        sliderElem.append(divContainer);
        return divContainer;
    }

   
    // exit;










    // var slider??ontainer = slider.querySelector( '.swiper-container' ),// ?????????????????? ??????????????????
    //     sliderWrapper = slider.querySelector( '.swiper-wrapper' ),// ??????????????????, ???????? ??????????????
    //     slides = sliderWrapper.querySelectorAll( '.swiper-slide' ),// ????????????
    //     slideCount = slides.length,// ???????????????????? ??????????????
    //     slideWidth = slides[0].offsetWidth,// ???????????? ???? ?????? ??????????????
    //     buttonPrev = slider.querySelector( '.swiper-button-prev' ),// ???????????? ??????????
    //     buttonNext = slider.querySelector( '.swiper-button-next' ),// ???????????? ????????????
    //     style = sliderWrapper.style,// ?????????? ?? ????????
    //     startPoint = 0;// ???????????????? ??????????????
    // //
    // var timerId = 0,
    //     autoPlayBool = false;// ???????????? ???? ????????????????

    // var autoPlayTime = 3000;// ?????????? ?????????????????????????????? ?????????????????????? ????????????????
    // var pauseOnHover = true;// ?????????????? ???? ?????????? autoPlay ???? ????????????


    // buttonPrev.addEventListener( "click", function(event){
    //     event.preventDefault();
    //     shiftLeft();
    // } );
    // buttonNext.addEventListener( "click", function(event){
    //     event.preventDefault();
    //     shiftRight();
    // });

    // this.autoPlay = function() {
    //     clearTimeout(timerId);
    //     timerId = setTimeout(autoPlayLocal, autoPlayTime);
    //     autoPlayBool = true;
    // }

    // this.stop = function(value) {
    //     clearTimeout(timerId);
    //     autoPlayBool = false;
    // }

    // function shiftRight(){
    //     var shift = toNumber(style.marginLeft) - slideWidth;
    //     if ( Math.abs(shift) < slideWidth * slideCount ){
    //         style.marginLeft = shift + 'px';//?????????? ???????????????? ?? ??????????
    //     }else{
    //         style.marginLeft = startPoint + 'px';//?????????? ?? ????????????
    //     }
    // }

    // function shiftLeft(){
    //     var shift = toNumber(style.marginLeft) + slideWidth;
    //     if ( shift <= startPoint ){
    //         style.marginLeft = shift + 'px';//?????????? ???????????????? ?? ????????
    //     }else{
    //         style.marginLeft = (slideCount - 1) * slideWidth * -1 + 'px';//?????????? ?? ????????????
    //     }
    // }

    // function autoPlayLocal(){
    //     shiftRight();
    //     timerId = setTimeout(autoPlayLocal, autoPlayTime);
    // }

    // //auto pause when hover
    // slider??ontainer.addEventListener( "mouseover", function( event ) {
    //     if (pauseOnHover) {
    //         clearTimeout(timerId);
    //     }
    // });
    // slider??ontainer.addEventListener( "mouseout", function( event ) {
    //     if (pauseOnHover) {
    //         timerId = setTimeout(autoPlayLocal, autoPlayTime);
    //     }
    // });

    // //licener on swipe
    // var sliderSwiper = new Swipe( slider??ontainer );
    // sliderSwiper.toLeft = function(evt){
    //     if (autoPlayBool) {//?????????? ???????????????? ???? ??????????
    //         clearTimeout(timerId);
    //         timerId = setTimeout(autoPlayLocal, autoPlayTime);
    //     }
    //     shiftRight();
    // };
    // sliderSwiper.toRight = function(evt){
    //     if (autoPlayBool) {//?????????? ???????????????? ???? ??????????
    //         clearTimeout(timerId);
    //         timerId = setTimeout(autoPlayLocal, autoPlayTime*3);
    //     }
    //     shiftLeft();
    // }; 

    
}

// class Swipe
function Swipe(DomElem){
    var touchDownX = null;                                                        
    var touchDownY = null;                                                        
    var xDiff = null;                                                        
    var yDiff = null;                                                        
    var coficient = 0.8;// ???????????????????? ???????????? ???? ?????? ???????????? ????????????                                                     
    var speed = 10;// ???????????????? ????????????????    

    this.toTop = function(){};                                               
    this.toBottom = function(){};                                               
    this.toLeft = function(){};                                               
    this.toRight = function(){};                                               

    var handleTouchStart = function (evt) {
        touchDownX = evt.touches[0].clientX;                                      
        touchDownY = evt.touches[0].clientY;
    };                                                

    var handleTouchMove = function (evt) {
        if ( ! touchDownX || ! touchDownY ) {
            return;
        }
        var touchUpX = evt.touches[0].clientX;                                    
        var touchUpY = evt.touches[0].clientY;

        xDiff = touchDownX - touchUpX;
        yDiff = touchDownY - touchUpY; 
        console.log(Math.abs(xDiff) > Math.abs(yDiff)*coficient);
        if((Math.abs(xDiff) > Math.abs(yDiff)*coficient) && ((Math.abs(xDiff)+Math.abs(yDiff)) > speed) ){// ???????????? ???? ???????????? ????????????
            evt.preventDefault();
        }                                        
    };

    var handleTouchEnd = function (self) {
        return function (evt) {
            if ( ( Math.abs( xDiff ) > Math.abs( yDiff ) * coficient ) && ((Math.abs(xDiff)+Math.abs(yDiff)) > speed) ) {  //?????????? ???? ??????????????????????
                if ( xDiff > 0 ) {                          //???????? ?? ????????
                    self.toLeft.apply(this, arguments);
                } else {                                    //???????? ?? ??????????
                    self.toRight.apply(this, arguments);
                }                        
            } else {                                        //?????????? ???? ????????????????
                if ( yDiff > 0 ) {
                    self.toBottom.apply(this, arguments);
                } else { 
                    self.toTop.apply(this, arguments);
                }                                                                 
            }
            /* reset values */
            touchDownX = null;
            touchDownY = null;  
            xDiff = null;                                                        
            yDiff = null;   
        }                                         
    };

    DomElem .addEventListener('touchstart', handleTouchStart, false);        
    DomElem .addEventListener('touchmove', handleTouchMove, false);
    DomElem .addEventListener('touchend', handleTouchEnd(this), false);
}