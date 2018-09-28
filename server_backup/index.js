const express = require('express')
const PORT = 5005
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const firebase = require("firebase");

const config = {
    apiKey: "AIzaSyA2BlCEmdqPAoKNqxaIxlxEIOS-IR5iqj0",
    authDomain: "jjdesign-b1593.firebaseapp.com",
    databaseURL: "https://jjdesign-b1593.firebaseio.com",
    projectId: "jjdesign-b1593",
    storageBucket: "jjdesign-b1593.appspot.com",
    messagingSenderId: "60730785404"
};

firebase.initializeApp(config);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const database = firebase.database();

app.post("/saveTransaction", (req, res) => {
    let id = database.ref().child('transactions').push().key;
    let time = new Date()
    let responseCode = 'ok'
    database.ref('transactions/' + id).set({
        transactionType: req.body.transactionType,
        checkNumber: req.body.checkNumber,
        amount: req.body.amount,
        title: req.body.title,
        notes: req.body.notes,
        username: req.body.username,
        date: time.toString()
    }, (error) => {
        if(error) {
            responseCode = 'failed'
        }
        res.send({
            'response': responseCode
        })
    })
    
})

app.get("/getTransactions", function (req, res) {
    let response = []
    database.ref('/transactions').once('value').then(function(snapshot) {
        for(let val in snapshot.val()) {
            response.push(snapshot.val()[val])
        }
        res.send({
            'response': 'ok',
            'data': response
        })
    })
    
})

app.get("/getTableInfo", function (req, res) {
    let response = []
    let total = 0
    let incomes = 0
    let expenses = 0
    let multiplier = 0
    database.ref('/transactions').once('value').then(function(snapshot) {
        for(let val in snapshot.val()) {
            if(snapshot.val()[val].transactionType == 'debit') {
                incomes += parseFloat(snapshot.val()[val].amount)
                multiplier = 1
            } else {
                expenses += parseFloat(snapshot.val()[val].amount)
                multiplier = -1
            }
            total += parseFloat(snapshot.val()[val].amount) * multiplier
        }
        res.send({
            'response': 'ok',
            'data': {
                'total': total,
                'incomes': incomes,
                'expenses': expenses
            }
        })
    })
    
})

app.get("/getChartData", function (req, res) {
    let pastWeek = []
    let transactions = []
    let dates = []
    let incomesArray = []
    let expensesArray = []
    database.ref('/transactions').once('value').then(function(snapshot) {
        
        for(let i = 0; i < 7; i++) {
            let d = new Date()
            let incomeOfDay = 0
            let expenseOfDay = 0
            d.setDate(d.getDate() - i)
            d.setHours(0, 0, 0, 0)
            for(let val in snapshot.val()) {
                let transaction = snapshot.val()[val]
                let date = new Date(transaction.date)
                date.setHours(0, 0, 0, 0)
                if(date.valueOf() == d.valueOf()) {
                    if(transaction.transactionType == 'debit') {
                        incomeOfDay += parseFloat(transaction.amount)
                    } else {
                        expenseOfDay += parseFloat(transaction.amount)
                    }
                }
            }
            /*pastWeek.push({
                date: d,
                incomes: incomeOfDay,
                expenses: expenseOfDay
            })*/
            let months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
            let dateDummy = new Date(d)
            let formattedDate = months[dateDummy.getMonth()] + " " + dateDummy.getDate()
            dates.push(formattedDate)
            incomesArray.push(incomeOfDay)
            expensesArray.push(expenseOfDay)
        }
        
        res.send({
            'response': 'ok',
            'data': {
                dates: dates.reverse(),
                incomes: incomesArray.reverse(),
                expenses: expensesArray.reverse()
            }
        })
    })
    
})

app.delete("/deleteTransaction/:id", function (req, res, next) {
    database.ref('transactions/' + req.params.id).set(null)
    res.send({
        'response': 'ok'
    })
})

/*
app.post("/post", function (req, res) { 
    the body is accessible through req.body
    res.send({
            'response': 'ok',
            'data': ...
        })
}
app.get("/get", function (req, res) {
    res.send({
            'response': 'ok',
            'data': ...
        })
}
*/

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
