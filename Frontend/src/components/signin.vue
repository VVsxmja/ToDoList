<template>
    <div class="auth-container" style="user-select: none;">
        <div class="auth-box">
            <div class="auth-box-item">
                <img src="/assets/image/logo.png" class="auth-box-logo" />
            </div>
            <el-input class="auth-box-item bottomMargin1" placeholder="用户名" v-model="this.username" />
            <el-input class="auth-box-item bottomMargin2" type="password" placeholder="密码"
                v-model="this.password" />
            <el-button class="auth-box-item" type="primary" @click="Login">登录</el-button>
            <div style="flex: 1 1 auto;"></div>
            <div class="auth-box-item"
                style="width: 100%; display: flex; flex-flow: row nowrap; justify-content: space-between; align-self: flex-end;">
                <el-button link type="primary" @click="this.$router.push('/resetPassword')">忘记密码</el-button>
                <el-button link type="primary" @click="this.$router.push('/signup')">注册</el-button>
            </div>
        </div>
    </div>
</template>
 

<script>

import axios from 'axios'
import { ElMessage } from 'element-plus'

export default {
    name: 'signIn',
    data() {
        return {
            username: '',
            password: '',
        }
    },
    mounted() {
        localStorage.removeItem('token')
    },
    methods: {
        async Login() {
            let response
            try {
                response = await axios.post('/api/user/signin', {
                    username: this.username,
                    passwordHash: await this.sha256(this.password)
                })
            } catch (err) {
                if (err.response.data.result == 'fail') {
                    ElMessage({
                        message: err.response.data.msg,
                        grouping: false,
                        type: 'error',
                    })
                } else {
                    ElMessage({
                        message: '未知错误',
                        grouping: false,
                        type: 'error',
                    })
                }
                return
            }
            ElMessage({
                message: '登录成功',
                grouping: false,
                type: 'success',
            })
            localStorage.setItem('token', response.data.token)
            this.$router.push('/app')
        },
        async sha256(message) {
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        },
    },
}
</script>
  
<style scoped>
@import "/assets/css/auth-box.css";

.bottomMargin1 {
    margin-bottom: 20px;
}

.bottomMargin2 {
    margin-bottom: 40px;
}
</style>