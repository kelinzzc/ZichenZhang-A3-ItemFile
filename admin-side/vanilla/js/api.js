(function(){
  var API_BASE = window.API_BASE || 'http://localhost:3000/api';

  function http(method, url, body, params){
    var qs='';
    if(params){
      var parts=[]; Object.keys(params).forEach(function(k){
        var v=params[k]; if(v!==undefined&&v!==null&&v!==''){ parts.push(encodeURIComponent(k)+'='+encodeURIComponent(v)); }
      });
      if(parts.length) qs='?'+parts.join('&');
    }
    return fetch(url+qs, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: method==='GET'? undefined : JSON.stringify(body||{})
    }).then(function(res){ if(!res.ok) return res.json().catch(function(){return {}}).then(function(e){throw e;}); return res.json(); });
  }

  window.AdminAPI = {
    // 活动相关
    listEvents: function(params){ return http('GET', API_BASE + '/events', null, params); },
    getEventById: function(id){ return http('GET', API_BASE + '/events/' + id); },
    createEvent: function(data){ return http('POST', API_BASE + '/events', data); },
    updateEvent: function(id, data){ return http('PUT', API_BASE + '/events/' + id, data); },
    deleteEvent: function(id){ return http('DELETE', API_BASE + '/events/' + id); },
    
    // 注册相关
    listRegistrations: function(params){ return http('GET', API_BASE + '/registrations', null, params); },
    deleteRegistration: function(id){ return http('DELETE', API_BASE + '/registrations/' + id); },
    
    // 统计相关
    getEventStats: function(){ return http('GET', API_BASE + '/events/stats'); },
    getRegistrationStats: function(){ return http('GET', API_BASE + '/registrations/stats'); },
    
    // 其他
    getCategories: function(){ return http('GET', API_BASE + '/categories'); }
  };
})();


