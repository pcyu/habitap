(($) => {

  var app = {
    init: function() {
      app.activateEdit();
      app.deactivateEdit();
      app.showEditMode();
    },
    activateEdit: function() {
      for (let i = 0; i < 100; i++) {
    	$(document).on('mousedown', '#habit-question-'+i, function(event) {
        event.stopPropagation();
        console.log("active");
        return app.editToggle();
      });
      }
    },
    deactivateEdit: function() {
      for (let i = 0; i < 100; i++) {
      $(document).on("mousedown", function(event) {
        event.stopPropagation();
        console.log("deactive");
      	if(!$(event.target).closest('#text-box-'+i).length) {
          return app.editToggle();
        }
      });
      }
    },
    editToggle: function(status) {
      for (let i = 0; i < 100; i++) {
      if (status === true) {
      	$('#habit-question-'+i).addClass('hide');
      } else {
        $('#text-box-'+i).removeClass('hide');
      }
      }
    },
  };

  $(window).on('load', () => {
    app.init();  //c028
  });

})(window.jQuery);
