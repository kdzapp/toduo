/////////////////////////////////
//----- History Functions -----//
////////////////////////////////

//TOGGLE FOR YOUR HISTORY VIEW//
function toggleMyHistory() {
  var history = document.getElementById("myHistoryToggle");
  var display = window.getComputedStyle(history).getPropertyValue("display");
  console.log(display);
  if(display == "none") {
    history.setAttribute("style", "display:inline;");
  }
  else {
    history.setAttribute("style", "display:none;");
  }
}

//TOGGLE FOR FRIEND'S HISTORY VIEW//
function toggleFriendHistory() {
  var history = document.getElementById("friendHistoryToggle");
  var display = window.getComputedStyle(history).getPropertyValue("display");

  if(display == "none") {
    history.setAttribute("style", "display:inline;");
  }
  else {
    history.setAttribute("style", "display:none;");
  }
}

/////////////////////////////////
//------ TODUO Functions ------//
/////////////////////////////////

//REMOVE TODUO ELEMENT FROM DATABASE//
function removeElement(element) {
  if(element.parentNode.getAttribute("name") == "friends_todoList") {
    var userid = element.parentNode.id;

    var date = element.getElementsByClassName("todoElement")[0].innerHTML;
    var todo = element.getElementsByClassName("todoElement")[1].innerHTML;

    firebase.database().ref('toduos/' + userid + '/todos/' + date + '/' + todo).set(1);

    element.remove();
  } else {
    var userid = firebase.auth().currentUser.uid;

    var date = element.getElementsByClassName("todoElement")[0].innerHTML;
    var todo = element.getElementsByClassName("todoElement")[1].innerHTML;

    firebase.database().ref('toduos/' + userid + '/todos/' + date + '/' + todo).set(1);

    element.remove();
  }
}

//ADD TODUO ELEMENT TO DATABASE//
function addTodo() {
  //Get User Information
  var user = firebase.auth().currentUser;

  var myList = document.getElementById("my_todolist");
  var todo = document.createElement("tr");

  var enteredDate = document.getElementById("inputDate").value;
  var enteredTodo = document.getElementById("inputTask").value;

  if(enteredTodo == "" || enteredDate == "") {
    //Alert User They Must Have TODO
    return;
  }

  document.getElementById("inputDate").value = "";
  document.getElementById("inputTask").value = "";

  firebase.database().ref('toduos/' + user.uid + '/todos/' + enteredDate + '/' + enteredTodo).set(0);
}

//MODAL ADD FRIEND BY UID//
function addFriend() {
  var user = firebase.auth().currentUser;
  var friend = document.getElementById("addFriend").value;

  if(friend == user.uid) {
    //ERROR, THIS IS YOUR UID//
    return;
  }

  document.getElementById("addFriend").value = "";

  firebase.database().ref('toduos/' + friend + '/email').once('value').then(function(snapshot) {
    var navBar = document.getElementById("tabList");
    var newBar = document.createElement("li");
    var userEmail = snapshot.val();

    if(userEmail != null) {
      newBar.className = "tab";
      const tabElement = `
      <a class="active" id="${friend}" onclick="setDuo(this)">${userEmail}</a>
      `;
      newBar.innerHTML = tabElement;
      navBar.insertBefore(newBar, navBar.children[navBar.childElementCount-3]);

      var friendsRef = firebase.database().ref('toduos/' + user.uid + '/friends');
      friendsRef.push(friend);
    } else {
      //ERROR, INVALID UID//
    }
  });

  $('#AddToDuo').modal('close');
}


//Check Button
function checkButton(element) {
  if(element.children[0].innerHTML == "check_box")
  {
    element.children[0].innerHTML = "check_box_outline_blank";
    window.clearTimeout(checkButton.theDeleteFunction);
  }
  else {
    element.children[0].innerHTML = "check_box";
    checkButton.theDeleteFunction = window.setTimeout(function(){ removeElement(element.parentNode.parentNode); }, 3000);
  }
}

/////////////////////////////////
//------- LIST Functions ------//
////////////////////////////////

//INITAL FILL YOUR LIST//
function fillTodo(enteredTodo, enteredDate, todoList, option) {

  var myList = document.getElementsByName(todoList)[0];
  var todo = document.createElement("tr");

  const todoElement = `
  <td>
    <a class="white-text"><p class="todoElement">${enteredDate}</p></a>
  </td>
  <td>
    <a class="white-text" onclick="setToImportant(this)"><p class="todoElement">${enteredTodo}</p></a>
  </td>
  <td class="center-align">
    <a class="btn-flat" onclick="checkButton(this)">
      <i class="material-icons white-text" id="checkBox">check_box_outline_blank</i>
    </a>
  </td>
  `;

  const todoImportantElement = `
  <td>
    <a class="red-text important"><p class="todoElement">${enteredDate}</p></a>
  </td>
  <td>
    <a class="red-text important" onclick="setToImportant(this)"><p class="todoElement">${enteredTodo}</p></a>
  </td>
  <td class="center-align">
    <a class="btn-flat" onclick="checkButton(this)">
      <i class="material-icons white-text" id="checkBox">check_box_outline_blank</i>
    </a>
  </td>
  `;

  const historyTodoElement = `
  <td>
    <p class="todoElement">${enteredDate}</p>
  </td>
  <td>
    <p class="todoElement">${enteredTodo}</p>
  </td>
  <td class="center-align">
    <a class="btn-flat">
      <i class="material-icons white-text" id="checkBox">check_box</i>
    </a>
  </td>
  `;

  if(option == 1) {
    todo.innerHTML = historyTodoElement;
  }
  else if(option == 2) {
    todo.innerHTML = todoImportantElement;
  }
  else {
    todo.innerHTML = todoElement;
  }

  //-2 for the last element is editable one ()
  myList.insertBefore(todo, myList.children[0]);
}

