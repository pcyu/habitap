(function($) {

    var app = {
      baseUrl: 'http://localhost:3008',
      init: function() {
        // app.habitDashboard();
        // app.getUserPage();
        // app.loginExec();
        // app.loginModal();
        // app.logoutHandler();
        // app.signUpHandler();
      },
      habitDashboard: () => {
        $(document).on('click', '#t-habit-entry', () => {
          app.loadPage("habit-form");
          $('#t-burger').prop('checked', false);
        });
        // $(document).on('click', '#t-habit-history', () => {
        //   $('#t-burger').prop('checked', false);
        // });
      },
      getUserPage: () => {
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
      loadPage: (page) => {
        let target = $('#root');
        let _page = `src/views/${page}.html`;
        $.get(_page, function(data) {
          $(target).html(data);
        });
      },
      loadProfile: (username) => {
        let _token = `Bearer ${localStorage.getItem('jwToken')}`;
//        let promise = new Promise((res, rej) => {
          $.ajax({
            headers: {
              "accept": "application/json; odata=verbose",
              "Authorization": _token
            },
            type: 'GET',
            url: `${app.baseUrl}/users/${username}`,
            success: (item) => {
              window.location.href = `${app.baseUrl}/users/profile`;

                $('#welcome').html( "<span class='red'>Hello <b>Again</b></span>" );

//              res();
            },
            error: (error) => {
              console.log(error);
//              rej();
            }
          });
//        });
//        return promise;
      },
      loginExec: () => {
        $(document).on('submit', '#login-submit', (e) => {
          e.preventDefault();
          app.loginHandler();
        });
      },
      loginHandler: () => {
        let _body = {
          username: $('#login-username').val(),
          password: $('#login-password').val()
        };
//        let promise = new Promise((res, rej) => {
          $.ajax({
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(_body),
            headers: {
              "accept": "application/json; odata=verbose",
            },
            type: 'POST',
            url: `http://localhost:3008/auth/login`,
            success: (data) => {
              app.profile.name = `${data.profile.firstName} ${data.profile.lastName}`;
              $('#login-username').val('');
              $('#login-password').val('');
              localStorage.setItem('jwToken', data.profile.token);
              app.loadProfile(_body.username);
//              res();
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
//              rej();
            }
          });
//        });
//        return promise;
      },
      loginModal: () => {
        $(document).on('click', '#t-login', (e) => {
          e.preventDefault();
          if($('.y-modal.signup').hasClass('active')) {
            $('.y-modal.signup').removeClass('active');
            $('.y-modal.login').addClass('active');
          } else {
            $('.y-modal.login').toggleClass('active');
          }
          $('#t-burger').prop('checked', false);
        });
      },
      logoutHandler: () => {
        $(document).on('click', '#t-logout', (e) => {
          e.preventDefault();
          localStorage.removeItem('jwToken');
          console.log(`You are now logged out.`);
          app.profile.name ='';
          location.reload(true);
        });
      },
      profile: {
        name: ''
      },
      signUpHandler: () => {
        $(document).on('click', '#t-sign-up', () => {
          // $("#t-modal-message").removeClass("active");
          if($('.y-modal.login').hasClass('active')) {
            $('.y-modal.login').removeClass('active');
            $('.y-modal.signup').addClass('active');
          } else {
            $('.y-modal.signup').toggleClass('active');
          }
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
      }
    };

    $(window).on('load', () => {
      app.init();
    });

  })(window.jQuery);
