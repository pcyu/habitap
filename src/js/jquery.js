(($) => {

  var app = {
    init: function() {
      app.demo();
    },
    demo: function() {
    	$("#demo").on('click', function() {
        event.preventDefault();
        $(".demoLogin").submit();
      });
    }
  };

  $(window).on('load', () => {
    app.init();  //c028
  });

})(window.jQuery);
