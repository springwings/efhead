<template>
  <el-card>
        <div style="font-size:12px;position:relative;top:30px;left:30px;width:150px">
        <em class="color-block">></em>箭头方向表示数据流向<br>
        <em class="color-block" style="background:#999"></em>灰色表示是孤立节点<br>
        <em class="color-block" style="background:#16ccb6"></em>深蓝色表示是结束节点
         </div></div>
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
    var chart = echarts.init(document.getElementById('relation'))
    this.scheduleMethod(chart)
  },
  methods: {
    scheduleMethod(chart){
      setInterval(()=>{this.handleInit(chart)},1000)
    },
    handleInit (chart) {
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
            symbolSize: 20,
            category: categories.findIndex(col => col.name === item.attribute),
          })),
          links: Object.values(data.edges).map(item => ({
            source: item.to,
            target: item.from,
            weight: item.weight,
            isconnect: item.isconnect
          })),
          categories
        }

        const baseLabel = {
           fontSize: 14,
              lineHeight: 21,
              padding:5,
              borderRadius:10,
              width:90,
              overflow: 'breakAll',
        }
        const lineLabel = {
          fontSize: 12,
          color: '#999',
          offset: [0, 10]
        }
        const findRoots = () => {
          const rootNodes = graph.nodes.filter(node => (node.category===1 || node.category===2));
          return rootNodes;
        }
        const buildTree = (parentId,weight,isconnect) => {
          const parentNode = graph.nodes.find(node => node.id === parentId);
          if (!parentNode) return null;
          const childrenLinks = graph.links.filter(link => link.target === parentId);
          const childrenNodes = childrenLinks.map(link => buildTree(link.source,link.weight,link.isconnect)).filter(Boolean);
          return {
            name: weight,
            id: "",
            category: parentNode.category,
            label: lineLabel,
            symbol: isconnect ? "arrow":"rect",
            itemStyle: { color: isconnect ? '#197700' : '#aa1a12'},
            symbolSize: isconnect? 8:10,
            symbolRotate: -90,
            children: [
              {
                id: parentNode.id,
                name: parentNode.name,
                label: baseLabel,
                category: parentNode.category,
                symbol: "circle",
                symbolSize:16,
                itemStyle: {
                             color: parentNode.category==0 ? '#2bbedb' : (parentNode.category==2? '#16ccb6' : (parentNode.category==1?'#888':'#48838c'))
                            },
                children:childrenNodes
              }
            ]
          };
        }

        const roots = findRoots();
        const treeData = {
          name: 'EF',
          id: '',
          symbolSize: 20,
          category:2,
          itemStyle: {
              normal: {color: '#859906',backgroundColor: '#859906'}
              },
          children: roots.map(root => buildTree(root.id,"~",true)).filter(Boolean)
        };
        this.$nextTick(() => {
          this.drawRelation(treeData, graph,chart)
        })
      })
    },
    drawRelation (treeData, graph,chart) {
      const option = {
        legend: [{ data: graph.categories.map(item => item.name) }],
        tooltip: {
                trigger: 'item',
            },
        animationDuration: 500,
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            type: 'tree',
                    orient: 'horizontal',
                    nodeGap: 20,
            data: [treeData],
            categories: graph.categories,
            roam: true,
            draggable: true,
            expandAndCollapse: false,
            edgeSymbol: ['arrow'],
            edgeLabel: {
              fontSize: 14
            },
            symbolSize: 20,
            label: {
              show: true,
              position: 'right',
              formatter: '{b}'
            },
            emphasis: {
               focus: 'descendant'
            },
            scaleLimit: {
              min: 0.4,
              max: 2
            },
            lineStyle: {
              width:0.5,
              color: '#197700',
              curveness: 0.5
            }
          }
        ]
      }
      chart.setOption(option)
    },
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
.color-block {width:10px;height:10px;display: inline-block;margin-right:2px;font-size:16px;font-weight:bold;color:#197700}
</style>
