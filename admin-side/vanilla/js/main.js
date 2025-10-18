(function(){
  var tbody = document.getElementById('tbody');
  var msg = document.getElementById('msg');

  function setMsg(text){ msg.textContent = text || ''; }

  function render(list){
    tbody.innerHTML = '';
    (list||[]).forEach(function(ev){
      var tr = document.createElement('tr');
      tr.innerHTML = '\
        <td>'+ev.id+'</td>\
        <td>'+ (ev.title||'') +'</td>\
        <td>'+ (ev.event_date||'') +'</td>\
        <td>'+ (ev.location||'') +'</td>\
        <td>$'+(ev.goal_amount||0)+' / $'+(ev.current_amount||0)+'</td>\
        <td><button data-id="'+ev.id+'" class="del">Delete</button></td>';
      tbody.appendChild(tr);
    });
  }

  function load(){
    setMsg('Loading...');
    AdminAPI.listEvents({ limit: 50 }).then(function(res){
      render(res.data || res);
      setMsg('');
    }).catch(function(e){ setMsg('Failed to load'); console.error(e); });
  }

  document.getElementById('reload').addEventListener('click', load);
  document.getElementById('create').addEventListener('click', function(){
    var now = new Date();
    var in2Days = new Date(now.getTime()+2*24*3600*1000);
    var payload = {
      title: 'Sample Event ' + now.toLocaleTimeString(),
      description: 'Quick creation from admin native version',
      full_description: 'Example',
      category_id: 1,
      organization_id: 1,
      event_date: in2Days.toISOString().slice(0,19).replace('T',' '),
      location: 'Sydney',
      venue_details: 'Room A',
      ticket_price: 10,
      goal_amount: 1000,
      current_amount: 0,
      max_attendees: 100,
      image_url: '/images/event1.jpg',
      latitude: -33.86,
      longitude: 151.21
    };
    setMsg('Creating...');
    AdminAPI.createEvent(payload).then(function(){ setMsg('Created successfully'); load(); })
      .catch(function(e){ setMsg((e && e.message) || 'Creation failed'); console.error(e); });
  });

  tbody.addEventListener('click', function(e){
    if(e.target && e.target.classList.contains('del')){
      var id = e.target.getAttribute('data-id');
      if(!id) return;
      if(!confirm('Are you sure you want to delete event '+id+'?')) return;
      setMsg('Deleting...');
      AdminAPI.deleteEvent(id).then(function(){ setMsg('Deleted successfully'); load(); })
        .catch(function(err){ setMsg((err && err.message) || 'Deletion failed'); console.error(err); });
    }
  });

  load();
})();


