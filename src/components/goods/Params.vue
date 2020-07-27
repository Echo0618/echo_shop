<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 警告区域 -->
      <el-alert show-icon type="warning" title="注意：只允许为第三级分类设置相关参数！" :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat-opt">
        <el-col>
          <span>商品分类区域：</span>
          <el-cascader v-model="selectedCateKeys" expandTrigger="hover" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="isBtnDisabled" @click="showDialog">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index,scope.row)">{{item}}</el-tag>
                <el-input class="input-new-tag" style="width: 120px;" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="openEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="delParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isBtnDisabled" @click="showDialog">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index,scope.row)">{{item}}</el-tag>
                <el-input class="input-new-tag" style="width: 120px;" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit">{{scope.row.attr_id}}</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="delParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog :title="'添加'+titleText" width="50%" :visible.sync="DialogVis" @close="dialogClosed">
      <el-form :model="form" ref="formRef" :rules="formRules" label-width="90px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="form.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="dialogClosed">取消</el-button>
        <el-button type="primary" @click="addParams">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="'修改'+titleText" width="50%" :visible.sync="editDialogVis" @close="editDialogClosed">
      <el-form :model="form" ref="formRef" :rules="formRules" label-width="90px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="form.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="editDialogClosed">取消</el-button>
        <el-button type="primary" @click="editParams(form.attr_id)">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  computed: {
    isBtnDisabled () {
      if (this.selectedCateKeys.length === 3) {
        return false
      }
      return true
    },
    // 当前 选中分类的ID
    cateId () {
      if (this.selectedCateKeys.length === 3) { return this.selectedCateKeys[this.selectedCateKeys.length - 1] }
      return ''
    },
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  },
  watch: {
  },
  data () {
    return {
      cateList: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 级联选择框 双向绑定到的数组
      selectedCateKeys: [],
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      DialogVis: false,
      form: {
        attr_name: '',
        attr_id: '',
        attr_sel: '',
        attr_vals: '',
        attr_write: '',
        cat_id: ''
      },
      formRules: {
        attr_name: [{ required: true, message: '参数不能为空', toggle: 'blur' }]
      },
      editDialogVis: false
    }
  },
  methods: {
    getCatList () {
      this.$http.get('categories')
        .then(({ data: res }) => {
          this.cateList = res.data
          console.log(res)
        })
    },
    handleChange () {
      this.getParamsList()
    },
    handleTabClick () {
      this.getParamsList()
    },
    getParamsList () {
      const params = { sel: this.activeName }
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      this.$http.get(`categories/${this.cateId}/attributes`, { params })
        .then(({ data: res }) => {
          console.log(res.data)
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            // 添加Boolean值 来控制文本框显示与隐藏
            item.inputVisible = false
            item.inputValue = ''
          })
          if (this.activeName === 'only') {
            this.onlyTableData = res.data
          } else {
            this.manyTableData = res.data
          }
        })
    },
    showDialog () {
      this.DialogVis = true
    },
    dialogClosed () {
      this.DialogVis = false
      this.$refs.formRef.resetFields()
    },
    addParams () {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        const params = {
          attr_name: this.form.attr_name,
          attr_sel: this.activeName,
          attr_vals: ''
        }
        this.$http.post(`categories/${this.cateId}/attributes`, params)
          .then(({ data: res }) => {
            this.DialogVis = false
            this.$message.success('创建成功！')
            this.getParamsList()
          })
      })
    },
    openEditDialog (attrId) {
      this.$http.get(`categories/${this.cateId}/attributes/${attrId}`)
        .then(({ data: res }) => {
          this.form = res.data
          this.editDialogVis = true
          console.log(res.data)
        })
    },
    editDialogClosed () {
      this.editDialogVis = false
      this.$refs.formRef.resetFields()
    },
    editParams (attrId) {
      this.$http.put(`categories/${this.cateId}/attributes/${attrId}`, { attr_name: this.form.attr_name, attr_sel: this.form.attr_sel })
        .then(({ data: res }) => {
          console.log(res.data)
          this.$message.success('更新成功')
          this.getParamsList()
          this.editDialogVis = false
        })
    },
    delParams (attrid) {
      this.$confirm('此操作将永久删除参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrid}`)
        if (res.meta.status !== 200) return this.$message.error('参数删除失败')
        else {
          this.$message.success('删除成功')
          this.getParamsList()
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动货得焦点
      // $nextTick的作用，当页面重新被渲染后，才会指定回调函数的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 文本框失去焦点，或 按下Enter都会触发
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return 则证明输入节后需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      row.inputValue = ''
      // 需要发起请求，保存这次操作
      this.saveAttrVals(row)

      console.log('row', row)
    },
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        })
      if (res.meta.status !== 200) { this.$message.error('添加属性失败！') }
      this.$message.success('更新属性成功')
    },
    // 删除对应的参数可选项
    handleClose (index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
      console.log(index)
    }
  },
  created () {
    this.getCatList()
  }
}
</script>
<style lang="less" scope>
.cat-opt{
  margin: 15px 0;
}
.el-tag{
  margin: 10px;
}

</style>
