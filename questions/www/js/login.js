$('#goBack').click(function () {
    history.go(-1)
})

$('#register').click(function () {
    location.href = 'register.html'
})

$('form').submit(function (ev) {
    ev.preventDefault()

    //将表单提交的数据来进行实例化
    var data = $(this).serialize()

    $.post('/api/login', data, function (res) {
        if (res.code == 'success') {
            location.href = '/'
            //location.href = 'index.html'
        }
        else {
            $('.modal-body').text(res.message)
            $('.modal').modal('show')
        }
    })
})