(($) => {

  var app = {
    init: function() {
      app.unhideEdit();
    },
    unhideEdit: () => {
      for (let i = 0; i < 100; i++) {
        $('#text-box-'+i).keyup(function () {
          if ($.trim(this.value).length > 0) $('#edit-button-'+i).show()
          else $('#edit-button-'+i).hide()
        });
      }
    }
  };

  $(window).on('load', () => {
    app.init();  //c028
  });

})(window.jQuery);
