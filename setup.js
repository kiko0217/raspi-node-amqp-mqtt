const amqp = require('amqplib/callback_api')
const mqtt = require('mqtt')
var count = 0
var errCount = 0
const option = {
    username: 'z2gGm75s86TDPGmECxFZ',
    // username: 'ngabringlocking',
    // password: 'fusimqtt1234',
    // password: '',
}
const client  = mqtt.connect('mqtt://octopus.fusi.id', option)
// const client  = mqtt.connect('mqtt://192.168.0.121', option)
 
const costumer = (connection) => {
    connection.createChannel(function(error1, channel) {
        if (error1)
        {
            throw error1
        }
        var queue = 'mq2_amqp'

        channel.assertQueue(queue, {
            durable: true
        })
        console.log(" [*] Waiting for messages in %s. To exit prese CTRL+C", queue)
        channel.consume(queue, function(msg) {
            // count = msg.content.toString()
            // if(msg.content.toString() != count){
            //     console.log("error")
            //     console.log(errCount++)
            //     count = msg.content.toString()
            // }
            count++
            client.publish('v1/devices/me/telemetry', msg.content.toString())
            // console.log(" [x] Received %s", msg.content.toString())
            // console.log(" [x] Received %d", count)
        }, {
            noAck: true
        })
    })
}
const reConnect = () => {
    client.on('connect', function () {
        console.log('connected mqtt')
        client.subscribe('v1/devices/me/rpc/request/+', function (err) {
        //     if (!err) {
        //         //   client.publish('presence', 'Hello mqtt')
        //     }
        })
    })
     
    client.on('message', function (topic, message) {
        // message is Buffer
        console.log(message.toString())
        // client.end()
    })
    
    connRabbitMq()
}

const connRabbitMq = async () => {
    console.log('connecting...')
    amqp.connect('amqp://admin1:admin1@192.168.0.100?heartbeat=60',  function (error0, conn) {
        if (error0) {
            console.log('reconncet')
            // setTimeout(reConnect(), 1000)
            return setTimeout(connRabbitMq, 1000);
        }
        costumer(conn)
        conn.on('error', (err) => {
            console.log(err)
        })
        conn.on('close', (err) => {
            console.log('close')
            console.log('reconncet')
            return setTimeout(connRabbitMq, 1000)
        })
    })
}

reConnect()