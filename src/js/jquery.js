(($) => {

  var app = {
    init: function() {
      app.unhideEdit();
      app.dynamicLength();
    },
    unhideEdit: () => {
      $('.text-box').keyup(function () {
        if ($.trim(this.value).length > 0) $('.edit-button').show()
        else $('.edit-button').hide()
      });
    },
    dynamicLength: () => {
      $.fn.textWidth = function(text, font) {
        if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $('<span>').hide().appendTo(document.body);
        $.fn.textWidth.fakeEl.text(text || this.val() || this.text() || this.attr('placeholder')).css('font', font || this.css('font'));
        return $.fn.textWidth.fakeEl.width();
      }; 
      $('.text-box').on('input', function() {
          var inputWidth = $(this).textWidth();
          $(this).css({
              width: inputWidth
          })
      }).trigger('input');    
      function inputWidth(elem, minW, maxW) {
          elem = $(this);
          console.log(elem)
      }
      var targetElem = $('.text-box');
      inputWidth(targetElem);
      },
  };

  $(window).on('load', () => {
    app.init();  //c028
  });

})(window.jQuery);
