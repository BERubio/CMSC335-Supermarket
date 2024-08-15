"use strict"
//class defined to perform dynamic html actions for server functionality

class Supermarket {
    //instance variables
    #orderTotal = 0;
    itemVals = [];
    itemsMap;

    //class constructor initializing which items are available and...
    // the map to use to store KV-Pairs of items and their prices
    constructor({itemsList}) {
        this.itemVals = itemsList;
        this.itemsMap = new Map();
    }

    makeList() {
        let list = ``;

        this.itemVals.forEach(({name}) => {
            //concatenate each item name to the catalog list that will be displayed 
            list += `<option value="${name}">${name}</option>`
        });

        return list;
    }

    makeTable() {
        let table =`<table border="1"> <tr> <th>Item</th> <th>Cost</th> </tr>`;

        this.itemVals.forEach(({name, cost}) => {
            // place each item name and cost, using toFixed for currency formatting, in the table
            table += `<tr> <td>${name}</td> <td>${String(cost.toFixed(2))}</td> </tr>`;

            //map each item name to its respective cost in the itemsMap
            this.itemsMap.set(name, cost);
        });

        table += `</table>`;

        return table;
    }

    makeOrder(itemsChosen) {
        // set each item-cost pair in the map
        this.itemVals.forEach(({name, cost}) => {
            this.itemsMap.set(name, cost);
        });
        //reset total cost for each order placed
        this.#orderTotal = 0;

        let orderTable = `<table border="1"><tr><th>Item</th><th>Cost</th></tr>`;

        itemsChosen.forEach((item) => {
            orderTable += `<tr><td>${item}</td><td>${(this.itemsMap.get(item)).toFixed(2)}</td></tr>`;
            //add to order total price
            this.#orderTotal += this.itemsMap.get(item);
        });
        //display order total as last row of the table (using toFixed for currency formatting)
        orderTable += `<tr><td>Total Cost:</td><td>${(this.#orderTotal).toFixed(2)}</td></tr> </table>`;

        return orderTable;
    }
    //getter functions used in other functions to access orderTotal and items Selected
    get values() {
        return this.itemVals;
    }
    get cost() {
        return this.#orderTotal;
    }
}

//const http = require('http');
const express = require("express");
const app = express();
const path = require("path");
const fs = require('fs');
const bodyParser = require("body-parser");

const portNumber = 5000;
//const httpSuccessStatus = 200;

app.use(bodyParser.urlencoded({ extended: false }));

/*const webServer = http.createServer((request, response) => {
	response.writeHead(httpSuccessStatus, {'Content-type':'text/html'});
	response.render('index.ejs')
	response.end();
});*/

process.stdin.setEncoding("utf8");

if (process.argv.length != 3) {
    process.stdout.write(`Usage supermarketServer.js jsonFile`);
    process.exit(1);
}

console.log(`Web server started and running at http://localhost:${portNumber}`);

//.json file to be displayed
const fileChosen = process.argv[2];
let supermarket;
let items;

try{
    const data = fs.readFileSync(fileChosen);
    items = JSON.parse(data);
    supermarket = new Supermarket(items);
}catch (err) {
    console.error("Error reading ItemsList.json file: ", err);
    process.exit(1);
}



const prompt = "Type itemsList or stop to shutdown the server: ";

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

process.stdout.write(prompt);
process.stdin.on('readable', function () {
    const dataInput = process.stdin.read();
    if (dataInput !== null) {
	    const command = dataInput.trim();

	    if (command === "stop") {
		    console.log("Shutting down the server");
            process.exit(0);  /* exiting */

        }else if (command === "itemsList") {
            console.log(items.itemsList);
            //process.stdout.write(prompt);
            //process.stdin.resume;

        }else{
        /* After invalid command, maintain stdin reading */
		    console.log(`Invalid command: ${command}`);
        }
        process.stdout.write(prompt);
        process.stdin.resume();
    }
});

/************************ */
/* ENDPOINT PROCESSING*/
/************************ */

app.get("/", (request, response) => {
    // Render the index.ejs file
    response.render('index');
});

app.get("/catalog", (request, response) => {
    //dynamically set itemsTable in displayItems.ejs to table created by supermarket class function
    const itemsTable = {itemsTable: supermarket.makeTable()};
    response.render('displayItems', itemsTable);
});

app.get('/order', (request,response) => {
    //dynamically set items in placeOrder.ejs to list made by supermarket class function
    const order = {items: supermarket.makeList()}
    response.render('placeOrder', order);
});

app.post('/order', (request,response) => {
    const orderItems = {
        name: request.body.name,
        email: request.body.email,
        delivery: request.body.delivery,
        orderTable: supermarket.makeOrder(request.body.itemsSelected)
    };

    response.render('orderConfirmation.ejs', orderItems);
});

app.listen(portNumber); 

/*function createTable(itemslist){
    let table = '<table border = 1>';
    table += '<tr><th>Item</th><th>Cost</th></tr>';
    
    itemslist.forEach(item => {
        table += '<tr><td>${item.name}</td><td>${item.cost}</td></tr>';
    });

    table += '</table>';

    return table;
}*/