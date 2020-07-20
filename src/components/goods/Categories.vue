<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-button type="primary" @click="openAddDialog">添加分类</el-button>
      </el-row>
      <!-- 表格区域 -->
      <!-- <el-table :data="cateList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="cat_name" label="商品名称"></el-table-column>
        <el-table-column prop="isValid" label="是否有效"></el-table-column>
        <el-table-column prop="sort" label="排序"></el-table-column>
        <el-table-column  label="操作"></el-table-column>
      </el-table> -->
      <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" index-text="序号" show-index border>
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen;"></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag type="primary" size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="delCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        >
    </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVis" width="80%" @close="addCateClosed">
      <el-form ref="addCateFormRef" :model="addCateForm" :rules="CateFormRules" label-width="80px">
        <el-form-item prop="cat_name" label="分类名称">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item prop="cat_pid" label="父级分类">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader v-model="selectedKeys" clearable change-on-select filterable popper-class="cascader-style" :options="parentCateList" :props="cascaderProps" @change="parentCateChange"></el-cascader>
        </el-form-item>
        <el-form-item prop="cat_level" label="分类等级">
          <el-input v-model="addCateForm.cat_level"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editCateDialogVis" width="80%" @close="editCateClosed">
      <el-form ref="editCateFormRef" :model="editCateForm" :rules="CateFormRules" label-width="80px">
        <el-form-item prop="cate_name" label="分类名称">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      // 商品分类的数据列表，默认为空
      cateList: [],
      total: 0,
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        // 表示当前列为模板列,
        type: 'template',
        // 表示当前这列使用模板名称
        template: 'isok'
      }, {
        label: '排序',
        // 表示当前列为模板列,
        type: 'template',
        // 表示当前这列使用模板名称
        template: 'order'
      }, {
        label: '操作',
        // 表示当前列为模板列,
        type: 'template',
        // 表示当前这列使用模板名称
        template: 'opt'
      }],
      // 控制层架分类对话框的显示与隐藏
      addCateDialogVis: false,
      // 添加分类的表单数据对象
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0 // 分类等级，默认是添加1级分类
      },
      // 添加分类 表单验证规则
      CateFormRules: {
        cat_name: [
          { reuqired: true, message: '分类名称不能为空', toggle: 'blur' }
        ]
      },
      // 父级分类数据
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      editCateDialogVis: false,
      editCateForm: {
        cat_id: 0,
        cat_name: '',
        cat_level: 0
      }
    }
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      // console.log(res)
      this.cateList = res.data.result
      this.total = res.data.total
      // this.$message.success('获取分类列表成功')
    },
    // 监听pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pegenum改变
    handleCurrentChange (newPagenum) {
      this.queryInfo.pagenum = newPagenum
      this.getCateList()
    },
    openAddDialog () {
      // 先获取符集分类数据列表
      this.getParentCateList()
      this.addCateDialogVis = true
    },
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      this.parentCateList = res.data
    },
    // 监听父级分类的数据变化
    parentCateChange () {
      console.log(this.selectedKeys)
      // 如果selectedKeys数组长度大于0，证明选中父级分类
      // 反之，就说明没有选中父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类ID
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类ID
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类
    addCate () {
      console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          this.$message.eror('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVis = false
      })
    },
    // 关闭 添加分类 对话框,并重置表单数据
    addCateClosed () {
      this.addCateDialogVis = false
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    showEditCateDialog (item) {
      console.log(item)
      this.editCateForm.cat_name = item.cat_name
      this.editCateForm.cat_id = item.cat_id
      this.editCateDialogVis = true
    },
    editCateClosed () {
      this.editCateDialogVis = false
    },
    editCate () {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, { cat_name: this.editCateForm.cat_name })
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类名称失败！')
        } else {
          this.$message.success('修改分类名称成功！')
          this.getCateList()
          this.editCateDialogVis = false
        }
      })
    },
    delCate (id) {
      this.$confirm('此操作将永久删除该分类，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${id}`)
        if (res.meta.status !== 200) return this.$message.error('删除分类失败！')
        else {
          this.$message.success('删除分类成功')
          this.getCateList()
        }
      })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    }
  },
  created () {
    this.getCateList()
  }
}
</script>
<style lang="less" scope>
.treeTable{
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
.el-cascader-menu{
max-height: 300px;
}
</style>
