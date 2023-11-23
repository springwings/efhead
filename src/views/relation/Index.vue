<template>
  <el-card>
    <div id="relation"></div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import taskApi from '@/request/api/task'

export default {
  data () {
    return {

    }
  },
  mounted () {
    this.handleInit()
  },
  methods: {
    handleInit () {
      taskApi.efm_doaction({
        ac: 'instanceflowgraph'
      }).then(res => {
        const data = res.response.datas
        const categories = [
          { name: 'M' },
          { name: 'S' },
          { name: 'B' },
          { name: 'E' }
        ]
        const graph = {
          nodes: Object.values(data.nodes).map((item, index) => ({
            id: item.Instance,
            name: item.Alias,
            symbolSize: 14,
            category: categories.findIndex(col => col.name === item.attribute),
            x: 0,
            y: 0
          })),
          links: Object.values(data.edges).map(item => ({
            source: item.to,
            target: item.from,
            label: {
              show: true,
              formatter: (params) => {
                return item.weight
              }
            }
          })),
          categories
        }
        this.$nextTick(() => {
          this.drawRelation(graph)
        })
      })
    },
    drawRelation (graph) {
      const option = {
        legend: [{ data: graph.categories.map(item => item.name) }],
        animationDuration: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            type: 'graph',
            layout: 'circular',
            data: graph.nodes,
            links: graph.links,
            categories: graph.categories,
            roam: true,
            edgeSymbol: ['arrow'],
            edgeLabel: {
              fontSize: 14
            },
            label: {
              show: true,
              position: 'right',
              formatter: '{b}'
            },
            emphasis: {
              focus: 'adjacency',
              lineStyle: {
                width: 2
              }
            },
            // labelLayout: {
            //   hideOverlap: false
            // },
            scaleLimit: {
              min: 0.4,
              max: 2
            },
            lineStyle: {
              color: 'source',
              width: 1,
              curveness: 0.3
            }
          }
        ]
      }
      const chart = echarts.init(document.getElementById('relation'))
      chart.setOption(option)
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep.el-card {
  box-sizing: border-box;
  height: 100%;
  .el-card__body {
    box-sizing: border-box;
    height: 100%;
  }
}
#relation {
  height: 100%;
}
</style>
