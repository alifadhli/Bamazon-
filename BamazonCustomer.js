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
				message: "What would you like to Buy? (the Product ID)",
				name: "itemNumber"
			},
			{
				type: "number",
				message: "How many would you like to get?",
				name: "howMany"
			},
		]).then(function (user) {

			connection.query('SELECT * FROM products JOIN departments ON products.DepartmentName = departments.DepartmentName WHERE itemID = ?', user.itemNumber, function(err, res) {
		    	if (err) throw err;

		    	if((res['StockQuantity']) > (user.howMany)) {
		    		var newQuantity = parseInt(res['StockQuantity']) - parseInt(user.howMany);
		    		var total = parseFloat(user.howMany) * parseFloat(res[Price]);
			    	total = total.toFixed(2);

			    	var departmentTotal = parseFloat(total) + parseFloat(res['TotalSales']);
			    	departmentTotal = departmentTotal.toFixed(2);

	    			connection.query("UPDATE departments SET ? WHERE ?", [{
		    			TotalSales: departmentTotal
		    		}, {
		    			DepartmentName: res['DepartmentName']
		    		}]);

		    		connection.query("UPDATE products SET ? WHERE ?", [{
		    			StockQuantity: newQuantity
		    		}, {
		    			itemID: user.itemNumber
		    		}], function(error, results) {
		    			if(error) throw error;

			    		console.log("Your order for " + user.howMany + " " + res['ProductName'] +
			    			"(s) has been placed.");
			    		console.log("Your total is $" + total);
			    		orderMore();
		    		});

		    	} else {
		    		console.log("We're sorry, we only have " + res['StockQuantity'] + " of that product.");
		    		orderMore();
		    	}	    
			});
		});	
	});
}

function orderMore() {
	inquirer.prompt([
		{
			type: "confirm",
			message: "Would you like to purchase something else?",
			name: "again"
		},
	]).then(function (user) {
		if(user.again) {
			selection();
		} else {
			exit();
		}
	});
}

function exit() {
	connection.end();
	console.log("Thank you for Shoping with us, Have a nice day :)");
}

selection();