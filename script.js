/*Page Load*/ 
// =================================================================================
// Global Variables
var integrity = 25,
integrityCount = 1,
itemCount = 1,
softGround = 10,
wallHax = 0,
currentPick = "small",
tl,
tm,
tr,
l ,
m ,
r ,
bl,
bm,
br,
items = [],
usedItemSlots = [],
foundItems = [],
userBackpack = [],
map = createArray(1, 10, 13);

// adds event listeners to the tiles for the mine function
window.onload = function() {
  var td = document.getElementsByTagName("td");
  for (let i = 0; i < td.length; i++) {
    td[i].addEventListener("click", mine);
  }
  spawnItems();
  for (let i = 0; i < softGround; i++) {
   createMap(5,5); 
  }
}
// ==================================================================================

/*Mining Functions*/ 
// ==================================================================================
// onclick function for mining
function mine(evt) {
  var elem = evt.currentTarget;
  bounds(elem);
  if (currentPick == "small") {
      integrity -= 1;
      stateChange(tm, 1);
      stateChange(l, 1);
      stateChange(m, 1);
      stateChange(r, 1);
      stateChange(bm, 1);
      call_after_DOM_updated(postMineCheck);
  }
  else {
    integrity -= 2;
    stateChange(tl, 1);
    stateChange(tm, 2);
    stateChange(tr, 1);
    stateChange(l, 2);
    stateChange(m, 2);
    stateChange(r, 2);
    stateChange(bl, 1);
    stateChange(bm, 2);
    stateChange(br, 1);
    call_after_DOM_updated(postMineCheck);
  }
}

// function to run window alerts after animation
function call_after_DOM_updated(fn) {
    intermediate = function () {window.requestAnimationFrame(fn)}
    window.requestAnimationFrame(intermediate)
}

// checks for finding all items and wall collapse
function postMineCheck() {
  for (let i = 0; i < items.length; i++) {
    if(!items[i].uncovered.includes(false) && items[i].found == false) {
      items[i].found = true;
      foundItems[foundItems.indexOf(false)] = true;
    }
    if(items[i].found == true && items[i].message == true) {
      items[i].message = false
      //alert("You found a " + items[i].name);
      addToBackpack(items[i].id);
      userBackpack.push(items[i].name);
    }
  }
  if(!foundItems.includes(false)) {
    //alert("you found all the items, starting a new dig.");
    newDig();
  }
  if (integrity <= 0) {
    //alert("The wall collapsed!");
    newDig();
  }
}

// determines the state of a tile based on the current state and the ammount of times to change
function stateChange(cell, times) {
  if (cell == -1) {
    return;
  }
  
  var elem = document.getElementById(cell);
  var cell = document.getElementById(cell).getAttribute("id");
  var state = elem.getAttribute("class");
  for (let i = 0; i < times; i++) {
   switch (true) {
    case state == "full" :
      state = "cracked-1";
    break
    case state == "cracked-1" :
      state = "cracked-2";
    break
    case state == "cracked-2" :
      state = "cracked-3";
    break
    case state == "cracked-3" :
      state = "cracked-4";
    break
    case state == "cracked-4" :
      state = "cracked-5";
    break
    case state == "cracked-5" && checkItem(cell):
       state = "item"
    break
    case state == "cracked-5":
      state = "clear";
    break
    case state == "clear" :
      state = "clear";
    break
    case state == "item" :
       state = "item";
    break
  } 
  }
  if (state != "item") {
    elem.setAttribute("class", state); 
  }
}

