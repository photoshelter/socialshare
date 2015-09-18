## Why

The purpose of this small library is to provide a consistent JavaScript API 
for triggering social shares for a number of popular social media services
and email.

It makes no assumptions about the DOM structure or styling of your document and
allows you to load the third-party JavaScript libraries of only the services
you'll use.

## How to use

Load socialshare.js in your document via a script tag:

`<script type="text/javascript" src="./socialshare.js"></script>`

Or within JavaScript via CommonJS:

`var socialShare = require('./socialshare.js');`

And load the third-party JS of any social media service you'd like to use. See
each service's respective documentation for information on loading:

 * [Facebook](https://developers.facebook.com/docs/javascript)
 * [Twitter](https://dev.twitter.com/web/javascript)
 * [Google Plus](https://developers.google.com/+/web/api/javascript)
 * [Pinterest](https://developers.pinterest.com/docs/sdks/js/)

When it's time to share, the library exposes a single global function, 
`socialShare`. One thing to note: a share event needs to be triggered by user
interaction or the share dialog popup windows will be blocked, per the policy 
of most modern browsers.

Here's the function's signature:

`socialShare({String} service [, {Object} data, {Function} callback])`

Now let's look at the options that can be passed in for particular 
services via an example call for each.

### Facebook

Facebook allows you to set a share URL and a callback which is fired when
the share occurs:

```javascript
socialShare(
  'facebook', 
  { url: 'http://some-url-other-than-window-dot-location' },
  function() { console.log('Share succeeded!'); }
);
```

### Twitter 

Twitter has the same options as facebook, plus you can pass in default tweet
text:

```javascript
socialShare(
  'twitter', 
  { url: 'http://some-url-other-than-window-dot-location',
    twitter: { text: 'Whoah twitterers, check out this thing!' }},
  function() { console.log('Share succeeded!'); }
);
```

### Google Plus

Google Plus only accepts a url.

```javascript
socialShare(
  'gplus', 
  { url: 'http://some-url-other-than-window-dot-location' }
);
```

### Pinterest 

Pinterest takes a url, required image url, and some text to display with the image.

```javascript
socialShare(
  'pinterest', 
  { url: 'http://some-url-other-than-window-dot-location',
    imgUrl: 'http://some-url/image.png',
    note: 'What a neat image!' }
);
```

### Email

Email, which is to say, popping open the user's native email client, accepts
a few parameters to prepopulate the message.. 

```javascript
socialShare(
  'email', 
  { to: 'person@personweb.net',
    subject: 'You won\'t believe how neat this is!',
    body: 'Hey there!\nI found this cool thing, thought you might enjoy.' }
);
```