//Set List Item to Important
function setToImportant(ele) {

  element = ele.parentNode.parentNode;

  if(element.parentNode.getAttribute("name") == "friends_todoList") {
    var userid = element.parentNode.id;

    var date = element.getElementsByClassName("todoElement")[0].innerHTML;
    var todo = element.getElementsByClassName("todoElement")[1].innerHTML;

    console.log(date + todo)

    if(element.getElementsByClassName("todoElement")[0].parentNode.className != "red-text important") {
      element.getElementsByClassName("todoElement")[0].parentNode.setAttribute("class", "red-text important");
      element.getElementsByClassName("todoElement")[1].parentNode.setAttribute("class", "red-text important");

      firebase.database().ref('toduos/' + userid + '/todos/' + date + '/' + todo).set(2);
    }
    else {
      element.getElementsByClassName("todoElement")[0].parentNode.setAttribute("class", "white-text");
      element.getElementsByClassName("todoElement")[1].parentNode.setAttribute("class", "white-text");

      firebase.database().ref('toduos/' + userid + '/todos/' + date + '/' + todo).set(0);
    }

  } else {
    var userid = firebase.auth().currentUser.uid;

    var date = element.getElementsByClassName("todoElement")[0].innerHTML;
    var todo = element.getElementsByClassName("todoElement")[1].innerHTML;

    if(element.getElementsByClassName("todoElement")[0].parentNode.className != "red-text important") {
      element.getElementsByClassName("todoElement")[0].parentNode.setAttribute("class", "red-text important");
      element.getElementsByClassName("todoElement")[1].parentNode.setAttribute("class", "red-text important");

      firebase.database().ref('toduos/' + userid + '/todos/' + date + '/' + todo).set(2);
    }
    else {
      element.getElementsByClassName("todoElement")[0].parentNode.setAttribute("class", "white-text");
      element.getElementsByClassName("todoElement")[1].parentNode.setAttribute("class", "white-text");

      firebase.database().ref('toduos/' + userid + '/todos/' + date + '/' + todo).set(0);
    }
  }
}

//INITAL FILL OF OTHER USERS//
function fillTab(userId) {
  firebase.database().ref('toduos/' + userId + '/email').once('value').then(function(snapshot) {
    var navBar = document.getElementById("tabList");
    var newBar = document.createElement("li");
    var userEmail = snapshot.val();

    newBar.className = "tab";
    const tabElement = `
    <a class="active" id="${userId}" onclick="setDuo(this)">${userEmail}</a>
    `;
    newBar.innerHTML = tabElement;
    navBar.insertBefore(newBar, navBar.children[navBar.childElementCount-3]);
  });
}

//CLEAR LIST//
function clearTodo(nameOfList) {
  var myList = document.getElementsByName(nameOfList)[0];

  while(myList.hasChildNodes()) {
    myList.removeChild(myList.lastChild);
  }
}

////////////////////////
//----- Other --------//
///////////////////////

//SET FRIEND_TODOLIST//
function setDuo(element) {
  clearTodo("friends_todoList");
  clearTodo("friends_historyList");
  var friendUid = element.id;

  if(friendUid == "defaultList") {
    document.getElementById("friendTodoCard").setAttribute("style", "display:none;");
    document.getElementById("myTodoCard").className = "col s12 m12";
  }
  else {
    document.getElementById("friendTodoCard").setAttribute("style", "display:flex;");
    document.getElementById("myTodoCard").className = "col s12 m6";

    document.getElementsByName("friends_todoList")[0].id = friendUid;

    firebase.database().ref('toduos/' + friendUid + '/todos').on('value', function(snapshot) {
      clearTodo("friends_todoList");
      snapshot.forEach(function(todoDates) {
        var enteredDate = todoDates.key;
        todoDates.forEach(function(todoElements) {
          var todoElement = todoElements.key;
          if(todoElements.val() == 0) {
            fillTodo(todoElement, enteredDate, "friends_todoList", 0);
          } else if (todoElements.val() == 2) {
            fillTodo(todoElement, enteredDate, "friends_todoList", 2)
          } else {
            fillTodo(todoElement, enteredDate, "friends_historyList", 1);
          }
        });
      });
    });
  }
}

//Sign Out Button//
function signOut() {
  firebase.auth().signOut().then(function() {

  }).catch(function(error) {
    alert(error.code);
  });
}

//Basic Modal//
function cancelModal() {
  document.getElementById("defaultList").className += "active";
  $('#AddToDuo').modal('close')
}
