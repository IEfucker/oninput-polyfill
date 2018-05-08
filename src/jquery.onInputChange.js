
/*
	ie9 doesn't trigger oninput event when content is removed with BACKSPACE, ctrl+x etc...
	API:
	1.$.onInputSupport for feature check
	2.$.onInputChange({
		selector,
		time
	}})
	*/
(function ($) {
	// code form modernizr.js
	function createElement(isSVG) {
		if (typeof document.createElement !== 'function') {
			// This is the case in IE7, where the type of createElement is "object".
			// For this reason, we cannot call apply() as Object is not a Function.
			return document.createElement(arguments[0]);
		} else if (isSVG) {
			return document.createElementNS.call(document, 'http://www.w3.org/2000/svg', arguments[0]);
		} else {
			return document.createElement.apply(document, arguments);
		}
	}

	// code form modernizr.js
	var hasEvent = (function () {

		// Detect whether event support can be detected via `in`. Test on a DOM element
		// using the "blur" event b/c it should always exist. bit.ly/event-detection
		var needsFallback = !('onblur' in document.documentElement);

		function inner(eventName, element) {

			var isSupported;
			if (!eventName) { return false; }
			if (!element || typeof element === 'string') {
				element = createElement(element || 'div');
			}

			// Testing via the `in` operator is sufficient for modern browsers and IE.
			// When using `setAttribute`, IE skips "unload", WebKit skips "unload" and
			// "resize", whereas `in` "catches" those.
			eventName = 'on' + eventName;
			isSupported = eventName in element;

			// Fallback technique for old Firefox - bit.ly/event-detection
			if (!isSupported && needsFallback) {
				if (!element.setAttribute) {
					// Switch to generic element if it lacks `setAttribute`.
					// It could be the `document`, `window`, or something else.
					element = createElement('div');
				}

				element.setAttribute(eventName, '');
				isSupported = typeof element[eventName] === 'function';

				if (element[eventName] !== undefined) {
					// If property was created, "remove it" by setting value to `undefined`.
					element[eventName] = undefined;
				}
				element.removeAttribute(eventName);
			}

			return isSupported;
		}
		return inner;
	})()

	// code from underscore.js
	// http://underscorejs.org/docs/underscore.html#section-83
	function debounce(func, wait, immediate) {
		var timeout, args, context, timestamp, result;

		var later = function () {
			var last = now() - timestamp;

			if (last < wait && last >= 0) {
				timeout = setTimeout(later, wait - last);
			} else {
				timeout = null;
				if (!immediate) {
					result = func.apply(context, args);
					if (!timeout) context = args = null;
				}
			}
		};

		return function () {
			context = this;
			args = arguments;
			timestamp = now();
			var callNow = immediate && !timeout;
			if (!timeout) timeout = setTimeout(later, wait);
			if (callNow) {
				result = func.apply(context, args);
				context = args = null;
			}

			return result;
		};
	}

	function now() {
		return Date.now() || new Date().getTime()
	}

	var onInputSupport = hasEvent("input")

	/* 
	onInputChange constructor
	opt:{
		selector,
		time
	}
	*/
	function OnInputChange(opt) {
		var selector = opt.selector || "",
			time = opt.time || 150,
			self = this

		this.$element = $(selector)
		this.element = this.$element[0]
		// selector invalid or input event is supported
		if (!this.element || onInputSupport) return
		this.options = $.extend({
			time: time
		}, opt)

		$("body").on("focus", selector, $.proxy(this._listen, this))
		$("body").on("blur", selector, $.proxy(this._unlisten, this))
	}

	OnInputChange.prototype = {

		_listen: function () {
			console.log("listen")
			// init this.value in delegate way
			this.value = this.element.value
			this._interval = window.setInterval($.proxy(this._check, this), this.options.time);
			return true;
		},

		_unlisten: function () {
			console.log("unlisten")
			window.clearInterval(this._interval);
			return true;
		},

		_run: function () {
			this.value = this.element.value;
			this.$element.trigger("input")
		},

		_check: function () {
			if (this.element.value != this.value) {
				this._run();
			}
		}
	};

	$.extend({
		onInputChange: function (opt) {
			new OnInputChange(opt)
		},
		onInputSupport: onInputSupport
	})

})(window.jQuery)

