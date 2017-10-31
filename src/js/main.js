(function($) {
  
    var app = {
      baseUrl: 'https://localhost:3008',
      name: '',
      init: function() {
        app.doLogin();
        app.getProtected();
        app.logoutHandler();
        app.signUpHandler();
      },
      doLogin: () => {
        $(document).on('click', '#t-login', () => {
          $("#t-modal-message").removeClass("active");
          $("#t-modal-sign-up").removeClass("active");
          $("#t-modal-login").toggleClass("active");
          $('#t-burger').prop('checked', false);
        });
        $(document).on('click', '#t-modal-login-button', () => {
          $("#t-modal-message").removeClass("active");
          $("#t-modal-login").toggleClass("active");
          $('#t-burger').prop('checked', false);
        });
        $(document).on('click', '#t-modal-sign-up-button', () => {
          $("#t-modal-message").removeClass("active");
          $("#t-modal-sign-up").toggleClass("active");
          $('#t-burger').prop('checked', false);
        });
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
            url: `https://localhost:3008/auth/login`,
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
              $("#t-modal-login").removeClass("active");
              $("#t-modal-message").empty();
              $("#t-modal-message").addClass("active");
              $("#t-modal-message").append(
                `
                <div id="t-modal-login-fail">Your login attempt has failed, please try again.</div>
                <a id="t-modal-login-button">Login</a>
                `
              )
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
          console.log(`You are now logged out.`);
          app.name ='';
          location.reload(true);
        });
      },
      signUpHandler: () => {
        $(document).on('click', '#t-sign-up', () => {
          $("#t-modal-message").removeClass("active");
          $("#t-modal-login").removeClass("active");
          $("#t-modal-sign-up").toggleClass("active");
          $('#t-burger').prop('checked', false);
        });
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
                $("#t-modal-sign-up").removeClass("active");
                $("#t-modal-message").empty();
                $("#t-modal-message").addClass("active");
                $("#t-modal-message").append(
                  `
                  <div id="t-modal-sign-up-success">Thank you ${body.firstName} ${body.lastName}! Your account has been created.</div>
                  <a id="t-modal-login-button">Login</a>
                  `
                )
                res();
              },
              error: (error) => {
                console.log(error);
                $("#t-modal-sign-up").removeClass("active");
                $("#t-modal-message").empty();
                $("#t-modal-message").addClass("active");
                $("#t-modal-message").append(
                  `
                  <div id="t-modal-sign-up-fail">${body.firstName} ${body.lastName}, Either your password needs to be ten characters long, or your username has already been selected.</div>
                  <a id="t-modal-sign-up-button">Sign-up</a>
                  `
                )
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