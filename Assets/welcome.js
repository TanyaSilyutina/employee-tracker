const figlet = require("figlet");
function greet (){
    console.log(figlet.textSync("Employee\nManager\n"))
}


module.exports = greet;