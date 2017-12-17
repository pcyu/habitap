(function($) {
  
      var app = {
        baseUrl: 'http://localhost:3007',
        init: function() {
          app.dailyCheck()
          app.cronJob();
        },
        dailyCheck: () => {
          $(document).on('submit', '.login-button', (e) => {
            e.preventDefault();
            $( ".individual-form-item" ).remove();
          });
        },
        cronJob: () => {
          $(document).on('submit', '.login-button', (e) => {
            e.preventDefault();
            $( ".individual-form-item" ).remove();
          });
        }
      };
      $(window).on('load', () => {
        app.init();
      });
  
    })(window.jQuery);