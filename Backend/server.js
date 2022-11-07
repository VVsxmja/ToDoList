import express from 'express'
const port = 8000
const app = express()

/**
 * 解析 JSON 及文本数据
 */
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


/**
 * 允许 CORS
 */
import cors from 'cors'
app.use(cors())


/**
 * 导入 logger
 */
import logger from './logger.js'


/**
 * 导入用户数据数据库
 */
import { UserdataDB, User } from './db/userdata.js'
try {
    await UserdataDB.authenticate()
    logger.info('成功连接到数据库')
} catch (error) {
    logger.error('无法连接到数据库: ', error)
    process.exit(-1)
}


/**
 * 注册 API
 * - request
 *  - username: 用户名
 *  - passwordHash: 密码Hash
 *  - EmailAddress: 邮箱地址
 *  - SecurityCode: 验证码
 * - response
 *  - IsFormValid: 判断post表单是否数据正确
 *    - 如果不正确返回四个boolean值(真值)
 *      - IsUserNameEmpty: 用户名是否为空
 *      - IsPasswordEmpty: 密码是否为空
 *      - IsEmailAddressEmpty: 邮箱地址是否为空
 *      - IsSecurityCodeEmpty: 验证码是否为空
 *    - 如果正确上述boolean值不存在，进入下面的判断
 *    *注意：Json格式已经不一样
 *  - IsSecurityCodeTrue:验证码正确判断
 *  - IsUsernameTrue：用户名是否合法
 * --ToDo
 *   由于无法写入数据库 先使用伪数据
 */
app.post('/api/register', async (req, res) => {
    const username = req.body.UserName
    const PasswordHash = req.body.PasswordHash
    const EmailAddress = req.body.EmailAddress
    const SecurityCode = req.body.SecurityCode

    let IsUserNameEmpty = username?false:true
    let IsPasswordEmpty = PasswordHash?false:true
    let IsEmailAddressEmpty = EmailAddress?false:true
    let IsSecurityCodeEmpty = SecurityCode?false:true

    logger.info(SecurityCode)
    if(IsUserNameEmpty||IsPasswordEmpty||IsEmailAddressEmpty||IsSecurityCodeEmpty){
        res.status(200).send({
            IsFormValid:false,
            IsUserNameEmpty:IsUserNameEmpty,
            IsPasswordEmpty:IsPasswordEmpty,
            IsEmailAddressEmpty:IsEmailAddressEmpty,
            IsSecurityCodeEmpty:IsSecurityCodeEmpty,
            msg:'登录格式不正确'
        })
        return
    }

    /**
     * Todo：找数据库中有无用户名
     * 验证码是否实现
     * （未成功）
     */

    let IsUsernameTrue = username==='dev'?false:true
    let IsSecurityCodeTrue = SecurityCode==='123456'?true:false

    if(!IsUsernameTrue||!IsSecurityCodeTrue){
        res.status(200).send({
            IsFormValid:true,
            IsSecurityCodeTrue:IsSecurityCodeTrue,
            IsUsernameTrue:IsUsernameTrue,
            msg:'用户输入信息不符合'
        })
        return
    }

    res.status(200).send({
        IsFormValid:true,
        IsSecurityCodeTrue:IsSecurityCodeTrue,
        IsUsernameTrue:IsUsernameTrue,
        msg:'注册成功'
    })
})


/**
 * 登录 API
 * 
 * - request
 *   - username: 用户名
 *   - passwordHash: 密码 hash 值
 * 
 * - response
 *   - result: 登录请求结果
 *     - 值只可能为 'success' / 'fail' / 'invalid' 之一
 *   - msg: 服务端返回的信息
 */
/**
 * 增加了写入token的内容
 */

import jwt from 'jsonwebtoken'

app.post('/api/login', async (req, res) => {
    const username = req.body.username
    const passwordHash = req.body.passwordHash
    if (!username || !passwordHash) {
        res.status(400).send({
            result: 'invalid',
            msg: '登录请求格式错误'
        })
        return
    }
    const requestedUser = await User.findOne({
        where: { username: username }
    }) // 由于 username 是 unique 的，所以可以使用 findOne
    if (!requestedUser) {
        res.status(200).send({
            result: 'fail',
            msg: '用户不存在'
        })
        return
    }
    if (requestedUser.passwordHash != passwordHash) {
        res.status(200).send({
            result: 'fail',
            msg: '密码错误'
        })
        return
    }
    var jwtBody = {
        username:requestedUser.username,
    }
    var jwtKey = 'whj'
    let token = jwt.sign(jwtBody,jwtKey)
    requestedUser.token = token
    logger.info(token)
    await requestedUser.save() //生成token 
    res.status(200).send({
        result: 'success',
        msg: '登录成功'
    })
})


/**
 * 忘记密码
 *  - request
 *   - EmailAddress: 邮箱地址
 *   - SecurityCode: 验证码
 *   - PasswordHash: 修改好的密码
 *  - respond:
 *   - IsSecurityCodeTrue: 验证码是否正确
 *   - IsUsernameTrue: 用户名是否正确(防止未注册使用)
 *   - IsEmailAddressValid: 邮箱是否有效
 */
app.post('/api/forgetpassword',async (req,res)=>{
    const EmailAddress  =req.body.EmailAddress
    const SecurityCode = req.body.SecurityCode
    const PasswordHash = req.body.PasswordHash

    /**
     * 请求格式判断
     */

    if(!EmailAddress||!SecurityCode||!PasswordHash){
        res.status(200).send({
            IsSecurityCodeTrue : undefined,
            msg:'忘记密码请求格式出错'
        })
        return
    }

    /**
     * 无法写入数据库 
     */

    // var requestedUser = User.findOne({
    //     where:{
    //         EmailAddress:EmailAddress
    //     }
    // })


    /**
     * 发邮箱不会
     */


    if(SecurityCode!=='123456'){
        res.status(200).send({
            IsSecurityCodeTrue:false,
            msg:'验证码不正确'
        })
        return
    }

    res.status(200).send({
        IsSecurityCodeTrue:true,
        msg:'重置密码成功'
    })
})

/**
 * personalinfo api:
 *   -request:
 *      - token : 检查登录状态
 *      - UserName: 用户名
 *      - UserGender: 用户性别
 *      - Signature: 用户个签
 *      - Birthday: 用户生日
 *      - Major: 用户专业
 *      - Grade: 用户年级
 *   - response:
 *      一个json对象返回这些信息
 *      - IsModificationApplied:判断修改成功与否的boolean值
 */
app.post('/api/personalinfo',async(req,res)=>{
    /**
     * 检查请求格式
     */
    const UserName = req.body.UserName
    const token = req.body.token
    const UserGender = req.body.UserGender
    const Signature = req.body.Signature
    const Birthday = req.body.Birthday
    const Major = req.body.Major
    const Grade = req.body.Grade

    /**
     * 数据库中查找username，比较token
     */
    
    if(!token||token!='123456'){
        res.status(200).send({
            IsModificationApplied:false,
            msg:'用户未登录'
        })
        return
    }

    /**
     * 数据库根据token更新user
     */

    res.status(200).send({
        IsModificationApplied:true,
        msg:'修改成功!'
    })

})

/**
 * 上传图片
 */
import fileUpload from 'express-fileupload'

app.use(fileUpload())

app.post('api/uploadimage',async(req,res)=>{
    logger.info(req.files)

    res.sendStatus(200)
})

/**
 * 运行服务器
 */
app.listen(port, () => {
    logger.info(`服务器开始运行: http://127.0.0.1:${port}`)
})