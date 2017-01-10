//https://jsfiddle.net/L3615eL1/  
var addressBook = (function() {
  var people = [{
    firstName: 'TOTO',
    lastName: 'Apizee',
    phone: '123456789'
  },{
    firstName: 'TITI',
    lastName: 'rethink',
    phone: '123456789'
  },{
    firstName: 'TATI',
    lastName: 'rethink',
    phone: '123456789'
  }];
  //cash the dom
  var table = $('#table1');
  var tbody = table.find('tbody');
  var $firstName = table.find('#firstName');
  var $lastName = table.find('#lastName');
  var $phone = table.find('#phone');
  var $button = table.find('#add');
  var $btnSave = table.find('#save');
  var $btnEdit = table.find('#edit');
  var $btnRemove = table.find('#remove');
  var $input = table.find(".edit");

  //bind events
  $button.on('click', addPerson);
  table.on('click', '#remove', deletePerson);
  /*table.on("change",'.edit' ,editPerson);*/
  console.log($input);
  _render();

  //render
  function _render() {
    tbody.html('');
    var length = people.length;
    for (var i = 0; i < length; i++) {
      table.prepend('<tr><td><input class="edit" type="text" value="' + people[i].firstName + '" ></td><td><input class="edit" type="text" value="' + people[i].lastName + '" ></td><td><input type="text" class="edit" value="' + people[i].phone + '" ></td><td> <button id="remove" class="btn btn-block">X</button></td></tr>');
    }
  }

  //custom function
  function addPerson() {
    var person = {
      firstName: $firstName.val(),
      lastName: $lastName.val(),
      phone: $phone.val()
    };
    people.push(person);
    $firstName.val('');
    $lastName.val('');
    $phone.val('');
    _render()
  }

  function deletePerson(event) {
    var element = event.target.closest('tr');
    var i = table.find('td').index(element);
    people.splice(i, 1);
    _render();
  }
  /*
    // function editPerson(event){
    //    var element=event.target.closest('tr');
    // 	var i=table.find('tr').index(element);
    //   var index = (table.find('tr').length -i)-1;
    //   console.log(element.firstChild());
    //   var person= {
    //   firstName: ,
    //   lastName: $lastName.val(),
    //   phone: $phone.val()
    //   };
    //     _render();
    // }
*/
  return {
    addPerson: addPerson,
    deletePerson: deletePerson
  };

})();