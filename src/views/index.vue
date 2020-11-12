<template>
  <div class="dashboard-editor-container">

    <panel-group @handleSetLineChartData="handleSetLineChartData" :orderInfo="orderInfo" v-if="initChildrenSuccess"/>
    <div style="margin-left: -100px; margin-top: 0px">
      <div id="myChartChina" style="width: 100%; height: 800px; ">
      </div>
    </div>


  </div>
</template>

<script>
import PanelGroup from './dashboard/PanelGroup'
import {getToken, getExpiresIn, setExpiresIn} from '@/utils/auth'
import {findDealerChinaChartData, findMainOrderSalesInfo} from "@/api/login";

const lineChartData = {
  newVisitis: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  messages: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  purchases: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  shoppings: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}

export default {
  name: 'Index',
  components: {
    PanelGroup,
  },
  data() {
    return {
      //刷新token锁
      refreshLock: false,
      //刷新token的时间
      refreshTime: '',
      lineChartData: lineChartData.newVisitis,
      initChildrenSuccess: false,
      chartChinaMapData: [],
      orderInfo: null,
    }
  },
  created() {
    this.refreshToken();
    // 查询中国地图经销商数订单
     findDealerChinaChartData().then(res=>{
       this.chartChinaMapData = res;
       this.drawLine();
    });
    // 查询有效订单数据(首页)
    findMainOrderSalesInfo().then(res=>{
      this.orderInfo = res.data;
      this.initChildrenSuccess = true;
    });
  },
  mounted() {

  },
  methods: {
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    },
    // 实时检测刷新token
    refreshToken() {
      this.refreshTime = setInterval(() => {
        if (null === getToken()) {
          return;
        }
        const expires_in = getExpiresIn();
        if (expires_in <= 1200 && !this.refreshLock) {
          this.refreshLock = true
          this.$store
            .dispatch('RefreshToken')
            .catch(() => {
              clearInterval(this.refreshTime)
            });
          this.refreshLock = false
        }
        this.$store.commit("SET_EXPIRES_IN", expires_in - 10);
        setExpiresIn(expires_in - 10);
      }, 10000);
    },


    drawLine() {
      // 基于准备好的dom，初始化echarts实例
      var myChartContainer = document.getElementById('myChartChina');
      var resizeMyChartContainer = function () {
        myChartContainer.style.width = (document.body.offsetWidth) + 'px'//页面一半的大小
      }
      resizeMyChartContainer();
      var myChartChina = this.$echarts.init(myChartContainer);

      // 绘制图表
      var optionMap = {
        tooltip: {},
        legend: {
          orient: 'vertical',
          left: 'ceneter',
          data: ['']
        },
        visualMap: {
          min: 0,
          max: 1000,
          left: '10%',
          top: 'bottom',
          text: ['高', '低'],
          calculable: true,
          color: ['#0b50b9', '#c3e2f4']
        },
        selectedMode: 'single',
        series: [
          {
            name: '',
            type: 'map',
            mapType: 'china',
            itemStyle: {
              normal: {
                borderColor: 'rgba(0, 0, 0, 0.2)'
              },
              emphasis: {
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowBlur: 20,
                borderWidth: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            showLegendSymbol: true,
            label: {
              normal: {
                show: true
              },
              emphasis: {
                show: true
              }
            },
            data: this.chartChinaMapData,
          }
        ]
      }

      myChartChina.setOption(optionMap);
      window.onresize = function () {
        resizeMyChartContainer();
        myChartChina.resize();
      }
    }

  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
