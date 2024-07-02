<template>
    <el-card >
    <div v-loading="loading" id="view_control" style="z-index:9999;font-size:12px;position:relative;top:30px;left:30px;width:100%;min-height:55px;">
      <div id="search_view" style="float:right;margin:10px 30px 0 0">
          <el-input style="width:150px" v-model="trackField" placeholder="追踪的字段名" clearable :maxlength="32"></el-input><br>
          <el-input style="width:150px" v-model="trackValue" placeholder="追踪的字段值" clearable :maxlength="32"></el-input><br>
          <a class="el-button el-button--success" @click="track()">{{ trackButton }}</a>
      </div>
      <div style="float:left">
         <a class="el-button el-button--success is-plain" @click="drawChart('circle')">环形图</a><br>
         <a class="el-button el-button--primary is-plain" @click="drawChart('tree')">树形图</a>
      </div>
        <div id="tree_view" style="display:none;float:left;margin:10px 0 0 10px ">
           <i class="el-icon-caret-right"></i> 箭头方向表示数据流向<br>
          <em class="color-block" style="background:#999"></em> 灰色表示是孤立节点<br>
          <em class="color-block" style="background:#87b9ed"></em> 深蓝色表示是结束节点<br>
          <em class="color-block" style="background:#ff6e00"></em> 橙色表示节点非健康状态<br>(节点中断或未打开读写)
        </div>
        <div id="circle_view" style="display:none;float:left;margin:10px 0 0 10px ">
          <i class="el-icon-caret-right"></i> 箭头方向表示数据流向<br>
          <i class="el-icon-minus"></i> 实线表示建立连接<br>
          <i class="el-icon-more"></i> 虚线表示未建立连接<br>
          <i class="el-icon-star-on"></i> 线上数据表示数据处理量
        </div>
    </div>
     <div id="relation" style="min-height:550px;" v-loading="loading"></div>
    </el-card>
</template>

<script>
import * as echarts from 'echarts'
import basicApi from '@/request/api/basic'

export default {
    data () {
        return {
          loading: true,
          trackField:"",
          trackValue:"",
          startTrack:false,
          isProcessing: false,
          trackButton:"开始追踪"
        }
    },
    mounted () {
       this.chart = echarts.init(document.getElementById('relation'))
		   this.drawChart('circle')
    },
    beforeDestroy() {
      clearInterval(this.interval_ins1);
      clearInterval(this.interval_ins2);
    },
    methods: {
      track(){
        this.startTrack = this.startTrack ? false : true
        this.trackButton = this.startTrack ? "停止追踪" : "开始追踪"
      },
      drawChart(type){
        this.loading = true
        clearInterval(this.interval_ins1);
        clearInterval(this.interval_ins2);
        switch (type){
        case 'tree':
          this.scheduletree(this.chart);
          document.getElementById('tree_view').style.display = 'block';
          document.getElementById('circle_view').style.display = 'none';
          break;
        case 'circle':
          document.getElementById('tree_view').style.display = 'none';
          document.getElementById('circle_view').style.display = 'block';
          this.schedulecircle(this.chart);
          break;
        default:
          break;
         }
        this.loading = false
     },
    schedulecircle(chart){
            this.handlecircle(chart)
            this.interval_ins1 = setInterval(()=>{
              if (!this.isProcessing) {
                this.handlecircle(chart);
              } },3000)
        },
      handlecircle (chart) {
        this.isProcessing = true
        basicApi.efm_doaction({
                ac: 'instanceflowgraph',
                track: this.startTrack,
                track_field: this.trackField,
                track_value: this.trackValue,
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
                        },
                        lineStyle: {
                            normal: {
                                type: item.isconnect ? 'solid' : 'dashed',
                                color: item.isconnect ? '#197700' : '#aa1a12'
                            },
                            emphasis: {
                                type: item.isconnect ? 'solid' : 'dashed',
                                color: item.isconnect ? '#197700' : '#aa1a12'
                            }
                        }
                    })),
                    categories
                }
                this.$nextTick(() => {
                    this.drawcircle(graph,chart)
                })
                this.isProcessing = false
            })
        },
        drawcircle (graph,chart) {
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
                            width: 1,
                            curveness: 0.2
                        }
                    }
                ]
            }
            chart.setOption(option)
        },
        scheduletree(chart){
            this.handletree(chart)
            this.interval_ins2 = setInterval(()=>{
              if (!this.isProcessing) {
                this.handletree(chart);
              } },3000)
        },
      handletree (chart) {
        this.isProcessing = true
        this.trackButton = this.startTrack ? "停止追踪" : "开始追踪"
        basicApi.efm_doaction({
                ac: 'instanceflowgraph',
                track: this.startTrack,
                track_field: this.trackField,
                track_value: this.trackValue,
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
                        status:item.instance_status,
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
                  fontSize: 13,
                  fontWeight:"bold",
                  lineHeight: 21,
                  borderWidth: 1,
                  padding:2,
                  borderRadius:10,
                  align: 'center',
                  overflow: 'breakAll',
                  backgroundColor: '#ecf5ff',
                  borderColor: '#b3d8ff',
                }
                const endnode = {
                  fontSize: 13,
                  fontWeight:"bold",
                  lineHeight: 21,
                  borderWidth: 1,
                  padding:2,
                  borderRadius:10,
                  align: 'center',
                  overflow: 'breakAll',
                  backgroundColor: '#b4d9ff',
                  borderColor: '#7ea9d5',
                }
                const unhealthnode = {
                  fontSize: 13,
                  fontWeight:"bold",
                  lineHeight: 21,
                  borderWidth: 1,
                  padding:2,
                  borderRadius:10,
                  align: 'center',
                  overflow: 'breakAll',
                  backgroundColor: '#ffc39d',
                  borderColor: '#f38742',
                }
                const singlenode = {
                  fontSize: 13,
                  fontWeight:"bold",
                  lineHeight: 21,
                  borderWidth: 1,
                  padding:2,
                  borderRadius:10,
                  align: 'center',
                  overflow: 'breakAll',
                  backgroundColor: '#eee',
                  borderColor: '#ccc',
                }
                const lineLabel = {
                    fontSize: 12,
                    color: '#666',
                    lineHeight: 21,
                    padding: 10,
                    offset: [-15, -6]
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
                        symbolSize: isconnect? 8:12,
                        symbolRotate: -90,
                        children: [
                            {
                                id: parentNode.id,
                                name: parentNode.name,
                                label: parentNode.status==0 ?(parentNode.category==3 ? endnode : (parentNode.category==1? singlenode :baseLabel)) :unhealthnode,
                                category: parentNode.category,
                                symbolSize:0.1,
                                itemStyle: {
                                    color: parentNode.status==0 ?(parentNode.category==0 ? '#2bbedb' : (parentNode.category==2? '#16ccb6' : (parentNode.category==1?'#888':'#48838c'))) : "#ff6e00"
                                },
                                children:childrenNodes
                            }
                        ]
                    };
                }

                const roots = findRoots();
                const treeData = {
                    name: 'ROOT',
                    id: '',
                    label: baseLabel,
                    symbolSize: 0.1,
                    category:2,
                    itemStyle: {
                        normal: {color: '#859906',backgroundColor: '#859906'}
                    },
                    children: roots.map(root => buildTree(root.id,"",true)).filter(Boolean)
                };
                this.$nextTick(() => {
                    this.drawtree(treeData, graph,chart)
                })
                this.isProcessing = false
            })
        },
      drawtree (treeData, graph,chart) {
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
                            min: 0.8,
                            max: 3
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
#view_control a{display: inline-block;margin: 5px auto 5px 5px; }
</style>