// sets the boundaries of the map and checks if the adjacent cells exist or not
function bounds(elem) {
  var row = elem.getAttribute("row");
  var column = elem.getAttribute("column");

  tl = (String.fromCharCode(row.charCodeAt() - 1)) + (parseInt(column, 10) - 1);
  tm = (String.fromCharCode(row.charCodeAt() - 1)) + column;
  tr = (String.fromCharCode(row.charCodeAt() - 1)) + (parseInt(column, 10) + 1);
  l = row + (parseInt(column, 10) - 1);
  m = row + column;
  r = row + (parseInt(column, 10) + 1);
  bl = (String.fromCharCode(row.charCodeAt() + 1)) + (parseInt(column, 10) - 1);
  bm = (String.fromCharCode(row.charCodeAt() + 1)) + column;
  br = (String.fromCharCode(row.charCodeAt() + 1)) + (parseInt(column, 10) + 1);
  if (tm[0] == "@") {
    tl = -1;
    tm = -1;
    tr = -1;
  }
  if (l[1] == 0) {
    tl = -1;
    l = -1;
    bl = -1;
  }
  if (bm[0] == "K") {
    bl = -1;
    bm = -1;
    br = -1;
  }
  if (r[2] == 4) {
    tr = -1;
    r = -1;
    br = -1;
  }
}

// changes the pick type to large
function largePick(params) {
  currentPick = "large";
  document.getElementById("currentPick").innerText = "Large Pick";
}

// changes the pick type to small
function smallPick(params) {
  currentPick = "small";
  document.getElementById("currentPick").innerText = "Small Pick";
}

// generates a new dig
function newDig() {
  document.querySelectorAll("td").forEach(e => {
    e.setAttribute("class", "full");
  });
  items = [];
  integrity = 25 * integrityCount;
  usedItemSlots = [];
  foundItems = [];
  document.querySelectorAll("[hack]").forEach(e => {
    e.setAttribute("hack", "false");
  });
  
  for (let i = 0; i < itemCount; i++) {
   spawnItems();
  }
  for (let i = 0; i < softGround; i++) {
   createMap(5, 5); 
  }
}
// =================================================================================

/*Item Functions*/ 
// =================================================================================
// object constructor for Items
function Item(coords, uncovered, found, message, name, id, value) {
  this.coords = coords;
  this.uncovered = uncovered;
  this.found = found;
  this.message = message;
  this.name = name;
  this.id = id;
  this.value = value;
}

function itemTypeGen(num, coords) {
  var uncovered = [false, false, false, false];
  switch(num) {
    case 0:
      return new Item(coords, uncovered, false, true, "Blue Sphere (S)", "SBS", 25);
    break;
    case 1:
      return new Item(coords, uncovered, false, true, "Green Sphere (S)", "SGS", 25);
    break;
    case 2:
      return new Item(coords, uncovered, false, true, "Red Sphere (S)", "SRS", 25);
    break;
  }
}

// functions to spawn the items in the wall
function spawnItems() {
  var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  var row = Math.floor(Math.random() * 9);
  var column = Math.floor(Math.random() * 12) + 1;
  var tmp = [];
  var tl = letters[row] + column;
  var tr = letters[row] + (column + 1);
  var bl = letters[row + 1] + column;
  var br = letters[row + 1] + (column + 1);
  
  tmp.push(tl);
  tmp.push(tr);
  tmp.push(bl);
  tmp.push(br);
  if (tmp.length == 0 || !usedItemSlots.some(e => tmp.includes(e))) {
    usedItemSlots.push(tl);
    usedItemSlots.push(tr);
    usedItemSlots.push(bl);
    usedItemSlots.push(br); 
    foundItems.push(false);
    var itemNum = Math.floor(Math.random() * 3);
    let item = itemTypeGen(itemNum, tmp);
    items.push(item);
    if(wallHax == 1) {
    document.getElementById(tl).setAttribute("hack", "tl");
    document.getElementById(tr).setAttribute("hack", "tr");
    document.getElementById(bl).setAttribute("hack", "bl");
    document.getElementById(br).setAttribute("hack", "br");
  }
  }
  else {
    spawnItems();
  }
}

// function that checks a mined cell to see if an item should be displayed, and which one needs to be displayed
function checkItem(cell) {
  var truth = false
  var index;
  if(items.forEach(e => {
    if (e.coords.includes(cell)) {
      truth = true;
      index = e.coords.indexOf(cell);
      e.uncovered[index] = true;
      switch(index) {
        case 0:
          document.getElementById(cell).setAttribute("class", getItemImg(e, 0));
        break;
        case 1:
          document.getElementById(cell).setAttribute("class", getItemImg(e, 1));
        break;
        case 2:
          document.getElementById(cell).setAttribute("class", getItemImg(e, 2));
        break;
        case 3:
          document.getElementById(cell).setAttribute("class", getItemImg(e, 3));
        break;
      }
    }  
  
  })) {
    return truth;
  }
  else {
    return truth;
  }
}

