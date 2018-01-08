(($) => {

  var app = {
    init: function() {
      app.unhideEdit();
    },
    unhideEdit: () => {
      $('.text-box').keyup(function () {
        if ($.trim(this.value).length > 0) $('.edit-button').show()
        else $('.edit-button').hide()
      });
    }
  };

  $(window).on('load', () => {
    app.init();  //c028
  });

})(window.jQuery);
