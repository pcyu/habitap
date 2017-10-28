(function($) {
  
    var app = {
      init: function() {
        app.registerHandler();
      },
      registerHandler: () => {
        $(document).on('submit', '#signup-submit', (e) => {
          e.preventDefault();
          let body = {
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            password: $('#password').val(),
            username: $('#username').val(),
          };
          let promise = new Promise((res, rej) => {
            $.ajax({
              contentType: "application/json; charset=utf-8",
              data: JSON.stringify(body),
              headers: {
                "accept": "application/json; odata=verbose"
              },
              type: 'POST',
              url: `http://localhost:3008/users/register`,
              success: (data) => {
                $('#showAll').empty();
                $('#showAll').append(`
                  <li class="listitem">
                    <div class="name h">Name</div>
                    <div class="active h">Active</div>
                    <div class="age h">Age</div>
                  </li>
                `);
                res();
              },
              error: (error) => {
                console.log(error);
                rej();
              }
            });
          });
        return promise;
        });
      },
      loadPage: (page) => {
        let target = $('#root');
        let _page = `src/templates/${page}.html`;
        // $(target).html(_page);
        $.get(_page, function(data) {
          $(target).html(data);
        }); 
      }
    };
  
    $(window).on('load', () => {
      app.init();
      app.loadPage("landing");
    });
  
    $(window).on('resize', () => {
      app.sizer();  //c007
    });
  
  })(window.jQuery);