// 測試用的範例程式碼，包含一些可現代化的模式

// 使用 var (可改為 let/const)
var userName = 'John';
var userAge = 30;

// 傳統 for 迴圈 (可改為 array methods)
var activeUsers = [];
for (var i = 0; i < users.length; i++) {
  if (users[i].active) {
    activeUsers.push(users[i]);
  }
}

// XMLHttpRequest (可改為 fetch)
var xhr = new XMLHttpRequest();
xhr.open('GET', '/api/users');
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4 && xhr.status === 200) {
    var data = JSON.parse(xhr.responseText);
    console.log(data);
  }
};
xhr.send();

// 回調模式 (可改為 Promise/async-await)
function loadData(callback) {
  setTimeout(function() {
    callback(null, { users: [] });
  }, 1000);
}

// 使用 jQuery (如果專案有的話)
// $('#button').click(function() {
//   $(this).addClass('active');
// });

// IIFE 模式 (可考慮模組化)
(function() {
  var privateVar = 'secret';

  window.MyModule = {
    publicMethod: function() {
      return privateVar;
    }
  };
})();