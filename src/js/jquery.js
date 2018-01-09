(($) => {

  var app = {
    init: function() {
      app.unhideBox();
      app.hideBox();
    },
    unhideBox: () => {
      for (let i = 0; i < 100; i++) {
        $('#updateForm-'+i).mouseover(function () {
          $('#text-box-'+i).css("display", "block");
          $('#habit-question-'+i).css("display", "none");
          $('#edit-button-'+i).show()
        });
      }
    },
    hideBox: () => {
      for (let i = 0; i < 100; i++) {
        $('#updateForm-'+i).mouseout(function () {
          $('#text-box-'+i).css("display", "none");
          $('#habit-question-'+i).css("display", "block");
          $('#edit-button-'+i).hide()
        });
      }
    }
  };

  $(window).on('load', () => {
    app.init();  //c028
  });

})(window.jQuery);
