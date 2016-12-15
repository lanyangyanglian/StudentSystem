const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const fs = require('fs')
const multer = require('multer')

const app = express()

const storage = multer.diskStorage({
    destination: 'www/uploads',
    filename: function (req, file, callback) {
        var petname = req.cookies.petname
        var index = file.originalname.lastIndexOf(".")
        var fileExtendName = file.originalname.substr(index)
        callback(null, `${petname + fileExtendName}`)
    }
})
const uploads = multer({ storage })

app.use(express.static('www'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

//注册接口
app.post('/api/register', (req, res) => {
    //因为表单中没有ip和时间 所有传送不了  以下做法是将ip和时间加到req.body对象中
    req.body.ip = handleIP(req.ip)
    req.body.time = format(new Date())

    fs.exists('www/users', exists => {
        if (exists) {
            //判断文件夹是否存在 存在文件夹就向其中添加文件
            //下面的方法是将注册信息保存下来
            saveRegisterInfo(res, req)
        }
        else {
            //如果文件夹不 存在  那么就先创建文件夹  然后再向其中添加文件（也就是要保存的注册信息）
            fs.mkdir('www/users', err => {
                if (err) {
                    send(res, 'file error', '抱歉，系统错误...')
                }
                else {
                    saveRegisterInfo(res, req)
                }
            })
        }
    })
})
//登录接口
app.post('/api/login', (req, res) => {
    //占位符，格式$(变量),不在使用单引号或者双引号包裹，而使用``符号包裹
    // var fileName = `www/users/${req.body.petname}.txt`
    var fileName = `www/users/${req.body.petname}.txt`

    //如果文件存在，返回true ，否则返回false
    //把返回的结果传递给回调函数的形参exists
    fs.exists(fileName, exists => {
        if (!exists) {
            send(res, 'register error', '用户名未注册！')
            return;
        }
        else {
            fs.readFile(fileName, (err, data) => {
                if (err) {
                    send(res, 'file error', '抱歉，系统错误...')
                    return;
                }
                else {
                    var user = JSON.parse(data)
                    if (user.password == req.body.password) {

                        //把昵称字段存储到cookie
                        res.cookie('petname', req.body.petname)

                        send(res, 'success', '登录成功...')
                    }
                    else {
                        send(res, 'signin error', '密码错误！')
                    }
                }
            })
        }
    })
})
//注销退出接口
app.get('/api/logout', (req, res) => {
    res.clearCookie('petname')
    res.status(200).json({ code: 'success' })
})
//提问接口
app.post('/api/ask', (req, res) => {
    var petname = req.cookies.petname

    if (!petname) {
        send(res, 'signin error', '请重新登录...')
        return
    }

    var time = new Date()
    var fileName = time.getTime();

    req.body.petname = petname
    req.body.ip = handleIP(req.ip)
    req.body.time = format(time)
    req.body.fileName = fileName

    fs.exists('www/questions', exists => {
        if (exists) {
            saveAskInfo(time, fileName, res, req)
        }
        else {
            fs.mkdir('www/questions', err => {
                if (err) {
                    send(res, 'file error', '抱歉，系统错误...')
                }
                else {
                    saveAskInfo(time, fileName, res, req)
                }
            })
        }
    })
})
//获取问答列表接口
app.get('/api/questions', (req, res) => {
    fs.readdir('www/questions', (err, files) => {
        if (err) {
            send(res, 'file error', '抱歉，系统错误...')
        }
        else {
            //把文件列表反转顺序，目的把最新提问的文件列表放到前面显示
            files = files.reverse()
            var questions = []

            readQuestions(0, files, questions, function () {
                send(res, 'success', '读取数据成功！', questions)
            })
        }
    })
})
//回答接口
app.post('/api/answer', (req, res) => {
    var petname = req.cookies.petname

    if (!petname) {
        send(res, 'signin error', '请重新登录...')
        return
    }
    console.log(req.body)
    var filename = `www/questions/${req.body.question}.txt`
    console.log(filename)

    req.body.petname = petname
    req.body.ip = handleIP(req.ip)
    req.body.time = format(new Date())

    fs.readFile(filename, (err, data) => {
        if (err) {
            send(res, 'file error', '抱歉，系统错误...')
        }
        else {
            var question = JSON.parse(data)
            if (!question.answers) {
                question.answers = []
            }

            question.answers.push(req.body)

            fs.writeFile(filename, JSON.stringify(question), err => {
                if (err) {
                    send(res, 'file error', '抱歉，系统错误...')
                }
                else {
                    send(res, 'success', '回答提交成功！')
                }
            })
        }
    })
})
//上传头像
app.post('/api/upload', uploads.single('photo'), (req, res) => {
    res.status(200).json({ code: 'success', message: '上传成功' })
})
//监听
app.listen(3000, () => console.log('服务正在运行...请访问http://127.0.0.1:3000/'))

//给客户端响应数据
function send(res, code, message) {
    res.status(200).json({ code, message })
}
//给客户端响应数据（问答列表专用）
function send(res, code, message, data) {
    res.status(200).json({ code, message, data })
}
//保存注册信息
function saveRegisterInfo(res, req) {
    //${}当作一个点位符
    var fileName = `www/users/${req.body.petname}.txt`
    //var fileName = 'www/users/' + req.body.petname + ".txt";

    fs.exists(fileName, exists => {
        if (exists) {
            send(res, 'registered', '用户名已经注册过了！')
        }
        else {
            fs.appendFile(fileName, JSON.stringify(req.body), err => {
                if (err) {
                    send(res, 'file error', '抱歉，系统错误...')
                }
                else {
                    send(res, 'success', '恭喜，注册成功！请登录...')
                }
            })
        }
    })
}
//保存提问信息
function saveAskInfo(time, fileName, res, req) {
    var fileName = `www/questions/${fileName}.txt`

    fs.appendFile(fileName, JSON.stringify(req.body), err => {
        if (err) {
            send(res, 'file error', '抱歉，系统错误...')
        }
        else {
            send(res, 'success', '问题提交成功！')
        }
    })
}
//读取问答列表文件到数组中
function readQuestions(i, files, questions, complete) {
    if (i < files.length) {
        fs.readFile(`www/questions/${files[i]}`, (err, data) => {
            if (!err) {
                questions.push(JSON.parse(data))
            }
            readQuestions(++i, files, questions, complete)
        })
    }
    else {
        complete()
    }
}

//转换日期格式
function format(date) {
    var dateStr = ""

    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var h = date.getHours()
    var m = date.getMinutes()
    var s = date.getSeconds()

    month = month < 10 ? "0" + month : month
    day = day < 10 ? "0" + day : day
    h = h < 10 ? "0" + h : h
    m = m < 10 ? "0" + m : m
    s = s < 10 ? "0" + s : s

    //生成格式：2016-07-16 14:51:12
    dateStr = year + "-" + month + "-" + day + " " + h + ":" + m + ":" + s

    return dateStr
}

//处理IP
function handleIP(IP) {
    var result = IP
    if (result.endsWith("127.0.0.1")) {
        result = "127.0.0.1"
    } else {
        if (result.indexOf(":") > -1) {
            var index = result.lastIndexOf(":")
            result = result.substr(index)
        }
    }
    return result
}
