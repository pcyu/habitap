(($) => {

  var app = {
    init: function() {
      app.activateEdit();
    },
    activateEdit: function() {
      for (let i = 0; i < 5; i++) {
    	$("#edit-button-"+i).on('click', function(event) {
        $("#text-box-"+i).css("display", "block")
      });
      }
    }
  };

  $(window).on('load', () => {
    app.init();  //c028
  });

})(window.jQuery);
