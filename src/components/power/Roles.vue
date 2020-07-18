<template>
  <div class="rights">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="openAddDialog">添加用户</el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-table :data="rolesList" border stripe>
          <!-- 展开列 -->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row v-for="(item1,i1) in scope.row.children" :key="item1.id" :class="['bdbottom',i1===0?'bdtop':'','vcenter']">
                <!-- 渲染一级权限 -->
                <el-col :span="5">
                  <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 渲染二级权限和三级权限 -->
                <el-col :span="19">
                  <!-- 通过for循环 嵌套渲染二级权限 -->
                  <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="[i2===0?'':'bdtop','vcenter']">
                    <el-col :span="6">
                      <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span='18'>
                      <el-tag v-for="(item3) in item2.children" :key="item3.id" type="warning" closable @close="removeRightById(scope.row,item3.id)">
                        {{item3.authName}}
                      </el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <!-- 索引列 -->
          <el-table-column type="index"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column  width="300px">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEdit(scope.row.id)">编辑</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="delRoles(scope.row.id)">删除</el-button>
              <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限 </el-button>
             </template>
          </el-table-column>
        </el-table>
      </el-row>
    </el-card>
    <el-dialog title="添加角色" :visible.sync="addDialogVis" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogClosed">取消</el-button>
        <el-button type="primary" @click="addRoles">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="修改角色" :visible.sync="editDialogVis" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogClosed">取消</el-button>
        <el-button type="primary" @click="editRoles">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="设置权限" :visible.sync="SetRightDialogVis" width="50%" @close="setRightDialogClosed">
      <el-tree :data="rightList" :props="treeProps" node-key="id" show-checkbox :default-expand-all="true" :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogClosed">取消</el-button>
        <el-button type="primary" @click="allotRight">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      rolesList: [],
      addDialogVis: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addRules: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '角色描述不能为空', trigger: 'blur' }
        ]
      },
      editDialogVis: false,
      editForm: {},
      editRules: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '角色描述不能为空', trigger: 'blur' }
        ]
      },
      SetRightDialogVis: false,
      rightList: [],
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点Id值数值
      defKeys: [],
      roleId: ''
    }
  },
  methods: {
    async getRolesList () {
      const { data: result } = await this.$http.get('roles')
      if (result.meta.status !== 200) { this.$message.error('获取角色列表失败') }
      this.rolesList = result.data
    },
    openAddDialog () {
      this.addDialogVis = true
    },
    addRoles () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: result } = await this.$http.post('roles', this.addForm)
        console.log(result)
        if (result.meta.status !== 201) this.$message.error('角色创建失败')
        else {
          this.addDialogClosed()
          this.$message.success(result.meta.msg)
          this.getRolesList()
        }
      })
    },
    addDialogClosed () {
      this.addDialogVis = false
      this.$refs.addFormRef.resetFields()
    },
    async showEdit (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取角色信息失败')
      else {
        this.editForm = res.data
        this.editDialogVis = true
      }
    },
    editDialogClosed () {
      this.editDialogVis = false
      this.$refs.editFormRef.resetFields()
    },
    editRoles () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('修改角色信息失败')
        else {
          this.$message.success(res.meta.msg)
          this.editDialogClosed()
          this.getRolesList()
        }
      })
    },
    async delRoles (id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) return this.$message.error('删除角色失败')
        else {
          this.$message.success(res.meta.msg)
          this.getRolesList()
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 根据ID删除对应的权限
    async removeRightById (role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久取消该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('取消权限失败')
      }
      // this.getRolesList()
      role.children = res.data
      this.$message.success(res.meta.msg)
    },
    // 展示对应权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) { return this.$message.error('获取权限失败') } else {
        console.log(res.data)
        this.rightList = res.data
      }
      this.getLeafKeys(role, this.defKeys)

      this.SetRightDialogVis = true
    },
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRight () {
      const keys = [
        ...this.$refs.treeRef.getHalfCheckedKeys(),
        ...this.$refs.treeRef.getCheckedKeys()
      ]
      const idStr = keys.join(',')
      console.log(keys)
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('设置权限失败')
      }
      this.SetRightDialogVis = false
      this.getRolesList()
      return this.$message.success(res.meta.msg)
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defkeys 数组中
    getLeafKeys (node, arr) {
      // 如果当前node 节点不包含children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    }

  },
  created () {
    this.getRolesList()
  }
}
</script>

<style lang="less" scope>
.el-tag{
  margin: 7px;
}
.bdtop{
  border-top: 1px solid #eee;
}
.bdbottom{
  border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>