function getItemImg(item, index) {
  var array = [];
  if(item.id == "SBS") {
    array = ["bstl", "bstr", "bsbl", "bsbr"];
  }
  else if(item.id == "SGS") {
    array = ["gstl", "gstr", "gsbl", "gsbr"];
  }
  else if(item.id == "SRS") {
    array = ["rstl", "rstr", "rsbl", "rsbr"];
  }
  return array[index];
}

// hides or shows the users backpack based on the current state
function userItems() {
  let shop = document.getElementById("shop");
  if (shop.getAttribute("class") == "shown") {
    shop.setAttribute("class", "hidden");
  }
  let backpack = document.getElementById("container");
  if (backpack.getAttribute("class") == "hidden") {
    backpack.setAttribute("class", "shown");
  }
  else {
    backpack.setAttribute("class", "hidden");
  }
}

// adds items to the users backpack
function addToBackpack(id) {
    let text = document.getElementById(id).innerText;
    document.getElementById(id).innerText = parseInt(text, 10) + 1;
}
// =================================================================================

/*Shop Functions*/
// =================================================================================
function shop() {
  let backpack = document.getElementById("container");
  if (backpack.getAttribute("class") == "shown") {
    backpack.setAttribute("class", "hidden");
  }
  let shop = document.getElementById("shop");
  if (shop.getAttribute("class") == "hidden") {
    shop.setAttribute("class", "shown");
  }
  else {
    shop.setAttribute("class", "hidden");
  }
}

function buy1() {
  let price = document.getElementById("price1");
  let money = document.getElementById("money");
  let quantity = document.getElementById("moreItems");
  let max = document.getElementById("maxItems").innerText;
  if (parseInt(money.innerText, 10) >= parseInt(price.innerText, 10) && quantity.innerText != max) {
    money.innerText = parseInt(money.innerText, 10) - parseInt(price.innerText, 10);
    quantity.innerText = parseInt(quantity.innerText, 10) + 1;
    if(quantity.innerText == max) {
      price.innerText = 0
    }
    else {
      price.innerText = parseInt(price.innerText, 10) + 50;
    }
    itemCount += 1;
    newDig(); 
  }
  else if(money.innerText >= price.innerText) {
    alert("You already have the max upgrade.");
  }
  else {
    alert("You need more money.");
  }
}

function buy2() {
  let price = document.getElementById("price2");
  let money = document.getElementById("money");
  let quantity = document.getElementById("moreIntegrity");
  let max = document.getElementById("maxIntegrity").innerText;
  if (parseInt(money.innerText, 10) >= parseInt(price.innerText, 10) && quantity.innerText != max) {
    money.innerText = parseInt(money.innerText, 10) - parseInt(price.innerText, 10);
    quantity.innerText = parseInt(quantity.innerText, 10) + 1;
    if(quantity.innerText == max) {
      price.innerText = 0
    }
    else {
      price.innerText = parseInt(price.innerText, 10) + 50;
    }
    integrityCount += 1;
    newDig();
  }
  else if(money.innerText >= price.innerText) {
    alert("You already have the max upgrade.");
  }
  else {
    alert("You need more money.");
  }
}

function buy3() {
  let price = document.getElementById("price3");
  let money = document.getElementById("money");
  let quantity = document.getElementById("softGround");
  let max = document.getElementById("maxSoft").innerText;
  if (parseInt(money.innerText, 10) >= parseInt(price.innerText, 10) && quantity.innerText != max) {
    money.innerText = parseInt(money.innerText, 10) - parseInt(price.innerText, 10);
    quantity.innerText = parseInt(quantity.innerText, 10) + 1;
    if(quantity.innerText == max) {
      price.innerText = 0
    }
    else {
      price.innerText = parseInt(price.innerText, 10) + 50;
    }
    softGround += 10;
    newDig();
  }
  else if(money.innerText >= price.innerText) {
    alert("You already have the max upgrade.");
  }
  else {
    alert("You need more money.");
  }
}

