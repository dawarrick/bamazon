# bamazonCustomer.js - buy your items from this CLI interface

#### Developed by Deb Warrick https://debwarrick.com

* bamazon is an example of my first use of MySQL, in conjunction with NODE and inquirer to provide a user interface
* bamazon can't be run from a URL, it must be executed using Node.js.

## How it works

You will be shown a list of the products in the bamazon database, including the price and the quantity available.
You will enter the item number, and then the quantity you wish to purchase.
You can purchase multiple items in one order.  When you are finished with your order, simply hit enter and your order will be compete.
If you have started an order and wish to cancel, type in Q.  If you order more than we have in stock, we'll let you know so you can adjust.
You will be given an order total at the end.

**To execute the purchase process type NODE bamazonCustomer.
  
## Additional Features

#### All entries are case insensitive.

##### Watch me walk you through it.
![](spotify-this-song.gif)



### bamazon uses the following Node.js libraries that you must install.

**inquirer** - to allow for the prompts for the execution.  
**keys** - the MySQL password is stored in a .env file to protect it.  
**dotenv** - used to protect my password
**console.table** - to prettify the Node output.  

You must have valid MySQL credentials loaded into a .env file in order to run it.

## Thank you for checking it out, and have fun!
