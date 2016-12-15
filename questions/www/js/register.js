$('#goBack').click(function () {
    //历史记录对象
    history.go(-1)
})

$('form').submit(function (ev) {
    ev.preventDefault()

    //$(':password').map()和$.map()返回的类型不一样，前者返回的是jq对象，后者返回的是Array
    var pass = $(':password').map(function () {
        return $(this).val()
    })

    if (pass[0] != pass[1]) {
        $('.modal-body').text('两次输入的密码不一样！')
        $('.modal').modal('show')
    }
    else {
        console.log('输入密码相同，准备提交数据')

        //序列化成字符串，格式为键值对，用&连接  是为了便用post方法传送数据！
        //将传送的数据结合成一整串字符串
        var data = $(this).serialize()
        //与上面同效果，注意一下this指向问题，在本示例中this指向form,只有把DOM对象转化成jq对象，才能使用jquery中方法
        //var data = $("form").serialize()
        console.log(data)

        //data向服务器端发送的数据
        //res服务器端响应的数据
        $.post('/api/register', data, function (res) {
            console.log(res)

            $('.modal-body').text(res.message)
            $('.modal').modal('show')
                .on('hidden.bs.modal', function (e) {
                    if (res.code == 'success') {
                        location.href = 'login.html'
                    }
                })
        })
    }
})