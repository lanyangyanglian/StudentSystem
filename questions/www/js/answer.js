$('#goBack').click(function () {
    history.go(-1)
})

var petname = $.cookie('petname')

if (petname) {
    $('#user').find('span').last().text(petname)
}
else {
    $('#user').find('span').last().text('登录').end().end().removeAttr('data-toggle').click(function () {
        location.href = 'login.html'
    })
}

$('.navbar .dropdown-menu li').last().click(function () {
    $.get('/api/logout', null, function (res) {
        if (res.code == 'success') {
            location.href = 'index.html'
        }
    })
})

var question = $.cookie('question')

$('form').submit(function (ev) {
    ev.preventDefault()

    if(!question){
        $('.modal-body').text("不能回答不存在的问题")
        $('.modal').modal('show')
        return;
    }
//content
    var formData = $(this).serializeArray()
    formData.push({
        name: 'question',
        value: question
    })

    $.post('/api/answer', formData, function (res) {
        $('.modal-body').text(res.message)
        $('.modal').modal('show')
            .on('hidden.bs.modal', function (e) {
                if (res.code == 'success') {
                    location.href = 'index.html'
                }
            })
    }, 'json')
})