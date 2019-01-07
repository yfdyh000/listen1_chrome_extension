
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({'url': chrome.extension.getURL('listen1.html')}, function(tab) {
      // Tab opened.
    });
  });
  
  
  function hack_referer_header(details) {
      let replace_referer = true;
      let replace_origin = true;
      let add_referer = true;
      let add_origin = true;
      
      var referer_value = '';
  
      if (details.url.indexOf("://music.163.com/") != -1) {
          referer_value = "http://music.163.com/";
      }
      if (details.url.indexOf("://gist.githubusercontent.com/") != -1) {
          referer_value = "https://gist.githubusercontent.com/";
      }
      
      if (details.url.indexOf("api.xiami.com/") != -1 || details.url.indexOf('.xiami.com/song/playlist/id/') != -1 
          || details.url.indexOf("www.xiami.com/api/") != -1 
      ) {
          add_origin = false;
          referer_value = "https://www.xiami.com";
      }
  
      if (details.url.indexOf("www.xiami.com/api/search/searchSongs") != -1) {
          var key = /key%22:%22(.*?)%22/.exec(details.url)[1];
          add_origin = false;
          referer_value = 'https://www.xiami.com/search?key=' + key;
      }
  
      if (details.url.indexOf("c.y.qq.com/") != -1) {
          referer_value = "https://y.qq.com";
      }
      if ((details.url.indexOf("i.y.qq.com/") != -1) ||
          (details.url.indexOf("qqmusic.qq.com/") != -1) ||
          (details.url.indexOf("music.qq.com/") != -1) ||
          (details.url.indexOf("imgcache.qq.com/") != -1)) {
          referer_value = "https://y.qq.com/";
      }
  
      if (details.url.indexOf(".kugou.com/") != -1) {
          referer_value = "http://www.kugou.com/";
      }
  
      if (details.url.indexOf(".kuwo.cn/") != -1) {
          referer_value = "http://www.kuwo.cn/";
      }
  
      if (details.url.indexOf(".bilibili.com/") != -1) {
          referer_value = "http://www.bilibili.com/";
          replace_origin = false;
          add_origin = false;
      }
  
      var isRefererSet = false;
      var isOriginSet = false;
      var headers = details.requestHeaders,
          blockingResponse = {};
  
      for (var i = 0, l = headers.length; i < l; ++i) {
          if (replace_referer && (headers[i].name == 'Referer') && (referer_value != '')) {
              headers[i].value = referer_value;
              isRefererSet = true;
          }
          if (replace_origin && (headers[i].name == 'Origin') && (referer_value != '')) {
              headers[i].value = referer_value;
              isOriginSet = true;
          }
      }
  
      if (add_referer && (!isRefererSet) && (referer_value != '')) {
          headers.push({
              name: "Referer",
              value: referer_value
          });
      }
  
      if (add_origin && (!isOriginSet) && (referer_value != '')) {
          console.log(details.url);
          headers.push({
              name: "Origin",
              value: referer_value
          });
      }
  
      blockingResponse.requestHeaders = headers;
      return blockingResponse;
  };
  
  chrome.webRequest.onBeforeSendHeaders.addListener(hack_referer_header, {
      urls: ["*://music.163.com/*", "*://*.xiami.com/*", "*://*.qq.com/*", "*://*.kugou.com/*", "*://*.bilibili.com/*", "*://*.githubusercontent.com/*"]
  }, ['requestHeaders', 'blocking']);
  
  
  /**
   * Get tokens.
   */
  
  chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
          var code = request.query.split('=')[1];
          Github.handleCallback(code);
          sendResponse();
      }
  );
  
  // at end of background.js
  chrome.commands.onCommand.addListener(function (command) {
    const [viewWindow] = chrome.extension.getViews().filter(p => p.location.href.endsWith('listen1.html'));
  
    switch (command) {
        case 'play_next':
            viewWindow.document.querySelector('.li-next').click();
            break;
        case 'play_prev':
            viewWindow.document.querySelector('.li-previous').click();
            break;
        case 'play_pause':
            viewWindow.document.querySelector('.play').click();
            break;
        default:
            console.log('不支持的快捷键')
    }
  });
