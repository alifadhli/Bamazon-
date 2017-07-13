var mysql = require('mysql');
var inquirer = require('inquirer');
var colors = require('colors');
var Table = require('cli-table');

var connection = mysql.createConnection({
     host: 'localhost',
     port: 3306,
     user: 'root',
     password: '',
     database: 'bamazon'
});

connection.connect(function(err) {
    if (err) throw err;
});

function selection() {
	console.log("");
	inquirer.prompt([
		{
			type: "rawlist",
			message: "What do you want to do?",
			choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
			name: "action"
		},
	]).then(function (user) {
		switch(user.action) {
			case "View Products for Sale":
				viewProducts();
				break;
			case "View Low Inventory":
				viewLowInventory();
				break;
			case "Add to Inventory":
				addInventory();
				break;
			case "Add New Product":
				addNewProduct();
				break;
			case "Exit":
				exit();
				break;
		}
	});
}

function viewProducts() {
	connection.query('SELECT * FROM products', function(err, res) {
	    if (err) throw err;

		var table = new Table({
			head: ["Product ID".cyan, "Product Name".cyan, "Department Name".cyan, "Price".cyan, "Quantity".cyan],
			colWidths: [13, 20, 20, 13, 13],
		});
		
		for(var i = 0; i < res.length; i++) {
			table.push(
			    [res[i].itemID, res[i].ProductName, res[i].DepartmentName, parseFloat(res[i].Price).toFixed(2), res[i].StockQuantity]
			);
		}
		
		console.log(table.toString());

		selection();
	});
}

function viewLowInventory() {
	connection.query('SELECT * FROM products', function(err, res) {
	    if (err) throw err;

		var table = new Table({
			head: ["Product ID".cyan, "Product Name".cyan, "Department Name".cyan, "Price".cyan, "Quantity".cyan],
			colWidths: [13, 20, 20, 13, 13],
		});
		
		for(var i = 0; i < res.length; i++) {
			if(res[i].StockQuantity < 5) {		//Will only push products with less than 5 quantity
				table.push(
			    	[res[i].itemID, res[i].ProductName, res[i].DepartmentName, parseFloat(res[i].Price).toFixed(2), res[i].StockQuantity]
				);
			}
		}

		if(table.length > 0) {
	    	console.log("\nHere are low quantity products (less than 5):");		
			console.log(table.toString());			
		} else {
			console.log("\nThere are no low quantity products right now!\n");
		}

		selection();
	});
}

function addInventory() {
	connection.query('SELECT * FROM products', function(err, res) {
	    if (err) throw err;

		var table = new Table({
			head: ["Product ID".cyan, "Product Name".cyan, "Department Name".cyan, "Price".cyan, "Quantity".cyan],
			colWidths: [13, 20, 20, 13, 13],
		});
		
		for(var i = 0; i < res.length; i++) {
			table.push(
			    [res[i].itemID, res[i].ProductName, res[i].DepartmentName, parseFloat(res[i].Price).toFixed(2), res[i].StockQuantity]
			);
		}
		
		console.log(table.toString());
		inquirer.prompt([
		{
			type: "number",
			message: "Which would you like to add to? (the Product ID)",
			name: "itemNumber"
		},
		{
			type: "number",
			message: "How many more would you like to add?",
			name: "howMany"
		},
		]).then(function (user) {
			var newQuantity = parseInt(res[user.itemNumber - 1].StockQuantity) + parseInt(user.howMany);
			connection.query("UPDATE products SET ? WHERE ?", [{
    			StockQuantity: newQuantity
    		}, {
    			itemID: user.itemNumber
    		}], function(error, results) {
    			if(error) throw error;

	    		console.log("\nYour quantity has been updated, Thank you for your Great work!\n");
	    		selection();
		    });

		});
	});
}

function addNewProduct() {
	inquirer.prompt([
	{
		type: "input",
		message: "What is the product name?",
		name: "itemName"
	},
	{
		type: "input",
		message: "What department is it in?",
		name: "itemDepartment"
	},
	{
		type: "number",
		message: "What is it's price?",
		name: "itemPrice"
	},
	{
		type: "number",
		message: "How many do we have of this product?",
		name: "itemQuantity"
	},
	]).then(function (user) {
		connection.query("INSERT INTO products SET ?", {
			ProductName: user.itemName,
			DepartmentName: user.itemDepartment,
			Price: user.itemPrice,
			StockQuantity: user.itemQuantity
		}, function(err, res) {
			if(err) throw err;

			console.log("\nYour product has been added!\n");
			selection();
		});
	});
}

function exit() {
	connection.end();
	console.log("Thank you for your work, Have a great day!");
}

selection();