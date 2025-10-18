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
        <td><button data-id="'+ev.id+'" class="del">删除</button></td>';
      tbody.appendChild(tr);
    });
  }

  function load(){
    setMsg('加载中…');
    AdminAPI.listEvents({ limit: 50 }).then(function(res){
      render(res.data || res);
      setMsg('');
    }).catch(function(e){ setMsg('加载失败'); console.error(e); });
  }

  document.getElementById('reload').addEventListener('click', load);
  document.getElementById('create').addEventListener('click', function(){
    var now = new Date();
    var in2Days = new Date(now.getTime()+2*24*3600*1000);
    var payload = {
      title: '示例活动 ' + now.toLocaleTimeString(),
      description: '管理端原生版快速创建',
      full_description: '示例',
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
    setMsg('创建中…');
    AdminAPI.createEvent(payload).then(function(){ setMsg('创建成功'); load(); })
      .catch(function(e){ setMsg((e && e.message) || '创建失败'); console.error(e); });
  });

  tbody.addEventListener('click', function(e){
    if(e.target && e.target.classList.contains('del')){
      var id = e.target.getAttribute('data-id');
      if(!id) return;
      if(!confirm('确定删除活动 '+id+' 吗？')) return;
      setMsg('删除中…');
      AdminAPI.deleteEvent(id).then(function(){ setMsg('删除成功'); load(); })
        .catch(function(err){ setMsg((err && err.message) || '删除失败'); console.error(err); });
    }
  });

  load();
})();


