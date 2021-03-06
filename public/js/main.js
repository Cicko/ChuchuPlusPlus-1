$(document).ready(function() {
  var myCodeMirror = CodeMirror.fromTextArea(document.getElementById("input"), {
    lineNumbers: true,
    tabindex: 2
  });
  myCodeMirror.setSize(800, 200);
  myCodeMirror.setValue("");

  $('#parse').click(function() {
		let value = myCodeMirror.getValue();
        $.get("/parse",
          { data: value },
          function (data) {
			if(data.status == 'success') {
				let valueToShow = JSON.stringify(data.result, undefined, 2);
				//let valueToShow = data.result;
				$("#output").html('<b>Generated Tree (JSON format):</b><br><textarea rows="30" cols="150" style="resize: none;">' + valueToShow + '</textarea><br><br><br><br>');
			} else if(data.status == 'error') {
				$("#output").html('<div class="error">ERROR:<br>' + data.result + '</div><br><br><br><br>');
			}
          },
          'json'
        );
  });

  $('#loginImage').click(function() {
		 $('#myModal').show()
  });
  
  // Load buttons from database on page load
  (function(){
    $.ajax({ url: '/getAllPrograms'
         , type: 'GET'
        })
    .done(function(data) {
	  data.forEach( function(v) { 
			// Add the button for every stored program
			$("#storedPrograms").append('<button type="button" class="programbutton btn btn-info" name="' + v + '">' + v + '</button>');
	  } );
    });
  })();
  //
  
  // Delegated event handler para los botones
  $('#storedPrograms').on('click', 'button.programbutton', function(){
    //console.log(this.name);
	$.get("/getProgram/xxx",
          { nombre: this.name },
          function (data) {
			myCodeMirror.setValue(data);
          },
          'json'
        );
  });
  //
	
	$("#cleanDB").click( () => {
      $.get("/cleanDB");
      $("#storedPrograms").empty();
      alert("The programs database has been cleaned up!");
    });
	
    $('#saveProgramButton').click(function() {
		var valueToSent = {};
		valueToSent.program = myCodeMirror.getValue();
		valueToSent.owner = 'User';
		valueToSent.name = $("#saveas").val();
        $.get("/addProgram",
          { data: valueToSent },
          function (data) {
				$("#storedPrograms").append('<button type="button" class="programbutton btn btn-info" name="' + valueToSent.name + '">' + valueToSent.name + '</button>');
          },
          'json'
        );
  });

});

$(function() {

    var $formLogin = $('#login-form');
    var $formRegister = $('#register-form');
    var $divForms = $('#div-forms');
    var $modalAnimateTime = 300;
    var $msgAnimateTime = 150;
    var $msgShowTime = 2000;

    $("form").submit(function () {
        switch(this.id) {
            case "login-form":
                var $lg_username=$('#login_username').val();
				var $lg_password=$('#login_password').val();

				var checkResult;
				var valueToSent = {};
				valueToSent.name = $('#login_username').val();
				valueToSent.password = $('#login_password').val();
				$.ajaxSetup({async: false});
				$.get("/validateCredentials",
				{ async: false,
				  data: valueToSent },
					function (data) {
					checkResult = data.text;
				},
				'json'
				);

                if (checkResult == 'yes') {
					msgChange($('#div-login-msg'), $('#icon-login-msg'), $('#text-login-msg'), "success", "glyphicon-ok", "Login OK");
                } else {
                    msgChange($('#div-login-msg'), $('#icon-login-msg'), $('#text-login-msg'), "error", "glyphicon-remove", "Login error");
                }
                return false;
                break;
            case "register-form":
                var $rg_username=$('#register_username').val();
                var $rg_email=$('#register_email').val();
                var $rg_password=$('#register_password').val();

				var checkResult;
				var valueToSent = {};
				valueToSent.name = $('#register_username').val();
				$.ajaxSetup({async: false});
				$.when($.get("/accountExists",
				{ async: false,
				  data: valueToSent },
					function (data) {
					checkResult = data.text;
				},
				'json'
				)).then(function(){
					if (checkResult == 'yes') {
					msgChange($('#div-register-msg'), $('#icon-register-msg'), $('#text-register-msg'), "error", "glyphicon-remove", "Account already exists");
                } else {
					valueToSent.name = $('#register_username').val();
					valueToSent.password = $('#register_password').val();
					$.ajaxSetup({async: false});
					$.when($.get("/createAccount",
					{ async: false,
					  data: valueToSent },
						function (data) {
					},
					'json'
					)).then(function(){
						// thing b
					});

					msgChange($('#div-register-msg'), $('#icon-register-msg'), $('#text-register-msg'), "success", "glyphicon-ok", "Register OK");
                }
                return false;
				});

                break;
            default:
                return false;
        }
        return false;
    });

    $('#login_register_btn').click( function () { modalAnimate($formLogin, $formRegister) });
    $('#register_login_btn').click( function () { modalAnimate($formRegister, $formLogin); });

    function modalAnimate ($oldForm, $newForm) {
        var $oldH = $oldForm.height();
        var $newH = $newForm.height();
        $divForms.css("height",$oldH);
        $oldForm.fadeToggle($modalAnimateTime, function(){
            $divForms.animate({height: $newH}, $modalAnimateTime, function(){
                $newForm.fadeToggle($modalAnimateTime);
            });
        });
    }

    function msgFade ($msgId, $msgText) {
        $msgId.fadeOut($msgAnimateTime, function() {
            $(this).text($msgText).fadeIn($msgAnimateTime);
        });
    }

    function msgChange($divTag, $iconTag, $textTag, $divClass, $iconClass, $msgText) {
        var $msgOld = $divTag.text();
        msgFade($textTag, $msgText);
        $divTag.addClass($divClass);
        $iconTag.removeClass("glyphicon-chevron-right");
        $iconTag.addClass($iconClass + " " + $divClass);
        setTimeout(function() {
            msgFade($textTag, $msgOld);
            $divTag.removeClass($divClass);
            $iconTag.addClass("glyphicon-chevron-right");
            $iconTag.removeClass($iconClass + " " + $divClass);
  		}, $msgShowTime);
    }
});
