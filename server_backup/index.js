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
        if (error) {
            responseCode = 'failed'
        }
        res.send({
            'response': responseCode
        })
    })

})

app.get("/getTransactions", function (req, res) {
    let response = []
    database.ref('/transactions').once('value').then(function (snapshot) {
        for (let val in snapshot.val()) {
            let d = new Date(snapshot.val()[val].date)
            let hours = d.getHours()
            let amOrPm = 'AM'
            let minutes = ''
            if (hours >= 12) {
                amOrPm = 'PM'
            }
            if (hours > 12) {
                hours -= 12
            }
            if (hours == 0) {
                hours = 12
            }
            if (d.getMinutes() < 10) {
                minutes = '0'
            }
            let months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
            let formattedDate = d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear() + " " + hours + ":" + minutes + d.getMinutes() + amOrPm
            let newObj = snapshot.val()[val]
            newObj["date"] = formattedDate
            newObj["id"] = val
            newObj["old"] = d
            response.push(newObj)
        }
        response.sort((a, b) => {
            return new Date(b["old"]) - new Date(a["old"])
        })
        res.send({
            'response': 'ok',
            'data': response
        })
    })

})

let filterObject = (obj, filters) => {
    let unixDate = obj["old"].getTime()
    if (filters["transactionType"] !== "any" && obj["transactionType"] != filters["transactionType"]) {
        return false
    }
    if (parseInt(filters["greaterThan"]) != 0 && parseInt(obj["amount"]) < parseInt(filters["greaterThan"])) return false
    if (parseInt(filters["lessThan"]) != 0 && parseInt(obj["amount"]) > parseInt(filters["lessThan"])) return false
    if (parseInt(filters["month"]) != 0 && obj["old"].getMonth() + 1 != parseInt(filters["month"])) return false
    if (parseInt(filters["year"]) != 0 && obj["old"].getFullYear() != parseInt(filters["year"])) return false
    if (parseInt(filters["fromDate"]) || parseInt(filters["fromDate"])) {
        if (parseInt(filters["fromDate"]) > unixDate || parseInt(filters["toDate"]) < unixDate) return false

    }
    return true
}
app.get("/getDates", function (req, res) {
    let months = []
    let years = []
    database.ref('/transactions').once('value').then(function (snapshot) {
        for (let val in snapshot.val()) {
            let d = new Date(snapshot.val()[val].date)
            !years.includes(d.getFullYear()) && years.push(d.getFullYear())
            !months.includes(d.getMonth() + 1) && months.push(d.getMonth() + 1)
        }
        res.send({
            'response': 'ok',
            'data': {
                'months': months,
                'years': years
            }
        })
    })
})
app.get("/getFilteredTransactions", function (req, res) {
    let credits = []
    let debits = []
    let filters = {
        transactionType: req.query.transactionType, // credit or debit
        greaterThan: req.query.greaterThan, //any number, '0' if filter is unused
        lessThan: req.query.lessThan, //any number, '0' if filter is unused
        month: req.query.month, //from '1' to '12', '0' if filter is unused
        year: req.query.year, //any year from '2016' to '2050', '0' if filter is unused
        fromDate: req.query.fromDate, //'any', 'last-seven-days', 'last-thirty-days', 'last-fifteen-days', 'last-six-months'
        toDate: req.query.toDate //'any', 'last-seven-days', 'last-thirty-days', 'last-fifteen-days', 'last-six-months'
    }
    database.ref('/transactions').once('value').then(function (snapshot) {
        for (let val in snapshot.val()) {
            let d = new Date(snapshot.val()[val].date)
            let hours = d.getHours()
            let amOrPm = 'AM'
            let minutes = ''
            if (hours >= 12) {
                amOrPm = 'PM'
            }
            if (hours > 12) {
                hours -= 12
            }
            if (hours == 0) {
                hours = 12
            }
            if (d.getMinutes() < 10) {
                minutes = '0'
            }
            let months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
            let formattedDate = d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear() // + " " + hours + ":" + minutes + d.getMinutes() + amOrPm
            let newObj = snapshot.val()[val]
            newObj["date"] = formattedDate
            newObj["id"] = val
            newObj["old"] = d
            let isFiltered = filterObject(newObj, filters)
            if (isFiltered) {
                if (newObj["transactionType"] == 'credit') {
                    credits.push(newObj)
                } else {
                    debits.push(newObj)
                }
            }
        }
        debits.sort((a, b) => {
            return new Date(b["old"]) - new Date(a["old"])
        })
        credits.sort((a, b) => {
            return new Date(b["old"]) - new Date(a["old"])
        })
        res.send({
            'response': 'ok',
            'data': {
                'debits': debits,
                'credits': credits
            }
        })
    })

})


app.get("/getTableInfo", function (req, res) {
    let response = []
    let total = 0
    let incomes = 0
    let expenses = 0
    let multiplier = 0
    database.ref('/transactions').once('value').then(function (snapshot) {
        for (let val in snapshot.val()) {
            if (snapshot.val()[val].transactionType == 'debit') {
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
    database.ref('/transactions').once('value').then(function (snapshot) {

        for (let i = 0; i < 7; i++) {
            let d = new Date()
            let incomeOfDay = 0
            let expenseOfDay = 0
            d.setDate(d.getDate() - i)
            d.setHours(0, 0, 0, 0)
            for (let val in snapshot.val()) {
                let transaction = snapshot.val()[val]
                let date = new Date(transaction.date)
                date.setHours(0, 0, 0, 0)
                if (date.valueOf() == d.valueOf()) {
                    if (transaction.transactionType == 'debit') {
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

app.get("/getName/:id", function (req, res, next) {
    database.ref('users/' + req.params.id).once('value').then(function (snapshot) {
        let user = snapshot.val()["name"]
        res.send({
            'response': 'ok',
            'data': user
        })
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

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
