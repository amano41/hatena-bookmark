// 認証
function authorize() {
  hatena.oauth.authorize();
}


// 認証成功後のコールバック関数
function callback(request) {
  return hatena.oauth.callback(request);
}


// 認証キャッシュ削除
function clear() {
  hatena.oauth.clear();
}


function doPost(e) {

  var jsonString = e.postData.getDataAsString();
  var data = JSON.parse(jsonString)

  var properties = PropertiesService.getScriptProperties().getProperties();
  var token = properties.VERIFICATION_TOKEN;

  if (data.token != token) {
    throw new Error("Invalid token: " + data.token);
  }

  var page = data.page
  return hatena.addBookmark(page);
}


var hatena = {


  oauth: {

    name: "hatena",

    getService: function() {

      var properties = PropertiesService.getScriptProperties().getProperties();
      var consumerKey = properties.CONSUMER_KEY;
      var consumerSecret = properties.CONSUMER_SECRET;
      var scope = properties.SCOPE;

      return OAuth1.createService(this.name)
        .setAccessTokenUrl('https://www.hatena.com/oauth/token')
        .setRequestTokenUrl('https://www.hatena.com/oauth/initiate?scope=' + scope)
        .setAuthorizationUrl('https://www.hatena.ne.jp/oauth/authorize')
        .setConsumerKey(consumerKey)
        .setConsumerSecret(consumerSecret)
        .setCallbackFunction('callback')
        .setPropertyStore(PropertiesService.getUserProperties());
    },

    authorize: function() {
      var service = this.getService();
      if (service.hasAccess()) {
        Logger.log("認証済み");
      }
      else {
        Logger.log(service.authorize());
      }
    },

    callback: function(request) {
      var service = this.getService();
      var isAuthorized = service.handleCallback(request);
      if (isAuthorized) {
        return HtmlService.createHtmlOutput("認証成功");
      } else {
        return HtmlService.createHtmlOutput("認証失敗");
      }
    },

    clear: function() {
      var service = this.getService();
      service.reset();
    }
  },


  addBookmark: function(page) {

    var url = "http://api.b.hatena.ne.jp/1/my/bookmark";

    var options = {
      "method": "POST",
      "payload": {
        "url": page
      }
    };

    Logger.log(page);

    var service = this.oauth.getService();
    var response = service.fetch(url, options);
    Logger.log(response.getContentText())

    return response;
  }

};
