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

$('form').submit(function (ev) {
    ev.preventDefault()

    var data = new FormData(this)

    $.post({
        url: '/api/upload',
        data: data,
        contentType: false,
        processData: false,
        success: function (res) {
            if (res.code == 'success') {
                location.href = 'index.html'
            }
            else {
                $('.modal-body').text(res.message)
                $('.modal').modal('show')
            }
        }
    })
})