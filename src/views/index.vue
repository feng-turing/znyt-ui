<template>
  <div class="dashboard-editor-container">

    <panel-group @handleSetLineChartData="handleSetLineChartData"/>
    <div style="margin-left: -100px; margin-top: 0px">
      <div id="myChartChina" style="width: 100%; height: 800px; ">

      </div>
    </div>


  </div>
</template>

<script>
import PanelGroup from './dashboard/PanelGroup'
import LineChart from './dashboard/LineChart'
import RaddarChart from './dashboard/RaddarChart'
import PieChart from './dashboard/PieChart'
import BarChart from './dashboard/BarChart'
import {getToken, getExpiresIn, setExpiresIn} from '@/utils/auth'

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
    LineChart,
    RaddarChart,
    PieChart,
    BarChart
  },
  data() {
    return {
      //刷新token锁
      refreshLock: false,
      //刷新token的时间
      refreshTime: '',
      lineChartData: lineChartData.newVisitis
    }
  },
  created() {
    this.refreshToken()
  },

  mounted() {
    this.drawLine();
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

      function randomData() {
        return Math.round(Math.random() * 500);
      }

      // 绘制图表
      var optionMap = {
        tooltip: {},
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['']
        },
        visualMap: {
          min: 0,
          max: 1500,
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
            data: [
              {name: '北京', value: randomData()},
              {name: '天津', value: randomData()},
              {name: '上海', value: randomData()},
              {name: '重庆', value: randomData()},
              {name: '河北', value: randomData()},
              {name: '河南', value: randomData()},
              {name: '云南', value: randomData()},
              {name: '辽宁', value: randomData()},
              {name: '黑龙江', value: randomData()},
              {name: '湖南', value: randomData()},
              {name: '安徽', value: randomData()},
              {name: '山东', value: randomData()},
              {name: '新疆', value: randomData()},
              {name: '江苏', value: randomData()},
              {name: '浙江', value: randomData()},
              {name: '江西', value: randomData()},
              {name: '湖北', value: randomData()},
              {name: '广西', value: randomData()},
              {name: '甘肃', value: randomData()},
              {name: '山西', value: randomData()},
              {name: '内蒙古', value: randomData()},
              {name: '陕西', value: randomData()},
              {name: '吉林', value: randomData()},
              {name: '福建', value: randomData()},
              {name: '贵州', value: randomData()},
              {name: '广东', value: randomData()},
              {name: '青海', value: randomData()},
              {name: '西藏', value: randomData()},
              {name: '四川', value: randomData()},
              {name: '宁夏', value: randomData()},
              {name: '海南', value: randomData()},
              {name: '台湾', value: randomData()},
              {name: '香港', value: randomData()},
              {name: '澳门', value: randomData()}
            ]
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
