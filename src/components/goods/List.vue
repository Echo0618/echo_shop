<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/Home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="10">
        <el-col :span="8"><el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="search"> <el-button slot="append" icon="el-icon-search" @click="search"></el-button></el-input></el-col>
        <el-col :span="4"><el-button type="primary" @click="goAddPage">添加商品</el-button></el-col>
      </el-row>

      <!-- 表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="100px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="100px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140px">
          <template slot-scope="scope">
              {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit"  size="mini" @click="editGoods(scope.row)"></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="delGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>{{queryInfo}}
      <!-- 分页区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      goodsList: []
    }
  },
  methods: {
    async search () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.search()
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.search()
    },
    editGoods (row) {
      console.log('row', row)
    },
    async delGoods (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('取消权限失败')
      }
      this.search()
      this.$message.success(res.meta.msg)
    },
    goAddPage () {
      this.$router.push('/goods/add')
    }
  },
  created () {
    this.search()
  }
}
</script>
<style lang="less" scope>

</style>
