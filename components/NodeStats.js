const web3 = require('web3')
const rpc = require('request')
const socket = require('socket.io-client')

class NodeStats {

  constructor() {
    this.io = socket('http://localhost:9647')
    this.WEB3_HTTP_HOST         = 'http://toorak01.ledgerium.io:8545/'
    this.WEB3_WS_HOST           = 'ws://toorak01.ledgerium.io:9000'
    this.WEB3_HTTP              = new web3(new web3.providers.HttpProvider(this.WEB3_HTTP_HOST))
    this.WEB3_WS                = new web3(new web3.providers.WebsocketProvider(this.WEB3_WS_HOST))
    this.id                     = ''
    this.fullName               = ''
    this.name                   = ''
    this.type                   = ''
    this.isMining               = false
    this.peers                  = 0
    this.lastBlockNumber        = 0
    this.lastBlockTransactions  = 0
    this.lastRecievedBlock      = Date.now()
    this.totalDifficulty        = 0
    this.propagationTime        = 0
    this.geoip                  = {lat: 0, long: 0}
    this.init()
  }

  init() {
      this.subscribeNewBlockHeaders()
      this.getNodeInfo()
      this.getPeers()
      this.checkIsMining()
      this.startInterval()
      this.listen()
  }

  listen() {
    const self = this
    this.io.on('checkAlive', ()=>{
      this.io.emit('isAlive', self.id)
    })
  }

  sendStats() {
      const payload = {
      id: this.id,
      type: this.type,
      name: this.name,
      isMining: this.isMining,
      peers: this.peers,
      lastBlockNumber: this.lastBlockNumber,
      lastBlockTransactions: this.lastBlockTransactions,
      lastRecievedBlock: this.lastRecievedBlock,
      totalDifficulty: this.totalDifficulty,
      propagationTime: this.propagationTime,
      timestamp: Date.now()
    }
    // console.log(payload)
    this.io.emit('nodeStats', payload)
  }

  startInterval() {
    setInterval(()=>{
      this.getNodeInfo()
      this.getPeers()
      this.checkIsMining()
    },10000)
  }

  subscribeNewBlockHeaders() {
    const self = this
    const blockListener = this.WEB3_WS.eth.subscribe('newBlockHeaders', function(error, result){
      if (error) return console.log(error);
    })
      .on("data", function(blockHeader){
        self.lastRecievedBlock = Date.now()
        self.getBlockData(blockHeader.number)
        self.propagationTime = Date.now() - (blockHeader.timestamp*1000)
      })
      .on("error", console.error);
  }

  getBlockData(blockNumber) {
    this.WEB3_HTTP.eth.getBlock(blockNumber).then(block => {
      this.totalDifficulty = block.totalDifficulty
      this.lastBlockNumber = block.number
      this.lastBlockTransactions = block.transactions.length
      this.sendStats()
    })
  }

  checkIsMining() {
    return new Promise((resolve, reject) => {
      this.WEB3_HTTP.eth.isMining()
      .then(isMining => {
        this.isMining = isMining
      });
    })
  }

  getNodeInfo() {
    return new Promise((resolve, reject) => {
      rpc({
        url: this.WEB3_HTTP_HOST,
        method: 'POST',
        json: {
          jsonrpc: '2.0',
          method: 'admin_nodeInfo',
          params: [],
          id: new Date().getTime()
        },
      }, (error, result) => {
          if(error) return reject(error);
          console.log(result.body.result)
          this.id = result.body.result.id
          this.fullName = result.body.result.name
          this.type = result.body.result.name.split('/')[0]
          this.name = result.body.result.name.split('/')[1].split('/')[0]
          return resolve(result.body.result)
      })
    })
  }

  getPeers() {
    return new Promise((resolve, reject) => {
      rpc({
        url: this.WEB3_HTTP_HOST,
        method: 'POST',
        json: {
          jsonrpc: '2.0',
          method: 'admin_peers',
          params: [],
          id: new Date().getTime()
        },
      }, (error, result) => {
          if(error) return reject(error);
          this.peers = result.body.result.length
          return resolve(result.body.result)
      })
    })
  }


}

module.exports = NodeStats
