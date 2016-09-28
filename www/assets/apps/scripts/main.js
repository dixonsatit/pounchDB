(function() {

  'use strict';

  var db = new PouchDB('users');

  db.changes({
    since: 'now',
    live: true
  }).on('change', showUsers);

  function save(data) {
      db.get(data._id).catch(function (err) {
        if (err.name === 'not_found') {
          return {
                _id: new Date().toISOString(),
                fullname: data.fullname,
                email: data.email,
                phone: data.phone
          };
        } else {
          throw err;
        }
      }).then(function (configDoc) {
        db.put(configDoc);
      }).catch(function (err) {

      });
      showUsers();
  }

  function showUsers() {
      db.allDocs({include_docs: true, descending: true}, function(err, doc) {
        redrawUserUI(doc.rows);
      });
  }

  function redrawUserUI(users) {
      var userTable = $('#user-table tbody');
      var arUser    = [];
      userTable.html('');
      users.forEach(function(user) {
        var tr = renderRow(user.doc);
        userTable.append(tr);
     });
  }

  function renderRow(user){
      var tr         = $('<tr></tr>');
      var fullname   = $('<td></td>');
      var email      = $('<td></td>');
      var phone      = $('<td></td>');
      var actions    = $('<td></td>');
      var btnDelete  = $('<button></button>');

      tr.attr('id','user_' + user._id);

      fullname.bind('click', user, onRowClick);
      fullname.append(user.fullname);
      fullname.attr('style','cursor:pointer');

      email.append(user.email);
      phone.append(user.phone);

      btnDelete.bind('click', user, onClickBtnDelete);
      btnDelete.addClass('btn btn-default');
      btnDelete.text('delete');
      actions.append(btnDelete);

      tr.append(fullname);
      tr.append(email);
      tr.append(phone);
      tr.append(actions);
      return tr;
  }

  function renderFormUpdate(data){
    $("#form-user").get(0).reset();
    $.each( data, function( key, value ) {
      $('input[name='+key+']').val(value);
    });
    $('#basic').modal('show');
  }

  function create(event) {
    $("#form-user").get(0).reset();
    $('#basic').modal('show');
  }

  function update(data){
    db.get(data._id).then(function (doc) {
        db.remove(doc._id, doc._rev);
        db.put({
          _id: data._id,
          fullname: data.fullname,
          email: data.email,
          phone: data.phone
        });
    }).catch(function (err) {

    });
  }

  function onRowClick(event) {
      renderFormUpdate(event.data);
  }

  function onClickBtnDelete(event) {
      if($.confirm({
          title: 'Delete contact?',
          confirmButton: 'Yes',
          cancelButton: 'No'
      })){
        db.remove(event.data);
        showUsers();
      }
  }

  $( "#form-user" ).on( "submit", function( event ) {
      event.preventDefault();
      var objData = $( this ).serializeArray();
      var data    = [];
      objData.forEach(function( user ){
        data[user.name] = user.value;
      });
      data._id ? update(data) : save(data);

      $('#basic').modal('hide');
  });

  $( "#btn-create" ).on( "click", function( event ) {
      create();
  });

  showUsers();

})();
