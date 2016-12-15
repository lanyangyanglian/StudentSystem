var petname = $.cookie('petname')

if (petname) {
    $('#user').find('span').last().text(petname)
}
else {
    // $('#user').find('span').last().text('登录')
    // $('#user').removeAttr('data-toggle').click(function () {
    //     location.href = 'login.html'
    // })
    $('#user').find('span').last().text('登录').end().end().removeAttr('data-toggle').click(function () {
        location.href = 'login.html'
    })
}

$('#ask').click(function () {
    // if (petname) {
    //     location.href = 'ask.html'
    // }
    // else {
    //     location.href = 'login.html'
    // }

    location.href = petname ? 'ask.html' : 'login.html'
})

$('.navbar .dropdown-menu li').last().click(function () {
    $.get('/api/logout', null, function (res) {
        if (res.code == 'success') {
            location.href = 'index.html'
        }
    })
})

//delegate代理，委托事件
$('.questions').delegate('[question]', 'click', function () {
    if (petname) {
        //客户端添加cookie
        $.cookie('question', $(this).attr('question'))
        location.href = 'answer.html'
    }
    else {
        location.href = 'login.html'
    }
})

$.getJSON('/api/questions', null, function (res) {
    if (res.code != "success") {
        console.log(res.message);
        return;
    }

    var html = ''
    for (var i = 0; i < res.data.length; i++) {
        
        var q = res.data[i]
        html += '<div class="media" question="' + q.fileName + '">'
        html += '<div class="media-left">'
        html += '<a>'
        html += '<img class="media-object" src="/uploads/' + q.petname + '.jpg" onerror="this.src=\'/images/user.png\'">'
        html += '</a>'
        html += '</div>'
        html += '<div class="media-body">'
        html += '<h4 class="media-heading">' + q.petname + '</h4>'
        html += q.content
        html += '<div class="media-footing">'
        html += q.time
        html += '</div>'
        html += '</div>'
        html += '</div>'

        if (q.answers) {
            for (var j = 0; j < q.answers.length; j++) {
                var a = q.answers[j]
                html += '<div class="media media-child">'
                html += '<div class="media-body">'
                html += '<h4 class="media-heading">' + a.petname + '</h4>'
                html += a.content
                html += '<div class="media-footing">'
                html += a.time
                html += '</div>'
                html += '</div>'
                html += '<div class="media-right">'
                html += '<a>'
                html += '<img class="media-object" src="/uploads/' + a.petname + '.jpg" onerror="this.src=\'/images/user.png\'">'
                html += '</a>'
                html += '</div>'
                html += '</div>'
            }
        }
    }

    $('.questions').html(html)
})
