(function($, window, undefined){
  'use strict';

  //define navigation container class
  var navSection = 'sp-g-app-opip-sticky-navigation';
  var navContainer = navSection + '__container';

  //define components class for the navigation list
  var compClass = '[data-nav-id]';

  //The selectors need to check to be added into nav bar
  var checkList = [{
                    id: '#solutions',
                    label: 'Solutions',
                    color: false
                  },{
                    id: '#contactUs',
                    label: 'Contact Us',
                    color: true
                  }];


  //define navbar variables
  var navContainerClass = '.' + navContainer;
  var $ele = {
    section: $('.' + navSection),
  	container : $(navContainerClass),
  	underline : $(navContainerClass + '__underline'),
    outerContainer: $(navContainerClass + '__outer'),
    placeholder: $(navContainerClass + '__placeholder'),
    ul : $(navContainerClass + '__ul'),
  	getNavEleById : function(navId){
  		return $(navContainerClass + '__list a[href^="' + navId + '"]');
  	},
  	fixClass : navContainer + '--fix',
    icon: $(navContainerClass + '__icon__down'),
    wrap: $(navContainerClass + '__wrap')
  };


  //init navigation list
  var idList = [];

  function addCheckList($component){
    var match = true;
    while( checkList.length > 0 && match){
      var _check = $(checkList[0].id);

      if(_check.length == 0){
        checkList.shift();
      }else if(!$component || _check.offset().top < $component.offset().top){
        idList.push(checkList[0]);
        checkList.shift();
      } else{
        match = false;
      }
    }
  }

  _.each($(compClass), function(component){
    var $component = $(component);

    addCheckList($component);

    var navObj = {};
    navObj.label = $component.data('nav-id');
    navObj.id = '#' + $component.attr('id');
    idList.push(navObj);
  });

  addCheckList();


  //inject list components into navbar
  function template(ele){
    return '<li class="' + (ele.color?'last ':'') + navContainer + '__list">'
            + '<a href="' + ele.id + '" data-link_cat="sub navigaton" data-link_id="sub_navigation_' + ele.label.toLowerCase() + '" '
            + 'data-link_meta="link_name:' + ele.label.toLowerCase() + '" data-link_position="sub navigation">' + ele.label + '</a>'
            + '</li>';
  }

  if(idList.length){
    _.each(idList, function(ele){
      $ele.ul.append(template(ele));
    });
  }


  $(function() {


    //define nav dimensions as nav global variable, in case of changing
    var navOffsetTop = $ele.container.offset().top;
    var navHeight = $ele.container.outerHeight();

    //use this variable to track which nav tag is underlined
    var underlinedTag = "";

     var underlineWidth = $ele.underline.width();
     var navBarOffsetLeft = $ele.container.offset().left;

     var moveUnderline = function(ele){
        var elePX = ele.offset().left;
        var eleWidth = ele.width();
        $ele.underline.css('left', elePX - navBarOffsetLeft + (eleWidth - underlineWidth)/2);
     }

     var moveUnderlineById = function(id){
        underlinedTag = id;
        moveUnderline($ele.getNavEleById(id));
     }


     function hideNavIfNoContent(){
        var i = 0;
        while (i < idList.length){
            if($(idList[i].id).children().length < 1){
              $('a[href^="' + idList[i].id + '"]').parent().hide();
              idList.splice(i, 1);
            }else{
              i++;
            }
        }
     }

     var stickTopNav = function(){

      //if nav is not fixed position, update nav offset top
      if(!$ele.outerContainer.hasClass($ele.fixClass)){
          navOffsetTop = $ele.section.offset().top;
      }

      //watch scroll event
      if( $(window).scrollTop() >= navOffsetTop){
          $ele.outerContainer.addClass($ele.fixClass);
          $ele.placeholder.show();
      }else{
          $ele.outerContainer.removeClass($ele.fixClass);
          $ele.placeholder.hide();
      }
     }

     var setUnderline = function(){

        var underlineShow = false;

        for(var i=idList.length-1; i>=0; i--){
            if($(idList[i].id).offset().top <= $(window).scrollTop() + navHeight){
                moveUnderlineById(idList[i].id);
                underlineShow = true;
                if(i == 0){
                  $ele.underline.css('opacity', 1);
                }
                break;
            }
        }

        if(!underlineShow){
            $ele.underline.css('opacity', 0);
        }
     }

     var mobileDropdownClick = function(e){
        e.preventDefault();

        $ele.icon.toggleClass( navContainer + '__icon__up');
        $ele.ul.slideToggle();
      }

     var initMobileDropdown = function(){
        $ele.wrap.off('click', mobileDropdownClick);
        if($(window).width() < 769){
          $ele.wrap.on('click', mobileDropdownClick);
         }
     }

     var scrollHandler = function() {
      hideNavIfNoContent();
      stickTopNav();
      setUnderline();
      initMobileDropdown();
     };


     function navClickHandler(obj){
        //hide dropdown for mobile
        if($(window).width() < 769){
          $ele.icon.toggleClass( navContainer + '__icon__up');
          $ele.ul.slideUp();
        }
          


        underlinedTag = obj.hash;
        var target = obj.hash,
           $target = $(target);

        if($target.length == 0 || idList.length == 0)
            return;

        var scrollTop = $target.offset().top - navHeight + 1;


        $(window).off('scroll', setUnderline);

        $('body').off('touchmove', setUnderline);

        var ele;
        ele = $(obj);

        moveUnderline(ele);
        $ele.underline.css('opacity', 1);

        $('html, body').stop().animate({
           'scrollTop': scrollTop
        }, 900, 'swing', function() {
            $(window).on('scroll', setUnderline);
            $('body').on('touchmove', setUnderline);
        });
    }

    $ele.getNavEleById('#').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        navClickHandler(this);
     });
     
    //Initialize when page load, in case of page scrolled already
    scrollHandler();

     //separately watch Stick & SetUnderline, to disable SetUnderline only when user click on nav
     $(window).on('scroll', stickTopNav);
     $(window).on('scroll', setUnderline);

     //add listener for Safari
     $('body').on('touchmove', stickTopNav);
     $('body').on('touchmove', setUnderline);


     //watch window size change for dynamic underline
     $(window).resize(function(){

        setTimeout(function (){
          navOffsetTop = $ele.section.offset().top;
          navHeight = $ele.container.outerHeight();
          navBarOffsetLeft = $ele.container.offset().left;

          if($(window).width() > 768){
            $ele.ul.show();
          } else {
            $ele.ul.hide();
          }
          initMobileDropdown();

          stickTopNav();
          if(underlinedTag != ""){
            moveUnderlineById(underlinedTag);
          }
        }, 500);

     });

  });

})(jQuery, window);