<template>
  <div>
    <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区域 -->
      <el-card>
        <!-- 提示区域 -->
        <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
        <!-- 步骤条区域 -->
        <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
        <!-- tab栏区域 -->
        <el-form :model="addForm" ref="addFormRef" :rules="addFormRules" label-position="top" label-width="100px">
          <el-tabs tab-position="left" v-model="activeIndex" :before-leave="beforeTabsLeave" @tab-click="tabClicked">
            <el-tab-pane label="基本信息" name="0">
              <el-form-item prop="goods_name" label="商品名称">
                <el-input v-model="addForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item prop="goods_price" label="商品价格">
                <el-input v-model="addForm.goods_price" type="number"></el-input>
              </el-form-item>
              <el-form-item prop="goods_weight" label="商品重量">
                <el-input v-model="addForm.goods_weight" type="number"></el-input>
              </el-form-item>
              <el-form-item prop="goods_number" label="商品数量">
                <el-input v-model="addForm.goods_number" type="number"></el-input>
              </el-form-item>
              <el-form-item prop="goods_cat" label="商品分类">
                <!-- <el-input v-model="addForm.goods_cat"></el-input> -->
                <el-cascader v-model="addForm.goods_cat" :options="categories" :props="props" @change="handleChange" ></el-cascader>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
              <!-- <el-tag v-for="(item,index) in manyTableData" :key="index">{{item.attr_name}}</el-tag> -->
              <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_is">
                <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox border :label="cb" v-for="(cb,i) in item.attr_vals" :key="i"></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
              <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
              <!-- action 表示图片要上传后台api地址 -->
              <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" :on-success="handleSuccess" list-type="picture" :headers="headerObject">
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
              <!-- 富文本编辑器组件 -->
              <quill-editor v-model="addForm.goods_introduce"></quill-editor>
              <!-- 添加按钮 -->
              <el-button type="primary" class="btnadd" @click="add">添加商品</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </el-card>
      <!-- 图片预览区域 -->
      <el-dialog title="图片预览" :visible.sync="previewVis" width="50%">
        <img :src="previewPath" alt="" class="previewImg">
      </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  watch: {
  },
  data () {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        // 商品详情
        goods_introduce: '',
        // 商品属性
        attr: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '商品价格不能为空', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '商品重量不能为空', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '商品数量不能为空', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '商品分类不能为空', trigger: 'blur' }
        ]

      },
      categories: [],
      props: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObject: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      // 控制图片
      previewVis: false
    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[this.addForm.goods_cat.length - 1]
      }
      return null
    }
  },
  methods: {
    getCateList () {
      this.$http.get('categories')
        .then(({ data: res }) => {
          this.categories = res.data
        })
        .catch(() => {
        // this.$message.error('获取商品列表失败')
          this.categories = []
        })
    },
    // 监听级联选择器 变化时，会出发函数
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabsLeave (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    async getGoodsCategories (sel) {
      const { data: res } = await this.$http.get(`categories/${this.addForm.goods_cat[this.addForm.goods_cat.length - 1]}/attributes`, { params: { sel: sel } })
      if (res.meta.status !== 200) {
        this.$message.error('获取商品参数失败！')
        this.activeIndex = '0'
      } else {
        if (sel === 'many') {
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
          })
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      }
    },
    // 获取商品静态属性函数

    // 监听tab点击事件
    tabClicked () {
      if (this.activeIndex === '1') {
        this.getGoodsCategories('many')
      } else if (this.activeIndex === '2') {
        this.getGoodsCategories('only')
      }
    },
    // 处理图片预览效果
    handlePreview (file) {
      this.previewPath = file.response.data.url
      this.previewVis = true
    },
    // 处理移除图片的效果
    handleRemove (file) {
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tem_path

      // 2.从pics 数组中，找到这个图片的对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3.调用数组的splice 方法，吧图片信息对象，从pics 数组中移除
      this.addForm.pics.splice(i, 1)
    },
    // 监听图片上传成功函数
    handleSuccess (response) {
      // 1.拼接得到一个图片信息对象
      const picsInfo = { pic: response.data.tmp_path }
      // 2.将图片信息push到pics数组中
      this.addForm.pics.push(picsInfo)
    },
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请重新核查表单提交数据 ')
        // 执行添加操作
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attr.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attr.push(newInfo)
        })
        form.attr = this.addForm.attr
        // 发起请求
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败')
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }

  },
  created () {
    this.getCateList()
  }

}
</script>
<style lang="less" scope>
.el-checkbox{
  margin:0 10px 0 0 !important;
}
.previewImg{
width: 100%;
}
.btnadd {
  margin-top: 15px;
}
</style>
