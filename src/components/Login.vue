<template>
    <div class="login_container">
        <div class="login_box">
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <el-form ref="LoginFormRef" label-width="0px" :model="LoginForm" :rules="LoginFormRules" class="login_form">
                <el-form-item prop="username">
                    <el-input prefix-icon="iconfont icon-user" v-model="LoginForm.username"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" prefix-icon="iconfont icon-3702mima" v-model="LoginForm.password" show-password></el-input>
                </el-form-item>
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="reset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
export default {
  data () {
    return {
      LoginForm: {
        username: '',
        password: ''
      },
      LoginFormRules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名称长度在3-10个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { min: 6, max: 15, message: '用户名称长度在6-15个字符之间', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login () {
      this.$refs.LoginFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: result } = await this.$http.post('login', { username: this.LoginForm.username, password: this.LoginForm.password })
        if (result.meta.status !== 200) { return this.$message.error('登录失败') }
        this.$message.success('登录成功')
        // 1将登录成功之后的token，保存到客户端的 sessionStorage中
        // 1.1 项目中出了登录之外的其他API借口，必须在登录之后才能访问
        // 1.2 taken 只应在当前网站打开期间生效，所以将token保存在sessionStorage中
        window.sessionStorage.setItem('token', result.data.token)
        // 2通过编程式导航跳转到后台主页，路由地址是 /home
        this.$router.push('/home')
      })
    },
    reset () {
      this.$refs.LoginFormRef.resetFields()
    }
  }
}
</script>
<style lang="less" scoped>
.login_container{
    background-color: #2b4b6b;
    height: 100%;
}
.login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
}
.avatar_box{
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position:absolute;
    left: 50%;
    transform: translate(-50%,-50%);
    background-color: #fff;
    img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
    }
}
.btns{
display: flex;
justify-content: flex-end;
}
.login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}
</style>