function buy4() {
  let price = document.getElementById("price4");
  let money = document.getElementById("money");
  let quantity = document.getElementById("wallHax");
  let max = document.getElementById("maxHax").innerText;
  if (parseInt(money.innerText, 10) >= parseInt(price.innerText, 10) && quantity.innerText != max) {
    money.innerText = parseInt(money.innerText, 10) - parseInt(price.innerText, 10);
    quantity.innerText = parseInt(quantity.innerText, 10) + 1;
    if(quantity.innerText == max) {
      price.innerText = 0
    }
    else {
      price.innerText = parseInt(price.innerText, 10) + 50;
    }
    wallHax = 1;
    newDig();
  }
  else if(money.innerText >= price.innerText) {
    alert("You already have the max upgrade.");
  }
  else {
    alert("You need more money.");
  }
}
function sellAll() {
  let money = document.getElementById("money").innerText;
  let srs = document.getElementById("SRS").innerText;
  let sgs = document.getElementById("SGS").innerText;
  let sbs = document.getElementById("SBS").innerText;
  let totalSmall = parseInt(srs, 10) + parseInt(sgs, 10) + parseInt(sbs, 10);
  document.getElementById("money").innerText = parseInt(money, 10) + 25 *     
  totalSmall;
  document.getElementById("SRS").innerText = 0;
  document.getElementById("SGS").innerText = 0;
  document.getElementById("SBS").innerText = 0;
}
// =================================================================================

/*Map Funnctions*/
// =================================================================================
// creates a 2D array for the map generator to create a map from
function createArray(num, height, width) {
    var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    var currLetter;
    var array = [];    
    for (var i = 0; i < height; i++) { 
      array.push([]);      
      currLetter = letters[i];
      for (var j = 0; j < width; j++) {  
         array[i].push(currLetter + (num + j));      
      }    
    }    
    return array;  
}

// creates a random map based on the width and height of the 2D array
function createMap(maxTunnels, maxLength) {
    let height = 10, 
      width = 13,  
      currentRow = Math.floor(Math.random() * height), 
      currentColumn = Math.floor(Math.random() * width), 
      directions = [[-1, 0], [1, 0], [0, -1], [0, 1]], 
      lastDirection = [], 
      randomDirection;
  
    while (maxTunnels && height && width && maxLength) {

      do {
         randomDirection = directions[Math.floor(Math.random() * directions.length)];
      } while ((randomDirection[0] === -lastDirection[0] && randomDirection[1] === -                lastDirection[1]) || (randomDirection[0] === lastDirection[0] && randomDirection[1] === lastDirection[1]));
      var randomLength = Math.ceil(Math.random() * maxLength), 
        tunnelLength = 0; 

      while (tunnelLength < randomLength) {

        if (((currentRow === 0) && (randomDirection[0] === -1)) ||
            ((currentColumn === 0) && (randomDirection[1] === -1)) ||
            ((currentRow === height - 1) && (randomDirection[0] === 1)) ||
            ((currentColumn === width - 1) && (randomDirection[1] === 1))) {
          break;
        } else {
          var cell = document.getElementById(map[currentRow][currentColumn]).getAttribute("class");

          if(cell == "full") {
            stateChange(map[currentRow][currentColumn], 1);
          }
          else if (cell == "cracked-1") {
            stateChange(map[currentRow][currentColumn], 1);
          }
          else if (cell == "cracked-2") {
            stateChange(map[currentRow][currentColumn], 2);
          }
          currentRow += randomDirection[0]; 
          currentColumn += randomDirection[1];
          tunnelLength++;
        }
      }

      if (tunnelLength) { 
        lastDirection = randomDirection;
        maxTunnels--; 
      }
    }
    // return map;
  };
// =================================================================================