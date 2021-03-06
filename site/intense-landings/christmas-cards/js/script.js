/**
 * Global variables
 */
"use strict";

var userAgent = navigator.userAgent.toLowerCase(),
	initialDate = new Date(),

	$document = $(document),
	$window = $(window),
	$html = $("html"),

	isDesktop = $html.hasClass("desktop"),
	isIE = userAgent.indexOf("msie") != -1 ? parseInt(userAgent.split("msie")[1]) : userAgent.indexOf("trident") != -1 ? 11 : userAgent.indexOf("edge") != -1 ? 12 : false,
	isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
	isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor),
	isTouch = "ontouchstart" in window,
	c3ChartsArray = [],
	livedemo = false,
	isNoviBuilder,

	plugins = {
		pointerEvents: isIE < 11 ? "js/pointer-events.min.js" : false,
		rdNavbar: $(".rd-navbar"),
		toggles: $(".toggle-custom"),
		customToggle: $("[data-custom-toggle]"),
		customWaypoints: $('[data-waypoint-to]'),
		resizable: $(".resizable"),
		pageLoader: $(".page-loader"),
		captcha: $('.recaptcha'),
		copyrightYear: $(".copyright-year"),
		rdInputLabel: $(".form-label"),
		regula: $("[data-constraints]"),
		rdMailForm: $(".rd-mailform"),
		lightGallery: $("[data-lightgallery='group']"),
		lightGalleryItem: $("[data-lightgallery='item']"),
		lightDynamicGalleryItem: $("[data-lightgallery='dynamic']"),
		snow: document.getElementById('canv'),
		bgAudio: document.querySelector('.bg-audio')
	};

	
/**
 * isScrolledIntoView
 * @description  check the element whas been scrolled into the view
 */
function isScrolledIntoView(elem) {
	return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
}


$window.on('load', function () {


});


