const NodeStats = require('./components/NodeStats')

const nodes = [
'http://125.254.27.14:8545',
'http://125.254.27.14:8545',
'http://125.254.27.14:8545',
'http://125.254.27.14:8545',
'http://139.218.162.11:8545',
'http://139.218.162.11:8546',
'http://139.218.162.11:8547',
'http://139.218.162.11:8548',
'http://178.62.102.61:8545',
'http://104.248.148.111:8545',
'http://52.141.2.205:8545',
'http://52.170.1.55:8545',
'http://13.75.106.163:8545',
'http://13.78.18.24:8545',
'http://104.210.73.239:8545',
'http://40.121.218.130:8545',
'http://52.170.218.37:8545',
]

for (let i=0; i<nodes.length; i++) {
    const http  = nodes[i]
    const ws = `ws://${nodes[i].split('http://')[1].split(':')[0]}:9000`
    const ip = nodes[i].split('http://')[1].split(':')[0]
    console.log(ip)
    const nodeStats = new NodeStats(http, ws, i, ip)
}
