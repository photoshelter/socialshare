/**
 * Exports a single sharing function which can open share dialogs for a 
 * variety of social media services, or a native email client. Note that each
 * share service triggers popup windows and as such user interaction
 * must initiate the call to this function to avoid being popup-blocked.
 *
 * @module O_O.lib.SocialShare
 *
 * @requires: twitter, facebook, gplus, and pinterest JavaScript SDKs/libs
 * must be loaded on page for sharing via each respective service. All
 * are optional. See each service's class for details on code to load.
 */

;(function() {


/**
 * Base class
 */
function SocialShare() {}

SocialShare.prototype = {
	constructor: SocialShare,
	share: function(data, cb) {
		throw new Error('share() must be implemented by subclass');
	}
};

/**
 * Share on Facebook
 */
function FacebookShare() { SocialShare.call(this, arguments); }
FacebookShare.prototype = Object.create(SocialShare.prototype);

/**
 * @param {Object} data
 * @param {String} data.url
 * @param {Object} cb
 * @requires Facebook JS SDK: https://developers.facebook.com/docs/javascript
 */
FacebookShare.prototype.share = function(data, cb) {
	if (!window.FB) throw new Error('FB library not loaded, what the heck.');
	data = data || {};
	window.FB.ui({
		method: 'share',
		href: data.url || window.location.href
	}, function(response){
		if (response && !response.error_code && cb) {
			cb();
		}
	});
};

/**
 * Share on Twitter
 */
function TwitterShare() { SocialShare.call(this, arguments); }
TwitterShare.prototype = Object.create(SocialShare.prototype);

/**
 * @param {Object} data
 * @param {String} data.url
 * @param {Object} data.twitter
 * @param {String} data.twitter.text
 * @param {Object} cb
 * @requires Twitter SDK: https://dev.twitter.com/web/javascript
 */
TwitterShare.prototype.share = function(data, cb) {
	if (!window.twttr)
		throw new Error('Twitter library not loaded, what the heck.');

	data = data || {};

	this.attachCb(cb);

	var tweetIntentUrl = 'https://twitter.com/intent/tweet?';
	var queryParams = {
		url: data.url || window.location.href,
		text: data && data.twitter ? data.twitter.text : ''
	};
	var href = tweetIntentUrl + makeQueryString(queryParams);
	simulateAnchorClick({href: href});
};

/**
 * Listen for tweet events, and after one has occurred, fire the cb specified
 * then remove the tweet listener to prevent duplicate calls on future tweets.
 * @param {Function} cb
 */
TwitterShare.prototype.attachCb = function(cb) {
	window.twttr.events.bind('tweet', function (ev) {
		cb && cb();
		window.twttr.events.unbind('tweet');
	});
};

/**
 * Share on Google Plus
 */
function GPlusShare() { SocialShare.call(this, arguments); }
GPlusShare.prototype = Object.create(SocialShare.prototype);

/**
 * @param {Object} data
 * @param {String} data.url
 * @requires Google Plus SDK: https://developers.google.com/+/web/api/javascript
 */
GPlusShare.prototype.share = function(data) {
	if (!window.gapi)
		throw new Error('Google plus library not loaded, what the heck.');

	data = data || {};
	var url = data.url || window.location.href;
	url = encodeURIComponent(url);

	var href = 'https://plus.google.com/share?url={'+url+'}';

	var onClick = function(e) {
		window.open(e.target.href, '',
					'menubar=no,toolbar=no,resizable=yes,' +
					'scrollbars=yes,height=600,width=600');
		return false;
	};

	simulateAnchorClick({href: href}, {onclick: onClick});
};

/**
 * Share on Pinterest
 */
function PinterestShare() { SocialShare.call(this, arguments); }
PinterestShare.prototype = Object.create(SocialShare.prototype);

/**
 * @param {Object} data
 * @requires Pinterest JS SDK: https://developers.pinterest.com/docs/sdks/js/
 * The pinterest library must be loaded with the script tag containing the
 * following attribute: data-pin-build="parsePinBtns". This exposes
 * parsePinBtns to the window, so we can run it when necessary. See
 * http://stackoverflow.com/questions/9352021/how-can-i-rerender-pinterests-pin-it-button
 */
PinterestShare.prototype.share = function(data) {
	if (!window.PDK)
		throw new Error('Pinterest library not loaded, what the heck.');

	data = data || {};

	PDK.pin(data.imgUrl, data.note, data.url);
};

/**
 * Share via email
 */
function EmailShare() { SocialShare.call(this, arguments); }
EmailShare.prototype = Object.create(SocialShare.prototype);

/**
 * @param {Object} data

 * @param {String} data.to
 * @param {String} data.subject
 * @param {String} data.body
 */
EmailShare.prototype.share = function(data) {
	data = data || {};

	var mailtoHref = 'mailto:' + (data.to || '') + '?' +
		makeQueryString({subject: data.subject || '', body: data.body || '' });

	simulateAnchorClick({href: mailtoHref}, {});
};

/**
 * Query string building utility: serializes object key/val pairs.
 * @param {Object} obj Each key/value pair will be serialized
 * @returns {String}
 * @example makeQueryString({a: 'b', c: 'd' }) // => 'a=b&c=d'
 */
function makeQueryString(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
};

/**
 * Creates an anchor, injects it into the document, simulates a click on it,
 * then cleans up after itself.
 * The purpose is to play nicely with popular APIs without having to manually
 * create anchors in view code all over the place. Instead we do it here once
 * and a caller can just say, e.g., "give me a twitter share!"
 *
 * @param {Object} attrs Key/val pairs, attributes to create on the HTML anchor
 * @param {Object} listeners Key/val pairs, on- style listeners
 * to attach to the HTML anchor
 * @param {Function} onPreClick Hook into the moment right after the anchor
 * has been inserted into the document but not yet clicked.
 */
function simulateAnchorClick(attrs, listeners, onPreClick) {
	var a = createAnchor(attrs, listeners);
	var div = document.createElement('div');
	/**
	 * A hook in case the simulated click needs to be prevented from bubbling
	 * and causing some undesired effect.
	 */
	div.setAttribute('class', 'anchor-wrapper');

	div.appendChild(a);
	document.body.appendChild(div);

	onPreClick && onPreClick();

	/**
	 * X-browser click simulation. Using a wrapper element then grabbing
	 * its first child because some services (lookin at you, pinterest)
	 * replace the original DOM element (i.e. the `a` element above).
	 */
	var el = div.firstChild;

	if (el.click) el.click();
	else if (el.fireEvent) el.fireEvent('onclick');
	else {
		var evObj = document.createEvent('Events');
		evObj.initEvent('click', true, false);
		el.dispatchEvent(evObj);
	}

	document.body.removeChild(div);
}

/**
 * Create an `a` element and add attributes and listeners to it, according
 * to the demands of the DOM.
 * @param {Object} attrs Key/val pairs, attributes to create on the HTML anchor
 * @param {Object} listeners Key/val pairs, on- style listeners
 * to attach to the HTML anchor
 * @return {HTMLElement}
 */
function createAnchor(attrs, listeners) {
	var a = document.createElement('a');

	Object.keys(attrs || {}).forEach(function (k) {
		a.setAttribute(k, attrs[k]);
	});

	Object.keys(listeners || {}).forEach(function (k) {
		a[k] = listeners[k];
	});

	return a;
}

/** 
 * Store of all available services
 */
var services = {
	facebook: new FacebookShare,
	twitter: new TwitterShare,
	gplus: new GPlusShare,
	pinterest: new PinterestShare,
	email: new EmailShare
};

/**
 * @param {String} service The social sharing service to use, e.g., facebook
 * @param {Object} data Payload containing any data that might be needed (see
 * particular share services for details of accepted keys)
 * @param {Function} cb A callback which fires once a share has occurred, if
 * given service provides the ability to register a callback (FB/Twitter only).
 */
function share(service, data, cb) {
	var serv = services[service];
	if (!serv) throw new Error('Pass a valid service');
	serv.share(data, cb)
}

// Conditional exporting for commonJS / window globals
if (typeof module !== 'undefined' && module.exports) {
	// The main thing really used by callers.
	exports.share = share;

	// Both of the following are exported for unit testing:
	exports.constructors = {
		SocialShare: SocialShare,
		FacebookShare: FacebookShare,
		TwitterShare: TwitterShare,
		GPlusShare: GPlusShare,
		PinterestShare: PinterestShare
	};
	exports.utils = {
		simulateAnchorClick: simulateAnchorClick,
		makeQueryString: makeQueryString
	};
} else {
	window.socialShare = share;
}

})();
