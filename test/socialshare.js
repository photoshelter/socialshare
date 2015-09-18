var assert = require('assert');
var lib = require('../socialshare.js');
var SocialShare = lib.constructors.SocialShare;
var FacebookShare = lib.constructors.FacebookShare;
var TwitterShare = lib.constructors.TwitterShare;
var GPlusShare = lib.constructors.GPlusShare;
var PinterestShare = lib.constructors.PinterestShare;
var share = lib.share;
var simulateAnchorClick = lib.utils.simulateAnchorClick;
var makeQueryString = lib.utils.makeQueryString;

var fakeTwitter = {
	events: {
		bind: function() {},
		unbind: function() {}
	}
};

describe('SocialShare', function() {

	describe('base constructor', function () {
		it('should blow up if ya try to call its abstract share method', function() {
			assert.throws(function() {
				var socialShare = new SocialShare;
				socialShare.share();
			});
		});
	});

	describe('simulateAnchorClick()', function () {
		it('should insert an anchor and click it', function (done) {
			// So done() is only called if the click occurs.
			document.onclick = function() {
				done();
				document.onclick = null;
			}
			simulateAnchorClick({href: '#'});
		});
		it('should fire any onclick fn passed in', function (done) {
			simulateAnchorClick({href: '#'},
				{onclick: function() { done(); return false; }});
		});
	});

	describe('makeQueryString()', function () {
		var o1, o2;
		beforeEach(function () {
			o1 = { a: 'b', c: 'd' };
			o2 = { a: 'b', c: 'd e' };
		});
		it('should serialize objects', function () {
			assert(
				makeQueryString(o1) ===
				'a=b&c=d' // technically shouldn't rely on key order
			);
		});
		it('should url encode params', function () {
			console.log(
				makeQueryString(o2) ===
				'a=b&c=d%20e'
			);
		});
	});

	describe('FacebookShare', function () {
		it('should blow up if FB lib not loaded', function () {
			assert(typeof window.FB === 'undefined');
			assert.throws(function () {
				(new FacebookShare).share();
			});

		});
		describe('share()', function () {
			var fbCalled, cbCalled;

			beforeEach(function() {
				fbCalled = false, cbCalled = false;
				window.FB = { ui: function (cfg, cb) { fbCalled = true; } };
			});

			it('should call FB.ui', function () {
				var fbShare = new FacebookShare;
				fbShare.share({}, function() {});
				assert(fbCalled === true);
			});

			it('should handle not being passed a config param', function () {
				assert.doesNotThrow(function () {
					var fbShare = new FacebookShare;
					fbShare.share(undefined, function() {});
				});

			});

			it('should handle not being passed a cb', function () {
				assert.doesNotThrow(function () {
					var fbShare = new FacebookShare;
					fbShare.share({}, undefined);
				});
			});
		});
	});

	describe('TwitterShare', function () {
		it('should blow up if twitter lib not loaded', function () {
			assert(typeof window.twttr === 'undefined');
			assert.throws(function () {
				(new TwitterShare).share();
			});
		});
	});

	describe('GPlusShare', function () {
		it('should blow up if goog lib not loaded', function () {
			assert(typeof window.gapi === 'undefined');
			assert.throws(function () {
				(new GPlusShare).share();
			});

		});
	});

	describe('PinterestShare', function () {
		it('should blow up if pinterest lib not loaded', function () {
			assert(typeof window.PDK === 'undefined');
			assert.throws(function () {
				(new PinterestShare).share();
			});

		});
	});

	describe('share()', function () {
		beforeEach(function () {
			window.FB = { ui: function (cfg, cb) {}};
			window.twttr = fakeTwitter;
		});
		it('blows up if ya try and use an invalid service', function () {
			assert.throws(function () {
				share('derp');
			});
		});
	});

});
