(function($) {
  
    var app = {
      baseUrl: 'http://localhost:3008',
      name: '',
      init: function() {
        app.doLogin();
        app.getProtected();
        app.logoutHandler();
        app.signUpHandler();
      },
      doLogin: () => {
        $(document).on('submit', '#login-submit', (e) => {
          e.preventDefault();
          app.loginHandler()
            .then(app.loadEndpoint);
        });
      },
      getProtected: () => {
        $(document).on('submit', '#get-protected', (e) => {
          e.preventDefault();
          let _token = `Bearer ${localStorage.getItem('jwToken')}`;
          let promise = new Promise((res, rej) => {
            $.ajax({
              // beforeSend: (req) => { req.setRequestHeader("Authorization", app.token) },
              headers: {
                "accept": "application/json; odata=verbose",
                "Authorization": _token
              },
              type: 'GET',
              url: `${app.baseUrl}/protected`,
              success: (item) => {
                console.log(item);
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
      loadEndpoint: () => {
        let _token = `Bearer ${localStorage.getItem('jwToken')}`;
        let promise = new Promise((res, rej) => {
          $.ajax({
            // beforeSend: (req) => { req.setRequestHeader("Authorization", app.token) },
            headers: {
              "accept": "application/json; odata=verbose",
              "Authorization": _token
            },
            type: 'GET',
            url: `${app.baseUrl}/protected`,
            success: (item) => {
              app.loadPage('protected');
              res();
            },
            error: (error) => {
              console.log(error);
              rej();
            }
          });
        });
        return promise;
      },
      loginHandler: () => {
        let _body = {
          username: $('#login-username').val(),
          password: $('#login-password').val()
        };
        let promise = new Promise((res, rej) => {
          $.ajax({
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(_body),
            headers: {
              "accept": "application/json; odata=verbose",
            },
            type: 'POST',
            url: `http://localhost:3008/auth/login`,
            success: (data) => {
              app.name = `${data.profile.firstName} ${data.profile.lastName}`;
              $('#login-username').val('');
              $('#login-password').val('');
              localStorage.setItem('jwToken', data.profile.token);
              console.log(`Welcome ${app.name}! You are now logged in.`);
              res();
            },
            error: (error) => {
              console.log(error);
              rej();
            }
          });
        });
        return promise;
      },
      logoutHandler: () => {
        $(document).on('submit', '#do-logout', (e) => {
          e.preventDefault();
          localStorage.removeItem('jwToken');
          console.log(`Goodbye ${app.name}! You are now logged out.`);
          app.name ='';
        });
      },
      signUpHandler: () => {
        $(document).on('submit', '#sign-up-submit', (e) => {
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
              url: `${app.baseUrl}/users/register`,
              success: (data) => {
                console.log(`Thank you ${body.firstName} ${body.lastName}! Your account has been created.`);
                $('#firstName').val('');
                $('#lastName').val('');
                $('#username').val('');
                $('#password').val('');
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