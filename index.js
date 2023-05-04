const inquirer = require("inquirer");
const path = require('path');
const fs = require('fs');
const cTable = require('console.table');
const greet = require('./Assets/welcome');
const Data = require("./db/query");

async function init() {
    await greet();
    const data = new Data();

    while (true) {
        const {choice} = await inquirer.prompt([
            {
                type: "list",
                name: "choice",
                message: "What would you like to do next?",
                choices: ["View all employees", "View all roles", "View all departments", "Quit"]
            }
        ]);
        if (choice === "Quit") {
            break;
        } else if (choice === "View all employees") {
            let employees = await data.getEmployees();
            console.log(cTable.getTable(employees));
        } else if (choice === "View all roles") {
            let roles = await data.getRoles();
            console.log(cTable.getTable(roles));
        } else if (choice === "View all departments") {
            let departments = await data.getDepartments();
            console.log(cTable.getTable(departments));
        }
    }
    await data.close();
    //
    // const res = await axios.get(`https://manateejokesapi.herokuapp.com/manatees/random`);
    // const fileIRead = await read('log.json', 'utf-8');
    // console.log(fileIRead);
    // const jokeArr = JSON.parse(fileIRead);
    // const newItem = {
    //     user: ans.user,
    //     setup: res.data.setup,
    //     punchline: res.data.punchline
    // }
    // jokeArr.push(newItem);
    // console.log(jokeArr);
    // await write("log.json", JSON.stringify(jokeArr, null, 4))
    // console.log('done');
}

init();


