<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="queryInfo.query"><el-button slot="append" icon="el-icon-search"></el-button></el-input>
        </el-col>
        <el-col>
          <el-table :data="orderList" border stript>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="order_number" label="订单号"></el-table-column>
            <el-table-column prop="order_price" label="订单价格"></el-table-column>
            <el-table-column prop="order_pay" label="是否付款">
              <template slot-scope="scope">
                <el-tag type="success" v-if="scope.row.order_pay===1">已付款</el-tag>
                <el-tag type="danger" v-else>未付款</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="is_send" label="是否发货"></el-table-column>
            <el-table-column prop="create_time" label="下单时间">
              <template slot-scope="scope">
                  {{scope.row.create_time|dateFormat}}
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showBox"></el-button>
                <el-button type="success" size="mini" icon="el-icon-location" @click="showProgressBox(scope.row)"></el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[10, 20, 30, 40]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
        </el-col>
      </el-row>

    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" @close="closeBox" width="50%">
      <el-form ref="addressFormRef" :model="addressForm" :rules="addressFormRules" label-width="90px">
        <el-form-item prop="address1" label="省市区/县">
          <el-cascader clearable v-model="addressForm.address1" :options="cityData" :props="props" @change="handleChange"></el-cascader>
        </el-form-item>
        <el-form-item prop="address2" label="详细地址">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button  @click="closeBox">取消</el-button>
        <el-button type="primary">确定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%" @close="progressClose">
      <el-timeline :reverse="reverse">
        <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer">
        <el-button @click="progressClose">取消</el-button>
        <el-button type="primary">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import cityData from './citydata'
export default {
  data () {
    return {
      orderList: [],
      queryInfo: {
        pagesize: 10,
        pagenum: 1,
        query: ''
      },
      total: 0,
      addressVisible: false,
      addressForm: {
        address1: '',
        address2: ''
      },
      addressFormRules: {
        address1: { required: true, message: '省市区/县不能为空', trigger: 'blur' },
        address2: { required: true, message: '详细地址不能为空', trigger: 'blur' }
      },
      options: [],
      props: {
        expandTrigger: 'hover'
      },
      cityData: cityData,
      progressVisible: false,
      progressInfo: [],
      reverse: true,
      activities: [{
        content: '活动按期开始',
        timestamp: '2018-04-15'
      }, {
        content: '通过审核',
        timestamp: '2018-04-13'
      }, {
        content: '创建成功',
        timestamp: '2018-04-11'
      }]
    }
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败！')
      }
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getOrderList()
    },
    handleCurrentChange (pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getOrderList()
    },
    handleChange () {

    },
    showBox () {
      this.addressVisible = true
    },
    closeBox () {
      this.addressVisible = false
      this.$refs.addressFormRef.resetFields()
    },
    showProgressBox (row) {
      this.getProGressList(row.order_number)
      this.progressVisible = true
    },
    progressClose () {
      this.progressVisible = false
    },
    async getProGressList (id) {
      const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败！')
      }
      this.$message.success('获取物流信息成功！')
      this.progressInfo = res.data
      console.log(res.data)
    }
  },
  created () {
    this.getOrderList()
  }
}
</script>
<style lang="less" scoped>

</style>
