<template>
  <div class="rights">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-table :data="rightsList" style="width: 100%" stripe border>
        <el-table-column type="index"></el-table-column>
        <!-- <el-table-column prop="id" label="ID"></el-table-column> -->
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
            <el-tag v-else-if="scope.row.level === '2'" type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      type: 'list',
      rightsList: []
    }
  },
  methods: {
    async getRightsList () {
      const { data: result } = await this.$http.get('rights/list')
      this.rightsList = result.data
      if (result.meta.status !== 200) return this.$message.error('获取权限列表失败')
    }
  },
  created () {
    this.getRightsList()
  }
}
</script>

<style lang="less" scope>

</style>
