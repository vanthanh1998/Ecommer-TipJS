'use strict'

const mongoose = require('mongoose');
const { db: {host, name, port}} = require('../configs/config.mongodb')
const connectString = `mongodb://${host}:${port}/${name}`
const { countConnect } = require('../helpers/check.connect');

console.log(`connectString:`, connectString);
class Database {
    constructor(){
        this.connect()
    }
    // conect
    connect(type = 'mongodb'){
        console.log('type:', type);
        if(1 === 1){
            mongoose.set('debug', true)
            mongoose.set('debug', { color: true}) 
        }
        mongoose.connect(connectString,{
            maxPoolSize: 50
        }).then( _ => {
            console.log(`Connected Mongodb Success`, countConnect())
        })
        .catch( err => console.log(`Error Connect`))
    }
    static getInstance() {
        if(!Database.instance){
            Database.instance = new Database()
        }

        return Database.instance
    }
}

const instanceMongoDb = Database.getInstance()
module.exports = instanceMongoDb