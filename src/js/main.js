(function($) {
  
    var app = {
      box: function(){
        $('head').append('<style>.viewport{background:rgba(0,0,0,0.7);bottom:0;color:white;cursor:pointer;font-size:10px;font-family:"LucidaGrande","Helvetica",sans-serif;line-height:14px;padding-bottom:4px;padding-left:6px;padding-right:6px;padding-top:4px;position:fixed;right:0;z-index:999}.viewport.inactive{opacity:0}#responsive-width,#responsive-height{display:inline-block}</style>');
        $('body').append('<div class="viewport"><div id="responsive-width"></div> x <div id="responsive-height"></div></div>');
      },
      calculateDimensions: function(){
        var viewportWidth = window.innerWidth;
        var viewportHeight = window.innerHeight;
        $("#responsive-width").html(viewportWidth);
        $("#responsive-height").html(viewportHeight);
      },
      init: function() {
        //app.testAlert();  //c002
        app.box();
        app.mobileToggle();
        app.sizer();  //c007
      },
      mobileToggle: function() {  //c009
        $(document).on('click', '#t-mobileicon', function() {
          $('html').toggleClass('disable');
          $(this).toggleClass('active');
          $('#t-navitems').toggleClass('active');
          $('#t-overlay').toggleClass('active');
        });
      },
      sizer: function() {
        app.calculateDimensions();
        app.toggleBox();
      },
      testAlert: function() {
        alert('JS is hooked up correctly.');
      },
      toggleBox: function(){
        $('.viewport').click(function(){
          $(this).toggleClass('inactive');
        });
      }
    };
  
    $(window).on('load', () => {
      app.init();
    });
  
    $(window).on('resize', () => {
      app.sizer();  //c007
    });
  
  })(window.jQuery);