$document.ready(function () {
	isNoviBuilder = window.xMode;

	if(isSafari) {
		$html.addClass('safari');
	}
	
	
	/**
	 * initOnView
	 * @description  calls a function when element has been scrolled into the view
	 */
	function lazyInit(element, func) {
		var init = function () {
			if (!element.hasClass('lazy-loaded') && isScrolledIntoView(element)) {
				func.call(element);
				element.addClass('lazy-loaded');
			}
		};

		init();
		$window.on('scroll', init);
	}




	/**
	 * attachFormValidator
	 * @description  attach form validation to elements
	 */
	function attachFormValidator(elements) {
		for (var i = 0; i < elements.length; i++) {
			var o = $(elements[i]), v;
			o.addClass("form-control-has-validation").after("<span class='form-validation'></span>");
			v = o.parent().find(".form-validation");
			if (v.is(":last-child")) {
				o.addClass("form-control-last-child");
			}
		}

		elements
			.on('input change propertychange blur', function (e) {
				var $this = $(this), results;

				if (e.type !== "blur") {
					if (!$this.parent().hasClass("has-error")) {
						return;
					}
				}

				if ($this.parents('.rd-mailform').hasClass('success')) {
					return;
				}

				if ((results = $this.regula('validate')).length) {
					for (i = 0; i < results.length; i++) {
						$this.siblings(".form-validation").text(results[i].message).parent().addClass("has-error")
					}
				} else {
					$this.siblings(".form-validation").text("").parent().removeClass("has-error")
				}
			})
			.regula('bind');

		var regularConstraintsMessages = [
			{
				type: regula.Constraint.Required,
				newMessage: "The text field is required."
			},
			{
				type: regula.Constraint.Email,
				newMessage: "The email is not a valid email."
			},
			{
				type: regula.Constraint.Numeric,
				newMessage: "Only numbers are required"
			},
			{
				type: regula.Constraint.Selected,
				newMessage: "Please choose an option."
			}
		];

		for (var i = 0; i < regularConstraintsMessages.length; i++) {
			var regularConstraint = regularConstraintsMessages[i];

			regula.override({
				constraintType: regularConstraint.type,
				defaultMessage: regularConstraint.newMessage
			});
		}
	}

	/**
	 * isValidated
	 * @description  check if all elemnts pass validation
	 */
	function isValidated(elements, captcha) {
		var results, errors = 0;

		if (elements.length) {
			for (j = 0; j < elements.length; j++) {

				var $input = $(elements[j]);
				if ((results = $input.regula('validate')).length) {
					for (k = 0; k < results.length; k++) {
						errors++;
						$input.siblings(".form-validation").text(results[k].message).parent().addClass("has-error");
					}
				} else {
					$input.siblings(".form-validation").text("").parent().removeClass("has-error")
				}
			}

			if (captcha) {
				if (captcha.length) {
					return validateReCaptcha(captcha) && errors == 0
				}
			}

			return errors == 0;
		}
		return true;
	}

	/**
	 * validateReCaptcha
	 * @description  validate google reCaptcha
	 */
	function validateReCaptcha(captcha) {
		var captchaToken = captcha.find('.g-recaptcha-response').val();

		if (captchaToken.length === 0) {
			captcha
				.siblings('.form-validation')
				.html('Please, prove that you are not robot.')
				.addClass('active');
			captcha
				.closest('.form-group')
				.addClass('has-error');

			captcha.on('propertychange', function () {
				var $this = $(this),
					captchaToken = $this.find('.g-recaptcha-response').val();

				if (captchaToken.length > 0) {
					$this
						.closest('.form-group')
						.removeClass('has-error');
					$this
						.siblings('.form-validation')
						.removeClass('active')
						.html('');
					$this.off('propertychange');
				}
			});

			return false;
		}

		return true;
	}

	/**
	 * onloadCaptchaCallback
	 * @description  init google reCaptcha
	 */
	window.onloadCaptchaCallback = function () {
		for (i = 0; i < plugins.captcha.length; i++) {
			var $capthcaItem = $(plugins.captcha[i]);

			grecaptcha.render(
				$capthcaItem.attr('id'),
				{
					sitekey: $capthcaItem.attr('data-sitekey'),
					size: $capthcaItem.attr('data-size') ? $capthcaItem.attr('data-size') : 'normal',
					theme: $capthcaItem.attr('data-theme') ? $capthcaItem.attr('data-theme') : 'light',
					callback: function (e) {
						$('.recaptcha').trigger('propertychange');
					}
				}
			);
			$capthcaItem.after("<span class='form-validation'></span>");
		}
	};

	/**
	 * parseJSONObject
	 * @description  return JSON object witch methods
	 */
	function parseJSONObject(element, attr) {
		return JSON.parse($(element).attr(attr), function (key, value) {
			if ((typeof value) === 'string') {
				if (value.indexOf('function') == 0) {
					return eval('(' + value + ')');
				}
			}
			return value;
		});
	}


	/**
	 * IE Polyfills
	 * @description  Adds some loosing functionality to IE browsers
	 */
	if (isIE) {
		if (isIE < 10) {
			$html.addClass("lt-ie-10");
		}

		if (isIE < 11) {
			if (plugins.pointerEvents) {
				$.getScript(plugins.pointerEvents)
					.done(function () {
						$html.addClass("ie-10");
						PointerEventsPolyfill.initialize({});
					});
			}
		}

		if (isIE === 11) {
			$("html").addClass("ie-11");
		}

		if (isIE === 12) {
			$("html").addClass("ie-edge");
		}
	}


	/**
	 * Copyright Year
	 * @description  Evaluates correct copyright year
	 */
	if (plugins.copyrightYear.length) {
		plugins.copyrightYear.text(initialDate.getFullYear());
	}

	/**
	 * RD Input Label
	 * @description Enables RD Input Label Plugin
	 */
	if (plugins.rdInputLabel.length) {
		plugins.rdInputLabel.RDInputLabel();
	}


	/**
	 * Toggles
	 * @description Make toggles from input[type="checkbox"]
	 */
	if (plugins.toggles.length) {
		var i;
		for (i = 0; i < plugins.toggles.length; i++) {
			var $this = $(plugins.toggles[i]);
			$this.after("<span class='toggle-custom-dummy'></span>")
		}
	}

	/**
	 * Regula
	 * @description Enables Regula plugin
	 */
	if (plugins.regula.length) {
		attachFormValidator(plugins.regula);
	}

	/**
	 * WOW
	 * @description Enables Wow animation plugin
	 */
	if (!isNoviBuilder && $html.hasClass('desktop') && $html.hasClass("wow-animation") && $(".wow").length) {
		new WOW().init();
	}

	/**
	 * RD Navbar
	 * @description Enables RD Navbar plugin
	 */
	if (plugins.rdNavbar.length) {
		var navbar = plugins.rdNavbar,
			aliases = {'0': '-', '480': '-xs-', '768': '-sm-', '992': '-md-', '1200': '-lg-'},
			responsiveNavbar = {};

		for (var alias in aliases) {
			responsiveNavbar[alias] = {};
			if (navbar.attr('data' + aliases[alias] + 'layout')) responsiveNavbar[alias].layout = navbar.attr('data' + aliases[alias] + 'layout');
			else responsiveNavbar[alias].layout = 'rd-navbar-fixed';
			if (navbar.attr('data' + aliases[alias] + 'device-layout')) responsiveNavbar[alias].deviceLayout = navbar.attr('data' + aliases[alias] + 'device-layout');
			else responsiveNavbar[alias].deviceLayout = 'rd-navbar-fixed';
			if (navbar.attr('data' + aliases[alias] + 'hover-on')) responsiveNavbar[alias].focusOnHover = navbar.attr('data' + aliases[alias] + 'hover-on') === 'true';
			if (navbar.attr('data' + aliases[alias] + 'auto-height')) responsiveNavbar[alias].autoHeight = navbar.attr('data' + aliases[alias] + 'auto-height') === 'true';
			if (navbar.attr('data' + aliases[alias] + 'stick-up-offset')) responsiveNavbar[alias].stickUpOffset = navbar.attr('data' + aliases[alias] + 'stick-up-offset');
			if (navbar.attr('data' + aliases[alias] + 'stick-up') && !isNoviBuilder) responsiveNavbar[alias].stickUp = navbar.attr('data' + aliases[alias] + 'stick-up') === 'true';
			else responsiveNavbar[alias].stickUp = false;

			if ($.isEmptyObject(responsiveNavbar[alias])) delete responsiveNavbar[alias];
		}

		navbar.RDNavbar({
			stickUpClone: ( !isNoviBuilder && navbar.attr("data-stick-up-clone") ) ? navbar.attr("data-stick-up-clone") === 'true' : false,
			stickUpOffset: ( navbar.attr("data-stick-up-offset") ) ? navbar.attr("data-stick-up-offset") : 1,
			anchorNavOffset: -78,
			anchorNav: !isNoviBuilder,
			anchorNavEasing: 'linear',
			focusOnHover: !isNoviBuilder,
			responsive: responsiveNavbar,
			onDropdownOver: function () {
				return !isNoviBuilder;
			}
		});

		if (navbar.attr("data-body-class")) {
			document.body.className += ' ' + navbar.attr("data-body-class");
		}
	}


	/**
	 * Page loader
	 * @description Enables Page loader
	 */
	if (plugins.pageLoader.length) {
		var pageLoaded = function () {
			plugins.pageLoader.addClass('loaded');
			$window.trigger('resize');
		};

		if (!isNoviBuilder) setTimeout(pageLoaded, 200);
		else pageLoaded();
	}


	/**
	 * UI To Top
	 * @description Enables ToTop Button
	 */
	if (!isNoviBuilder && isDesktop) {
		$().UItoTop({
			easingType: 'easeOutQuart',
			containerClass: 'ui-to-top icon icon-xs icon-circle icon-darker-filled mdi mdi-chevron-up'
		});
	}

	/**
	 * Google ReCaptcha
	 * @description Enables Google ReCaptcha
	 */
	if (plugins.captcha.length) {
		$.getScript("//www.google.com/recaptcha/api.js?onload=onloadCaptchaCallback&render=explicit&hl=en");
	}


	/**
	 * RD Mailform
	 */
	if (plugins.rdMailForm.length) {
		var i, j, k,
			msg = {
				'MF000': 'Successfully sent!',
				'MF001': 'Recipients are not set!',
				'MF002': 'Form will not work locally!',
				'MF003': 'Please, define email field in your form!',
				'MF004': 'Please, define type of your form!',
				'MF254': 'Something went wrong with PHPMailer!',
				'MF255': 'Aw, snap! Something went wrong.'
			};

		for (i = 0; i < plugins.rdMailForm.length; i++) {
			var $form = $(plugins.rdMailForm[i]),
				formHasCaptcha = false;

			$form.attr('novalidate', 'novalidate').ajaxForm({
				data: {
					"form-type": $form.attr("data-form-type") || "contact",
					"counter": i
				},
				beforeSubmit: function (arr, $form, options) {

					var form = $(plugins.rdMailForm[this.extraData.counter]),
						inputs = form.find("[data-constraints]"),
						output = $("#" + form.attr("data-form-output")),
						captcha = form.find('.recaptcha'),
						captchaFlag = true;

					output.removeClass("active error success");

					if (isValidated(inputs, captcha)) {

						// veify reCaptcha
						if (captcha.length) {
							var captchaToken = captcha.find('.g-recaptcha-response').val(),
								captchaMsg = {
									'CPT001': 'Please, setup you "site key" and "secret key" of reCaptcha',
									'CPT002': 'Something wrong with google reCaptcha'
								};

							formHasCaptcha = true;

							$.ajax({
								method: "POST",
								url: "bat/reCaptcha.php",
								data: {'g-recaptcha-response': captchaToken},
								async: false
							}).done(function (responceCode) {
								if (responceCode !== 'CPT000') {
									if (output.hasClass("snackbars")) {
										output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + captchaMsg[responceCode] + '</span></p>')

										setTimeout(function () {
											output.removeClass("active");
										}, 3500);

										captchaFlag = false;
									} else {
										output.html(captchaMsg[responceCode]);
									}

									output.addClass("active");
								}
							});
						}

						if (!captchaFlag) {
							return false;
						}

						form.addClass('form-in-process');

						if (output.hasClass("snackbars")) {
							output.html('<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>');
							output.addClass("active");
						}
					} else {
						return false;
					}
				},
				error: function (result) {

					var output = $("#" + $(plugins.rdMailForm[this.extraData.counter]).attr("data-form-output")),
						form = $(plugins.rdMailForm[this.extraData.counter]);

					output.text(msg[result]);
					form.removeClass('form-in-process');

					if (formHasCaptcha) {
						grecaptcha.reset();
					}
				},
				success: function (result) {

					var form = $(plugins.rdMailForm[this.extraData.counter]),
						output = $("#" + form.attr("data-form-output")),
						select = form.find('select');

					form
						.addClass('success')
						.removeClass('form-in-process');

					if (formHasCaptcha) {
						grecaptcha.reset();
					}

					result = result.length === 5 ? result : 'MF255';
					output.text(msg[result]);

					if (result === "MF000") {
						if (output.hasClass("snackbars")) {
							output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + msg[result] + '</span></p>');
						} else {
							output.addClass("active success");
						}
					} else {
						if (output.hasClass("snackbars")) {
							output.html(' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + msg[result] + '</span></p>');
						} else {
							output.addClass("active error");
						}
					}

					form.clearForm();

					if (select.length) {
						select.select2("val", "");
					}

					form.find('input, textarea').trigger('blur');

					setTimeout(function () {
						output.removeClass("active error success");
						form.removeClass('success');
					}, 3500);
				}
			});
		}
	}

	/**
	 * Custom Toggles
	 */
	if (plugins.customToggle.length) {
		var i;
		for (i = 0; i < plugins.customToggle.length; i++) {
			var $this = $(plugins.customToggle[i]);
			$this.on('click', function (e) {
				e.preventDefault();
				$("#" + $(this).attr('data-custom-toggle')).add(this).toggleClass('active');
			});

			if ($this.attr("data-custom-toggle-disable-on-blur") === "true") {
				$("body").on("click", $this, function (e) {
					if (e.target !== e.data[0] && $("#" + e.data.attr('data-custom-toggle')).find($(e.target)).length == 0 && e.data.find($(e.target)).length == 0) {
						$("#" + e.data.attr('data-custom-toggle')).add(e.data[0]).removeClass('active');
					}
				})
			}
		}
	}

	/**
	 * Custom Waypoints
	 */
	if (plugins.customWaypoints.length) {
		var i;
		plugins.customWaypoints = $document.find('[data-waypoint-to]');

		for (i = 0; i < plugins.customWaypoints.length; i++) {
			var item = plugins.customWaypoints[i];

			$(item).on("click", function (e) {
				e.preventDefault();
				console.log($(this));
				$("body, html").stop().animate({
					scrollTop: $($(this).attr('data-waypoint-to')).offset().top
				}, 1000, function () {
					$(window).trigger("resize");
				});
			});
		}
	}




	/**
	 * lightGallery
	 * @description Enables lightGallery plugin
	 */
	function initLightGallery(itemsToInit, addClass) {
		$(itemsToInit).lightGallery({
			thumbnail: $(itemsToInit).attr("data-lg-thumbnail") !== "false",
			selector: "[data-lightgallery='item']",
			autoplay: $(itemsToInit).attr("data-lg-autoplay") === "true",
			pause: parseInt($(itemsToInit).attr("data-lg-autoplay-delay")) || 5000,
			addClass: addClass,
			mode: $(itemsToInit).attr("data-lg-animation") || "lg-slide",
			loop: $(itemsToInit).attr("data-lg-loop") !== "false"
		});
	}

	function initDynamicLightGallery(itemsToInit, addClass) {
		$(itemsToInit).on("click", function () {
			$(itemsToInit).lightGallery({
				thumbnail: $(itemsToInit).attr("data-lg-thumbnail") !== "false",
				selector: "[data-lightgallery='item']",
				autoplay: $(itemsToInit).attr("data-lg-autoplay") === "true",
				pause: parseInt($(itemsToInit).attr("data-lg-autoplay-delay")) || 5000,
				addClass: addClass,
				mode: $(itemsToInit).attr("data-lg-animation") || "lg-slide",
				loop: $(itemsToInit).attr("data-lg-loop") !== "false",
				dynamic: true,
				dynamicEl: JSON.parse($(itemsToInit).attr("data-lg-dynamic-elements")) || []
			});
		});
	}

	function initLightGalleryItem(itemToInit, addClass) {
		$(itemToInit).lightGallery({
			selector: "this",
			addClass: addClass,
			counter: false,
			youtubePlayerParams: {
				modestbranding: 1,
				showinfo: 0,
				rel: 0,
				controls: 0
			},
			vimeoPlayerParams: {
				byline: 0,
				portrait: 0
			}
		});
	}

	if (!isNoviBuilder && plugins.lightGallery.length) {
		for (var i = 0; i < plugins.lightGallery.length; i++) initLightGallery(plugins.lightGallery[i]);
	}

	if (!isNoviBuilder && plugins.lightGalleryItem.length) {
		for (var i = 0; i < plugins.lightGalleryItem.length; i++) initLightGalleryItem(plugins.lightGalleryItem[i]);
	}

	if (!isNoviBuilder && plugins.lightDynamicGalleryItem.length) {
		for (var i = 0; i < plugins.lightDynamicGalleryItem.length; i++) initDynamicLightGallery(plugins.lightDynamicGalleryItem[i]);
	}


	/**
	 * Enable parallax by mouse
	 */
	var parallaxJs = document.getElementsByClassName('parallax-scene-js');
	var screenLg = window.innerWidth;
	if (parallaxJs && !isNoviBuilder && screenLg > 992 && !isMobile) {
		for (var i = 0; i < parallaxJs.length; i++) {
			var scene = parallaxJs[i];
			new Parallax(scene);
		}
	}

	// Canvas snow
	if( screenLg > 992 && plugins.snow && !isMobile) {
		getSnow(plugins.snow);
	}

	// bg sound
	if( plugins.bgAudio ) {
		var handler = function() {
			var playPromise = this.track.play();

			if( playPromise ) {
				playPromise.then( null, (function() {
					this.playBtn.classList.add( 'button-mute' );
					this.popup.classList.add( 'active' );
				}).bind( this ));
			}

			if ( this.playBtn ) {
				this.playBtn.addEventListener( 'click', (function() {
					if( this.track.paused ) {
						this.playBtn.classList.remove( 'button-mute' );
						this.popup.classList.remove( 'active' );
						this.track.play();
					} else {
						this.playBtn.classList.add( 'button-mute' );
						this.track.pause();
					}
				}).bind( this ));
			}
		};

		plugins.bgAudio.track = plugins.bgAudio.querySelector( 'audio' );
		plugins.bgAudio.playBtn = plugins.bgAudio.querySelector( '.audio-button' );
		plugins.bgAudio.popup = plugins.bgAudio.querySelector( '.audio-popup' );

		if ( plugins.bgAudio.track.readyState !== 4 ) {
			plugins.bgAudio.track.addEventListener( 'canplay', handler.bind( plugins.bgAudio ) );
		} else {
			handler.call( plugins.bgAudio );
		}
	}
});
